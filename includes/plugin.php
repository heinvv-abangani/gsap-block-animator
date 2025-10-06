<?php

declare(strict_types=1);

namespace GSAPBlockAnimator;

use GSAPBlockAnimator\Container\Container;
use GSAPBlockAnimator\Container\ContainerInterface;
use GSAPBlockAnimator\Services\ServiceProvider;

/**
 * Main plugin class
 *
 * @package GSAPBlockAnimator
 * @since 2.0.0
 */
class Plugin {

	/**
	 * Plugin instance
	 *
	 * @var self|null
	 */
	private static ?self $instance = null;

	/**
	 * Dependency injection container
	 *
	 * @var ContainerInterface
	 */
	private ContainerInterface $container;

	/**
	 * Plugin initialization status
	 *
	 * @var bool
	 */
	private bool $initialized = false;

	/**
	 * Private constructor for singleton pattern
	 */
	private function __construct() {
		$this->container = new Container();
	}

	/**
	 * Get plugin instance
	 *
	 * @return self
	 */
	public static function get_instance(): self {
		if ( self::$instance === null ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	/**
	 * Initialize the plugin
	 *
	 * @return void
	 */
	public function init(): void {
		if ( $this->initialized ) {
			return;
		}

		$this->register_services();
		$this->setup_hooks();
		$this->load_textdomain();

		$this->initialized = true;

		/**
		 * Fires after the plugin has been initialized
		 *
		 * @since 2.0.0
		 *
		 * @param Plugin $plugin Plugin instance
		 */
		do_action( 'gsap_block_animator_initialized', $this );
	}

	/**
	 * Plugin activation handler
	 *
	 * @return void
	 */
	public function activate(): void {
		// Flush rewrite rules
		flush_rewrite_rules();

		// Create plugin options with default values
		$default_options = array(
			'version'          => GSAP_BLOCK_ANIMATOR_VERSION,
			'enabled'          => true,
			'load_gsap'        => true,
			'gsap_source'      => 'cdn', // cdn or local
			'performance_mode' => false,
			'debug_mode'       => false,
		);

		add_option( 'gsap_block_animator_options', $default_options );

		/**
		 * Fires when the plugin is activated
		 *
		 * @since 2.0.0
		 */
		do_action( 'gsap_block_animator_activated' );
	}

	/**
	 * Plugin deactivation handler
	 *
	 * @return void
	 */
	public function deactivate(): void {
		// Flush rewrite rules
		flush_rewrite_rules();

		/**
		 * Fires when the plugin is deactivated
		 *
		 * @since 2.0.0
		 */
		do_action( 'gsap_block_animator_deactivated' );
	}

	/**
	 * Plugin uninstall handler
	 *
	 * @return void
	 */
	public static function uninstall(): void {
		// Remove plugin options
		delete_option( 'gsap_block_animator_options' );

		// Remove any custom database tables
		// (None in this version, but placeholder for future use)

		/**
		 * Fires when the plugin is uninstalled
		 *
		 * @since 2.0.0
		 */
		do_action( 'gsap_block_animator_uninstalled' );
	}

	/**
	 * Get the dependency injection container
	 *
	 * @return ContainerInterface
	 */
	public function get_container(): ContainerInterface {
		return $this->container;
	}

	/**
	 * Check if plugin is initialized
	 *
	 * @return bool
	 */
	public function is_initialized(): bool {
		return $this->initialized;
	}

	/**
	 * Register services in the container
	 *
	 * @return void
	 */
	private function register_services(): void {
		$service_provider = new ServiceProvider();
		$this->container->register( $service_provider );
	}

	/**
	 * Setup WordPress hooks
	 *
	 * @return void
	 */
	private function setup_hooks(): void {
		// Enqueue assets
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_frontend_assets' ) );
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_editor_assets' ) );

		// Register block extensions
		add_action( 'init', array( $this, 'register_block_extensions' ), 20 );

		// Add body class for styling
		add_filter( 'body_class', array( $this, 'add_body_class' ) );

		// Handle admin notices
		if ( is_admin() ) {
			add_action( 'admin_notices', array( $this, 'admin_notices' ) );
		}
	}

	/**
	 * Enqueue frontend assets
	 *
	 * @return void
	 */
	public function enqueue_frontend_assets(): void {
		$options = get_option( 'gsap_block_animator_options', array() );

		// Load GSAP if enabled
		if ( $options['load_gsap'] ?? true ) {
			$this->enqueue_gsap_library();
		}

		// Enqueue frontend script
		wp_enqueue_script(
			'gsap-block-animator-frontend',
			GSAP_BLOCK_ANIMATOR_DIST_URL . 'js/frontend.js',
			array( 'gsap' ),
			GSAP_BLOCK_ANIMATOR_VERSION,
			true
		);

		// Localize script with settings
		wp_localize_script(
			'gsap-block-animator-frontend',
			'gsapBlockAnimatorSettings',
			array(
				'performanceMode' => $options['performance_mode'] ?? false,
				'debugMode'       => $options['debug_mode'] ?? false,
			)
		);
	}

	/**
	 * Enqueue editor assets
	 *
	 * @return void
	 */
	public function enqueue_editor_assets(): void {
		// Enqueue GSAP for editor previews
		$this->enqueue_gsap_library();

		// Enqueue editor script
		wp_enqueue_script(
			'gsap-block-animator-editor',
			GSAP_BLOCK_ANIMATOR_DIST_URL . 'js/editor.js',
			array(
				'wp-blocks',
				'wp-element',
				'wp-block-editor',
				'wp-components',
				'wp-compose',
				'wp-hooks',
				'wp-i18n',
			),
			GSAP_BLOCK_ANIMATOR_VERSION,
			true
		);

		// TODO: Enqueue editor styles when CSS is built
		// wp_enqueue_style(
		//	'gsap-block-animator-editor',
		//	GSAP_BLOCK_ANIMATOR_DIST_URL . 'css/editor.css',
		//	array( 'wp-edit-blocks' ),
		//	GSAP_BLOCK_ANIMATOR_VERSION
		// );

		// Localize script with editor settings
		wp_localize_script(
			'gsap-block-animator-editor',
			'gsapBlockAnimatorEditor',
			array(
				'apiUrl'    => rest_url( 'gsap-block-animator/v1/' ),
				'nonce'     => wp_create_nonce( 'wp_rest' ),
				'pluginUrl' => GSAP_BLOCK_ANIMATOR_PLUGIN_URL,
			)
		);
	}

	/**
	 * Register block extensions
	 *
	 * @return void
	 */
	public function register_block_extensions(): void {
		try {
			$block_extensions = $this->container->resolve( 'GSAPBlockAnimator\Services\BlockExtensionService' );
			$block_extensions->register_extensions();
		} catch ( \Throwable $e ) {
			error_log(
				sprintf(
					'Failed to register block extensions: %s',
					$e->getMessage()
				)
			);
		}
	}

	/**
	 * Add body class for plugin styling
	 *
	 * @param array<string> $classes Body classes
	 * @return array<string> Modified body classes
	 */
	public function add_body_class( array $classes ): array {
		$options = get_option( 'gsap_block_animator_options', array() );

		if ( $options['enabled'] ?? true ) {
			$classes[] = 'gsap-block-animator-enabled';
		}

		if ( $options['performance_mode'] ?? false ) {
			$classes[] = 'gsap-block-animator-performance';
		}

		return $classes;
	}

	/**
	 * Display admin notices
	 *
	 * @return void
	 */
	public function admin_notices(): void {
		// Check if GSAP assets are available
		$gsap_script = GSAP_BLOCK_ANIMATOR_DIST_URL . 'js/frontend.js';
		$headers     = @get_headers( $gsap_script );

		if ( ! $headers || strpos( $headers[0], '200' ) === false ) {
			echo '<div class="notice notice-warning"><p>';
			esc_html_e(
				'GSAP Block Animator: Frontend assets not found. Please run "npm run build" to compile assets.',
				'gsap-block-animator'
			);
			echo '</p></div>';
		}
	}

	/**
	 * Load plugin textdomain
	 *
	 * @return void
	 */
	private function load_textdomain(): void {
		load_plugin_textdomain(
			'gsap-block-animator',
			false,
			dirname( plugin_basename( GSAP_BLOCK_ANIMATOR_PLUGIN_FILE ) ) . '/languages'
		);
	}

	/**
	 * Enqueue GSAP library
	 *
	 * @return void
	 */
	private function enqueue_gsap_library(): void {
		$options = get_option( 'gsap_block_animator_options', array() );
		$source  = $options['gsap_source'] ?? 'cdn';

		if ( $source === 'cdn' ) {
			wp_enqueue_script(
				'gsap',
				'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js',
				array(),
				'3.12.5',
				true
			);

			wp_enqueue_script(
				'gsap-scrolltrigger',
				'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js',
				array( 'gsap' ),
				'3.12.5',
				true
			);
		} else {
			// Local GSAP files (if available)
			wp_enqueue_script(
				'gsap',
				GSAP_BLOCK_ANIMATOR_ASSETS_URL . 'vendor/gsap/gsap.min.js',
				array(),
				'3.12.5',
				true
			);

			wp_enqueue_script(
				'gsap-scrolltrigger',
				GSAP_BLOCK_ANIMATOR_ASSETS_URL . 'vendor/gsap/ScrollTrigger.min.js',
				array( 'gsap' ),
				'3.12.5',
				true
			);
		}
	}

	/**
	 * Prevent cloning
	 */
	private function __clone() {
	}

	/**
	 * Prevent unserialization
	 */
	public function __wakeup(): void {
		throw new \Exception( 'Cannot unserialize singleton' );
	}
}
