import { AnimationService } from './services/animation-service';
import type { AnimationConfig } from './types/animation';

class FrontendController {
	private animationService: AnimationService;
	private observer: IntersectionObserver | null = null;
	private initialized = false;

	constructor() {
		this.animationService = new AnimationService();
		this.bindEvents();
	}

	private bindEvents(): void {
		if ( 'loading' === document.readyState ) {
			document.addEventListener( 'DOMContentLoaded', this.initializeOnDOMReady.bind( this ) );
		} else {
			this.initializeOnDOMReady();
		}

		window.addEventListener( 'beforeunload', this.cleanupBeforeUnload.bind( this ) );
	}

	private initializeOnDOMReady(): void {
		if ( this.initialized ) {
			return;
		}

		this.initialized = true;
		this.initializeAnimations();
		this.initializeIntersectionObserver();
	}

	private initializeAnimations(): void {
		const animatedElements = this.findAnimatedElements();

		animatedElements.forEach( ( element ) => {
			this.processAnimatedElement( element );
		} );
	}

	private findAnimatedElements(): NodeListOf<Element> {
		return document.querySelectorAll( '[data-gsap-animation]' );
	}

	private processAnimatedElement( element: Element ): void {
		const config = this.extractAnimationConfig( element );

		if ( ! this.isValidConfig( config ) ) {
			return;
		}

		this.createAnimation( element, config );
	}

	private extractAnimationConfig( element: Element ): AnimationConfig | null {
		const configData = element.getAttribute( 'data-gsap-animation' );

		if ( ! configData ) {
			return null;
		}

		try {
			return JSON.parse( configData ) as AnimationConfig;
		} catch {
			return null;
		}
	}

	private isValidConfig( config: AnimationConfig | null ): config is AnimationConfig {
		return config !== null &&
			config.enabled &&
			'string' === typeof config.type &&
			'string' === typeof config.trigger;
	}

	private createAnimation( element: Element, config: AnimationConfig ): void {
		try {
			this.animationService.createProductionAnimation( element, config );
		} catch ( error ) {
			// Silent error handling for production
		}
	}

	private initializeIntersectionObserver(): void {
		if ( this.hasScrollTriggeredElements() ) {
			this.observer = new IntersectionObserver(
				this.handleIntersectionChanges.bind( this ),
				this.getIntersectionObserverOptions(),
			);

			this.observeScrollElements();
		}
	}

	private hasScrollTriggeredElements(): boolean {
		return document.querySelector( '[data-gsap-trigger="scroll"]' ) !== null;
	}

	private getIntersectionObserverOptions(): IntersectionObserverInit {
		return {
			root: null,
			rootMargin: '0px',
			threshold: 0.1,
		};
	}

	private observeScrollElements(): void {
		const scrollElements = document.querySelectorAll( '[data-gsap-trigger="scroll"]' );

		scrollElements.forEach( ( element ) => {
			if ( this.observer ) {
				this.observer.observe( element );
			}
		} );
	}

	private handleIntersectionChanges( entries: IntersectionObserverEntry[] ): void {
		entries.forEach( ( entry ) => {
			if ( entry.isIntersecting ) {
				this.triggerScrollAnimation( entry.target );
			}
		} );
	}

	private triggerScrollAnimation( element: Element ): void {
		const blockId = this.extractBlockId( element );

		if ( blockId ) {
			this.animationService.stopPreview( blockId );
		}
	}

	private extractBlockId( element: Element ): string | null {
		return element.getAttribute( 'data-gsap-block-id' ) ||
			element.getAttribute( 'data-block' );
	}

	private cleanupBeforeUnload(): void {
		this.destroyIntersectionObserver();
		this.destroyAllAnimations();
	}

	private destroyIntersectionObserver(): void {
		if ( this.observer ) {
			this.observer.disconnect();
			this.observer = null;
		}
	}

	private destroyAllAnimations(): void {
		this.animationService.destroyAll();
	}

	public reinitialize(): void {
		this.destroyIntersectionObserver();
		this.destroyAllAnimations();
		this.initialized = false;
		this.initializeOnDOMReady();
	}

	public getAnimationService(): AnimationService {
		return this.animationService;
	}
}

const frontendController = new FrontendController();

if ( typeof window !== 'undefined' ) {
	( window as any ).GSAPBlockAnimator = {
		controller: frontendController,
		AnimationService,
	};
}

export { frontendController as default, FrontendController, AnimationService };
