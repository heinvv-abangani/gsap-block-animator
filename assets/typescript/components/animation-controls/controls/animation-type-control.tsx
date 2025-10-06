import { SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import type { AnimationType } from '../../../types/animation';

interface AnimationTypeControlProps {
	value: AnimationType;
	onChange: (type: AnimationType) => void;
}

export class AnimationTypeControl {
	private static readonly TYPE_OPTIONS = [
		{ label: __('To', 'gsap-block-animator'), value: 'to' as AnimationType },
		{ label: __('From', 'gsap-block-animator'), value: 'from' as AnimationType },
		{ label: __('From/To', 'gsap-block-animator'), value: 'fromTo' as AnimationType },
		{ label: __('Set', 'gsap-block-animator'), value: 'set' as AnimationType },
	];

	static render({ value, onChange }: AnimationTypeControlProps): JSX.Element {
		return (
			<SelectControl
				label={__('Animation Type', 'gsap-block-animator')}
				value={value}
				options={this.TYPE_OPTIONS}
				onChange={(type: string) => onChange(type as AnimationType)}
				help={__('Choose the type of GSAP animation', 'gsap-block-animator')}
			/>
		);
	}

	static getTypeOptions() {
		return this.TYPE_OPTIONS;
	}

	static getTypeLabel(type: AnimationType): string {
		const option = this.TYPE_OPTIONS.find(opt => opt.value === type);
		return option?.label || type;
	}
}