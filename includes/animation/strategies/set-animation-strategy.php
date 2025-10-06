<?php

declare(strict_types=1);

namespace GSAPBlockAnimator\Animation\Strategies;

use GSAPBlockAnimator\Animation\Interfaces\Animation_Strategy_Interface;
use GSAPBlockAnimator\Animation\Value_Objects\Animation_Config;

class Set_Animation_Strategy implements Animation_Strategy_Interface {

	private const SIGNED_CSS_UNIT_PATTERN = '/^-?\d+(\.\d+)?(px|em|rem|%|vw|vh)$/';
	private const POSITIVE_CSS_UNIT_PATTERN = '/^\d+(\.\d+)?(px|em|rem|%|vw|vh)$/';
	private const HEX_COLOR_PATTERN = '/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/';
	private const RGB_COLOR_PATTERN = '/^rgba?\([^)]+\)$/';

	public function get_type(): string {
		return 'set';
	}

	public function is_compatible( Animation_Config $config ): bool {
		return $config->get_type() === 'set';
	}

	public function generate_animation_data( Animation_Config $config ): array {
		$properties = $this->prepare_properties( $config );

		return array(
			'type'       => 'set',
			'properties' => $properties,
			'trigger'    => $config->get_trigger(),
		);
	}

	public function validate_config( Animation_Config $config ): array {
		$errors = array();

		if ( empty( $config->get_properties() ) ) {
			$errors[] = 'Set animation requires at least one property to set';
		}

		return $errors;
	}

	private function prepare_properties( Animation_Config $config ): array {
		$properties     = array();
		$raw_properties = $config->get_properties();

		foreach ( $raw_properties as $key => $value ) {
			if ( $this->is_valid_property( $key, $value ) ) {
				$properties[ $key ] = $this->sanitize_property_value( $key, $value );
			}
		}

		return $properties;
	}

	private function is_valid_property( string $key, $value ): bool {
		$allowed_properties = array(
			'x',
			'y',
			'rotation',
			'scale',
			'opacity',
			'backgroundColor',
			'color',
			'width',
			'height',
			'display',
			'visibility',
			'zIndex',
		);

		return in_array( $key, $allowed_properties, true ) && ! empty( $value );
	}

	private function sanitize_property_value( string $key, $value ) {
		switch ( $key ) {
			case 'x':
			case 'y':
				return $this->sanitize_movement_value( $value );
			case 'rotation':
				return $this->sanitize_numeric_value( $value, -360, 360 );
			case 'scale':
				return $this->sanitize_numeric_value( $value, 0.1, 10 );
			case 'opacity':
				return $this->sanitize_numeric_value( $value, 0, 1 );
			case 'backgroundColor':
			case 'color':
				return $this->sanitize_color_value( $value );
			case 'width':
			case 'height':
				return $this->sanitize_size_value( $value );
			case 'display':
				return $this->sanitize_display_value( $value );
			case 'visibility':
				return $this->sanitize_visibility_value( $value );
			case 'zIndex':
				return $this->sanitize_z_index_value( $value );
			default:
				return $value;
		}
	}

	private function sanitize_movement_value( $value ): string {
		if ( is_numeric( $value ) ) {
			return (string) $value . 'px';
		}

		if ( is_string( $value ) && preg_match( self::SIGNED_CSS_UNIT_PATTERN, $value ) ) {
			return $value;
		}

		return '0px';
	}

	private function sanitize_numeric_value( $value, float $min, float $max ): float {
		$numeric_value = is_numeric( $value ) ? (float) $value : 0;
		return max( $min, min( $max, $numeric_value ) );
	}

	private function sanitize_color_value( $value ): string {
		if ( is_string( $value ) && preg_match( self::HEX_COLOR_PATTERN, $value ) ) {
			return $value;
		}

		if ( is_string( $value ) && preg_match( self::RGB_COLOR_PATTERN, $value ) ) {
			return $value;
		}

		return 'transparent';
	}

	private function sanitize_size_value( $value ): string {
		if ( is_numeric( $value ) ) {
			return max( 0, (float) $value ) . 'px';
		}

		if ( is_string( $value ) && preg_match( self::POSITIVE_CSS_UNIT_PATTERN, $value ) ) {
			return $value;
		}

		return 'auto';
	}

	private function sanitize_display_value( $value ): string {
		$allowed_display_values = array(
			'block',
			'inline',
			'inline-block',
			'flex',
			'inline-flex',
			'grid',
			'inline-grid',
			'table',
			'table-cell',
			'none',
		);

		if ( is_string( $value ) && in_array( $value, $allowed_display_values, true ) ) {
			return $value;
		}

		return 'block';
	}

	private function sanitize_visibility_value( $value ): string {
		$allowed_visibility_values = array( 'visible', 'hidden', 'collapse' );

		if ( is_string( $value ) && in_array( $value, $allowed_visibility_values, true ) ) {
			return $value;
		}

		return 'visible';
	}

	private function sanitize_z_index_value( $value ): int {
		if ( is_numeric( $value ) ) {
			return max( -999, min( 999, (int) $value ) );
		}

		return 0;
	}
}
