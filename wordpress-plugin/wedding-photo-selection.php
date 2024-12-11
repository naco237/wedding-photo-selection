<?php
/*
Plugin Name: Wedding Photo Selection
Description: Plugin pour la sélection de photos de mariage
Version: 1.0
Author: Votre Nom
*/

if (!defined('ABSPATH')) {
    exit;
}

// Définition des constantes
define('WPS_VERSION', '1.0.0');
define('WPS_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('WPS_PLUGIN_URL', plugin_dir_url(__FILE__));

// Chargement des fichiers requis
require_once WPS_PLUGIN_DIR . 'includes/security.php';
require_once WPS_PLUGIN_DIR . 'includes/logger.php';
require_once WPS_PLUGIN_DIR . 'includes/cache.php';

// Chargement des fichiers d'optimisation
require_once WPS_PLUGIN_DIR . 'includes/image-optimizer.php';
require_once WPS_PLUGIN_DIR . 'includes/advanced-cache.php';
require_once WPS_PLUGIN_DIR . 'includes/asset-optimizer.php';

// Création des tables personnalisées lors de l'activation
function wps_create_tables() {
    global $wpdb;
    $charset_collate = $wpdb->get_charset_collate();

    // Table des clients
    $table_clients = $wpdb->prefix . 'wps_clients';
    $sql_clients = "CREATE TABLE IF NOT EXISTS $table_clients (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        couple varchar(100) NOT NULL,
        access_code varchar(12) NOT NULL,
        drive_link text NOT NULL,
        expiry_date date NOT NULL,
        max_photos_album int NOT NULL DEFAULT 1000,
        max_photos_classique int NOT NULL DEFAULT 200,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";

    // Table des paramètres
    $table_settings = $wpdb->prefix . 'wps_settings';
    $sql_settings = "CREATE TABLE IF NOT EXISTS $table_settings (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        setting_name varchar(50) NOT NULL,
        setting_value text NOT NULL,
        PRIMARY KEY  (id)
    ) $charset_collate;";

    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql_clients);
    dbDelta($sql_settings);

    // Insertion des paramètres par défaut
    $default_settings = array(
        'default_max_photos_album' => 1000,
        'default_max_photos_classique' => 200,
        'access_code_length' => 8,
        'access_code_expiration' => 90
    );

    foreach ($default_settings as $name => $value) {
        $wpdb->replace(
            $table_settings,
            array(
                'setting_name' => $name,
                'setting_value' => $value
            ),
            array('%s', '%s')
        );
    }
}

// Enregistrement des scripts et styles
function wps_enqueue_scripts() {
    wp_enqueue_script('wedding-photo-selection', plugin_dir_url(__FILE__) . 'dist/assets/index.js', array(), '1.0', true);
    wp_enqueue_style('wedding-photo-selection', plugin_dir_url(__FILE__) . 'dist/assets/index.css');
    
    wp_localize_script('wedding-photo-selection', 'wpApiSettings', array(
        'root' => esc_url_raw(rest_url('wedding-photos/v1')),
        'nonce' => wp_create_nonce('wp_rest')
    ));
}
add_action('wp_enqueue_scripts', 'wps_enqueue_scripts');

// Endpoints API pour les clients
function wps_register_client_routes() {
    register_rest_route('wedding-photos/v1', '/validate-code', array(
        'methods' => 'POST',
        'callback' => 'wps_validate_code',
        'permission_callback' => '__return_true'
    ));

    register_rest_route('wedding-photos/v1', '/photos', array(
        'methods' => 'GET',
        'callback' => 'wps_get_photos',
        'permission_callback' => '__return_true'
    ));

    register_rest_route('wedding-photos/v1', '/save-selection', array(
        'methods' => 'POST',
        'callback' => 'wps_save_selection',
        'permission_callback' => '__return_true'
    ));
}
add_action('rest_api_init', 'wps_register_client_routes');

// Endpoints API pour l'administration
function wps_register_admin_routes() {
    register_rest_route('wedding-photos/v1', '/admin/clients', array(
        'methods' => 'GET',
        'callback' => 'wps_get_clients',
        'permission_callback' => 'wps_admin_permissions'
    ));

    register_rest_route('wedding-photos/v1', '/admin/clients', array(
        'methods' => 'POST',
        'callback' => 'wps_create_client',
        'permission_callback' => 'wps_admin_permissions'
    ));

    register_rest_route('wedding-photos/v1', '/admin/clients/(?P<id>\d+)', array(
        'methods' => 'PUT',
        'callback' => 'wps_update_client',
        'permission_callback' => 'wps_admin_permissions'
    ));

    register_rest_route('wedding-photos/v1', '/admin/clients/(?P<id>\d+)', array(
        'methods' => 'DELETE',
        'callback' => 'wps_delete_client',
        'permission_callback' => 'wps_admin_permissions'
    ));

    register_rest_route('wedding-photos/v1', '/admin/settings', array(
        'methods' => 'GET',
        'callback' => 'wps_get_settings',
        'permission_callback' => 'wps_admin_permissions'
    ));

    register_rest_route('wedding-photos/v1', '/admin/settings', array(
        'methods' => 'POST',
        'callback' => 'wps_update_settings',
        'permission_callback' => 'wps_admin_permissions'
    ));
}
add_action('rest_api_init', 'wps_register_admin_routes');

