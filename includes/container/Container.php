<?php

declare(strict_types=1);

namespace GSAPBlockAnimator\Container;

use ReflectionClass;
use ReflectionException;
use ReflectionParameter;

/**
 * Dependency injection container implementation
 *
 * @package GSAPBlockAnimator\Container
 * @since 2.0.0
 */
class Container implements ContainerInterface {

	/**
	 * Service bindings
	 *
	 * @var array<string, callable|string|object>
	 */
	private array $bindings = array();

	/**
	 * Singleton instances
	 *
	 * @var array<string, object>
	 */
	private array $singletons = array();

	/**
	 * Singleton bindings
	 *
	 * @var array<string, bool>
	 */
	private array $singleton_bindings = array();

	/**
	 * Currently resolving services (for circular dependency detection)
	 *
	 * @var array<string, bool>
	 */
	private array $resolving = array();

	/**
	 * {@inheritDoc}
	 */
	public function bind( string $abstract, callable|string|object $concrete ): void {
		$this->bindings[ $abstract ]           = $concrete;
		$this->singleton_bindings[ $abstract ] = false;

		// Remove existing singleton instance if rebinding
		unset( $this->singletons[ $abstract ] );
	}

	/**
	 * {@inheritDoc}
	 */
	public function singleton( string $abstract, callable|string|object $concrete ): void {
		$this->bindings[ $abstract ]           = $concrete;
		$this->singleton_bindings[ $abstract ] = true;
	}

	/**
	 * {@inheritDoc}
	 */
	public function has( string $id ): bool {
		return isset( $this->bindings[ $id ] ) || class_exists( $id );
	}

	/**
	 * {@inheritDoc}
	 */
	public function get( string $id ): object {
		return $this->resolve( $id );
	}

	/**
	 * {@inheritDoc}
	 */
	public function resolve( string $abstract ): object {
		// Check for circular dependency
		if ( isset( $this->resolving[ $abstract ] ) ) {
			throw ContainerException::circular_dependency( $abstract );
		}

		// Return existing singleton instance
		if ( isset( $this->singletons[ $abstract ] ) ) {
			return $this->singletons[ $abstract ];
		}

		$this->resolving[ $abstract ] = true;

		try {
			$instance = $this->make( $abstract );

			// Store singleton instance
			if ( $this->is_singleton( $abstract ) ) {
				$this->singletons[ $abstract ] = $instance;
			}

			return $instance;
		} finally {
			unset( $this->resolving[ $abstract ] );
		}
	}

	/**
	 * {@inheritDoc}
	 */
	public function register( ServiceProviderInterface $provider ): void {
		$provider->register( $this );
	}

	/**
	 * {@inheritDoc}
	 */
	public function get_bindings(): array {
		return array_keys( $this->bindings );
	}

	/**
	 * Make an instance of the given service
	 *
	 * @param string $abstract Service identifier
	 * @return object
	 * @throws ContainerException
	 */
	private function make( string $abstract ): object {
		// Use explicit binding if available
		if ( isset( $this->bindings[ $abstract ] ) ) {
			$concrete = $this->bindings[ $abstract ];

			if ( is_callable( $concrete ) ) {
				return $concrete( $this );
			}

			if ( is_string( $concrete ) ) {
				return $this->build( $concrete );
			}

			if ( is_object( $concrete ) ) {
				return $concrete;
			}
		}

		// Auto-resolve class if it exists
		if ( class_exists( $abstract ) ) {
			return $this->build( $abstract );
		}

		throw ContainerException::service_not_found( $abstract );
	}

	/**
	 * Build a class instance with dependency injection
	 *
	 * @param string $class_name Class name to build
	 * @return object
	 * @throws ContainerException
	 */
	private function build( string $class_name ): object {
		try {
			$reflection = new ReflectionClass( $class_name );

			if ( ! $reflection->isInstantiable() ) {
				throw ContainerException::invalid_service(
					$class_name,
					'Class is not instantiable'
				);
			}

			$constructor = $reflection->getConstructor();

			if ( $constructor === null ) {
				return new $class_name();
			}

			$dependencies = $this->resolve_dependencies( $constructor->getParameters() );

			return $reflection->newInstanceArgs( $dependencies );
		} catch ( ReflectionException $e ) {
			throw ContainerException::invalid_service( $class_name, $e->getMessage() );
		}
	}

	/**
	 * Resolve constructor dependencies
	 *
	 * @param array<ReflectionParameter> $parameters
	 * @return array<object>
	 * @throws ContainerException
	 */
	private function resolve_dependencies( array $parameters ): array {
		$dependencies = array();

		foreach ( $parameters as $parameter ) {
			$dependency     = $this->resolve_dependency( $parameter );
			$dependencies[] = $dependency;
		}

		return $dependencies;
	}

	/**
	 * Resolve a single dependency
	 *
	 * @param ReflectionParameter $parameter
	 * @return object
	 * @throws ContainerException
	 */
	private function resolve_dependency( ReflectionParameter $parameter ): object {
		$type = $parameter->getType();

		if ( $type === null || $type->isBuiltin() ) {
			if ( $parameter->isDefaultValueAvailable() ) {
				return $parameter->getDefaultValue();
			}

			throw ContainerException::invalid_service(
				$parameter->getName(),
				'Cannot resolve parameter without type hint'
			);
		}

		$type_name = $type->getName();

		if ( ! class_exists( $type_name ) && ! interface_exists( $type_name ) ) {
			throw ContainerException::invalid_service(
				$type_name,
				'Class or interface does not exist'
			);
		}

		return $this->resolve( $type_name );
	}

	/**
	 * Check if a service is registered as singleton
	 *
	 * @param string $abstract Service identifier
	 * @return bool
	 */
	private function is_singleton( string $abstract ): bool {
		return $this->singleton_bindings[ $abstract ] ?? false;
	}
}
