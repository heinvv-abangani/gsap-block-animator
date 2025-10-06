<?php

declare(strict_types=1);

namespace GSAPBlockAnimator\Animation\Strategies;

use GSAPBlockAnimator\Animation\Interfaces\Animation_Strategy_Interface;
use GSAPBlockAnimator\Animation\Value_Objects\Animation_Config;

class FromTo_Animation_Strategy implements Animation_Strategy_Interface {

	private const SIGNED_CSS_UNIT_PATTERN   = '/^-?\d+(\.\d+)?(px|em|rem|%|vw|vh)$/';
	private const POSITIVE_CSS_UNIT_PATTERN = '/^\d+(\.\d+)?(px|em|rem|%|vw|vh)$/';
	private const HEX_COLOR_PATTERN         = '/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/';
	private const RGB_COLOR_PATTERN         = '/^rgba?\([^)]+\)$/';
	private const MOVEMENT_UNIT_PATTERN     = '/^(-?\d+(?:\.\d+)?)(px|em|rem|%|vw|vh)$/';

	public function get_type(): string {
		return 'fromTo';
	}

	public function is_compatible( Animation_Config $config ): bool {
		return $config->get_type() === 'fromTo';
	}

	public function generate_animation_data( Animation_Config $config ): array {
		$from_properties = $this->prepare_from_properties( $config );
		$to_properties   = $this->prepare_to_properties( $config );
		$timing          = $this->prepare_timing( $config );

		return array(
			'type'           => 'fromTo',
			'fromProperties' => $from_properties,
			'toProperties'   => $to_properties,
			'timing'         => $timing,
			'trigger'        => $config->get_trigger(),
		);
	}

	public function validate_config( Animation_Config $config ): array {
		$errors = array();

		if ( empty( $config->get_properties() ) ) {
			$errors[] = 'FromTo animation requires at least one property to animate';
		}

		if ( $config->get_duration() <= 0 ) {
			$errors[] = 'Animation duration must be greater than 0';
		}

		return $errors;
	}

	private function prepare_from_properties( Animation_Config $config ): array {
		$properties     = array();
		$raw_properties = $config->get_properties();

		foreach ( $raw_properties as $key => $value ) {
			if ( $this->is_valid_property( $key, $value ) ) {
				$properties[ $key ] = $this->generate_from_value( $key, $value );
			}
		}

		return $properties;
	}

	private function prepare_to_properties( Animation_Config $config ): array {
		$properties     = array();
		$raw_properties = $config->get_properties();

		foreach ( $raw_properties as $key => $value ) {
			if ( $this->is_valid_property( $key, $value ) ) {
				$properties[ $key ] = $this->sanitize_property_value( $key, $value );
			}
		}

		return $properties;
	}

	private function prepare_timing( Animation_Config $config ): array {
		return array(
			'duration' => max( 0.1, $config->get_duration() ),
			'delay'    => max( 0, $config->get_delay() ),
			'repeat'   => max( 0, $config->get_repeat() ),
			'yoyo'     => $config->is_yoyo(),
			'ease'     => $this->sanitize_ease( $config->get_ease() ),
		);
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
		);

		return in_array( $key, $allowed_properties, true ) && ! empty( $value );
	}

	private function generate_from_value( string $key, $value ) {
		switch ( $key ) {
			case 'x':
			case 'y':
				return $this->calculate_opposite_movement( $value );
			case 'rotation':
				return $this->calculate_opposite_rotation( $value );
			case 'scale':
				return $this->calculate_opposite_scale( $value );
			case 'opacity':
				return $this->calculate_opposite_opacity( $value );
			case 'backgroundColor':
			case 'color':
				return 'transparent';
			case 'width':
			case 'height':
				return '0px';
			default:
				return $value;
		}
	}

	private function calculate_opposite_movement( $value ): string {
		if ( is_numeric( $value ) ) {
			$numeric = (float) $value;
			return ( $numeric * -1 ) . 'px';
		}

		if ( is_string( $value ) && preg_match( self::MOVEMENT_UNIT_PATTERN, $value, $matches ) ) {
			$numeric = (float) $matches[1];
			$unit    = $matches[2];
			return ( $numeric * -1 ) . $unit;
		}

		return '0px';
	}

	private function calculate_opposite_rotation( $value ): float {
		$numeric = is_numeric( $value ) ? (float) $value : 0;
		return $numeric > 0 ? $numeric - 360 : $numeric + 360;
	}

	private function calculate_opposite_scale( $value ): float {
		$numeric = is_numeric( $value ) ? (float) $value : 1;
		return $numeric > 1 ? 0.1 : 2.0;
	}

	private function calculate_opposite_opacity( $value ): float {
		$numeric = is_numeric( $value ) ? (float) $value : 1;
		return $numeric > 0.5 ? 0 : 1;
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

	private function sanitize_ease( string $ease ): string {
		$allowed_eases = array(
			'none',
			'power1.out',
			'power2.out',
			'power3.out',
			'back.out',
			'elastic.out',
			'bounce.out',
			'power1.in',
			'power2.in',
			'power3.in',
			'power1.inOut',
			'power2.inOut',
			'power3.inOut',
		);

		return in_array( $ease, $allowed_eases, true ) ? $ease : 'power1.out';
	}
}
