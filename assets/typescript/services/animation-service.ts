import type { AnimationConfig } from '../types/animation';
import '../types/global';

// Use global GSAP loaded via CDN
const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;

if (gsap && ScrollTrigger) {
	gsap.registerPlugin(ScrollTrigger);
}

interface PreviewOptions {
	element: Element;
	config: AnimationConfig;
	onComplete?: () => void;
	onError?: (error: Error) => void;
}

interface AnimationInstance {
	timeline: any;
	scrollTrigger?: any;
}

export class AnimationService {
	private activeAnimations: Map<string, AnimationInstance> = new Map();
	private originalStates: Map<string, CSSStyleDeclaration> = new Map();

	public async createPreview(options: PreviewOptions): Promise<void> {
		try {
			this.validateElement(options.element);
			this.validateConfig(options.config);

			const blockId = this.extractBlockId(options.element);
			this.storeOriginalState(blockId, options.element);
			
			const timeline = this.buildTimeline(options.config);
			const target = this.resolveTarget(options.element, options.config);
			
			this.applyAnimationToTimeline(timeline, target, options.config);
			this.configureTimelineCallbacks(timeline, options);
			
			this.storeActiveAnimation(blockId, { timeline });
			
			await this.executeTimeline(timeline);

		} catch (error) {
			this.handlePreviewError(error, options.onError);
		}
	}

	public stopPreview(blockId: string): void {
		const animation = this.getActiveAnimation(blockId);
		if (animation) {
			this.killAnimation(animation);
			this.removeActiveAnimation(blockId);
		}
	}

	public resetElement(blockId: string): void {
		const element = this.findElementByBlockId(blockId);
		if (element) {
			this.stopPreview(blockId);
			this.restoreOriginalState(blockId, element);
		}
	}

	public createProductionAnimation(element: Element, config: AnimationConfig): void {
		const blockId = this.extractBlockId(element);
		const timeline = this.buildTimeline(config);
		const target = this.resolveTarget(element, config);

		this.applyAnimationToTimeline(timeline, target, config);

		const animation: AnimationInstance = { timeline };

		if (this.requiresScrollTrigger(config)) {
			animation.scrollTrigger = this.createScrollTrigger(element, timeline, config);
		}

		this.storeActiveAnimation(blockId, animation);
		this.executeBasedOnTrigger(timeline, config);
	}

	public destroyAll(): void {
		this.activeAnimations.forEach((animation) => {
			this.killAnimation(animation);
		});
		this.clearAllMaps();
	}

	private validateElement(element: Element): void {
		if (!element || !element.parentNode) {
			throw new Error('Invalid element provided for animation');
		}
	}

	private validateConfig(config: AnimationConfig): void {
		if (!config.enabled) {
			throw new Error('Animation is not enabled');
		}
		if (!config.type || !config.trigger) {
			throw new Error('Animation configuration is incomplete');
		}
	}

	private extractBlockId(element: Element): string {
		const blockId = element.getAttribute('data-gsap-block-id') || 
			element.getAttribute('data-block') ||
			`fallback-${Date.now()}`;
		return blockId;
	}

	private storeOriginalState(blockId: string, element: Element): void {
		if (!this.originalStates.has(blockId)) {
			const computedStyle = window.getComputedStyle(element);
			this.originalStates.set(blockId, computedStyle);
		}
	}

	private buildTimeline(config: AnimationConfig): any {
		return gsap.timeline({
			duration: config.timing.duration,
			delay: config.timing.delay,
			repeat: config.timing.repeat,
			yoyo: config.timing.yoyo,
			ease: config.timing.ease,
			paused: true,
		});
	}

	private resolveTarget(element: Element, config: AnimationConfig): Element | NodeListOf<Element> {
		if (config.selector) {
			return element.querySelectorAll(config.selector);
		}
		return element;
	}

	private applyAnimationToTimeline(
		timeline: any,
		target: Element | NodeListOf<Element>,
		config: AnimationConfig
	): void {
		const properties = this.prepareAnimationProperties(config);

		switch (config.type) {
			case 'to':
				timeline.to(target, properties);
				break;
			case 'from':
				timeline.from(target, properties);
				break;
			case 'fromTo':
				timeline.fromTo(target, this.prepareFromProperties(config), properties);
				break;
			case 'set':
				timeline.set(target, properties);
				break;
		}
	}

