<?php

declare(strict_types=1);

namespace GSAPBlockAnimator\Validation;

use GSAPBlockAnimator\Exceptions\Validation_Exception;

class Animation_Validator {

	private const SIGNED_CSS_UNIT_PATTERN = '/^-?\d+(\.\d+)?(px|em|rem|%|vw|vh)$/';
	private const POSITIVE_CSS_UNIT_PATTERN = '/^\d+(\.\d+)?(px|em|rem|%|vw|vh)$/';
	private const HEX_COLOR_PATTERN = '/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/';
	private const RGB_COLOR_PATTERN = '/^rgba?\([^)]+\)$/';

	private array $rules;
	private array $errors;

	public function __construct() {
		$this->rules  = $this->get_validation_rules();
		$this->errors = array();
	}

	public function validate( array $data ): bool {
		$this->errors = array();

		$this->validate_enabled( $data );
		$this->validate_type( $data );
		$this->validate_trigger( $data );
		$this->validate_properties( $data );
		$this->validate_timing( $data );
		$this->validate_selector( $data );

		return empty( $this->errors );
	}

	public function get_errors(): array {
		return $this->errors;
	}

	public function validate_or_throw( array $data ): void {
		if ( ! $this->validate( $data ) ) {
			throw Validation_Exception::from_errors( $this->errors );
		}
	}

	private function validate_enabled( array $data ): void {
		if ( ! isset( $data['enabled'] ) ) {
			$this->add_error( 'enabled', 'Field is required' );
			return;
		}

		if ( ! is_bool( $data['enabled'] ) ) {
			$this->add_error( 'enabled', 'Must be a boolean value' );
		}
	}

	private function validate_type( array $data ): void {
		if ( ! isset( $data['type'] ) ) {
			$this->add_error( 'type', 'Animation type is required' );
			return;
		}

		if ( ! is_string( $data['type'] ) ) {
			$this->add_error( 'type', 'Must be a string' );
			return;
		}

		if ( ! in_array( $data['type'], $this->rules['types'], true ) ) {
			$this->add_error(
				'type',
				sprintf(
					'Invalid type. Allowed: %s',
					implode( ', ', $this->rules['types'] )
				)
			);
		}
	}

	private function validate_trigger( array $data ): void {
		if ( ! isset( $data['trigger'] ) ) {
			$this->add_error( 'trigger', 'Trigger type is required' );
			return;
		}

		if ( ! is_string( $data['trigger'] ) ) {
			$this->add_error( 'trigger', 'Must be a string' );
			return;
		}

		if ( ! in_array( $data['trigger'], $this->rules['triggers'], true ) ) {
			$this->add_error(
				'trigger',
				sprintf(
					'Invalid trigger. Allowed: %s',
					implode( ', ', $this->rules['triggers'] )
				)
			);
		}
	}

	private function validate_properties( array $data ): void {
		if ( ! isset( $data['properties'] ) ) {
			$this->add_error( 'properties', 'Properties are required' );
			return;
		}

		if ( ! is_array( $data['properties'] ) ) {
			$this->add_error( 'properties', 'Must be an array' );
			return;
		}

		if ( ( $data['enabled'] ?? false ) && empty( $data['properties'] ) ) {
			$this->add_error( 'properties', 'At least one property is required when animation is enabled' );
			return;
		}

		foreach ( $data['properties'] as $key => $value ) {
			$this->validate_property( $key, $value );
		}
	}

	private function validate_property( string $key, $value ): void {
		if ( ! in_array( $key, $this->rules['properties'], true ) ) {
			$this->add_error(
				"properties.{$key}",
				sprintf(
					'Invalid property. Allowed: %s',
					implode( ', ', $this->rules['properties'] )
				)
			);
			return;
		}

		switch ( $key ) {
			case 'x':
			case 'y':
				$this->validate_movement_property( $key, $value );
				break;
			case 'rotation':
				$this->validate_rotation_property( $key, $value );
				break;
			case 'scale':
				$this->validate_scale_property( $key, $value );
				break;
			case 'opacity':
				$this->validate_opacity_property( $key, $value );
				break;
			case 'backgroundColor':
			case 'color':
				$this->validate_color_property( $key, $value );
				break;
			case 'width':
			case 'height':
				$this->validate_size_property( $key, $value );
				break;
		}
	}

	private function validate_movement_property( string $key, $value ): void {
		if ( is_numeric( $value ) ) {
			return;
		}

		if ( ! is_string( $value ) || ! preg_match( self::SIGNED_CSS_UNIT_PATTERN, $value ) ) {
			$this->add_error( "properties.{$key}", 'Must be a number or valid CSS unit' );
		}
	}

	private function validate_rotation_property( string $key, $value ): void {
		if ( ! is_numeric( $value ) ) {
			$this->add_error( "properties.{$key}", 'Must be a number' );
			return;
		}

		$numeric = (float) $value;
		if ( $numeric < -360 || $numeric > 360 ) {
			$this->add_error( "properties.{$key}", 'Must be between -360 and 360 degrees' );
		}
	}

	private function validate_scale_property( string $key, $value ): void {
		if ( ! is_numeric( $value ) ) {
			$this->add_error( "properties.{$key}", 'Must be a number' );
			return;
		}

		$numeric = (float) $value;
		if ( $numeric < 0.1 || $numeric > 10 ) {
			$this->add_error( "properties.{$key}", 'Must be between 0.1 and 10' );
		}
	}

