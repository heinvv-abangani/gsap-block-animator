import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { BaseControlSection } from './base-control-section';
import type { AnimationConfig } from '../../../types/animation';

interface ActionButtonsSectionProps {
	onReset: () => void;
}

export class ActionButtonsSection {
	static render( { onReset }: ActionButtonsSectionProps ): JSX.Element {
		return BaseControlSection.render( {
			label: '',
			className: 'gsap-action-buttons',
			children: (
				<Button
					variant="secondary"
					onClick={ onReset }
					className="gsap-reset-button"
				>
					{ __( 'Reset to Defaults', 'gsap-block-animator' ) }
				</Button>
			),
		} );
	}

	static getDefaultConfig(): AnimationConfig {
		return {
			enabled: false,
			type: 'to',
			trigger: 'pageload',
			properties: {},
			timing: {
				duration: 0.5,
				delay: 0,
				repeat: 0,
				yoyo: false,
				ease: 'power1.out',
			},
		};
	}

	static createResetHandler( onChange: ( updates: Partial<AnimationConfig> ) => void ) {
		return () => {
			onChange( this.getDefaultConfig() );
		};
	}
}
