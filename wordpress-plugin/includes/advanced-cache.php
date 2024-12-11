<?php
namespace WeddingPhotoSelection\Cache;

class AdvancedCache {
    private static $instance = null;
    private $cache_dir;
    private $cache_time = 3600;
    private $excluded_urls = ['wp-admin', 'wp-login'];

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function __construct() {
        $this->cache_dir = WP_CONTENT_DIR . '/cache/page-cache';
        if (!file_exists($this->cache_dir)) {
            wp_mkdir_p($this->cache_dir);
        }
    }

    public function init() {
        if (!$this->should_cache()) {
            return;
        }

        $cache_file = $this->get_cache_file();
        
        if ($this->is_cache_valid($cache_file)) {
            $this->serve_cache($cache_file);
        } else {
            ob_start([$this, 'cache_output']);
        }
    }

    private function should_cache() {
        if (is_admin() || is_user_logged_in()) {
            return false;
        }

        $current_url = $_SERVER['REQUEST_URI'];
        foreach ($this->excluded_urls as $excluded) {
            if (strpos($current_url, $excluded) !== false) {
                return false;
            }
        }

        return true;
    }

    private function get_cache_file() {
        $cache_key = md5($_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI']);
        return $this->cache_dir . '/' . $cache_key . '.html';
    }

    private function is_cache_valid($cache_file) {
        if (!file_exists($cache_file)) {
            return false;
        }

        if (time() - filemtime($cache_file) > $this->cache_time) {
            return false;
        }

        return true;
    }

    private function serve_cache($cache_file) {
        $content = file_get_contents($cache_file);
        
        // Ajout des en-têtes de cache
        header('X-Cache: HIT');
        header('Cache-Control: public, max-age=' . $this->cache_time);
        
        echo $content;
        exit;
    }

    public function cache_output($buffer) {
        if (empty($buffer)) {
            return $buffer;
        }

        $cache_file = $this->get_cache_file();
        file_put_contents($cache_file, $buffer);
        
        return $buffer;
    }

    public function clear_cache() {
        $files = glob($this->cache_dir . '/*');
        foreach ($files as $file) {
            if (is_file($file)) {
                unlink($file);
            }
        }
    }

    public function get_cache_size() {
        $size = 0;
        $files = glob($this->cache_dir . '/*');
        foreach ($files as $file) {
            if (is_file($file)) {
                $size += filesize($file);
            }
        }
        return $size;
    }
}

// Initialisation
if (!defined('WP_CACHE') || !WP_CACHE) {
    return;
}

AdvancedCache::getInstance()->init();
