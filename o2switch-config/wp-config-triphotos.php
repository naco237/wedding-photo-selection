<?php
// ** Réglages MySQL - Votre hébergeur doit vous fournir ces informations. ** //
define( 'DB_NAME', 'kuna4419_triphotos' );
define( 'DB_USER', 'kuna4419' );
define( 'DB_PASSWORD', 'JMV7-Wz9L-FVS?' );
define( 'DB_HOST', 'localhost' );
define( 'DB_CHARSET', 'utf8mb4' );
define( 'DB_COLLATE', '' );

// ** Clés uniques d'authentification et salage ** //
define('AUTH_KEY',         'votre-clé-unique-1');
define('SECURE_AUTH_KEY',  'votre-clé-unique-2');
define('LOGGED_IN_KEY',    'votre-clé-unique-3');
define('NONCE_KEY',        'votre-clé-unique-4');
define('AUTH_SALT',        'votre-clé-unique-5');
define('SECURE_AUTH_SALT', 'votre-clé-unique-6');
define('LOGGED_IN_SALT',   'votre-clé-unique-7');
define('NONCE_SALT',       'votre-clé-unique-8');

$table_prefix = 'wp_';

define( 'WP_DEBUG', false );
define( 'WP_DEBUG_LOG', false );
define( 'WP_DEBUG_DISPLAY', false );

// SSL et URLs du site
define('FORCE_SSL_ADMIN', true);
define('WP_HOME', 'https://tri-photos.happywd.com');
define('WP_SITEURL', 'https://tri-photos.happywd.com');

// Optimisations
define('WP_MEMORY_LIMIT', '256M');
define('WP_MAX_MEMORY_LIMIT', '512M');
define('WP_POST_REVISIONS', 5);
define('EMPTY_TRASH_DAYS', 7);
define('WP_AUTO_UPDATE_CORE', true);

if ( ! defined( 'ABSPATH' ) ) {
    define( 'ABSPATH', __DIR__ . '/' );
}

require_once ABSPATH . 'wp-settings.php';