// Vérification des permissions admin
function wps_admin_permissions() {
    return current_user_can('manage_options');
}

// Shortcodes pour intégrer l'application
function wps_client_shortcode() {
    return '<div id="wedding-photo-selection-client"></div>';
}
add_shortcode('wedding_photo_selection_client', 'wps_client_shortcode');

function wps_admin_shortcode() {
    if (!current_user_can('manage_options')) {
        return 'Accès non autorisé';
    }
    return '<div id="wedding-photo-selection-admin"></div>';
}
add_shortcode('wedding_photo_selection_admin', 'wps_admin_shortcode');

// Fonctions de callback pour l'API
function wps_validate_code($request) {
    global $wpdb;
    $params = $request->get_params();
    $code = sanitize_text_field($params['code']);
    
    $client = $wpdb->get_row(
        $wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}wps_clients WHERE access_code = %s AND expiry_date >= CURDATE()",
            $code
        )
    );
    
    return new WP_REST_Response(array(
        'valid' => !empty($client),
        'client' => $client ? array(
            'id' => $client->id,
            'couple' => $client->couple,
            'maxPhotos' => array(
                'album' => (int)$client->max_photos_album,
                'classique' => (int)$client->max_photos_classique
            )
        ) : null
    ), 200);
}

// Autres fonctions de callback à implémenter selon vos besoins...

// Fonction utilitaire pour générer un code d'accès unique
function wps_generate_access_code($length = 8) {
    $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    $code = '';
    for ($i = 0; $i < $length; $i++) {
        $code .= $chars[rand(0, strlen($chars) - 1)];
    }
    return $code;
}

// Optimisation des performances
function wps_optimize_performance() {
    // Désactiver les emojis WordPress
    remove_action('wp_head', 'print_emoji_detection_script', 7);
    remove_action('admin_print_scripts', 'print_emoji_detection_script');
    remove_action('wp_print_styles', 'print_emoji_styles');
    remove_action('admin_print_styles', 'print_emoji_styles');

    // Désactiver l'API XML-RPC
    add_filter('xmlrpc_enabled', '__return_false');

    // Désactiver les versions des ressources
    function wps_remove_version_strings($src) {
        if (strpos($src, 'ver=')) {
            $src = remove_query_arg('ver', $src);
        }
        return $src;
    }
    add_filter('style_loader_src', 'wps_remove_version_strings', 9999);
    add_filter('script_loader_src', 'wps_remove_version_strings', 9999);

    // Optimiser les requêtes à la base de données
    add_filter('found_posts_query', 'wps_optimize_found_posts_query', 10, 2);
    function wps_optimize_found_posts_query($query, $query_vars) {
        if (!is_admin()) {
            return 'SELECT FOUND_ROWS()';
        }
        return $query;
    }
}
add_action('init', 'wps_optimize_performance');

// Configuration des en-têtes de cache
function wps_add_cache_headers() {
    if (!is_admin()) {
        header('Cache-Control: public, max-age=31536000');
        header('Expires: ' . gmdate('D, d M Y H:i:s', time() + 31536000) . ' GMT');
        header('Last-Modified: ' . gmdate('D, d M Y H:i:s', get_the_modified_time('U')) . ' GMT');
    }
}
add_action('send_headers', 'wps_add_cache_headers');

// Ajout des hooks d'activation/désactivation
register_activation_hook(__FILE__, 'wps_activate');
register_deactivation_hook(__FILE__, 'wps_deactivate');

function wps_activate() {
    wps_create_tables();
    
    // Créer le répertoire des logs
    $upload_dir = wp_upload_dir();
    $log_dir = $upload_dir['basedir'] . '/wps-logs';
    if (!file_exists($log_dir)) {
        wp_mkdir_p($log_dir);
        file_put_contents($log_dir . '/.htaccess', 'Deny from all');
    }
    
    // Flush les règles de réécriture
    flush_rewrite_rules();
    
    // Log l'activation
    \WeddingPhotoSelection\Logger\wps_log('Plugin activé', 'info');
}

function wps_deactivate() {
    // Nettoyer le cache
    \WeddingPhotoSelection\Cache\wps_cache()->flush();
    
    // Log la désactivation
    \WeddingPhotoSelection\Logger\wps_log('Plugin désactivé', 'info');
    
    // Flush les règles de réécriture
    flush_rewrite_rules();
}