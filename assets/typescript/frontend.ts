/**
 * GSAP Block Animator - Frontend Entry Point
 *
 * @package
 * @since 2.0.0
 */

import { initializeFrontendController } from './frontend-animation-controller';
// Global types are included automatically via tsconfig.json

interface FrontendSettings {
	performanceMode: boolean;
	debugMode: boolean;
}

class FrontendInitializer {
	private settings: FrontendSettings;
	private resizeTimeout: number = 0;

	constructor() {
		this.settings = this.getWordPressSettings();
		this.initialize();
	}

	private initialize(): void {
		if ( ! this.checkGSAPAvailability() ) {
			return;
		}

		this.registerScrollTriggerIfAvailable();
		this.exposeControllerGlobally();
		this.handleReducedMotionPreference();
		this.bindVisibilityChangeEvents();
		this.bindResizeEventsWithThrottling();
	}

	private checkGSAPAvailability(): boolean {
		return typeof window.gsap !== 'undefined';
	}

	private registerScrollTriggerIfAvailable(): void {
		if ( typeof window.ScrollTrigger !== 'undefined' ) {
			window.gsap.registerPlugin( window.ScrollTrigger );
		}
	}

	private getWordPressSettings(): FrontendSettings {
		return window.gsapBlockAnimatorSettings || {
			performanceMode: false,
			debugMode: false,
		};
	}

	private exposeControllerGlobally(): void {
		// Initialize the new TypeScript frontend controller
		initializeFrontendController();
	}

	private handleReducedMotionPreference(): void {
		// Handle reduced motion preference - implemented in animation controller
	}

	private bindVisibilityChangeEvents(): void {
		document.addEventListener( 'visibilitychange', () => {
			if ( document.hidden ) {
				window.GSAPBlockAnimator?.controller?.getAnimationService?.()?.destroyAll?.();
			} else {
				window.GSAPBlockAnimator?.controller?.reinitialize?.();
			}
		} );
	}

	private bindResizeEventsWithThrottling(): void {
		window.addEventListener( 'resize', () => {
			clearTimeout( this.resizeTimeout );
			this.resizeTimeout = window.setTimeout( () => {
				if ( typeof window.ScrollTrigger !== 'undefined' ) {
					window.ScrollTrigger.refresh();
				}
			}, 250 );
		} );
	}

	public getSettings(): FrontendSettings {
		return this.settings;
	}

	public reinitialize(): void {
		this.initialize();
	}
}

new FrontendInitializer();
