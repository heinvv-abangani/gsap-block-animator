<?php

declare(strict_types=1);

namespace GSAPBlockAnimator\Container;

use Psr\Container\ContainerExceptionInterface;
use Exception;

/**
 * Container exception
 *
 * @package GSAPBlockAnimator\Container
 * @since 2.0.0
 */
class ContainerException extends Exception implements ContainerExceptionInterface {

	/**
	 * Create exception for service not found
	 *
	 * @param string $service Service identifier
	 * @return self
	 */
	public static function service_not_found( string $service ): self {
		return new self( sprintf( 'Service "%s" not found in container', $service ) );
	}

	/**
	 * Create exception for circular dependency
	 *
	 * @param string $service Service identifier
	 * @return self
	 */
	public static function circular_dependency( string $service ): self {
		return new self( sprintf( 'Circular dependency detected for service "%s"', $service ) );
	}

	/**
	 * Create exception for invalid service
	 *
	 * @param string $service Service identifier
	 * @param string $reason Reason for invalidity
	 * @return self
	 */
	public static function invalid_service( string $service, string $reason ): self {
		return new self( sprintf( 'Invalid service "%s": %s', $service, $reason ) );
	}
}
