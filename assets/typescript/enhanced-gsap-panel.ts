/**
 * Enhanced GSAP Animation Panel - TypeScript + JavaScript Hybrid
 *
 * This file enhances the working JavaScript implementation with TypeScript types
 * while maintaining full compatibility with the existing system.
 *
 * @package
 * @since 2.0.0
 */

import type {
	AnimationConfig,
	AnimationType,
	TriggerType,
	EaseType,
	TimelineConfig,
} from './types/animation';

// WordPress globals - properly typed
declare const wp: {
    hooks: {
        addFilter: ( hookName: string, namespace: string, callback: ( ...args: unknown[] ) => unknown ) => void;
    };
    blocks: {
        registerBlockType: ( name: string, settings: Record<string, unknown> ) => void;
    };
    compose: {
        createHigherOrderComponent: ( enhancer: ( Component: unknown ) => unknown, displayName: string ) => unknown;
    };
    blockEditor: {
        InspectorControls: unknown;
    };
    element: {
        createElement: ( type: unknown, props?: Record<string, unknown>, ...children: unknown[] ) => unknown;
    };
    components: Record<string, unknown>;
    i18n: {
        __: ( text: string, domain?: string ) => string;
    };
};

/**
 * Default animation configuration with proper typing
 */
export const DEFAULT_ANIMATION_CONFIG: AnimationConfig = {
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
	timeline: {
		isTimeline: false,
		timelineId: '',
		timelineName: '',
		timelinePosition: 'start',
	},
};

/**
 * Animation type definitions for UI components
 */
export const ANIMATION_TYPES: Record<AnimationType, { label: string; tooltip: string }> = {
	to: {
		label: 'To',
		tooltip: 'Animate from current state to specified values',
	},
	from: {
		label: 'From',
		tooltip: 'Animate from specified values to current state',
	},
	fromTo: {
		label: 'From/To',
		tooltip: 'Animate from specified start values to specified end values',
	},
	set: {
		label: 'Set',
		tooltip: 'Instantly set properties without animation',
	},
};

/**
 * Trigger type definitions
 */
export const TRIGGER_TYPES: Record<TriggerType, { label: string; description: string }> = {
	pageload: {
		label: 'On Page Load',
		description: 'Animation starts when the page loads',
	},
	scroll: {
		label: 'On Scroll',
		description: 'Animation triggers when element comes into view',
	},
	click: {
		label: 'On Click',
		description: 'Animation starts when element is clicked',
	},
	hover: {
		label: 'On Hover',
		description: 'Animation starts on mouse hover',
	},
};

/**
 * Easing function definitions
 */
export const EASING_FUNCTIONS: Record<EaseType, { label: string; curve: string }> = {
	none: { label: 'None', curve: 'linear' },
	'power1.out': { label: 'Power1 Out', curve: 'ease-out' },
	'power2.out': { label: 'Power2 Out', curve: 'ease-out strong' },
	'power3.out': { label: 'Power3 Out', curve: 'ease-out stronger' },
	'back.out': { label: 'Back Out', curve: 'back ease-out' },
	'elastic.out': { label: 'Elastic Out', curve: 'elastic ease-out' },
	'bounce.out': { label: 'Bounce Out', curve: 'bounce ease-out' },
};

/**
 * Enhanced Animation Panel Props Interface
 */
export interface EnhancedGSAPPanelProps {
    attributes: {
        gsapAnimation?: AnimationConfig;
        [key: string]: unknown;
    };
    setAttributes: ( attributes: Partial<{ gsapAnimation: AnimationConfig }> ) => void;
    clientId: string;
    name: string;
    isSelected: boolean;
}

/**
 * Animation Property Validator
 */
export class AnimationValidator {
	/**
	 * Validate CSS unit values
	 * @param {string} value - The CSS value to validate
	 */
	static validateCSSUnit( value: string ): boolean {
		const CSS_UNIT_PATTERN = /^-?\d+(\.\d+)?(px|em|rem|%|vw|vh|vmin|vmax|ex|ch|pt|pc|in|cm|mm)$/;
		return CSS_UNIT_PATTERN.test( value );
	}

	/**
	 * Validate numeric range
	 * @param {number} value - The value to validate
	 * @param {number} min   - Minimum allowed value
	 * @param {number} max   - Maximum allowed value
	 */
	static validateRange( value: number, min: number, max: number ): boolean {
		return value >= min && value <= max;
	}

	/**
	 * Validate animation configuration
	 * @param {AnimationConfig} config - The animation configuration to validate
	 */
	static validateConfig( config: AnimationConfig ): { isValid: boolean; errors: string[] } {
		const errors: string[] = [];

		if ( ! config.enabled ) {
			return { isValid: true, errors: [] }; // Disabled animations are always valid
		}

		// Validate timing
		if ( config.timing.duration <= 0 ) {
			errors.push( 'Duration must be greater than 0' );
		}

		if ( config.timing.delay < 0 ) {
			errors.push( 'Delay cannot be negative' );
		}

		// Validate properties
		if ( config.properties.x && 'string' === typeof config.properties.x ) {
			if ( ! this.validateCSSUnit( config.properties.x ) ) {
				errors.push( 'X movement must be a valid CSS unit' );
			}
		}

		if ( config.properties.y && 'string' === typeof config.properties.y ) {
			if ( ! this.validateCSSUnit( config.properties.y ) ) {
				errors.push( 'Y movement must be a valid CSS unit' );
			}
		}

		if ( config.properties.opacity !== undefined ) {
			if ( ! this.validateRange( config.properties.opacity, 0, 1 ) ) {
				errors.push( 'Opacity must be between 0 and 1' );
			}
		}

		return { isValid: 0 === errors.length, errors };
	}
}

