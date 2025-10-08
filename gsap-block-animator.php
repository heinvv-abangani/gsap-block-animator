<?php
/**
 * Plugin Name: GSAP Block Animator
 * Plugin URI: https://github.com/janvanvlastuin1981/gsap-block-animator
 * Description: Advanced GSAP animations for WordPress Gutenberg blocks with TypeScript and modern PHP architecture
 * Version: 2.0.0
 * Author: Tevin Hendricks
 * Author URI: https://github.com/janvanvlastuin1981
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: gsap-block-animator
 * Domain Path: /languages
 * Requires at least: 6.0
 * Tested up to: 6.4
 * Requires PHP: 7.4
 * Network: false
 *
 * @package GSAPBlockAnimator
 * @since 2.0.0
 */

declare(strict_types=1);

namespace GSAPBlockAnimator;

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('GSAP_BLOCK_ANIMATOR_VERSION', '2.0.0');
define('GSAP_BLOCK_ANIMATOR_PLUGIN_FILE', __FILE__);
define('GSAP_BLOCK_ANIMATOR_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('GSAP_BLOCK_ANIMATOR_PLUGIN_URL', plugin_dir_url(__FILE__));
define('GSAP_BLOCK_ANIMATOR_ASSETS_URL', GSAP_BLOCK_ANIMATOR_PLUGIN_URL . 'assets/');
define('GSAP_BLOCK_ANIMATOR_DIST_URL', GSAP_BLOCK_ANIMATOR_ASSETS_URL . 'dist/');

// Check PHP version
if (version_compare(PHP_VERSION, '7.4', '<')) {
    add_action('admin_notices', function () {
        echo '<div class="notice notice-error"><p>';
        printf(
            /* translators: 1: Current PHP version, 2: Required PHP version */
            esc_html__('GSAP Block Animator requires PHP %2$s or higher. You are running PHP %1$s.', 'gsap-block-animator'),
            PHP_VERSION,
            '7.4'
        );
        echo '</p></div>';
    });
    return;
}

// Load autoloaders
$vendor_autoloader = GSAP_BLOCK_ANIMATOR_PLUGIN_DIR . 'vendor/autoload.php';
$custom_autoloader = GSAP_BLOCK_ANIMATOR_PLUGIN_DIR . 'includes/autoloader.php';

// Load vendor autoloader if available
if (file_exists($vendor_autoloader)) {
    require_once $vendor_autoloader;
}

// Always load our custom autoloader for plugin classes
if (file_exists($custom_autoloader)) {
    require_once $custom_autoloader;
} else {
    add_action('admin_notices', function () {
        echo '<div class="notice notice-error"><p>';
        esc_html_e('GSAP Block Animator: Plugin autoloader not found. Plugin installation may be corrupted.', 'gsap-block-animator');
        echo '</p></div>';
    });
    return;
}

// Initialize plugin
add_action('plugins_loaded', function () {
    try {
        $plugin = Plugin::get_instance();
        $plugin->init();
    } catch (\Throwable $e) {
        error_log(sprintf(
            'GSAP Block Animator initialization error: %s in %s:%d',
            $e->getMessage(),
            $e->getFile(),
            $e->getLine()
        ));

        if (defined('WP_DEBUG') && WP_DEBUG) {
            add_action('admin_notices', function () use ($e) {
                echo '<div class="notice notice-error"><p>';
                printf(
                    /* translators: %s: Error message */
                    esc_html__('GSAP Block Animator error: %s', 'gsap-block-animator'),
                    esc_html($e->getMessage())
                );
                echo '</p></div>';
            });
        }
    }
});

// Plugin activation hook
register_activation_hook(__FILE__, function () {
    // Check requirements during activation
    if (version_compare(PHP_VERSION, '7.4', '<')) {
        wp_die(
            esc_html__('GSAP Block Animator requires PHP 7.4 or higher.', 'gsap-block-animator'),
            esc_html__('Plugin Activation Error', 'gsap-block-animator'),
            ['back_link' => true]
        );
    }

    if (version_compare(get_bloginfo('version'), '6.0', '<')) {
        wp_die(
            esc_html__('GSAP Block Animator requires WordPress 6.0 or higher.', 'gsap-block-animator'),
            esc_html__('Plugin Activation Error', 'gsap-block-animator'),
            ['back_link' => true]
        );
    }

    // Create necessary database tables or options
    try {
        error_log('GSAP Block Animator: Starting plugin activation');
        
        // Check if required interfaces are available
        if (!interface_exists('\Psr\Container\ContainerInterface')) {
            throw new Exception('PSR Container interface not found. Composer autoloader may not be loaded.');
        }
        error_log('GSAP Block Animator: PSR interfaces are available');
        
        $plugin = Plugin::get_instance();
        error_log('GSAP Block Animator: Plugin instance created successfully');
        $plugin->activate();
        error_log('GSAP Block Animator: Plugin activated successfully');
    } catch (\Throwable $e) {
        $error_msg = sprintf(
            'GSAP Block Animator activation error: %s in %s:%d',
            $e->getMessage(),
            $e->getFile(),
            $e->getLine()
        );
        error_log($error_msg);
        
        wp_die(
            sprintf(
                esc_html__('Failed to activate GSAP Block Animator: %s', 'gsap-block-animator'),
                esc_html($e->getMessage())
            ),
            esc_html__('Plugin Activation Error', 'gsap-block-animator'),
            ['back_link' => true]
        );
    }
});

// Plugin deactivation hook
register_deactivation_hook(__FILE__, function () {
    try {
        $plugin = Plugin::get_instance();
        $plugin->deactivate();
    } catch (\Throwable $e) {
        error_log(sprintf(
            'GSAP Block Animator deactivation error: %s',
            $e->getMessage()
        ));
    }
});

// Plugin uninstall hook
register_uninstall_hook(__FILE__, [Plugin::class, 'uninstall']);