<?php

declare(strict_types=1);

namespace GSAPBlockAnimator\Exceptions;

use Exception;

class Service_Exception extends Exception {

	public static function initialization_failed( string $service, string $reason = '' ): self {
		return new self(
			$reason
				? sprintf( 'Failed to initialize %s service: %s', $service, $reason )
				: sprintf( 'Failed to initialize %s service', $service ),
			500
		);
	}

	public static function dependency_missing( string $dependency, string $service = '' ): self {
		return new self(
			$service
				? sprintf( 'Missing dependency "%s" for %s service', $dependency, $service )
				: sprintf( 'Missing dependency: %s', $dependency ),
			500
		);
	}

	public static function operation_failed( string $operation, string $reason = '' ): self {
		return new self(
			$reason
				? sprintf( 'Operation "%s" failed: %s', $operation, $reason )
				: sprintf( 'Operation "%s" failed', $operation ),
			500
		);
	}

	public static function configuration_error( string $setting, string $reason = '' ): self {
		return new self(
			$reason
				? sprintf( 'Configuration error for "%s": %s', $setting, $reason )
				: sprintf( 'Configuration error: %s', $setting ),
			500
		);
	}

	public static function resource_not_found( string $resource, string $identifier = '' ): self {
		return new self(
			$identifier
				? sprintf( 'Resource "%s" not found with identifier: %s', $resource, $identifier )
				: sprintf( 'Resource not found: %s', $resource ),
			404
		);
	}

	public static function permission_denied( string $operation, string $resource = '' ): self {
		return new self(
			$resource
				? sprintf( 'Permission denied for operation "%s" on resource: %s', $operation, $resource )
				: sprintf( 'Permission denied for operation: %s', $operation ),
			403
		);
	}

	public static function rate_limit_exceeded( string $operation, int $limit ): self {
		return new self(
			sprintf( 'Rate limit exceeded for operation "%s". Limit: %d requests', $operation, $limit ),
			429
		);
	}

	public static function external_service_error( string $service, string $error = '' ): self {
		return new self(
			$error
				? sprintf( 'External service "%s" error: %s', $service, $error )
				: sprintf( 'External service "%s" is unavailable', $service ),
			502
		);
	}
}
