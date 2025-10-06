import { SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import type { TriggerType } from '../../../types/animation';

interface TriggerControlProps {
	value: TriggerType;
	onChange: ( trigger: TriggerType ) => void;
}

export class TriggerControl {
	private static readonly TRIGGER_OPTIONS = [
		{ label: __( 'On Page Load', 'gsap-block-animator' ), value: 'pageload' as TriggerType },
		{ label: __( 'On Scroll', 'gsap-block-animator' ), value: 'scroll' as TriggerType },
		{ label: __( 'On Click', 'gsap-block-animator' ), value: 'click' as TriggerType },
		{ label: __( 'On Hover', 'gsap-block-animator' ), value: 'hover' as TriggerType },
	];

	static render( { value, onChange }: TriggerControlProps ): JSX.Element {
		return (
			<SelectControl
				label={ __( 'Trigger', 'gsap-block-animator' ) }
				value={ value }
				options={ this.TRIGGER_OPTIONS }
				onChange={ ( trigger: string ) => onChange( trigger as TriggerType ) }
				help={ __( 'When should the animation trigger?', 'gsap-block-animator' ) }
			/>
		);
	}

	static getTriggerOptions() {
		return this.TRIGGER_OPTIONS;
	}

	static getTriggerLabel( trigger: TriggerType ): string {
		const option = this.TRIGGER_OPTIONS.find( ( opt ) => opt.value === trigger );
		return option?.label || trigger;
	}

	static isScrollTrigger( trigger: TriggerType ): boolean {
		return 'scroll' === trigger;
	}

	static isInteractionTrigger( trigger: TriggerType ): boolean {
		return 'click' === trigger || 'hover' === trigger;
	}
}
