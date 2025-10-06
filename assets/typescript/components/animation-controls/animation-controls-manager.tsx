import { Fragment } from '@wordpress/element';
import type { AnimationConfig, AnimationType, TriggerType, EaseType, TimingProperties } from '../../types/animation';

import { AnimationToggleControl } from './controls/animation-toggle-control';
import { AnimationTypeControl } from './controls/animation-type-control';
import { TriggerControl } from './controls/trigger-control';
import { SelectorControl } from './controls/selector-control';
import { TransformPropertiesSection } from './controls/transform-properties-section';
import { TimingControlsSection } from './controls/timing-controls-section';
import { ActionButtonsSection } from './controls/action-buttons-section';
import { ConfigSummarySection } from './controls/config-summary-section';

interface AnimationControlsManagerProps {
	config: AnimationConfig;
	onChange: (updates: Partial<AnimationConfig>) => void;
	onToggle: (enabled: boolean) => void;
	blockName: string;
}

export class AnimationControlsManager {
	private config: AnimationConfig;
	private onChange: (updates: Partial<AnimationConfig>) => void;
	private onToggle: (enabled: boolean) => void;
	private blockName: string;

	constructor(props: AnimationControlsManagerProps) {
		this.config = props.config;
		this.onChange = props.onChange;
		this.onToggle = props.onToggle;
		this.blockName = props.blockName;
	}

	public render(): JSX.Element {
		return (
			<Fragment>
				{this.renderToggleControl()}
				{this.config.enabled && this.renderEnabledControls()}
			</Fragment>
		);
	}

	private renderToggleControl(): JSX.Element {
		return AnimationToggleControl.render({
			enabled: this.config.enabled,
			onToggle: this.onToggle,
		});
	}

	private renderEnabledControls(): JSX.Element {
		return (
			<Fragment>
				{this.renderBasicControls()}
				{this.renderTransformProperties()}
				{this.renderTimingControls()}
				{this.renderActionButtons()}
				{this.renderConfigSummary()}
			</Fragment>
		);
	}

	private renderBasicControls(): JSX.Element {
		return (
			<Fragment>
				{AnimationTypeControl.render({
					value: this.config.type,
					onChange: (type: AnimationType) => this.onChange({ type }),
				})}
				{TriggerControl.render({
					value: this.config.trigger,
					onChange: (trigger: TriggerType) => this.onChange({ trigger }),
				})}
				{SelectorControl.render({
					value: this.config.selector || '',
					onChange: (selector: string) => this.onChange({ selector }),
				})}
			</Fragment>
		);
	}

	private renderTransformProperties(): JSX.Element {
		return TransformPropertiesSection.render({
			properties: this.config.properties,
			updateProperty: this.updateProperty.bind(this),
		});
	}

	private renderTimingControls(): JSX.Element {
		return TimingControlsSection.render({
			timing: this.config.timing,
			updateTiming: this.updateTiming.bind(this),
		});
	}

	private renderActionButtons(): JSX.Element {
		return ActionButtonsSection.render({
			onReset: ActionButtonsSection.createResetHandler(this.onChange),
		});
	}

	private renderConfigSummary(): JSX.Element {
		return ConfigSummarySection.render({
			config: this.config,
		});
	}

	private updateProperty(key: string, value: unknown): void {
		this.onChange({
			properties: {
				...this.config.properties,
				[key]: value,
			},
		});
	}

	private updateTiming(key: string, value: unknown): void {
		this.onChange({
			timing: {
				...this.config.timing,
				[key]: value,
			},
		});
	}

	public static create(props: AnimationControlsManagerProps): AnimationControlsManager {
		return new AnimationControlsManager(props);
	}

	public static render(props: AnimationControlsManagerProps): JSX.Element {
		const manager = new AnimationControlsManager(props);
		return manager.render();
	}

	public getConfig(): AnimationConfig {
		return this.config;
	}

	public validateConfiguration(): string[] {
		const errors: string[] = [];

		if (this.config.enabled && Object.keys(this.config.properties).length === 0) {
			errors.push('At least one animation property is required when animation is enabled');
		}

		if (this.config.timing.duration <= 0) {
			errors.push('Animation duration must be greater than 0');
		}

		if (this.config.selector && !SelectorControl.validateSelector(this.config.selector)) {
			errors.push('Invalid CSS selector provided');
		}

		return errors;
	}
}