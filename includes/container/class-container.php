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
	 * @var array<string, mixed>
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
	public function bind( string $type_name, $concrete ): void {
		$this->bindings[ $type_name ]           = $concrete;
		$this->singleton_bindings[ $type_name ] = false;

		// Remove existing singleton instance if rebinding.
		unset( $this->singletons[ $type_name ] );
	}

	/**
	 * {@inheritDoc}
	 */
	public function singleton( string $type_name, $concrete ): void {
		$this->bindings[ $type_name ]           = $concrete;
		$this->singleton_bindings[ $type_name ] = true;
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
	 *
	 * @throws ContainerException When circular dependency detected or resolution fails.
	 */
	public function resolve( string $type_name ): object {
		// Check for circular dependency.
		if ( isset( $this->resolving[ $type_name ] ) ) {
			throw ContainerException::circular_dependency( $type_name );
		}

		// Return existing singleton instance.
		if ( isset( $this->singletons[ $type_name ] ) ) {
			return $this->singletons[ $type_name ];
		}

		$this->resolving[ $type_name ] = true;

		try {
			$instance = $this->make( $type_name );

			// Store singleton instance.
			if ( $this->is_singleton( $type_name ) ) {
				$this->singletons[ $type_name ] = $instance;
			}

			return $instance;
		} finally {
			unset( $this->resolving[ $type_name ] );
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
