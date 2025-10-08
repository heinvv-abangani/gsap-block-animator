<?php

declare(strict_types=1);

namespace GSAPBlockAnimator\Services;

/**
 * Block extension service
 *
 * @package GSAPBlockAnimator\Services
 * @since 2.0.0
 */
class BlockExtensionService {

	private const HTML_ELEMENT_PATTERN = '/^(\s*<[^>]+)(\s*>)/';

	/**
	 * Constructor
	 */
	public function __construct() {
		// Service initialization
	}

	/**
	 * Register block extensions
	 *
	 * @return void
	 */
	public function register_extensions(): void {
		// Add animation attributes to blocks
		add_filter( 'register_block_type_args', array( $this, 'add_animation_attributes' ), 10, 2 );

		// Process animation data during block rendering
		add_filter( 'render_block', array( $this, 'add_animation_data' ), 10, 2 );
	}

	/**
	 * Add animation attributes to block types
	 *
	 * @param array<string, mixed> $args Block type args
	 * @param string               $block_type Block type name
	 * @return array<string, mixed> Modified block type args
	 */
	public function add_animation_attributes( array $args, string $block_type ): array {
		// Skip core dynamic blocks
		$skip_blocks = array(
			'core/block',
			'core/template',
			'core/template-part',
			'core/navigation',
		);

		if ( in_array( $block_type, $skip_blocks, true ) ) {
			return $args;
		}

		// Initialize attributes array if not exists
		if ( ! isset( $args['attributes'] ) ) {
			$args['attributes'] = array();
		}

		// Add gsapAnimation attribute
		$args['attributes']['gsapAnimation'] = array(
			'type'    => 'object',
			'default' => array(
				'enabled'    => false,
				'type'       => 'to',
				'trigger'    => 'pageload',
				'properties' => array(),
				'timing'     => array(
					'duration' => 0.5,
					'delay'    => 0,
					'repeat'   => 0,
					'yoyo'     => false,
					'ease'     => 'power1.out',
				),
			),
		);

		return $args;
	}

	/**
	 * Add animation data to rendered blocks
	 *
	 * @param string               $block_content Block content
	 * @param array<string, mixed> $block Block data
	 * @return string Modified block content
	 */
	public function add_animation_data( string $block_content, array $block ): string {
		$animation_config = $block['attrs']['gsapAnimation'] ?? null;

		if ( ! $animation_config || ! ( $animation_config['enabled'] ?? false ) ) {
			return $block_content;
		}

		// Add animation data attributes
		$animation_data = wp_json_encode( $animation_config );
		$trigger        = esc_attr( $animation_config['trigger'] ?? 'pageload' );
		$selector       = $animation_config['selector'] ?? null;

		// Create unique ID for the block
		$block_id = 'gsap-block-' . $block['blockName'] . '-' . wp_generate_uuid4();

		$attributes = sprintf(
			' data-gsap-animation="%s" data-gsap-trigger="%s" data-gsap-block-id="%s"',
			esc_attr( $animation_data ),
			$trigger,
			esc_attr( $block_id )
		);

		if ( $selector ) {
			$attributes .= sprintf( ' data-gsap-selector="%s"', esc_attr( $selector ) );
		}

		// Add attributes to the first HTML element in the block content
		if ( preg_match( self::HTML_ELEMENT_PATTERN, $block_content, $matches ) ) {
			$before        = $matches[1];
			$after         = $matches[2];
			$block_content = $before . $attributes . $after . substr( $block_content, strlen( $matches[0] ) );
		}

		return $block_content;
	}
}
