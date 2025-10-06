import { ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

interface AnimationToggleControlProps {
	enabled: boolean;
	onToggle: (enabled: boolean) => void;
}

export class AnimationToggleControl {
	static render({ enabled, onToggle }: AnimationToggleControlProps): JSX.Element {
		return (
			<ToggleControl
				label={__('Enable Animation', 'gsap-block-animator')}
				checked={enabled}
				onChange={onToggle}
				help={enabled ? 
					__('Animation is enabled for this block', 'gsap-block-animator') : 
					__('Enable to add GSAP animation to this block', 'gsap-block-animator')
				}
			/>
		);
	}

	static getHelpText(enabled: boolean): string {
		return enabled 
			? __('Animation is enabled for this block', 'gsap-block-animator')
			: __('Enable to add GSAP animation to this block', 'gsap-block-animator');
	}
}