<?php

declare(strict_types=1);

namespace GSAPBlockAnimator\Exceptions;

use Exception;

class Animation_Exception extends Exception {

	public static function invalid_config( string $message = '' ): self {
		return new self(
			$message ?: 'Invalid animation configuration provided',
			400
		);
	}

	public static function missing_properties(): self {
		return new self(
			'Animation requires at least one property to animate',
			400
		);
	}

	public static function invalid_duration( float $duration ): self {
		return new self(
			sprintf( 'Invalid animation duration: %f. Duration must be greater than 0', $duration ),
			400
		);
	}

	public static function invalid_type( string $type ): self {
		return new self(
			sprintf( 'Invalid animation type: %s. Allowed types: to, from, fromTo, set', $type ),
			400
		);
	}

	public static function invalid_trigger( string $trigger ): self {
		return new self(
			sprintf( 'Invalid trigger type: %s. Allowed triggers: pageload, scroll, click, hover', $trigger ),
			400
		);
	}

	public static function strategy_not_found( string $type ): self {
		return new self(
			sprintf( 'Animation strategy not found for type: %s', $type ),
			404
		);
	}

	public static function element_not_found( string $selector = '' ): self {
		return new self(
			$selector
				? sprintf( 'Element not found with selector: %s', $selector )
				: 'Target element not found for animation',
			404
		);
	}

	public static function timeline_creation_failed( string $reason = '' ): self {
		return new self(
			$reason
				? sprintf( 'Failed to create animation timeline: %s', $reason )
				: 'Failed to create animation timeline',
			500
		);
	}

	public static function gsap_not_loaded(): self {
		return new self(
			'GSAP library is not loaded or available',
			500
		);
	}
}