	private function validate_opacity_property( string $key, $value ): void {
		if ( ! is_numeric( $value ) ) {
			$this->add_error( "properties.{$key}", 'Must be a number' );
			return;
		}

		$numeric = (float) $value;
		if ( $numeric < 0 || $numeric > 1 ) {
			$this->add_error( "properties.{$key}", 'Must be between 0 and 1' );
		}
	}

	private function validate_color_property( string $key, $value ): void {
		if ( ! is_string( $value ) ) {
			$this->add_error( "properties.{$key}", 'Must be a string' );
			return;
		}

		$is_hex     = preg_match( self::HEX_COLOR_PATTERN, $value );
		$is_rgb     = preg_match( self::RGB_COLOR_PATTERN, $value );
		$is_keyword = in_array( strtolower( $value ), array( 'transparent', 'inherit', 'initial', 'unset' ), true );

		if ( ! $is_hex && ! $is_rgb && ! $is_keyword ) {
			$this->add_error( "properties.{$key}", 'Must be a valid color (hex, rgb, or keyword)' );
		}
	}

	private function validate_size_property( string $key, $value ): void {
		if ( is_numeric( $value ) ) {
			return;
		}

		if ( ! is_string( $value ) || ! preg_match( self::POSITIVE_CSS_UNIT_PATTERN, $value ) ) {
			$this->add_error( "properties.{$key}", 'Must be a positive number or valid CSS unit' );
		}
	}

	private function validate_timing( array $data ): void {
		if ( ! isset( $data['timing'] ) ) {
			$this->add_error( 'timing', 'Timing configuration is required' );
			return;
		}

		if ( ! is_array( $data['timing'] ) ) {
			$this->add_error( 'timing', 'Must be an array' );
			return;
		}

		$timing = $data['timing'];

		$this->validate_duration( $timing );
		$this->validate_delay( $timing );
		$this->validate_repeat( $timing );
		$this->validate_yoyo( $timing );
		$this->validate_ease( $timing );
	}

	private function validate_duration( array $timing ): void {
		if ( ! isset( $timing['duration'] ) ) {
			$this->add_error( 'timing.duration', 'Duration is required' );
			return;
		}

		if ( ! is_numeric( $timing['duration'] ) ) {
			$this->add_error( 'timing.duration', 'Must be a number' );
			return;
		}

		$duration = (float) $timing['duration'];
		if ( $duration <= 0 || $duration > 10 ) {
			$this->add_error( 'timing.duration', 'Must be between 0.1 and 10 seconds' );
		}
	}

	private function validate_delay( array $timing ): void {
		if ( ! isset( $timing['delay'] ) ) {
			return;
		}

		if ( ! is_numeric( $timing['delay'] ) ) {
			$this->add_error( 'timing.delay', 'Must be a number' );
			return;
		}

		$delay = (float) $timing['delay'];
		if ( $delay < 0 || $delay > 5 ) {
			$this->add_error( 'timing.delay', 'Must be between 0 and 5 seconds' );
		}
	}

	private function validate_repeat( array $timing ): void {
		if ( ! isset( $timing['repeat'] ) ) {
			return;
		}

		if ( ! is_int( $timing['repeat'] ) && ! is_numeric( $timing['repeat'] ) ) {
			$this->add_error( 'timing.repeat', 'Must be an integer' );
			return;
		}

		$repeat = (int) $timing['repeat'];
		if ( $repeat < 0 || $repeat > 100 ) {
			$this->add_error( 'timing.repeat', 'Must be between 0 and 100' );
		}
	}

	private function validate_yoyo( array $timing ): void {
		if ( ! isset( $timing['yoyo'] ) ) {
			return;
		}

		if ( ! is_bool( $timing['yoyo'] ) ) {
			$this->add_error( 'timing.yoyo', 'Must be a boolean' );
		}
	}

	private function validate_ease( array $timing ): void {
		if ( ! isset( $timing['ease'] ) ) {
			$this->add_error( 'timing.ease', 'Ease function is required' );
			return;
		}

		if ( ! is_string( $timing['ease'] ) ) {
			$this->add_error( 'timing.ease', 'Must be a string' );
			return;
		}

		if ( ! in_array( $timing['ease'], $this->rules['eases'], true ) ) {
			$this->add_error(
				'timing.ease',
				sprintf(
					'Invalid ease function. Allowed: %s',
					implode( ', ', $this->rules['eases'] )
				)
			);
		}
	}

	private function validate_selector( array $data ): void {
		if ( ! isset( $data['selector'] ) || empty( $data['selector'] ) ) {
			return;
		}

		if ( ! is_string( $data['selector'] ) ) {
			$this->add_error( 'selector', 'Must be a string' );
			return;
		}

		if ( strlen( $data['selector'] ) > 200 ) {
			$this->add_error( 'selector', 'Must be less than 200 characters' );
		}
	}

	private function add_error( string $field, string $message ): void {
		$this->errors[] = "{$field}: {$message}";
	}

	private function get_validation_rules(): array {
		return array(
			'types'      => array( 'to', 'from', 'fromTo', 'set' ),
			'triggers'   => array( 'pageload', 'scroll', 'click', 'hover' ),
			'properties' => array(
				'x',
				'y',
				'rotation',
				'scale',
				'opacity',
				'backgroundColor',
				'color',
				'width',
				'height',
			),
			'eases'      => array(
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
			),
		);
	}
}
