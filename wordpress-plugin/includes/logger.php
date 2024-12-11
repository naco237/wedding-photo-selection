<?php
namespace WeddingPhotoSelection\Logger;

class Logger {
    private static $instance = null;
    private $log_directory;

    private function __construct() {
        $upload_dir = wp_upload_dir();
        $this->log_directory = $upload_dir['basedir'] . '/wps-logs';
        
        if (!file_exists($this->log_directory)) {
            wp_mkdir_p($this->log_directory);
            file_put_contents($this->log_directory . '/.htaccess', 'Deny from all');
        }
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function log($message, $level = 'info', $context = array()) {
        if (!is_string($message)) {
            $message = print_r($message, true);
        }

        $timestamp = current_time('mysql');
        $log_entry = sprintf(
            "[%s] [%s] %s %s\n",
            $timestamp,
            strtoupper($level),
            $message,
            !empty($context) ? json_encode($context) : ''
        );

        $filename = $this->log_directory . '/wps-' . date('Y-m-d') . '.log';
        error_log($log_entry, 3, $filename);

        // Rotation des logs si nécessaire
        $this->rotate_logs();
    }

    private function rotate_logs() {
        $max_logs = 7; // Garde 7 jours de logs
        $files = glob($this->log_directory . '/wps-*.log');
        
        if (count($files) > $max_logs) {
            usort($files, function($a, $b) {
                return filemtime($a) - filemtime($b);
            });
            
            $files_to_delete = array_slice($files, 0, count($files) - $max_logs);
            foreach ($files_to_delete as $file) {
                unlink($file);
            }
        }
    }

    public function clear_logs() {
        $files = glob($this->log_directory . '/wps-*.log');
        foreach ($files as $file) {
            unlink($file);
        }
    }
}

// Fonction helper globale pour le logging
function wps_log($message, $level = 'info', $context = array()) {
    Logger::getInstance()->log($message, $level, $context);
}
