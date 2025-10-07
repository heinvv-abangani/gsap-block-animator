<?php

declare(strict_types=1);

namespace GSAPBlockAnimator\Container;

use Psr\Container\ContainerInterface as PsrContainerInterface;

/**
 * Dependency injection container interface
 *
 * @package GSAPBlockAnimator\Container
 * @since 2.0.0
 */
interface ContainerInterface extends PsrContainerInterface {

	/**
	 * Bind a service to the container
	 *
	 * @param string                 $abstract Service identifier
	 * @param callable|string|object $concrete Service implementation
	 * @return void
	 */
	public function bind( string $abstract, $concrete ): void;

	/**
	 * Bind a singleton service to the container
	 *
	 * @param string                 $abstract Service identifier
	 * @param callable|string|object $concrete Service implementation
	 * @return void
	 */
	public function singleton( string $abstract, $concrete ): void;

	/**
	 * Resolve a service from the container
	 *
	 * @param string $abstract Service identifier
	 * @return object The resolved service instance
	 * @throws ContainerException If the service cannot be resolved
	 */
	public function resolve( string $abstract ): object;

	/**
	 * Register a service provider
	 *
	 * @param ServiceProviderInterface $provider
	 * @return void
	 */
	public function register( ServiceProviderInterface $provider ): void;

	/**
	 * Get all registered service identifiers
	 *
	 * @return array<string>
	 */
	public function get_bindings(): array;
}
