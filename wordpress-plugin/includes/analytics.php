<?php
namespace WeddingPhotoSelection\Analytics;

class Analytics {
    private static $instance = null;
    private $table_name;

    private function __construct() {
        global $wpdb;
        $this->table_name = $wpdb->prefix . 'wps_analytics';
        $this->create_analytics_table();
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function create_analytics_table() {
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE IF NOT EXISTS {$this->table_name} (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            event_type varchar(50) NOT NULL,
            user_id bigint(20),
            client_id varchar(50),
            data longtext,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            KEY event_type (event_type),
            KEY user_id (user_id),
            KEY client_id (client_id)
        ) $charset_collate;";

        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }

    public function track_event($event_type, $data = [], $user_id = null, $client_id = null) {
        global $wpdb;

        if (empty($user_id) && is_user_logged_in()) {
            $user_id = get_current_user_id();
        }

        if (empty($client_id)) {
            $client_id = isset($_COOKIE['wps_client_id']) ? sanitize_text_field($_COOKIE['wps_client_id']) : null;
        }

        $wpdb->insert(
            $this->table_name,
            [
                'event_type' => $event_type,
                'user_id' => $user_id,
                'client_id' => $client_id,
                'data' => json_encode($data),
            ],
            ['%s', '%d', '%s', '%s']
        );
    }

    public function get_analytics_report($start_date = null, $end_date = null, $event_type = null) {
        global $wpdb;

        $where = [];
        $where_values = [];

        if ($start_date) {
            $where[] = 'created_at >= %s';
            $where_values[] = $start_date;
        }

        if ($end_date) {
            $where[] = 'created_at <= %s';
            $where_values[] = $end_date;
        }

        if ($event_type) {
            $where[] = 'event_type = %s';
            $where_values[] = $event_type;
        }

        $where_clause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';

        $query = $wpdb->prepare(
            "SELECT 
                event_type,
                COUNT(*) as count,
                DATE(created_at) as date
            FROM {$this->table_name}
            {$where_clause}
            GROUP BY event_type, DATE(created_at)
            ORDER BY date DESC, event_type",
            $where_values
        );

        return $wpdb->get_results($query);
    }

    public function get_user_activity($user_id, $limit = 50) {
        global $wpdb;

        $query = $wpdb->prepare(
            "SELECT * FROM {$this->table_name}
            WHERE user_id = %d
            ORDER BY created_at DESC
            LIMIT %d",
            $user_id,
            $limit
        );

        return $wpdb->get_results($query);
    }

    public function get_popular_photos($start_date = null, $end_date = null, $limit = 10) {
        global $wpdb;

        $where = ["event_type = 'photo_view'"];
        $where_values = [];

        if ($start_date) {
            $where[] = 'created_at >= %s';
            $where_values[] = $start_date;
        }

        if ($end_date) {
            $where[] = 'created_at <= %s';
            $where_values[] = $end_date;
        }

        $where_clause = 'WHERE ' . implode(' AND ', $where);

        $query = $wpdb->prepare(
            "SELECT 
                JSON_EXTRACT(data, '$.photo_id') as photo_id,
                COUNT(*) as views
            FROM {$this->table_name}
            {$where_clause}
            GROUP BY photo_id
            ORDER BY views DESC
            LIMIT %d",
            array_merge($where_values, [$limit])
        );

        return $wpdb->get_results($query);
    }

    public function clean_old_data($days = 90) {
        global $wpdb;

        $wpdb->query($wpdb->prepare(
            "DELETE FROM {$this->table_name}
            WHERE created_at < DATE_SUB(NOW(), INTERVAL %d DAY)",
            $days
        ));
    }
}

// Initialisation
function wps_track_event($event_type, $data = [], $user_id = null, $client_id = null) {
    Analytics::getInstance()->track_event($event_type, $data, $user_id, $client_id);
}

// Nettoyage automatique des anciennes données
add_action('wp_scheduled_delete', function() {
    Analytics::getInstance()->clean_old_data();
});
