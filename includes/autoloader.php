<?php

declare(strict_types=1);

namespace GSAPBlockAnimator;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * GSAP Block Animator autoloader.
 *
 * GSAP Block Animator autoloader handler class is responsible for loading the different
 * classes needed to run the plugin.
 *
 * @package GSAPBlockAnimator
 * @since 2.0.0
 */
class Autoloader {

	/**
	 * Classes map.
	 *
	 * Maps GSAP Block Animator classes to file names.
	 *
	 * @since 2.0.0
	 * @access private
	 * @static
	 *
	 * @var array Classes used by GSAP Block Animator.
	 */
	private static array $classes_map;

	/**
	 * Default path for autoloader.
	 *
	 * @var string
	 */
	private static string $default_path;

	/**
	 * Default namespace for autoloader.
	 *
	 * @var string
	 */
	private static string $default_namespace;

	/**
	 * Run autoloader.
	 *
	 * Register a function as `__autoload()` implementation.
	 *
	 * @param string $default_path
	 * @param string $default_namespace
	 *
	 * @since 2.0.0
	 * @access public
	 * @static
	 */
	public static function run( string $default_path = '', string $default_namespace = '' ): void {
		if ( '' === $default_path ) {
			$default_path = GSAP_BLOCK_ANIMATOR_PLUGIN_DIR . 'includes/';
		}

		if ( '' === $default_namespace ) {
			$default_namespace = __NAMESPACE__;
		}

		self::$default_path = $default_path;
		self::$default_namespace = $default_namespace;

		spl_autoload_register( [ __CLASS__, 'autoload' ] );
	}

	/**
	 * Get classes map.
	 *
	 * @since 2.0.0
	 * @access public
	 * @static
	 *
	 * @return array Classes map.
	 */
	public static function get_classes_map(): array {
		if ( ! isset( self::$classes_map ) ) {
			self::init_classes_map();
		}

		return self::$classes_map;
	}

	/**
	 * Initialize classes map.
	 *
	 * @since 2.0.0
	 * @access private
	 * @static
	 */
	private static function init_classes_map(): void {
		self::$classes_map = [
			'Plugin' => 'plugin.php',
			'Container\Container' => 'container/class-container.php',
			'Container\ContainerInterface' => 'container/container-interface.php',
			'Container\ServiceProviderInterface' => 'container/service-provider-interface.php',
			'Container\ContainerException' => 'container/container-exception.php',
			'Services\ServiceProvider' => 'services/service-provider.php',
			'Services\AnimationService' => 'services/animation-service.php',
			'Services\BlockExtensionService' => 'services/block-extension-service.php',
			'Validation\Animation_Validator' => 'validation/class-animation-validator.php',
			'Validation\Property_Validator' => 'validation/property-validator.php',
			'Animation\Interfaces\Animation_Strategy_Interface' => 'animation/interfaces/animation-strategy-interface.php',
			'Animation\Strategies\To_Animation_Strategy' => 'animation/strategies/to-animation-strategy.php',
			'Animation\Strategies\From_Animation_Strategy' => 'animation/strategies/from-animation-strategy.php',
			'Animation\Strategies\FromTo_Animation_Strategy' => 'animation/strategies/fromto-animation-strategy.php',
			'Animation\Strategies\Set_Animation_Strategy' => 'animation/strategies/set-animation-strategy.php',
			'Animation\Value_Objects\Animation_Config' => 'animation/value-objects/animation-config.php',
			'Exceptions\Animation_Exception' => 'exceptions/animation-exception.php',
			'Exceptions\Service_Exception' => 'exceptions/service-exception.php',
			'Exceptions\Validation_Exception' => 'exceptions/validation-exception.php',
		];
	}

	/**
	 * Load class.
	 *
	 * For a given class name, require the class file.
	 *
	 * @since 2.0.0
	 * @access private
	 * @static
	 *
	 * @param string $relative_class_name Class name.
	 */
	private static function load_class( string $relative_class_name ): void {
		$classes_map = self::get_classes_map();

		if ( isset( $classes_map[ $relative_class_name ] ) ) {
			$filename = self::$default_path . $classes_map[ $relative_class_name ];
		} else {
			// Fallback to automatic conversion for unmapped classes
			$filename = strtolower(
				preg_replace(
					[ '/([a-z])([A-Z])/', '/_/', '/\\\/' ],
					[ '$1-$2', '-', DIRECTORY_SEPARATOR ],
					$relative_class_name
				)
			);

			$filename = self::$default_path . $filename . '.php';
		}

		if ( is_readable( $filename ) ) {
			require_once $filename;
		}
	}

	/**
	 * Autoload.
	 *
	 * For a given class, check if it exist and load it.
	 *
	 * @since 2.0.0
	 * @access private
	 * @static
	 *
	 * @param string $class_name Class name.
	 */
	private static function autoload( string $class_name ): void {
		if ( 0 !== strpos( $class_name, self::$default_namespace . '\\' ) ) {
			return;
		}

		$relative_class_name = preg_replace( '/^' . preg_quote( self::$default_namespace, '/' ) . '\\\/', '', $class_name );

		if ( ! class_exists( $class_name ) ) {
			self::load_class( $relative_class_name );
		}
	}
}

// Initialize the autoloader
Autoloader::run();