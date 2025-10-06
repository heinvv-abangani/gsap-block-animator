<?php

declare(strict_types=1);

namespace GSAPBlockAnimator\Exceptions;

use Exception;

class Validation_Exception extends Exception {

	/**
	 * Validation errors array
	 *
	 * @var array
	 */
	private array $errors;

	public function __construct( array $errors, string $message = '', int $code = 422 ) {
		$this->errors = $errors;

		$message = $message ? $message : $this->format_error_message( $errors );

		parent::__construct( $message, $code );
	}

	public function get_errors(): array {
		return $this->errors;
	}

	public function has_errors(): bool {
		return ! empty( $this->errors );
	}

	public function get_first_error(): ?string {
		return $this->errors[0] ?? null;
	}

	public static function from_errors( array $errors ): self {
		return new self( $errors );
	}

	public static function invalid_property( string $property, string $reason = '' ): self {
		$message = $reason
			? sprintf( 'Invalid property "%s": %s', $property, $reason )
			: sprintf( 'Invalid property: %s', $property );

		return new self( array( $message ) );
	}

	public static function required_field_missing( string $field ): self {
		return new self( array( sprintf( 'Required field "%s" is missing', $field ) ) );
	}

	public static function invalid_value_type( string $field, string $expected, string $actual ): self {
		return new self(
			array(
				sprintf( 'Invalid value type for "%s". Expected %s, got %s', $field, $expected, $actual ),
			)
		);
	}

	public static function value_out_of_range( string $field, $value, $min, $max ): self {
		return new self(
			array(
				sprintf( 'Value for "%s" (%s) is out of range. Must be between %s and %s', $field, $value, $min, $max ),
			)
		);
	}

	public static function invalid_format( string $field, string $format, $value ): self {
		return new self(
			array(
				sprintf( 'Invalid format for "%s". Expected %s format, got: %s', $field, $format, $value ),
			)
		);
	}

	public static function invalid_enum_value( string $field, $value, array $allowed ): self {
		return new self(
			array(
				sprintf(
					'Invalid value for "%s": %s. Allowed values: %s',
					$field,
					$value,
					implode( ', ', $allowed )
				),
			)
		);
	}

	private function format_error_message( array $errors ): string {
		if ( empty( $errors ) ) {
			return 'Validation failed';
		}

		if ( count( $errors ) === 1 ) {
			return $errors[0];
		}

		return sprintf( 'Validation failed with %d errors: %s', count( $errors ), implode( '; ', $errors ) );
	}
}
