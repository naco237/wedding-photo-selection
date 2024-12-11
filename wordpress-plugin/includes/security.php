<?php
namespace WeddingPhotoSelection\Security;

class Security {
    private static $instance = null;
    private $rate_limit_duration = 3600; // 1 heure
    private $max_attempts = 5;

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function init() {
        add_action('rest_api_init', [$this, 'add_cors_headers']);
        add_filter('rest_authentication_errors', [$this, 'check_rate_limit']);
        add_action('init', [$this, 'set_security_headers']);
    }

    public function set_security_headers() {
        if (!is_admin()) {
            header('X-Content-Type-Options: nosniff');
            header('X-Frame-Options: SAMEORIGIN');
            header('X-XSS-Protection: 1; mode=block');
            header('Referrer-Policy: strict-origin-when-cross-origin');
            header("Content-Security-Policy: default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval'");
        }
    }

    public function add_cors_headers() {
        remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
        add_filter('rest_pre_serve_request', function ($value) {
            $origin = get_http_origin();
            if ($origin === 'https://tri-photos.happywd.com') {
                header('Access-Control-Allow-Origin: ' . esc_url_raw($origin));
                header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
                header('Access-Control-Allow-Credentials: true');
                header('Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce');
            }
            return $value;
        });
    }

    public function check_rate_limit($error) {
        if ($error) {
            return $error;
        }

        $ip = $this->get_client_ip();
        $endpoint = $_SERVER['REQUEST_URI'];
        $attempts = get_transient('rate_limit_' . md5($ip . $endpoint));

        if ($attempts === false) {
            set_transient('rate_limit_' . md5($ip . $endpoint), 1, $this->rate_limit_duration);
        } else if ($attempts >= $this->max_attempts) {
            return new \WP_Error(
                'too_many_requests',
                'Trop de requêtes, veuillez réessayer plus tard.',
                array('status' => 429)
            );
        } else {
            set_transient('rate_limit_' . md5($ip . $endpoint), $attempts + 1, $this->rate_limit_duration);
        }

        return null;
    }

    private function get_client_ip() {
        $ip = '';
        if (isset($_SERVER['HTTP_CF_CONNECTING_IP'])) {
            $ip = $_SERVER['HTTP_CF_CONNECTING_IP'];
        } elseif (isset($_SERVER['HTTP_X_REAL_IP'])) {
            $ip = $_SERVER['HTTP_X_REAL_IP'];
        } elseif (isset($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $ip = trim(current(explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])));
        } elseif (isset($_SERVER['REMOTE_ADDR'])) {
            $ip = $_SERVER['REMOTE_ADDR'];
        }
        return filter_var($ip, FILTER_VALIDATE_IP);
    }

    public function validate_nonce($nonce, $action = -1) {
        if (!wp_verify_nonce($nonce, $action)) {
            return new \WP_Error(
                'invalid_nonce',
                'Nonce invalide',
                array('status' => 403)
            );
        }
        return true;
    }

    public function sanitize_input($data) {
        if (is_array($data)) {
            return array_map([$this, 'sanitize_input'], $data);
        }
        return is_string($data) ? sanitize_text_field($data) : $data;
    }
}

// Initialisation
Security::getInstance()->init();