	private prepareAnimationProperties(config: AnimationConfig): any {
		const properties: any = {
			duration: config.timing.duration,
			ease: config.timing.ease,
		};

		this.addTransformProperties(properties, config);
		this.addStyleProperties(properties, config);

		return properties;
	}

	private addTransformProperties(properties: any, config: AnimationConfig): void {
		if (config.properties.x !== undefined) properties.x = config.properties.x;
		if (config.properties.y !== undefined) properties.y = config.properties.y;
		if (config.properties.rotation !== undefined) properties.rotation = config.properties.rotation;
		if (config.properties.scale !== undefined) properties.scale = config.properties.scale;
	}

	private addStyleProperties(properties: any, config: AnimationConfig): void {
		if (config.properties.opacity !== undefined) properties.opacity = config.properties.opacity;
		if (config.properties.backgroundColor) properties.backgroundColor = config.properties.backgroundColor;
	}

	private prepareFromProperties(config: AnimationConfig): any {
		return {
			x: 0,
			y: 0,
			rotation: 0,
			scale: 1,
			opacity: 1,
		};
	}

	private configureTimelineCallbacks(timeline: any, options: PreviewOptions): void {
		timeline.eventCallback('onComplete', () => {
			if (options.onComplete) {
				options.onComplete();
			}
		});

		timeline.eventCallback('onInterrupt', () => {
			if (options.onComplete) {
				options.onComplete();
			}
		});
	}

	private storeActiveAnimation(blockId: string, animation: AnimationInstance): void {
		this.activeAnimations.set(blockId, animation);
	}

	private async executeTimeline(timeline: any): Promise<void> {
		return new Promise((resolve) => {
			timeline.eventCallback('onComplete', resolve);
			timeline.play();
		});
	}

	private handlePreviewError(error: unknown, onError?: (error: Error) => void): void {
		const errorInstance = error instanceof Error ? error : new Error('Unknown animation error');
		
		if (onError) {
			onError(errorInstance);
		} else {
			console.error('Animation preview error:', errorInstance);
		}
	}

	private getActiveAnimation(blockId: string): AnimationInstance | undefined {
		return this.activeAnimations.get(blockId);
	}

	private killAnimation(animation: AnimationInstance): void {
		animation.timeline.kill();
		if (animation.scrollTrigger) {
			animation.scrollTrigger.kill();
		}
	}

	private removeActiveAnimation(blockId: string): void {
		this.activeAnimations.delete(blockId);
	}

	private findElementByBlockId(blockId: string): Element | null {
		return document.querySelector(`[data-gsap-block-id="${blockId}"]`) ||
			document.querySelector(`[data-block="${blockId}"]`);
	}

	private restoreOriginalState(blockId: string, element: Element): void {
		gsap.set(element, {
			clearProps: 'all',
		});
		this.originalStates.delete(blockId);
	}

	private requiresScrollTrigger(config: AnimationConfig): boolean {
		return config.trigger === 'scroll';
	}

	private createScrollTrigger(
		element: Element,
		timeline: any,
		config: AnimationConfig
	): any {
		return ScrollTrigger.create({
			trigger: element,
			start: 'top 80%',
			end: 'bottom 20%',
			animation: timeline,
			toggleActions: 'play none none reverse',
		});
	}

	private executeBasedOnTrigger(timeline: any, config: AnimationConfig): void {
		switch (config.trigger) {
			case 'pageload':
				timeline.play();
				break;
			case 'scroll':
				break;
			case 'click':
				this.addClickTrigger(timeline);
				break;
			case 'hover':
				this.addHoverTrigger(timeline);
				break;
		}
	}

	private addClickTrigger(timeline: any): void {
		const element = timeline.targets()[0] as Element;
		if (element) {
			element.addEventListener('click', () => timeline.restart());
		}
	}

	private addHoverTrigger(timeline: any): void {
		const element = timeline.targets()[0] as Element;
		if (element) {
			element.addEventListener('mouseenter', () => timeline.play());
			element.addEventListener('mouseleave', () => timeline.reverse());
		}
	}

	private clearAllMaps(): void {
		this.activeAnimations.clear();
		this.originalStates.clear();
	}
}