import { useState, useCallback, useEffect } from '@wordpress/element';
import { Button, Notice } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import type { AnimationConfig } from '../../types/animation';
import { AnimationService } from '../../services/animation-service';

interface AnimationPreviewProps {
	config: AnimationConfig;
	blockId: string;
	isPreviewMode: boolean;
	onTogglePreview: () => void;
}

export const AnimationPreview: React.FC<AnimationPreviewProps> = ( {
	config,
	blockId,
	isPreviewMode,
	onTogglePreview,
} ) => {
	const [ isPlaying, setIsPlaying ] = useState( false );
	const [ error, setError ] = useState<string | null>( null );
	const [ animationService ] = useState( () => new AnimationService() );

	const clearErrorsOnConfigChange = useCallback( () => {
		setError( null );
	}, [ config ] );

	useEffect( clearErrorsOnConfigChange, [ config ] );

	const findBlockElement = useCallback( (): Element => {
		const blockElement = document.querySelector( `[data-block="${ blockId }"]` );
		if ( ! blockElement ) {
			throw new Error( __( 'Block element not found for preview', 'gsap-block-animator' ) );
		}
		return blockElement;
	}, [ blockId ] );

	const handleAnimationComplete = useCallback( () => {
		setIsPlaying( false );
	}, [] );

	const handleAnimationError = useCallback( ( err: Error ) => {
		setError( err.message );
		setIsPlaying( false );
	}, [] );

	const handlePlayError = useCallback( ( err: unknown ) => {
		const errorMessage = err instanceof Error ? err.message : __( 'Unknown error occurred', 'gsap-block-animator' );
		setError( errorMessage );
		setIsPlaying( false );
	}, [] );

	const playPreview = useCallback( async () => {
		if ( ! config.enabled ) {
			return;
		}

		setIsPlaying( true );
		setError( null );

		try {
			const blockElement = findBlockElement();
			await animationService.createPreview( {
				element: blockElement,
				config,
				onComplete: handleAnimationComplete,
				onError: handleAnimationError,
			} );
		} catch ( err ) {
			handlePlayError( err );
		}
	}, [ config, findBlockElement, animationService, handleAnimationComplete, handleAnimationError, handlePlayError ] );

	const stopPreview = useCallback( () => {
		animationService.stopPreview( blockId );
		setIsPlaying( false );
	}, [ blockId, animationService ] );

	const resetElement = useCallback( () => {
		animationService.resetElement( blockId );
		setIsPlaying( false );
	}, [ blockId, animationService ] );

	return (
		<div className="gsap-animation-preview">
			<div className="gsap-preview-header">
				<h4>{ __( 'Preview & Testing', 'gsap-block-animator' ) }</h4>
			</div>

			{ error && (
				<Notice 
					status="error" 
					isDismissible={ true }
					onRemove={ () => setError( null ) }
				>
					{ error }
				</Notice>
			) }

			<div className="gsap-preview-controls">
				<Button
					variant="primary"
					onClick={ playPreview }
					isBusy={ isPlaying }
					disabled={ ! config.enabled || isPlaying }
					className="gsap-preview-button"
				>
					{ isPlaying ? 
						__( 'Playing...', 'gsap-block-animator' ) : 
						__( 'Preview Animation', 'gsap-block-animator' )
					}
				</Button>

				<Button
					variant="secondary"
					onClick={ stopPreview }
					disabled={ ! isPlaying }
					className="gsap-stop-button"
				>
					{ __( 'Stop', 'gsap-block-animator' ) }
				</Button>

				<Button
					variant="tertiary"
					onClick={ resetElement }
					className="gsap-reset-element-button"
				>
					{ __( 'Reset Element', 'gsap-block-animator' ) }
				</Button>
			</div>

			<div className="gsap-preview-info">
				<div className="gsap-info-row">
					<span className="gsap-info-label">{ __( 'Animation Type:', 'gsap-block-animator' ) }</span>
					<span className="gsap-info-value">{ config.type }</span>
				</div>
				<div className="gsap-info-row">
					<span className="gsap-info-label">{ __( 'Trigger:', 'gsap-block-animator' ) }</span>
					<span className="gsap-info-value">{ config.trigger }</span>
				</div>
				<div className="gsap-info-row">
					<span className="gsap-info-label">{ __( 'Duration:', 'gsap-block-animator' ) }</span>
					<span className="gsap-info-value">{ config.timing.duration }s</span>
				</div>
				{ config.timing.delay > 0 && (
					<div className="gsap-info-row">
						<span className="gsap-info-label">{ __( 'Delay:', 'gsap-block-animator' ) }</span>
						<span className="gsap-info-value">{ config.timing.delay }s</span>
					</div>
				) }
			</div>

			<div className="gsap-preview-help">
				<p>
					{ __( 'Use the preview to test your animation before saving. The animation will play on the actual block element in the editor.', 'gsap-block-animator' ) }
				</p>
			</div>
		</div>
	);
};