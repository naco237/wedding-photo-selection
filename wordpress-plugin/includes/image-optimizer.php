<?php
namespace WeddingPhotoSelection\ImageOptimizer;

class ImageOptimizer {
    private static $instance = null;
    private $max_width = 2048;
    private $quality = 82;
    private $convert_to_webp = true;

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function init() {
        add_filter('wp_handle_upload', [$this, 'optimize_uploaded_image']);
        add_filter('wp_generate_attachment_metadata', [$this, 'optimize_image_sizes'], 10, 2);
        add_filter('image_make_intermediate_size', [$this, 'convert_to_webp']);
    }

    public function optimize_uploaded_image($file) {
        if (!$this->is_image($file['type'])) {
            return $file;
        }

        $image = wp_get_image_editor($file['file']);
        if (!is_wp_error($image)) {
            // Redimensionner si nécessaire
            $current_size = $image->get_size();
            if ($current_size['width'] > $this->max_width) {
                $image->resize($this->max_width, null, false);
            }

            // Optimiser la qualité
            $image->set_quality($this->quality);

            // Sauvegarder
            $image->save($file['file']);

            // Créer version WebP si activé
            if ($this->convert_to_webp) {
                $this->create_webp_version($file['file']);
            }
        }

        return $file;
    }

    public function optimize_image_sizes($metadata, $attachment_id) {
        if (!isset($metadata['sizes'])) {
            return $metadata;
        }

        foreach ($metadata['sizes'] as $size => $data) {
            $file_path = get_attached_file($attachment_id);
            $dir = dirname($file_path);
            $image_path = $dir . '/' . $data['file'];

            $image = wp_get_image_editor($image_path);
            if (!is_wp_error($image)) {
                $image->set_quality($this->quality);
                $image->save($image_path);

                if ($this->convert_to_webp) {
                    $this->create_webp_version($image_path);
                }
            }
        }

        return $metadata;
    }

    public function convert_to_webp($file) {
        if (!$this->is_image(mime_content_type($file))) {
            return $file;
        }

        $this->create_webp_version($file);
        return $file;
    }

    private function create_webp_version($file_path) {
        $image = wp_get_image_editor($file_path);
        if (!is_wp_error($image)) {
            $webp_path = preg_replace('/\.(jpe?g|png)$/i', '.webp', $file_path);
            $image->save($webp_path, 'image/webp');
        }
    }

    private function is_image($mime_type) {
        return strpos($mime_type, 'image/') === 0;
    }
}

// Initialisation
add_action('init', function() {
    ImageOptimizer::getInstance()->init();
});
