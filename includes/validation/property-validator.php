<?php

declare(strict_types=1);

namespace GSAPBlockAnimator\Validation;

class Property_Validator {

	private const HEX_COLOR_PATTERN = '/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/';
	private const RGB_COLOR_PATTERN = '/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[01](?:\.\d+)?)?\s*\)$/';
	private const HSL_COLOR_PATTERN = '/^hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(?:,\s*[01](?:\.\d+)?)?\s*\)$/';
	private const CSS_UNIT_PATTERN = '/^-?\d+(\.\d+)?(px|em|rem|%|vw|vh|vmin|vmax|ex|ch|pt|pc|in|cm|mm)$/';
	private const POSITIVE_CSS_UNIT_PATTERN = '/^\d+(\.\d+)?(px|em|rem|%|vw|vh)$/';
	private const SIGNED_CSS_UNIT_PATTERN = '/^-?\d+(\.\d+)?(px|em|rem|%|vw|vh)$/';
	private const BLOCK_NAME_PATTERN = '/^[a-z][a-z0-9-]*\/[a-z][a-z0-9-]*$/';
	private const SECURITY_FORBIDDEN_PATTERN = '/[^\w\s\-\.#\[\]=:,()\'>+~]/';

	public static function validate_css_color( string $value ): bool {
		$keywords = array(
			'transparent',
			'inherit',
			'initial',
			'unset',
			'currentcolor',
			'black',
			'white',
			'red',
			'green',
			'blue',
			'yellow',
			'cyan',
			'magenta',
		);

		return preg_match( self::HEX_COLOR_PATTERN, $value ) ||
				preg_match( self::RGB_COLOR_PATTERN, $value ) ||
				preg_match( self::HSL_COLOR_PATTERN, $value ) ||
				in_array( strtolower( $value ), $keywords, true );
	}

	public static function validate_css_unit( string $value ): bool {
		return preg_match( self::CSS_UNIT_PATTERN, $value ) === 1;
	}

	public static function validate_numeric_range( $value, float $min, float $max ): bool {
		if ( ! is_numeric( $value ) ) {
			return false;
		}

		$numeric = (float) $value;
		return $numeric >= $min && $numeric <= $max;
	}

	public static function validate_css_selector( string $selector ): bool {
		if ( empty( $selector ) || strlen( $selector ) > 500 ) {
			return false;
		}

		$forbidden_patterns = array(
			'javascript:',
			'data:',
			'vbscript:',
			'on\w+\s*=',
			'<script',
			'</script',
		);

		foreach ( $forbidden_patterns as $pattern ) {
			if ( preg_match( '/' . preg_quote( $pattern, '/' ) . '/i', $selector ) ) {
				return false;
			}
		}

		return true;
	}

	public static function validate_ease_function( string $ease ): bool {
		$allowed_eases = array(
			'none',
			'linear',
			'power1.in',
			'power1.out',
			'power1.inOut',
			'power2.in',
			'power2.out',
			'power2.inOut',
			'power3.in',
			'power3.out',
			'power3.inOut',
			'power4.in',
			'power4.out',
			'power4.inOut',
			'back.in',
			'back.out',
			'back.inOut',
			'elastic.in',
			'elastic.out',
			'elastic.inOut',
			'bounce.in',
			'bounce.out',
			'bounce.inOut',
			'circ.in',
			'circ.out',
			'circ.inOut',
			'expo.in',
			'expo.out',
			'expo.inOut',
			'sine.in',
			'sine.out',
			'sine.inOut',
		);

		return in_array( $ease, $allowed_eases, true );
	}

	public static function sanitize_css_unit( $value, string $default_unit = 'px' ): string {
		if ( is_numeric( $value ) ) {
			return (string) $value . $default_unit;
		}

		if ( is_string( $value ) && self::validate_css_unit( $value ) ) {
			return $value;
		}

		return '0' . $default_unit;
	}

	public static function sanitize_numeric_value( $value, float $min, float $max, float $default = 0 ): float {
		if ( ! is_numeric( $value ) ) {
			return $default;
		}

		$numeric = (float) $value;
		return max( $min, min( $max, $numeric ) );
	}

	public static function sanitize_css_color( string $value, string $default = 'transparent' ): string {
		if ( self::validate_css_color( $value ) ) {
			return $value;
		}

		return $default;
	}

	public static function sanitize_css_selector( string $selector ): string {
		$selector = trim( $selector );

		if ( ! self::validate_css_selector( $selector ) ) {
			return '';
		}

		$selector = preg_replace( self::SECURITY_FORBIDDEN_PATTERN, '', $selector );

		return substr( $selector, 0, 200 );
	}

	public static function validate_block_name( string $block_name ): bool {
		return preg_match( self::BLOCK_NAME_PATTERN, $block_name ) === 1;
	}

	public static function validate_trigger_type( string $trigger ): bool {
		$allowed_triggers = array( 'pageload', 'scroll', 'click', 'hover', 'custom' );
		return in_array( $trigger, $allowed_triggers, true );
	}

	public static function validate_animation_type( string $type ): bool {
		$allowed_types = array( 'to', 'from', 'fromTo', 'set', 'timeline' );
		return in_array( $type, $allowed_types, true );
	}

	public static function validate_duration( float $duration ): bool {
		return $duration > 0 && $duration <= 60;
	}

	public static function validate_delay( float $delay ): bool {
		return $delay >= 0 && $delay <= 30;
	}

	public static function validate_repeat_count( int $repeat ): bool {
		return $repeat >= 0 && $repeat <= 1000;
	}

	public static function sanitize_animation_property_value( string $property, $value ) {
		switch ( $property ) {
			case 'x':
			case 'y':
				return self::sanitize_css_unit( $value );

			case 'rotation':
				return self::sanitize_numeric_value( $value, -360, 360, 0 );

			case 'scale':
				return self::sanitize_numeric_value( $value, 0.1, 10, 1 );

			case 'opacity':
				return self::sanitize_numeric_value( $value, 0, 1, 1 );

			case 'backgroundColor':
			case 'color':
				return is_string( $value ) ? self::sanitize_css_color( $value ) : 'transparent';

			case 'width':
			case 'height':
				return self::sanitize_css_unit( $value );

			default:
				return $value;
		}
	}
}
