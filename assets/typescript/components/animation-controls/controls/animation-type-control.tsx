import { SelectControl, Notice } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import type { AnimationType } from '../../../types/animation';

interface AnimationTypeControlProps {
	value: AnimationType;
	onChange: ( type: AnimationType ) => void;
}

export class AnimationTypeControl {
	private static readonly TYPE_OPTIONS = [
		{ label: __( 'To', 'gsap-block-animator' ), value: 'to' as AnimationType },
		{ label: __( 'From', 'gsap-block-animator' ), value: 'from' as AnimationType },
		{ label: __( 'From/To', 'gsap-block-animator' ), value: 'fromTo' as AnimationType },
		{ label: __( 'Set', 'gsap-block-animator' ), value: 'set' as AnimationType },
	];

	private static readonly TYPE_DESCRIPTIONS: Record<AnimationType, { description: string; useCase: string }> = {
		to: {
			description: __( 'Animates from the current state to the values you define.', 'gsap-block-animator' ),
			useCase: __( 'Use Case: Element starts at its current position/style and animates to your target values. Most common method.', 'gsap-block-animator' ),
		},
		from: {
			description: __( 'Animates from the values you define to the current state.', 'gsap-block-animator' ),
			useCase: __( 'Use Case: Great for entrance animations. Element appears from somewhere and settles into its natural position.', 'gsap-block-animator' ),
		},
		fromTo: {
			description: __( 'Animates from specific values to specific values (full control).', 'gsap-block-animator' ),
			useCase: __( 'Use Case: When you need precise control over both start and end states. Most predictable but requires more setup.', 'gsap-block-animator' ),
		},
		set: {
			description: __( 'Immediately sets values without animation (duration is 0).', 'gsap-block-animator' ),
			useCase: __( 'Use Case: Initialize states before animations, reset elements, or make instant changes.', 'gsap-block-animator' ),
		},
	};

	static render( { value, onChange }: AnimationTypeControlProps ): JSX.Element {
		const typeInfo = this.TYPE_DESCRIPTIONS[ value ];

		return (
			<div className="gsap-animation-type-control">
				<SelectControl
					label={ __( 'Animation Type', 'gsap-block-animator' ) }
					value={ value }
					options={ this.TYPE_OPTIONS }
					onChange={ ( type: string ) => onChange( type as AnimationType ) }
					help={ __( 'Choose the type of GSAP animation', 'gsap-block-animator' ) }
				/>
				{ typeInfo && (
					<Notice status="info" isDismissible={ false } className="gsap-type-info-notice">
						<p><strong>{ typeInfo.description }</strong></p>
						<p>{ typeInfo.useCase }</p>
					</Notice>
				) }
			</div>
		);
	}

	static getTypeOptions() {
		return this.TYPE_OPTIONS;
	}

	static getTypeLabel( type: AnimationType ): string {
		const option = this.TYPE_OPTIONS.find( ( opt ) => opt.value === type );
		return option?.label || type;
	}
}
