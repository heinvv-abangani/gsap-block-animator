/**
 * GSAP Frontend Animation Controller - TypeScript Implementation
 *
 * @package
 * @since 2.0.0
 */

import type { AnimationConfig } from './types/animation';

// Global types are included automatically via tsconfig.json

interface AnimationProperties {
    [key: string]: unknown;
    duration?: number;
    delay?: number;
    ease?: string;
    repeat?: number;
    yoyo?: boolean;
}

/**
 * Frontend Animation Controller Class
 */
export class FrontendAnimationController {
	private initialized: boolean = false;
	private observer: IntersectionObserver | null = null;

	constructor() {
		this.bindEvents();
	}

	/**
	 * Bind DOM events
	 */
	private bindEvents(): void {
		if ( 'loading' === document.readyState ) {
			document.addEventListener( 'DOMContentLoaded', this.initializeOnDOMReady.bind( this ) );
		} else {
			this.initializeOnDOMReady();
		}

		window.addEventListener( 'beforeunload', this.cleanupBeforeUnload.bind( this ) );
	}

	/**
	 * Initialize when DOM is ready
	 */
	private initializeOnDOMReady(): void {
		if ( this.initialized ) {
			return;
		}

		this.initialized = true;
		this.initializeAnimations();
		this.initializeIntersectionObserver();
	}

	/**
	 * Initialize all animations
	 */
	private initializeAnimations(): void {
		console.log('🎬 Frontend Controller: Initializing animations...');
		const animatedElements = this.findAnimatedElements();
		console.log(`📊 Found ${animatedElements.length} animated elements:`, animatedElements);

		animatedElements.forEach( ( element: Element ) => {
			console.log('🎯 Processing animated element:', element);
			this.processAnimatedElement( element );
		} );
		
		console.log('✅ Animation initialization complete');
	}

	/**
	 * Find all elements with animation data
	 */
	private findAnimatedElements(): NodeListOf<Element> {
		return document.querySelectorAll( '[data-gsap-animation]' );
	}

	/**
	 * Process a single animated element
	 * @param {Element} element - The DOM element to process
	 */
	private processAnimatedElement( element: Element ): void {
		const animationConfig = this.extractAnimationConfig( element );
		console.log('🔍 Animation config extracted:', animationConfig);

		if ( this.isValidConfig( animationConfig ) ) {
			console.log('✅ Valid config, creating animation');
			this.createAnimation( element, animationConfig );
		} else {
			console.log('❌ Invalid animation config');
		}
	}

	/**
	 * Extract animation configuration from element
	 * @param {Element} element - The DOM element
	 */
	private extractAnimationConfig( element: Element ): AnimationConfig | null {
		const animationData = element.getAttribute( 'data-gsap-animation' );

		if ( ! animationData ) {
			return null;
		}

		try {
			const config = JSON.parse( animationData ) as AnimationConfig;
			return config;
		} catch ( error ) {
			return null;
		}
	}

	/**
	 * Validate animation configuration
	 * @param {AnimationConfig | null} config - The animation configuration to validate
	 */
	private isValidConfig( config: AnimationConfig | null ): config is AnimationConfig {
		return config !== null &&
               config.enabled &&
               'string' === typeof config.type &&
               'string' === typeof config.trigger;
	}

	/**
	 * Create animation for element
	 * @param {Element}         element - The DOM element
	 * @param {AnimationConfig} config  - The animation configuration
	 */
	private createAnimation( element: Element, config: AnimationConfig ): void {
		try {
			console.log('🎭 Creating animation for element:', element, 'with config:', config);
			
			if ( ! this.checkGSAPAvailability() ) {
				console.warn('⚠️ GSAP not available during animation creation');
				return;
			}

			const properties = this.prepareAnimationProperties( config );
			console.log('🔧 Prepared animation properties:', properties);

			if ( ! this.hasAnimationProperties( properties ) ) {
				console.warn('⚠️ No valid animation properties found');
				return;
			}

			console.log('🚀 Executing animation with trigger:', config.trigger);
			this.executeAnimationByTrigger( element, config, properties );
		} catch ( error ) {
			console.error('❌ Error creating animation:', error);
		}
	}

	/**
	 * Check if GSAP is available
	 */
	private checkGSAPAvailability(): boolean {
		return typeof window.gsap !== 'undefined';
	}

