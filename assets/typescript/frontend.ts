/**
 * GSAP Block Animator - Frontend Entry Point
 *
 * @package GSAPBlockAnimator
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
		if (!this.checkGSAPAvailability()) {
			return;
		}

		this.registerScrollTriggerIfAvailable();
		this.exposeControllerGlobally();
		this.handleReducedMotionPreference();
		this.bindVisibilityChangeEvents();
		this.bindResizeEventsWithThrottling();
	}

	private checkGSAPAvailability(): boolean {
		if (typeof window.gsap === 'undefined') {
			console.warn('GSAP Block Animator: GSAP library not loaded');
			return false;
		}
		return true;
	}

	private registerScrollTriggerIfAvailable(): void {
		if (typeof window.ScrollTrigger !== 'undefined') {
			window.gsap.registerPlugin(window.ScrollTrigger);
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
		const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
		if (prefersReducedMotion && this.settings.debugMode) {
			console.log('GSAP Block Animator: Reduced motion preference detected');
		}
	}

	private bindVisibilityChangeEvents(): void {
		document.addEventListener('visibilitychange', () => {
			if (document.hidden) {
				(window as any).GSAPBlockAnimator?.controller?.getAnimationService()?.destroyAll();
			} else {
				(window as any).GSAPBlockAnimator?.controller?.reinitialize();
			}
		});
	}

	private bindResizeEventsWithThrottling(): void {
		window.addEventListener('resize', () => {
			clearTimeout(this.resizeTimeout);
			this.resizeTimeout = window.setTimeout(() => {
				if (typeof window.ScrollTrigger !== 'undefined') {
					window.ScrollTrigger.refresh();
				}
			}, 250);
		});
	}

	public getSettings(): FrontendSettings {
		return this.settings;
	}

	public reinitialize(): void {
		this.initialize();
	}
}

new FrontendInitializer();