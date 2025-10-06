<?php

declare(strict_types=1);

namespace GSAPBlockAnimator\Services;

use GSAPBlockAnimator\Container\ContainerInterface;
use GSAPBlockAnimator\Container\ServiceProviderInterface;

/**
 * Main service provider
 *
 * @package GSAPBlockAnimator\Services
 * @since 2.0.0
 */
class ServiceProvider implements ServiceProviderInterface {

	/**
	 * {@inheritDoc}
	 */
	public function register( ContainerInterface $container ): void {
		// Register core services as singletons
		$container->singleton(
			'GSAPBlockAnimator\Services\AnimationService',
			function () {
				return new AnimationService();
			}
		);

		$container->singleton(
			'GSAPBlockAnimator\Services\BlockExtensionService',
			function () {
				return new BlockExtensionService();
			}
		);

		// Register other services as needed...
	}
}
