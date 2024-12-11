<?php
// ** Configuration MySQL - Informations à obtenir chez O2switch ** //
define('DB_NAME', 'happywd_photos');
define('DB_USER', 'happywd_photos');
define('DB_PASSWORD', ''); // À remplir avec le vrai mot de passe
define('DB_HOST', 'localhost');
define('DB_CHARSET', 'utf8mb4');
define('DB_COLLATE', '');

// ** Clés de sécurité uniques - https://api.wordpress.org/secret-key/1.1/salt/ ** //
define('AUTH_KEY',         'votre-clé-unique');
define('SECURE_AUTH_KEY',  'votre-clé-unique');
define('LOGGED_IN_KEY',    'votre-clé-unique');
define('NONCE_KEY',        'votre-clé-unique');
define('AUTH_SALT',        'votre-clé-unique');
define('SECURE_AUTH_SALT', 'votre-clé-unique');
define('LOGGED_IN_SALT',   'votre-clé-unique');
define('NONCE_SALT',       'votre-clé-unique');

// ** Configuration de l'URL du site ** //
define('WP_HOME', 'https://tri-photos.happywd.com');
define('WP_SITEURL', 'https://tri-photos.happywd.com');

// ** Configuration du cache ** //
define('WP_CACHE', true);
define('WP_CACHE_KEY_SALT', 'tri-photos.happywd.com');

// ** Configuration de la mémoire ** //
define('WP_MEMORY_LIMIT', '256M');
define('WP_MAX_MEMORY_LIMIT', '512M');

// ** Configuration de sécurité ** //
define('FORCE_SSL_ADMIN', true);
define('FORCE_SSL_LOGIN', true);
define('DISALLOW_FILE_EDIT', true);
define('DISALLOW_FILE_MODS', true);
define('WP_AUTO_UPDATE_CORE', true);

// ** Configuration du debug ** //
define('WP_DEBUG', false);
define('WP_DEBUG_LOG', false);
define('WP_DEBUG_DISPLAY', false);
@ini_set('display_errors', 0);

// ** Configuration des révisions ** //
define('WP_POST_REVISIONS', 5);
define('AUTOSAVE_INTERVAL', 300);

// ** Configuration du multisite ** //
define('WP_ALLOW_MULTISITE', false);

// ** Configuration des langues ** //
define('WPLANG', 'fr_FR');

// ** Configuration des uploads ** //
define('UPLOADS', 'wp-content/uploads');

$table_prefix = 'wps_';

/* C'est tout, ne touchez pas à ce qui suit ! Bonne publication. */
if (!defined('ABSPATH'))
    define('ABSPATH', dirname(__FILE__) . '/');

require_once(ABSPATH . 'wp-settings.php');
