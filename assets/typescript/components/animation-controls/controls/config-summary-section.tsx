import { __ } from '@wordpress/i18n';
import { BaseControlSection } from './base-control-section';
import type { AnimationConfig } from '../../../types/animation';

interface ConfigSummarySectionProps {
	config: AnimationConfig;
}

export class ConfigSummarySection {
	static render({ config }: ConfigSummarySectionProps): JSX.Element {
		return BaseControlSection.render({
			label: '',
			className: 'gsap-config-summary',
			children: (
				<div className="gsap-summary-box">
					<strong>{__('✅ Animation Configured', 'gsap-block-animator')}</strong>
					<br />
					{this.formatSummaryText(config)}
				</div>
			)
		});
	}

	private static formatSummaryText(config: AnimationConfig): string {
		const typeLabel = __('Type:', 'gsap-block-animator');
		const triggerLabel = __('Trigger:', 'gsap-block-animator');
		const durationLabel = __('Duration:', 'gsap-block-animator');

		return `${typeLabel} ${config.type} | ${triggerLabel} ${config.trigger} | ${durationLabel} ${config.timing.duration}s`;
	}

	static getSummaryData(config: AnimationConfig) {
		return {
			type: config.type,
			trigger: config.trigger,
			duration: config.timing.duration,
			hasProperties: Object.keys(config.properties).length > 0,
			totalProperties: Object.keys(config.properties).length,
		};
	}

	static isConfigurationComplete(config: AnimationConfig): boolean {
		return config.enabled && 
			   config.type && 
			   config.trigger &&
			   Object.keys(config.properties).length > 0;
	}
}