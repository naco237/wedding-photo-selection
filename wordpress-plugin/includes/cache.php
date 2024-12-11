<?php
namespace WeddingPhotoSelection\Cache;

class Cache {
    private static $instance = null;
    private $cache_time = 3600; // 1 heure par défaut

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function get($key) {
        return get_transient('wps_cache_' . $key);
    }

    public function set($key, $value, $expiration = null) {
        $expiration = $expiration ?? $this->cache_time;
        return set_transient('wps_cache_' . $key, $value, $expiration);
    }

    public function delete($key) {
        return delete_transient('wps_cache_' . $key);
    }

    public function flush() {
        global $wpdb;
        return $wpdb->query(
            "DELETE FROM $wpdb->options WHERE option_name LIKE '_transient_wps_cache_%' OR option_name LIKE '_transient_timeout_wps_cache_%'"
        );
    }

    public function remember($key, $callback, $expiration = null) {
        $value = $this->get($key);
        
        if ($value === false) {
            $value = $callback();
            $this->set($key, $value, $expiration);
        }
        
        return $value;
    }
}

// Helper function
function wps_cache() {
    return Cache::getInstance();
}
