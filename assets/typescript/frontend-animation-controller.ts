/**
 * GSAP Frontend Animation Controller - TypeScript Implementation
 * 
 * @package GSAPBlockAnimator
 * @since 2.0.0
 */

import type { AnimationConfig } from './types/animation';

// Global types are included automatically via tsconfig.json

interface AnimationProperties {
    [key: string]: any;
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
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', this.initializeOnDOMReady.bind(this));
        } else {
            this.initializeOnDOMReady();
        }

        window.addEventListener('beforeunload', this.cleanupBeforeUnload.bind(this));
    }

    /**
     * Initialize when DOM is ready
     */
    private initializeOnDOMReady(): void {
        if (this.initialized) return;

        this.initialized = true;
        this.initializeAnimations();
        this.initializeIntersectionObserver();
    }

    /**
     * Initialize all animations
     */
    private initializeAnimations(): void {
        const animatedElements = this.findAnimatedElements();
        
        animatedElements.forEach((element: Element) => {
            this.processAnimatedElement(element);
        });
    }

    /**
     * Find all elements with animation data
     */
    private findAnimatedElements(): NodeListOf<Element> {
        return document.querySelectorAll('[data-gsap-animation]');
    }

    /**
     * Process a single animated element
     */
    private processAnimatedElement(element: Element): void {
        const animationConfig = this.extractAnimationConfig(element);
        
        if (this.isValidConfig(animationConfig)) {
            this.createAnimation(element, animationConfig);
        }
    }

    /**
     * Extract animation configuration from element
     */
    private extractAnimationConfig(element: Element): AnimationConfig | null {
        const animationData = element.getAttribute('data-gsap-animation');
        
        if (!animationData) return null;

        try {
            const config = JSON.parse(animationData) as AnimationConfig;
            return config;
        } catch (error) {
            console.warn('GSAP Block Animator: Invalid animation configuration found on element:', element);
            return null;
        }
    }

    /**
     * Validate animation configuration
     */
    private isValidConfig(config: AnimationConfig | null): config is AnimationConfig {
        return config !== null && 
               config.enabled && 
               typeof config.type === 'string' && 
               typeof config.trigger === 'string';
    }

    /**
     * Create animation for element
     */
    private createAnimation(element: Element, config: AnimationConfig): void {
        try {
            if (!this.checkGSAPAvailability()) return;

            const properties = this.prepareAnimationProperties(config);
            
            if (!this.hasAnimationProperties(properties)) {
                console.warn('GSAP Block Animator: No animation properties found! Animation will not be visible.');
                return;
            }

            this.executeAnimationByTrigger(element, config, properties);
        } catch (error) {
            console.error('GSAP Block Animator: Failed to create animation for element:', element, error);
        }
    }

    /**
     * Check if GSAP is available
     */
    private checkGSAPAvailability(): boolean {
        if (typeof window.gsap === 'undefined') {
            console.warn('GSAP Block Animator: GSAP library not loaded');
            return false;
        }
        return true;
    }

    /**
     * Prepare animation properties from config
     */
    private prepareAnimationProperties(config: AnimationConfig): AnimationProperties {
        const properties: AnimationProperties = {
            duration: config.timing.duration || 0.5,
            delay: config.timing.delay || 0,
            ease: config.timing.ease || 'power1.out'
        };

        // Add timing properties
        if (config.timing.repeat) {
            properties.repeat = config.timing.repeat;
        }
        if (config.timing.yoyo) {
            properties.yoyo = config.timing.yoyo;
        }

        // Add transform properties
        const animProps = config.properties;
        if (animProps) {
            if (animProps.x !== undefined && animProps.x !== '') {
                properties.x = animProps.x;
            }
            if (animProps.y !== undefined && animProps.y !== '') {
                properties.y = animProps.y;
            }
            if (animProps.rotation !== undefined) {
                const rotationValue = String(animProps.rotation);
                if (rotationValue !== '' && rotationValue !== '0') {
                    properties.rotation = animProps.rotation;
                }
            }
            if (animProps.scale !== undefined) {
                const scaleValue = String(animProps.scale);
                if (scaleValue !== '' && scaleValue !== '1') {
                    properties.scale = animProps.scale;
                }
            }
            if (animProps.opacity !== undefined) {
                properties.opacity = animProps.opacity;
            }
        }

        return properties;
    }

    /**
     * Check if properties contain actual animation values
     */
    private hasAnimationProperties(properties: AnimationProperties): boolean {
        const animationKeys = ['x', 'y', 'rotation', 'scale', 'opacity'];
        return animationKeys.some(key => properties[key] !== undefined);
    }

    /**
     * Execute animation based on trigger type
     */
    private executeAnimationByTrigger(element: Element, config: AnimationConfig, properties: AnimationProperties): void {
        switch (config.trigger) {
            case 'pageload':
                this.createPageLoadAnimation(element, config, properties);
                break;
            case 'scroll':
                this.createScrollAnimation(element, config, properties);
                break;
            case 'click':
                this.createClickAnimation(element, config, properties);
                break;
            case 'hover':
                this.createHoverAnimation(element, config, properties);
                break;
            default:
                console.warn(`GSAP Block Animator: Unknown trigger type: ${config.trigger}`);
        }
    }

    /**
     * Create page load animation
     */
    private createPageLoadAnimation(element: Element, config: AnimationConfig, properties: AnimationProperties): void {
        const gsap = window.gsap;

        switch (config.type) {
            case 'to':
                gsap.to(element, properties);
                break;
            case 'from':
                gsap.from(element, properties);
                break;
            case 'fromTo':
                const fromProps = this.getFromProperties();
                gsap.fromTo(element, fromProps, properties);
                break;
            case 'set':
                gsap.set(element, properties);
                break;
            default:
                console.warn(`GSAP Block Animator: Unknown animation type: ${config.type}`);
        }
    }

    /**
     * Create scroll-triggered animation
     */
    private createScrollAnimation(element: Element, config: AnimationConfig, properties: AnimationProperties): void {
        if (typeof window.ScrollTrigger === 'undefined') {
            console.warn('GSAP Block Animator: ScrollTrigger not available, falling back to page load');
            this.createPageLoadAnimation(element, config, properties);
            return;
        }

        const gsap = window.gsap;
        gsap.registerPlugin(window.ScrollTrigger);

        const scrollProperties = {
            ...properties,
            scrollTrigger: {
                trigger: element,
                start: "top 80%",
                end: "bottom 20%",
                toggleActions: "play none none reverse"
            }
        };

        switch (config.type) {
            case 'to':
                gsap.to(element, scrollProperties);
                break;
            case 'from':
                gsap.from(element, scrollProperties);
                break;
            default:
                console.warn(`GSAP Block Animator: Animation type ${config.type} not supported for scroll trigger`);
        }
    }

    /**
     * Create click-triggered animation
     */
    private createClickAnimation(element: Element, config: AnimationConfig, properties: AnimationProperties): void {
        const gsap = window.gsap;
        
        (element as HTMLElement).style.cursor = 'pointer';
        
        element.addEventListener('click', () => {
            switch (config.type) {
                case 'to':
                    gsap.to(element, properties);
                    break;
                case 'from':
                    gsap.from(element, properties);
                    break;
                default:
                    console.warn(`GSAP Block Animator: Animation type ${config.type} not supported for click trigger`);
            }
        });
    }

    /**
     * Create hover-triggered animation
     */
    private createHoverAnimation(element: Element, config: AnimationConfig, properties: AnimationProperties): void {
        const gsap = window.gsap;
        
        element.addEventListener('mouseenter', () => {
            gsap.to(element, properties);
        });

        element.addEventListener('mouseleave', () => {
            gsap.to(element, {
                x: 0,
                y: 0,
                rotation: 0,
                scale: 1,
                opacity: 1,
                duration: properties.duration,
                ease: properties.ease
            });
        });
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
            opacity: 1
        };
    }

    /**
     * Initialize intersection observer for scroll animations
     */
    private initializeIntersectionObserver(): void {
        if (!this.hasScrollTriggeredElements()) return;

        this.observer = new IntersectionObserver(
            this.handleIntersectionChanges.bind(this),
            this.getIntersectionObserverOptions()
        );

        this.observeScrollElements();
    }

    /**
     * Check if there are scroll-triggered elements
     */
    private hasScrollTriggeredElements(): boolean {
        return document.querySelector('[data-gsap-trigger="scroll"]') !== null;
    }

    /**
     * Get intersection observer options
     */
    private getIntersectionObserverOptions(): IntersectionObserverInit {
        return {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };
    }

    /**
     * Observe scroll elements
     */
    private observeScrollElements(): void {
        const scrollElements = document.querySelectorAll('[data-gsap-trigger="scroll"]');
        
        scrollElements.forEach((element: Element) => {
            if (this.observer) {
                this.observer.observe(element);
            }
        });
    }

    /**
     * Handle intersection observer changes
     */
    private handleIntersectionChanges(entries: IntersectionObserverEntry[]): void {
        entries.forEach((entry: IntersectionObserverEntry) => {
            if (entry.isIntersecting) {
                this.triggerScrollAnimation(entry.target);
            }
        });
    }

    /**
     * Trigger scroll animation for element
     */
    private triggerScrollAnimation(element: Element): void {
        const blockId = this.extractBlockId(element);
        if (blockId) {
            // Handle scroll animation trigger
            console.log('GSAP Block Animator: Scroll animation triggered for element:', element);
        }
    }

    /**
     * Extract block ID from element
     */
    private extractBlockId(element: Element): string | null {
        return element.getAttribute('data-gsap-block-id') || 
               element.getAttribute('data-block') || 
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
        if (this.observer) {
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
    if (typeof window !== 'undefined') {
        window.GSAPBlockAnimator = {
            controller
        };
    }
}

// Auto-initialize if we're in a browser environment
if (typeof window !== 'undefined') {
    initializeFrontendController();
}

export { initializeFrontendController };
export default FrontendAnimationController;