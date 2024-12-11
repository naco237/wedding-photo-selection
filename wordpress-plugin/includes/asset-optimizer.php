<?php
namespace WeddingPhotoSelection\AssetOptimizer;

class AssetOptimizer {
    private static $instance = null;
    private $cache_dir;
    private $version;

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function __construct() {
        $this->cache_dir = WP_CONTENT_DIR . '/cache/assets';
        $this->version = WPS_VERSION;
        
        if (!file_exists($this->cache_dir)) {
            wp_mkdir_p($this->cache_dir);
        }
    }

    public function init() {
        add_action('wp_enqueue_scripts', [$this, 'optimize_assets'], 999);
        add_filter('script_loader_tag', [$this, 'add_async_defer'], 10, 2);
        add_action('wp_head', [$this, 'add_preload_hints'], 1);
    }

    public function optimize_assets() {
        global $wp_scripts, $wp_styles;

        // Optimisation des scripts
        foreach ($wp_scripts->registered as $handle => $script) {
            // Ajouter async/defer pour les scripts non critiques
            if (!$this->is_critical_script($handle)) {
                $script->extra['async'] = true;
            }

            // Minification et combinaison des scripts
            if ($this->should_optimize_script($script)) {
                $this->optimize_script($script);
            }
        }

        // Optimisation des styles
        foreach ($wp_styles->registered as $handle => $style) {
            if ($this->should_optimize_style($style)) {
                $this->optimize_style($style);
            }
        }
    }

    public function add_async_defer($tag, $handle) {
        if (isset($wp_scripts->registered[$handle]->extra['async'])) {
            if (false === stripos($tag, 'defer')) {
                $tag = str_replace(' src', ' defer src', $tag);
            }
        }
        return $tag;
    }

    public function add_preload_hints() {
        $critical_assets = $this->get_critical_assets();
        foreach ($critical_assets as $asset) {
            echo '<link rel="preload" href="' . esc_url($asset['url']) . '" as="' . esc_attr($asset['type']) . '">' . "\n";
        }
    }

    private function optimize_script($script) {
        if (!file_exists($script->src)) {
            return;
        }

        $cache_key = md5($script->src . $this->version);
        $cache_file = $this->cache_dir . '/' . $cache_key . '.js';

        if (!file_exists($cache_file) || $this->is_development()) {
            $content = file_get_contents($script->src);
            
            // Minification basique
            $content = $this->minify_js($content);
            
            file_put_contents($cache_file, $content);
        }

        $script->src = str_replace(WP_CONTENT_DIR, content_url(), $cache_file);
    }

    private function optimize_style($style) {
        if (!file_exists($style->src)) {
            return;
        }

        $cache_key = md5($style->src . $this->version);
        $cache_file = $this->cache_dir . '/' . $cache_key . '.css';

        if (!file_exists($cache_file) || $this->is_development()) {
            $content = file_get_contents($style->src);
            
            // Minification basique
            $content = $this->minify_css($content);
            
            file_put_contents($cache_file, $content);
        }

        $style->src = str_replace(WP_CONTENT_DIR, content_url(), $cache_file);
    }

    private function minify_js($content) {
        // Suppression des commentaires et espaces inutiles
        $content = preg_replace('!/\*[^*]*\*+([^/][^*]*\*+)*/!', '', $content);
        $content = str_replace(["\r\n", "\r", "\n", "\t"], '', $content);
        return $content;
    }

    private function minify_css($content) {
        // Suppression des commentaires et espaces inutiles
        $content = preg_replace('!/\*[^*]*\*+([^/][^*]*\*+)*/!', '', $content);
        $content = str_replace(["\r\n", "\r", "\n", "\t"], '', $content);
        $content = preg_replace('/\s+/', ' ', $content);
        return $content;
    }

    private function is_critical_script($handle) {
        $critical_scripts = ['jquery', 'wp-api'];
        return in_array($handle, $critical_scripts);
    }

    private function should_optimize_script($script) {
        return !is_admin() && !empty($script->src) && strpos($script->src, 'wp-includes') === false;
    }

    private function should_optimize_style($style) {
        return !is_admin() && !empty($style->src);
    }

    private function get_critical_assets() {
        return [
            ['url' => get_theme_file_uri('style.css'), 'type' => 'style'],
            ['url' => includes_url('js/jquery/jquery.min.js'), 'type' => 'script'],
        ];
    }

    private function is_development() {
        return defined('WP_DEBUG') && WP_DEBUG;
    }
}

// Initialisation
add_action('init', function() {
    AssetOptimizer::getInstance()->init();
});
