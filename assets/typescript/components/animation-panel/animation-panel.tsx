import { useState, useCallback } from '@wordpress/element';
import { PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import type { BlockEditProps } from '../../types/block';
import type { AnimationConfig } from '../../types/animation';
import { AnimationControls } from '../animation-controls/animation-controls';
import { AnimationPreview } from '../animation-preview/animation-preview';

interface AnimationPanelProps extends BlockEditProps {
	// Additional props can be added here
}

export const AnimationPanel: React.FC<AnimationPanelProps> = ( {
	attributes,
	setAttributes,
	clientId,
	name: blockName,
} ) => {
	const [ isPreviewMode, setIsPreviewMode ] = useState( false );

	const getDefaultAnimationConfig = (): AnimationConfig => ( {
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
	} );

	const animationConfig: AnimationConfig = attributes.gsapAnimation || getDefaultAnimationConfig();

	const updateAnimationConfig = useCallback( ( updates: Partial<AnimationConfig> ) => {
		const newConfig = {
			...animationConfig,
			...updates,
		};

		setAttributes( {
			gsapAnimation: newConfig,
		} );
	}, [ animationConfig, setAttributes ] );

	const toggleAnimation = useCallback( ( enabled: boolean ) => {
		updateAnimationConfig( { enabled } );
	}, [ updateAnimationConfig ] );

	const togglePreviewMode = useCallback( () => {
		setIsPreviewMode( ! isPreviewMode );
	}, [ isPreviewMode ] );

	return (
		<PanelBody
			title={ __( 'GSAP Animation', 'gsap-block-animator' ) }
			initialOpen={ animationConfig.enabled }
			className="gsap-animation-panel"
		>
			<AnimationControls
				config={ animationConfig }
				onChange={ updateAnimationConfig }
				onToggle={ toggleAnimation }
				blockName={ blockName }
			/>

			{ animationConfig.enabled && (
				<AnimationPreview
					config={ animationConfig }
					blockId={ clientId }
					isPreviewMode={ isPreviewMode }
					onTogglePreview={ togglePreviewMode }
				/>
			) }
		</PanelBody>
	);
};
