<?php
namespace WeddingPhotoSelection\Backup;

class BackupManager {
    private static $instance = null;
    private $backup_dir;
    private $max_backups = 5;

    private function __construct() {
        $upload_dir = wp_upload_dir();
        $this->backup_dir = $upload_dir['basedir'] . '/wps-backups';
        
        if (!file_exists($this->backup_dir)) {
            wp_mkdir_p($this->backup_dir);
            file_put_contents($this->backup_dir . '/.htaccess', 'Deny from all');
        }
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function create_backup($type = 'full') {
        try {
            $backup_file = $this->backup_dir . '/backup-' . date('Y-m-d-His') . '.zip';
            $zip = new \ZipArchive();

            if ($zip->open($backup_file, \ZipArchive::CREATE) !== true) {
                throw new \Exception("Impossible de créer l'archive ZIP");
            }

            // Sauvegarde de la base de données
            $this->backup_database($zip);

            if ($type === 'full') {
                // Sauvegarde des fichiers
                $this->backup_files($zip);
            }

            $zip->close();

            // Rotation des sauvegardes
            $this->rotate_backups();

            // Log le succès
            \WeddingPhotoSelection\Logger\wps_log(
                'Sauvegarde créée avec succès',
                'info',
                ['type' => $type, 'file' => $backup_file]
            );

            return $backup_file;

        } catch (\Exception $e) {
            \WeddingPhotoSelection\Logger\wps_log(
                'Erreur lors de la sauvegarde',
                'error',
                ['message' => $e->getMessage()]
            );
            throw $e;
        }
    }

    private function backup_database($zip) {
        global $wpdb;

        $tables = [
            $wpdb->prefix . 'wps_clients',
            $wpdb->prefix . 'wps_settings',
            $wpdb->prefix . 'wps_analytics'
        ];

        foreach ($tables as $table) {
            $rows = $wpdb->get_results("SELECT * FROM `{$table}`", ARRAY_A);
            if ($rows) {
                $sql = "INSERT INTO `{$table}` VALUES \n";
                foreach ($rows as $row) {
                    $values = array_map(function($value) use ($wpdb) {
                        return is_null($value) ? 'NULL' : $wpdb->prepare('%s', $value);
                    }, $row);
                    $sql .= "(" . implode(',', $values) . "),\n";
                }
                $sql = rtrim($sql, ",\n") . ";\n";
                $zip->addFromString("database/{$table}.sql", $sql);
            }
        }
    }

    private function backup_files($zip) {
        $upload_dir = wp_upload_dir();
        $this->add_files_to_zip($zip, $upload_dir['basedir'], 'uploads');
    }

    private function add_files_to_zip($zip, $source, $prefix = '') {
        $source = str_replace('\\', '/', realpath($source));
        
        if (is_dir($source)) {
            $files = new \RecursiveIteratorIterator(
                new \RecursiveDirectoryIterator($source),
                \RecursiveIteratorIterator::SELF_FIRST
            );

            foreach ($files as $file) {
                $file = str_replace('\\', '/', $file);

                if (in_array(substr($file, strrpos($file, '/') + 1), ['.', '..'])) {
                    continue;
                }

                $file = str_replace('\\', '/', realpath($file));

                if (is_dir($file)) {
                    $zip->addEmptyDir($prefix . '/' . str_replace($source . '/', '', $file . '/'));
                } else if (is_file($file)) {
                    $zip->addFile($file, $prefix . '/' . str_replace($source . '/', '', $file));
                }
            }
        } else if (is_file($source)) {
            $zip->addFile($source, $prefix . '/' . basename($source));
        }
    }

    private function rotate_backups() {
        $backups = glob($this->backup_dir . '/backup-*.zip');
        if (count($backups) > $this->max_backups) {
            usort($backups, function($a, $b) {
                return filemtime($a) - filemtime($b);
            });
            
            $to_delete = array_slice($backups, 0, count($backups) - $this->max_backups);
            foreach ($to_delete as $backup) {
                unlink($backup);
            }
        }
    }

    public function restore_backup($backup_file) {
        try {
            $zip = new \ZipArchive();
            if ($zip->open($backup_file) !== true) {
                throw new \Exception("Impossible d'ouvrir l'archive ZIP");
            }

            // Restaurer la base de données
            for ($i = 0; $i < $zip->numFiles; $i++) {
                $filename = $zip->getNameIndex($i);
                if (strpos($filename, 'database/') === 0) {
                    $sql = $zip->getFromIndex($i);
                    $this->execute_sql($sql);
                }
            }

            // Restaurer les fichiers
            $upload_dir = wp_upload_dir();
            $zip->extractTo($upload_dir['basedir']);
            $zip->close();

            \WeddingPhotoSelection\Logger\wps_log(
                'Restauration effectuée avec succès',
                'info',
                ['file' => $backup_file]
            );

            return true;

        } catch (\Exception $e) {
            \WeddingPhotoSelection\Logger\wps_log(
                'Erreur lors de la restauration',
                'error',
                ['message' => $e->getMessage()]
            );
            throw $e;
        }
    }

    private function execute_sql($sql) {
        global $wpdb;
        $queries = explode(";\n", $sql);
        foreach ($queries as $query) {
            if (!empty(trim($query))) {
                $wpdb->query($query);
            }
        }
    }
}

// Planification des sauvegardes automatiques
add_action('init', function() {
    if (!wp_next_scheduled('wps_backup_cron')) {
        wp_schedule_event(time(), 'daily', 'wps_backup_cron');
    }
});

add_action('wps_backup_cron', function() {
    try {
        BackupManager::getInstance()->create_backup();
    } catch (\Exception $e) {
        \WeddingPhotoSelection\Logger\wps_log(
            'Erreur lors de la sauvegarde automatique',
            'error',
            ['message' => $e->getMessage()]
        );
    }
});