	/**
	 * Prepare animation properties from config
	 * @param {AnimationConfig} config - The animation configuration
	 */
	private prepareAnimationProperties( config: AnimationConfig ): AnimationProperties {
		const properties: AnimationProperties = {
			duration: config.timing.duration || 0.5,
			delay: config.timing.delay || 0,
			ease: config.timing.ease || 'power1.out',
		};

		// Add timing properties
		if ( config.timing.repeat ) {
			properties.repeat = config.timing.repeat;
		}
		if ( config.timing.yoyo ) {
			properties.yoyo = config.timing.yoyo;
		}

		// Add transform properties
		const animProps = config.properties;
		if ( animProps ) {
			if ( animProps.x !== undefined && animProps.x !== '' ) {
				properties.x = animProps.x;
			}
			if ( animProps.y !== undefined && animProps.y !== '' ) {
				properties.y = animProps.y;
			}
			if ( animProps.rotation !== undefined ) {
				const rotationValue = String( animProps.rotation );
				if ( rotationValue !== '' && rotationValue !== '0' ) {
					properties.rotation = animProps.rotation;
				}
			}
			if ( animProps.scale !== undefined ) {
				const scaleValue = String( animProps.scale );
				if ( scaleValue !== '' && scaleValue !== '1' ) {
					properties.scale = animProps.scale;
				}
			}
			if ( animProps.opacity !== undefined ) {
				properties.opacity = animProps.opacity;
			}
		}

		return properties;
	}

	/**
	 * Check if properties contain actual animation values
	 * @param {AnimationProperties} properties - The animation properties
	 */
	private hasAnimationProperties( properties: AnimationProperties ): boolean {
		const animationKeys = [ 'x', 'y', 'rotation', 'scale', 'opacity' ];
		return animationKeys.some( ( key ) => properties[ key ] !== undefined );
	}

	/**
	 * Execute animation based on trigger type
	 * @param {Element}             element    - The DOM element
	 * @param {AnimationConfig}     config     - The animation configuration
	 * @param {AnimationProperties} properties - The animation properties
	 */
	private executeAnimationByTrigger( element: Element, config: AnimationConfig, properties: AnimationProperties ): void {
		switch ( config.trigger ) {
			case 'pageload':
				this.createPageLoadAnimation( element, config, properties );
				break;
			case 'scroll':
				this.createScrollAnimation( element, config, properties );
				break;
			case 'click':
				this.createClickAnimation( element, config, properties );
				break;
			case 'hover':
				this.createHoverAnimation( element, config, properties );
				break;
			default:
                // Unknown trigger type - silently ignored
		}
	}

	/**
	 * Create page load animation
	 * @param {Element}             element    - The DOM element
	 * @param {AnimationConfig}     config     - The animation configuration
	 * @param {AnimationProperties} properties - The animation properties
	 */
	private createPageLoadAnimation( element: Element, config: AnimationConfig, properties: AnimationProperties ): void {
		const gsap = window.gsap;
		console.log(`🎬 Creating ${config.type} page load animation for:`, element);

		switch ( config.type ) {
			case 'to':
				console.log('🎯 Executing gsap.to with properties:', properties);
				gsap.to( element, properties );
				break;
			case 'from':
				console.log('🎯 Executing gsap.from with properties:', properties);
				gsap.from( element, properties );
				break;
			case 'fromTo':
				const fromProps = this.getFromProperties();
				console.log('🎯 Executing gsap.fromTo with from:', fromProps, 'to:', properties);
				gsap.fromTo( element, fromProps, properties );
				break;
			case 'set':
				console.log('🎯 Executing gsap.set with properties:', properties);
				gsap.set( element, properties );
				break;
			default:
				console.warn('⚠️ Unknown animation type:', config.type);
		}
	}

	/**
	 * Create scroll-triggered animation
	 * @param {Element}             element    - The DOM element
	 * @param {AnimationConfig}     config     - The animation configuration
	 * @param {AnimationProperties} properties - The animation properties
	 */
	private createScrollAnimation( element: Element, config: AnimationConfig, properties: AnimationProperties ): void {
		if ( 'undefined' === typeof window.ScrollTrigger ) {
			// ScrollTrigger not available, fallback to page load
			this.createPageLoadAnimation( element, config, properties );
			return;
		}

		const gsap = window.gsap;
		gsap.registerPlugin( window.ScrollTrigger );

		const scrollProperties = {
			...properties,
			scrollTrigger: {
				trigger: element,
				start: 'top 80%',
				end: 'bottom 20%',
				toggleActions: 'play none none reverse',
			},
		};

		switch ( config.type ) {
			case 'to':
				gsap.to( element, scrollProperties );
				break;
			case 'from':
				gsap.from( element, scrollProperties );
				break;
			default:
                // Animation type not supported for scroll trigger - silently ignored
		}
	}

