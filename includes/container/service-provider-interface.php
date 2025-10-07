<?php

declare(strict_types=1);

namespace GSAPBlockAnimator\Container;

/**
 * Service provider interface
 *
 * @package GSAPBlockAnimator\Container
 * @since 2.0.0
 */
interface ServiceProviderInterface {

	/**
	 * Register services in the container
	 *
	 * @param ContainerInterface $container
	 * @return void
	 */
	public function register( ContainerInterface $container ): void;
}
