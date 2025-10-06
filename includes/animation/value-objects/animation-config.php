<?php

declare(strict_types=1);

namespace GSAPBlockAnimator\Animation\Value_Objects;

class Animation_Config {

	private bool $enabled;
	private string $type;
	private string $trigger;
	private array $properties;
	private float $duration;
	private float $delay;
	private int $repeat;
	private bool $yoyo;
	private string $ease;
	private ?string $selector;

	public function __construct( array $config ) {
		$this->enabled    = (bool) ( $config['enabled'] ?? false );
		$this->type       = $this->sanitize_type( $config['type'] ?? 'to' );
		$this->trigger    = $this->sanitize_trigger( $config['trigger'] ?? 'pageload' );
		$this->properties = (array) ( $config['properties'] ?? array() );

		$timing         = (array) ( $config['timing'] ?? array() );
		$this->duration = max( 0.1, (float) ( $timing['duration'] ?? 0.5 ) );
		$this->delay    = max( 0, (float) ( $timing['delay'] ?? 0 ) );
		$this->repeat   = max( 0, (int) ( $timing['repeat'] ?? 0 ) );
		$this->yoyo     = (bool) ( $timing['yoyo'] ?? false );
		$this->ease     = $this->sanitize_ease( $timing['ease'] ?? 'power1.out' );

		$this->selector = ! empty( $config['selector'] ) ? (string) $config['selector'] : null;
	}

	public function is_enabled(): bool {
		return $this->enabled;
	}

	public function get_type(): string {
		return $this->type;
	}

	public function get_trigger(): string {
		return $this->trigger;
	}

	public function get_properties(): array {
		return $this->properties;
	}

	public function get_duration(): float {
		return $this->duration;
	}

	public function get_delay(): float {
		return $this->delay;
	}

	public function get_repeat(): int {
		return $this->repeat;
	}

	public function is_yoyo(): bool {
		return $this->yoyo;
	}

	public function get_ease(): string {
		return $this->ease;
	}

	public function get_selector(): ?string {
		return $this->selector;
	}

	public function to_array(): array {
		return array(
			'enabled'    => $this->enabled,
			'type'       => $this->type,
			'trigger'    => $this->trigger,
			'properties' => $this->properties,
			'timing'     => array(
				'duration' => $this->duration,
				'delay'    => $this->delay,
				'repeat'   => $this->repeat,
				'yoyo'     => $this->yoyo,
				'ease'     => $this->ease,
			),
			'selector'   => $this->selector,
		);
	}

	private function sanitize_type( string $type ): string {
		$allowed_types = array( 'to', 'from', 'fromTo', 'set' );
		return in_array( $type, $allowed_types, true ) ? $type : 'to';
	}

	private function sanitize_trigger( string $trigger ): string {
		$allowed_triggers = array( 'pageload', 'scroll', 'click', 'hover' );
		return in_array( $trigger, $allowed_triggers, true ) ? $trigger : 'pageload';
	}

	private function sanitize_ease( string $ease ): string {
		$allowed_eases = array(
			'none',
			'power1.out',
			'power2.out',
			'power3.out',
			'back.out',
			'elastic.out',
			'bounce.out',
			'power1.in',
			'power2.in',
			'power3.in',
			'power1.inOut',
			'power2.inOut',
			'power3.inOut',
		);

		return in_array( $ease, $allowed_eases, true ) ? $ease : 'power1.out';
	}
}
