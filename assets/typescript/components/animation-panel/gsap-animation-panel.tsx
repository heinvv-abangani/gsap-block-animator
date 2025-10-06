/**
 * GSAP Animation Panel - TypeScript Implementation
 *
 * @package
 * @since 2.0.0
 */

import * as React from 'react';
import { createElement } from '@wordpress/element';
import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
// Import { InspectorControls } from '@wordpress/block-editor';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { InspectorControls } = ( window.wp as any ).blockEditor;
import {
	PanelBody,
	ToggleControl,
	SelectControl,
	TextControl,
	RangeControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import type {
	AnimationConfig,
	AnimationType,
	TriggerType,
	EaseType,
	TimelineConfig,
} from '../../types/animation';
import type { BlockEditProps } from '../../types/block';

interface GSAPAnimationPanelProps extends BlockEditProps {
    attributes: {
        gsapAnimation?: AnimationConfig;
        [key: string]: unknown;
    };
    setAttributes: ( attributes: Partial<{ gsapAnimation: AnimationConfig }> ) => void;
}

/**
 * Default animation configuration
 */
const DEFAULT_ANIMATION_CONFIG: AnimationConfig = {
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
 * Animation type options for SelectControl
 */
const ANIMATION_TYPE_OPTIONS: Array<{ label: string; value: AnimationType }> = [
	{ label: __( 'To', 'gsap-block-animator' ), value: 'to' },
	{ label: __( 'From', 'gsap-block-animator' ), value: 'from' },
	{ label: __( 'From/To', 'gsap-block-animator' ), value: 'fromTo' },
	{ label: __( 'Set', 'gsap-block-animator' ), value: 'set' },
];

/**
 * Trigger type options for SelectControl
 */
const TRIGGER_TYPE_OPTIONS: Array<{ label: string; value: TriggerType }> = [
	{ label: __( 'On Page Load', 'gsap-block-animator' ), value: 'pageload' },
	{ label: __( 'On Scroll', 'gsap-block-animator' ), value: 'scroll' },
	{ label: __( 'On Click', 'gsap-block-animator' ), value: 'click' },
	{ label: __( 'On Hover', 'gsap-block-animator' ), value: 'hover' },
];

/**
 * Easing options for SelectControl
 */
const EASING_OPTIONS: Array<{ label: string; value: EaseType }> = [
	{ label: __( 'None', 'gsap-block-animator' ), value: 'none' },
	{ label: __( 'Power1 Out', 'gsap-block-animator' ), value: 'power1.out' },
	{ label: __( 'Power2 Out', 'gsap-block-animator' ), value: 'power2.out' },
	{ label: __( 'Power3 Out', 'gsap-block-animator' ), value: 'power3.out' },
	{ label: __( 'Back Out', 'gsap-block-animator' ), value: 'back.out' },
	{ label: __( 'Elastic Out', 'gsap-block-animator' ), value: 'elastic.out' },
	{ label: __( 'Bounce Out', 'gsap-block-animator' ), value: 'bounce.out' },
];

/**
 * Timeline position options
 */
const TIMELINE_POSITION_OPTIONS: Array<{ label: string; value: string }> = [
	{ label: __( 'Start', 'gsap-block-animator' ), value: 'start' },
	{ label: __( 'End', 'gsap-block-animator' ), value: 'end' },
	{ label: __( '+=0.5', 'gsap-block-animator' ), value: '+=0.5' },
	{ label: __( '-=0.5', 'gsap-block-animator' ), value: '-=0.5' },
	{ label: __( 'Custom', 'gsap-block-animator' ), value: 'custom' },
];

/**
 * GSAP Animation Panel Component
 * @param {GSAPAnimationPanelProps} props               - Component props
 * @param {Object}                  props.attributes    - Block attributes
 * @param {Function}                props.setAttributes - Attribute setter function
 * @return {JSX.Element} The animation panel component
 */
function GSAPAnimationPanel( { attributes, setAttributes }: GSAPAnimationPanelProps ): JSX.Element {
	const gsapAnimation: AnimationConfig = {
		...DEFAULT_ANIMATION_CONFIG,
		...attributes.gsapAnimation,
	};

	/**
	 * Update animation configuration
	 * @param {Partial<AnimationConfig>} updates - Configuration updates
	 */
	const updateAnimation = ( updates: Partial<AnimationConfig> ): void => {
		setAttributes( {
			gsapAnimation: { ...gsapAnimation, ...updates },
		} );
	};

	/**
	 * Update animation property
	 * @param {string}  key   - Property key
	 * @param {unknown} value - Property value
	 */
	const updateProperty = ( key: string, value: unknown ): void => {
		const currentProperties = gsapAnimation.properties || {};
		updateAnimation( {
			properties: { ...currentProperties, [ key ]: value },
		} );
	};

	/**
	 * Update timing configuration
	 * @param {keyof AnimationConfig['timing']} key   - Timing property key
	 * @param {unknown}                         value - Timing property value
	 */
	const updateTiming = ( key: keyof AnimationConfig['timing'], value: unknown ): void => {
		updateAnimation( {
			timing: { ...gsapAnimation.timing, [ key ]: value },
		} );
	};

	/**
	 * Update timeline configuration
	 * @param {keyof TimelineConfig} key   - Timeline property key
	 * @param {unknown}              value - Timeline property value
	 */
	const updateTimeline = ( key: keyof TimelineConfig, value: unknown ): void => {
		updateAnimation( {
			timeline: {
				isTimeline: gsapAnimation.timeline?.isTimeline || false,
				timelineId: gsapAnimation.timeline?.timelineId || '',
				timelineName: gsapAnimation.timeline?.timelineName || '',
				timelinePosition: gsapAnimation.timeline?.timelinePosition || 'start',
				[ key ]: value,
			} as TimelineConfig,
		} );
	};

	/**
	 * Render animation controls
	 */
	const renderControls = (): React.ReactElement[] => {
		const controls: React.ReactElement[] = [];

		// Enable Animation Toggle
		controls.push(
			createElement( ToggleControl, {
				key: 'enable-animation',
				label: __( 'Enable Animation', 'gsap-block-animator' ),
				checked: gsapAnimation.enabled,
				onChange: ( enabled: boolean ) => updateAnimation( { enabled } ),
				help: gsapAnimation.enabled
					? __( 'Animation is enabled for this block', 'gsap-block-animator' )
					: __( 'Enable to add GSAP animation to this block', 'gsap-block-animator' ),
			} ),
		);

		// Show additional controls only when enabled
		if ( gsapAnimation.enabled ) {
			// Animation Type
			controls.push(
				createElement( SelectControl, {
					key: 'animation-type',
					label: __( 'Animation Type', 'gsap-block-animator' ),
					value: gsapAnimation.type,
					options: ANIMATION_TYPE_OPTIONS,
					onChange: ( type: string ) => updateAnimation( { type: type as AnimationType } ),
				} ),
			);

			// Trigger
			controls.push(
				createElement( SelectControl, {
					key: 'trigger',
					label: __( 'Trigger', 'gsap-block-animator' ),
					value: gsapAnimation.trigger,
					options: TRIGGER_TYPE_OPTIONS,
					onChange: ( trigger: string ) => updateAnimation( { trigger: trigger as TriggerType } ),
				} ),
			);

			// Timeline Settings
			controls.push(
				createElement( ToggleControl, {
					key: 'create-timeline',
					label: __( 'Create Timeline', 'gsap-block-animator' ),
					checked: gsapAnimation.timeline?.isTimeline || false,
					onChange: ( isTimeline: boolean ) => updateTimeline( 'isTimeline', isTimeline ),
					help: __( 'Enable to create a GSAP timeline for this element', 'gsap-block-animator' ),
				} ),
			);

			// Timeline creation fields
			if ( gsapAnimation.timeline?.isTimeline ) {
				controls.push(
					createElement( TextControl, {
						key: 'timeline-id',
						label: __( 'Timeline ID', 'gsap-block-animator' ),
						value: gsapAnimation.timeline?.timelineId || '',
						onChange: ( timelineId: string ) => updateTimeline( 'timelineId', timelineId ),
						placeholder: 'my-timeline',
						help: __( 'Unique identifier for this timeline', 'gsap-block-animator' ),
					} ),
					createElement( TextControl, {
						key: 'timeline-name',
						label: __( 'Timeline Name', 'gsap-block-animator' ),
						value: gsapAnimation.timeline?.timelineName || '',
						onChange: ( timelineName: string ) => updateTimeline( 'timelineName', timelineName ),
						placeholder: 'My Timeline',
						help: __( 'Display name for this timeline', 'gsap-block-animator' ),
					} ),
				);
			}

			// Add to Timeline Section (if not creating timeline)
			if ( ! gsapAnimation.timeline?.isTimeline ) {
				controls.push(
					createElement( SelectControl, {
						key: 'select-timeline',
						label: __( 'Add to Timeline', 'gsap-block-animator' ),
						value: gsapAnimation.timeline?.parentTimelineId || '',
						options: [
							{ label: __( 'No Timeline', 'gsap-block-animator' ), value: '' },
							{ label: __( 'Timeline 1', 'gsap-block-animator' ), value: 'timeline-1' },
							{ label: __( 'Timeline 2', 'gsap-block-animator' ), value: 'timeline-2' },
						],
						onChange: ( parentTimelineId: string ) => updateTimeline( 'parentTimelineId', parentTimelineId ),
						help: __( 'Select a timeline to add this animation to', 'gsap-block-animator' ),
					} ),
					createElement( SelectControl, {
						key: 'timeline-position',
						label: __( 'Timeline Position', 'gsap-block-animator' ),
						value: gsapAnimation.timeline?.timelinePosition || 'start',
						options: TIMELINE_POSITION_OPTIONS,
						onChange: ( timelinePosition: string ) => updateTimeline( 'timelinePosition', timelinePosition ),
						help: __( 'When to add this animation in the timeline', 'gsap-block-animator' ),
					} ),
				);

				// Custom timeline position field
				if ( 'custom' === gsapAnimation.timeline?.timelinePosition ) {
					controls.push(
						createElement( TextControl, {
							key: 'custom-position',
							label: __( 'Custom Position', 'gsap-block-animator' ),
							value: gsapAnimation.timeline?.customPosition || '',
							onChange: ( customPosition: string ) => updateTimeline( 'customPosition', customPosition ),
							placeholder: '+=1',
							help: __( 'Custom timeline position (e.g., +=1, -=0.5, 2)', 'gsap-block-animator' ),
						} ),
					);
				}
			}

			// Transform Properties
			controls.push(
				createElement( TextControl, {
					key: 'x-movement',
					label: __( 'X Movement', 'gsap-block-animator' ),
					value: ( gsapAnimation.properties?.x as string ) || '',
					onChange: ( value: string ) => updateProperty( 'x', value ),
					placeholder: '0px',
					help: __( 'Horizontal movement (px, %, em, etc.)', 'gsap-block-animator' ),
				} ),
				createElement( TextControl, {
					key: 'y-movement',
					label: __( 'Y Movement', 'gsap-block-animator' ),
					value: ( gsapAnimation.properties?.y as string ) || '',
					onChange: ( value: string ) => updateProperty( 'y', value ),
					placeholder: '0px',
					help: __( 'Vertical movement (px, %, em, etc.)', 'gsap-block-animator' ),
				} ),
				createElement( TextControl, {
					key: 'rotation',
					label: __( 'Rotation', 'gsap-block-animator' ),
					value: gsapAnimation.properties?.rotation?.toString() || '',
					onChange: ( value: string ) => updateProperty( 'rotation', parseFloat( value ) || 0 ),
					placeholder: '0',
					help: __( 'Rotation in degrees', 'gsap-block-animator' ),
				} ),
				createElement( TextControl, {
					key: 'scale',
					label: __( 'Scale', 'gsap-block-animator' ),
					value: gsapAnimation.properties?.scale?.toString() || '',
					onChange: ( value: string ) => updateProperty( 'scale', parseFloat( value ) || 1 ),
					placeholder: '1',
					help: __( 'Scale multiplier (1 = 100%)', 'gsap-block-animator' ),
				} ),
				createElement( RangeControl, {
					key: 'opacity',
					label: __( 'Opacity', 'gsap-block-animator' ),
					value: gsapAnimation.properties?.opacity !== undefined ? gsapAnimation.properties.opacity : 1,
					onChange: ( value: number | undefined ) => updateProperty( 'opacity', value || 1 ),
					min: 0,
					max: 1,
					step: 0.1,
					help: __( 'Element opacity (0–1)', 'gsap-block-animator' ),
				} ),
			);

			// Timing Controls
			controls.push(
				createElement( RangeControl, {
					key: 'duration',
					label: __( 'Duration (seconds)', 'gsap-block-animator' ),
					value: gsapAnimation.timing.duration,
					onChange: ( value?: number ) => updateTiming( 'duration', value || 0.5 ),
					min: 0.1,
					max: 5,
					step: 0.1,
					help: __( 'Animation duration in seconds', 'gsap-block-animator' ),
				} ),
				createElement( RangeControl, {
					key: 'delay',
					label: __( 'Delay (seconds)', 'gsap-block-animator' ),
					value: gsapAnimation.timing.delay,
					onChange: ( value?: number ) => updateTiming( 'delay', value || 0 ),
					min: 0,
					max: 3,
					step: 0.1,
					help: __( 'Delay before animation starts', 'gsap-block-animator' ),
				} ),
				createElement( SelectControl, {
					key: 'easing',
					label: __( 'Easing', 'gsap-block-animator' ),
					value: gsapAnimation.timing.ease,
					options: EASING_OPTIONS,
					onChange: ( ease: string ) => updateTiming( 'ease', ease as EaseType ),
				} ),
			);

			// Configuration Summary
			controls.push(
				createElement( 'hr', {
					key: 'summary-divider',
					style: { margin: '20px 0', border: 'none', borderTop: '1px solid #ccc' },
				} ),
				createElement( 'div', {
					key: 'summary',
					style: {
						padding: '15px',
						backgroundColor: '#f0f9ff',
						border: '1px solid #0073aa',
						borderRadius: '4px',
						marginTop: '15px',
					},
				}, [
					createElement( 'div', {
						key: 'summary-title',
						style: { fontWeight: 'bold', color: '#0073aa', marginBottom: '8px' },
					}, '✅ ' + __( 'Animation Configured', 'gsap-block-animator' ) ),
					createElement( 'div', {
						key: 'summary-details',
						style: { fontSize: '12px', color: '#666' },
					}, [
						__( 'Type:', 'gsap-block-animator' ) + ' ' + gsapAnimation.type + ' | ',
						__( 'Trigger:', 'gsap-block-animator' ) + ' ' + gsapAnimation.trigger + ' | ',
						__( 'Duration:', 'gsap-block-animator' ) + ' ' + gsapAnimation.timing.duration + 's',
					].join( '' ) ),
				] ),
			);
		}

		return controls;
	};

	return createElement(
		PanelBody,
		{
			title: __( 'GSAP Animation', 'gsap-block-animator' ),
			initialOpen: gsapAnimation.enabled,
			className: 'gsap-animation-panel',
		},
		...renderControls(),
	);
}

/**
 * Higher Order Component to add the GSAP animation panel
 */
const withGSAPPanel = createHigherOrderComponent(
	( BlockEdit: React.ComponentType<BlockEditProps> ) => {
		return ( props: BlockEditProps ) => {
			const { name: blockName } = props;

			// Skip certain blocks
			const skipBlocks = [
				'core/block',
				'core/template',
				'core/template-part',
				'core/navigation',
				'core/freeform',
				'core/html',
			];

			if ( skipBlocks.includes( blockName ) ) {
				return createElement( BlockEdit, props );
			}

			return createElement(
				'div',
				{},
				createElement( BlockEdit, props ),
				createElement(
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
				InspectorControls as any,
				null,
				createElement( GSAPAnimationPanel, props ),
				),
			);
		};
	},
	'withGSAPPanel',
);

/**
 * Add gsapAnimation attribute to all blocks
 * @param {Record<string, unknown>} settings - Block settings
 * @param {string}                  name     - Block name
 */
function addGSAPAttributes( settings: Record<string, unknown>, name: string ) {
	// Skip certain blocks
	const skipBlocks = [
		'core/block',
		'core/template',
		'core/template-part',
		'core/navigation',
		'core/freeform',
		'core/html',
	];

	if ( skipBlocks.includes( name ) ) {
		return settings;
	}

	return {
		...settings,
		attributes: {
			...( settings.attributes || {} ),
			gsapAnimation: {
				type: 'object',
				default: DEFAULT_ANIMATION_CONFIG,
			},
		},
	};
}

// Register the filters
addFilter(
	'blocks.registerBlockType',
	'gsap-block-animator/add-attributes',
	addGSAPAttributes,
);

addFilter(
	'editor.BlockEdit',
	'gsap-block-animator/add-animation-controls',
	withGSAPPanel,
);

export { GSAPAnimationPanel, withGSAPPanel, addGSAPAttributes };
export type { GSAPAnimationPanelProps };