/**
 * Animation State Manager
 */
export class AnimationStateManager {
	private static configs = new Map<string, AnimationConfig>();

	/**
	 * Store animation configuration for a block
	 * @param {string}          blockId - The block ID
	 * @param {AnimationConfig} config  - The animation configuration
	 */
	static setConfig( blockId: string, config: AnimationConfig ): void {
		this.configs.set( blockId, config );
	}

	/**
	 * Get animation configuration for a block
	 * @param {string} blockId - The block ID
	 */
	static getConfig( blockId: string ): AnimationConfig | undefined {
		return this.configs.get( blockId );
	}

	/**
	 * Get all timeline configurations
	 */
	static getTimelines(): Array<{ id: string; config: AnimationConfig }> {
		const timelines: Array<{ id: string; config: AnimationConfig }> = [];

		this.configs.forEach( ( config, id ) => {
			if ( config.timeline?.isTimeline ) {
				timelines.push( { id, config } );
			}
		} );

		return timelines;
	}

	/**
	 * Clean up removed blocks
	 * @param {string[]} existingBlockIds - Array of existing block IDs
	 */
	static cleanup( existingBlockIds: string[] ): void {
		const configKeys = Array.from( this.configs.keys() );

		configKeys.forEach( ( key ) => {
			if ( ! existingBlockIds.includes( key ) ) {
				this.configs.delete( key );
			}
		} );
	}
}

/**
 * Enhanced Panel Helper Functions
 */
export class PanelHelpers {
	/**
	 * Generate timeline options for select control
	 */
	static getTimelineOptions(): Array<{ label: string; value: string }> {
		const options = [
			{ label: wp.i18n.__( 'No Timeline', 'gsap-block-animator' ), value: '' },
		];

		const timelines = AnimationStateManager.getTimelines();
		timelines.forEach( ( { id, config } ) => {
			options.push( {
				label: config.timeline?.timelineName || `Timeline ${ id.slice( 0, 8 ) }`,
				value: config.timeline?.timelineId || id,
			} );
		} );

		return options;
	}

	/**
	 * Generate configuration summary text
	 * @param {AnimationConfig} config - The animation configuration
	 */
	static getConfigSummary( config: AnimationConfig ): string {
		const parts = [
			`${ wp.i18n.__( 'Type:', 'gsap-block-animator' ) } ${ config.type }`,
			`${ wp.i18n.__( 'Trigger:', 'gsap-block-animator' ) } ${ config.trigger }`,
			`${ wp.i18n.__( 'Duration:', 'gsap-block-animator' ) } ${ config.timing.duration }s`,
		];

		if ( config.timeline?.isTimeline ) {
			parts.push( `${ wp.i18n.__( 'Timeline:', 'gsap-block-animator' ) } ${ config.timeline.timelineName || 'Unnamed' }` );
		}

		return parts.join( ' | ' );
	}

	/**
	 * Check if animation has meaningful properties
	 * @param {AnimationConfig} config - The animation configuration
	 */
	static hasAnimationProperties( config: AnimationConfig ): boolean {
		const props = config.properties;
		return !! (
			props.x || props.y || props.rotation ||
            ( props.scale && props.scale !== 1 ) ||
            ( props.opacity !== undefined && props.opacity !== 1 )
		);
	}
}

/**
 * Type-safe event handlers
 */
export class EventHandlers {
	/**
	 * Handle animation property updates
	 * @param {AnimationConfig} gsapAnimation - Current animation configuration
	 * @param {Function}        setAttributes - Attribute setter function
	 */
	static createPropertyUpdater(
		gsapAnimation: AnimationConfig,
		setAttributes: ( attrs: Record<string, unknown> ) => void,
	) {
		return ( key: string, value: unknown ) => {
			const currentProperties = gsapAnimation.properties || {};
			setAttributes( {
				gsapAnimation: {
					...gsapAnimation,
					properties: { ...currentProperties, [ key ]: value },
				},
			} );
		};
	}

	/**
	 * Handle timing updates
	 * @param {AnimationConfig} gsapAnimation - Current animation configuration
	 * @param {Function}        setAttributes - Attribute setter function
	 */
	static createTimingUpdater(
		gsapAnimation: AnimationConfig,
		setAttributes: ( attrs: Record<string, unknown> ) => void,
	) {
		return ( key: keyof AnimationConfig['timing'], value: unknown ) => {
			setAttributes( {
				gsapAnimation: {
					...gsapAnimation,
					timing: { ...gsapAnimation.timing, [ key ]: value },
				},
			} );
		};
	}

	/**
	 * Handle timeline updates
	 * @param {AnimationConfig} gsapAnimation - Current animation configuration
	 * @param {Function}        setAttributes - Attribute setter function
	 */
	static createTimelineUpdater(
		gsapAnimation: AnimationConfig,
		setAttributes: ( attrs: Record<string, unknown> ) => void,
	) {
		return ( key: keyof TimelineConfig, value: unknown ) => {
			setAttributes( {
				gsapAnimation: {
					...gsapAnimation,
					timeline: { ...gsapAnimation.timeline, [ key ]: value },
				},
			} );
		};
	}
}

/**
 * Export utility functions for the working JavaScript implementation
 */
export const GSAPPanelUtils = {
	DEFAULT_ANIMATION_CONFIG,
	ANIMATION_TYPES,
	TRIGGER_TYPES,
	EASING_FUNCTIONS,
	AnimationValidator,
	AnimationStateManager,
	PanelHelpers,
	EventHandlers,
};

// Make it available globally for the JavaScript implementation
if ( typeof window !== 'undefined' ) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	( window as any ).GSAPPanelUtils = GSAPPanelUtils;
}

export default GSAPPanelUtils;