	/**
	 * Create click-triggered animation
	 * @param {Element}             element    - The DOM element
	 * @param {AnimationConfig}     config     - The animation configuration
	 * @param {AnimationProperties} properties - The animation properties
	 */
	private createClickAnimation( element: Element, config: AnimationConfig, properties: AnimationProperties ): void {
		const gsap = window.gsap;

		( element as HTMLElement ).style.cursor = 'pointer';

		element.addEventListener( 'click', () => {
			switch ( config.type ) {
				case 'to':
					gsap.to( element, properties );
					break;
				case 'from':
					gsap.from( element, properties );
					break;
				default:
                    // Animation type not supported for click trigger - silently ignored
			}
		} );
	}

	/**
	 * Create hover-triggered animation
	 * @param {Element}             element    - The DOM element
	 * @param {AnimationConfig}     config     - The animation configuration
	 * @param {AnimationProperties} properties - The animation properties
	 */
	private createHoverAnimation( element: Element, config: AnimationConfig, properties: AnimationProperties ): void {
		const gsap = window.gsap;

		element.addEventListener( 'mouseenter', () => {
			gsap.to( element, properties );
		} );

		element.addEventListener( 'mouseleave', () => {
			gsap.to( element, {
				x: 0,
				y: 0,
				rotation: 0,
				scale: 1,
				opacity: 1,
				duration: properties.duration,
				ease: properties.ease,
			} );
		} );
	}

	/**
	 * Get default 'from' properties for fromTo animations
	 */
	private getFromProperties(): AnimationProperties {
		return {
			x: 0,
			y: 0,
			rotation: 0,
			scale: 1,
			opacity: 1,
		};
	}

	/**
	 * Initialize intersection observer for scroll animations
	 */
	private initializeIntersectionObserver(): void {
		if ( ! this.hasScrollTriggeredElements() ) {
			return;
		}

		this.observer = new IntersectionObserver(
			this.handleIntersectionChanges.bind( this ),
			this.getIntersectionObserverOptions(),
		);

		this.observeScrollElements();
	}

	/**
	 * Check if there are scroll-triggered elements
	 */
	private hasScrollTriggeredElements(): boolean {
		return document.querySelector( '[data-gsap-trigger="scroll"]' ) !== null;
	}

	/**
	 * Get intersection observer options
	 */
	private getIntersectionObserverOptions(): IntersectionObserverInit {
		return {
			root: null,
			rootMargin: '0px',
			threshold: 0.1,
		};
	}

	/**
	 * Observe scroll elements
	 */
	private observeScrollElements(): void {
		const scrollElements = document.querySelectorAll( '[data-gsap-trigger="scroll"]' );

		scrollElements.forEach( ( element: Element ) => {
			if ( this.observer ) {
				this.observer.observe( element );
			}
		} );
	}

	/**
	 * Handle intersection observer changes
	 * @param {IntersectionObserverEntry[]} entries - The intersection observer entries
	 */
	private handleIntersectionChanges( entries: IntersectionObserverEntry[] ): void {
		entries.forEach( ( entry: IntersectionObserverEntry ) => {
			if ( entry.isIntersecting ) {
				this.triggerScrollAnimation( entry.target );
			}
		} );
	}

	/**
	 * Trigger scroll animation for element
	 * @param {Element} element - The DOM element
	 */
	private triggerScrollAnimation( element: Element ): void {
		const blockId = this.extractBlockId( element );
		if ( blockId ) {
			// Handle scroll animation trigger
			// Animation implementation here
		}
	}

	/**
	 * Extract block ID from element
	 * @param {Element} element - The DOM element
	 */
	private extractBlockId( element: Element ): string | null {
		return element.getAttribute( 'data-gsap-block-id' ) ||
               element.getAttribute( 'data-block' ) ||
               null;
	}

	/**
	 * Cleanup before unload
	 */
	private cleanupBeforeUnload(): void {
		this.destroyIntersectionObserver();
	}

	/**
	 * Destroy intersection observer
	 */
	private destroyIntersectionObserver(): void {
		if ( this.observer ) {
			this.observer.disconnect();
			this.observer = null;
		}
	}

	/**
	 * Reinitialize the controller
	 */
	public reinitialize(): void {
		this.destroyIntersectionObserver();
		this.initialized = false;
		this.initializeOnDOMReady();
	}

	/**
	 * Get initialization status
	 */
	public isInitialized(): boolean {
		return this.initialized;
	}
}

/**
 * Initialize and expose the controller
 */
function initializeFrontendController(): void {
	const controller = new FrontendAnimationController();

	// Expose globally for debugging and external access
	if ( typeof window !== 'undefined' ) {
		window.GSAPBlockAnimator = {
			controller,
		};
	}
}

// Auto-initialize if we're in a browser environment
if ( typeof window !== 'undefined' ) {
	initializeFrontendController();
}

export { initializeFrontendController };
export default FrontendAnimationController;
