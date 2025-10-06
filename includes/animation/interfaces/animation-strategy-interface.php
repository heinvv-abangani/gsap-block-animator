<?php

declare(strict_types=1);

namespace GSAPBlockAnimator\Animation\Interfaces;

use GSAPBlockAnimator\Animation\Value_Objects\Animation_Config;

interface Animation_Strategy_Interface {

	public function get_type(): string;

	public function is_compatible( Animation_Config $config ): bool;

	public function generate_animation_data( Animation_Config $config ): array;

	public function validate_config( Animation_Config $config ): array;
}
