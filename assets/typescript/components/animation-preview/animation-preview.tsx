import { useState, useCallback, useEffect } from '@wordpress/element';
import { Button, Notice } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

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
	// IsPreviewMode,
	// onTogglePreview,
} ) => {
	const [ isPlaying, setIsPlaying ] = useState( false );
	const [ error, setError ] = useState<string | null>( null );
	const [ animationService ] = useState( () => new AnimationService() );

	const clearErrorsOnConfigChange = useCallback( () => {
		setError( null );
	}, [] );

	useEffect( clearErrorsOnConfigChange, [ clearErrorsOnConfigChange ] );

	const findBlockElement = useCallback( (): Element => {
		console.log( '[GSAP Preview] Searching for block with ID:', blockId );
		
		const iframe = document.querySelector( 'iframe[name="editor-canvas"]' ) as HTMLIFrameElement;
		const searchDocument = iframe && iframe.contentDocument ? iframe.contentDocument : document;
		
		console.log( '[GSAP Preview] Searching in:', iframe ? 'iframe' : 'main document' );
		
		const blockWrapper = searchDocument.getElementById( `block-${ blockId }` );
		
		if ( ! blockWrapper ) {
			console.error( '[GSAP Preview] Block wrapper not found for ID:', blockId );
			console.log( '[GSAP Preview] Available blocks:', 
				Array.from( searchDocument.querySelectorAll( '[id^="block-"]' ) ).map( el => el.id )
			);
			throw new Error( __( 'Block wrapper not found. Please ensure the block is selected.', 'gsap-block-animator' ) );
		}
		
		console.log( '[GSAP Preview] Found block wrapper:', blockWrapper );
		
		const targetElement = 
			blockWrapper.querySelector( '.block-editor-block-list__block-edit .wp-block' ) ||
			blockWrapper.querySelector( '.wp-block' ) ||
			blockWrapper.querySelector( '[data-type]' ) ||
			blockWrapper.querySelector( '[contenteditable]' ) ||
			blockWrapper;
		
		console.log( '[GSAP Preview] Target element:', targetElement );
		console.log( '[GSAP Preview] Target element tag:', targetElement.tagName );
		
		if ( ! targetElement || ! targetElement.parentNode ) {
			throw new Error( __( 'Block content element not found for preview.', 'gsap-block-animator' ) );
		}
		
		return targetElement;
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
			console.warn( '[GSAP Preview] Animation is disabled' );
			return;
		}

		console.log( '[GSAP Preview] Starting preview for block:', blockId );
		console.log( '[GSAP Preview] Config:', config );

		setIsPlaying( true );
		setError( null );

		try {
			const blockElement = findBlockElement();
			console.log( '[GSAP Preview] Found element:', blockElement );
			console.log( '[GSAP Preview] Element tag:', blockElement.tagName );
			console.log( '[GSAP Preview] Element classes:', blockElement.className );
			
			await animationService.createPreview( {
				element: blockElement,
				config,
				onComplete: handleAnimationComplete,
				onError: handleAnimationError,
			} );
			
			console.log( '[GSAP Preview] Animation started successfully' );
		} catch ( err ) {
			console.error( '[GSAP Preview] Error:', err );
			handlePlayError( err );
		}
	}, [ config, blockId, findBlockElement, animationService, handleAnimationComplete, handleAnimationError, handlePlayError ] );

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
					{ isPlaying
						? __( 'Playing...', 'gsap-block-animator' )
						: __( 'Preview Animation', 'gsap-block-animator' )
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

AnimationPreview.propTypes = {
	config: PropTypes.object.isRequired,
	blockId: PropTypes.string.isRequired,
	isPreviewMode: PropTypes.bool.isRequired,
	onTogglePreview: PropTypes.func.isRequired,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;
