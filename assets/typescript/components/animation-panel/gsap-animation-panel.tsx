import * as React from 'react';
import { createElement, useState, useEffect, useMemo } from '@wordpress/element';
import { createHigherOrderComponent } from '@wordpress/compose';

const { InspectorControls } = ( window.wp as unknown as { blockEditor: { InspectorControls: React.ComponentType<unknown> } } ).blockEditor;
import {
	PanelBody,
	Modal,
	Button,
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
	TimingProperties,
	TimelineConfig,
} from '../../types/animation';
import type { BlockEditProps } from '../../types/block';

interface GSAPAnimationPanelProps extends BlockEditProps {
    attributes: {
        gsapAnimation?: AnimationConfig;
        [key: string]: unknown;
    };
    setAttributes: ( attributes: Partial<{ gsapAnimation: AnimationConfig }> ) => void;
    clientId: string;
}
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

const ANIMATION_TYPE_OPTIONS: Array<{ label: string; value: AnimationType }> = [
	{ label: __( 'To', 'gsap-block-animator' ), value: 'to' },
	{ label: __( 'From', 'gsap-block-animator' ), value: 'from' },
	{ label: __( 'From/To', 'gsap-block-animator' ), value: 'fromTo' },
	{ label: __( 'Set', 'gsap-block-animator' ), value: 'set' },
];

const TRIGGER_TYPE_OPTIONS: Array<{ label: string; value: TriggerType }> = [
	{ label: __( 'On Page Load', 'gsap-block-animator' ), value: 'pageload' },
	{ label: __( 'On Scroll', 'gsap-block-animator' ), value: 'scroll' },
	{ label: __( 'On Click', 'gsap-block-animator' ), value: 'click' },
	{ label: __( 'On Hover', 'gsap-block-animator' ), value: 'hover' },
];

const EASING_OPTIONS: Array<{ label: string; value: EaseType }> = [
	{ label: __( 'None', 'gsap-block-animator' ), value: 'none' },
	{ label: __( 'Power1 Out', 'gsap-block-animator' ), value: 'power1.out' },
	{ label: __( 'Power2 Out', 'gsap-block-animator' ), value: 'power2.out' },
	{ label: __( 'Power3 Out', 'gsap-block-animator' ), value: 'power3.out' },
	{ label: __( 'Back Out', 'gsap-block-animator' ), value: 'back.out' },
	{ label: __( 'Elastic Out', 'gsap-block-animator' ), value: 'elastic.out' },
	{ label: __( 'Bounce Out', 'gsap-block-animator' ), value: 'bounce.out' },
];

const TIMELINE_POSITION_OPTIONS: Array<{ label: string; value: string }> = [
	{ label: __( 'Start', 'gsap-block-animator' ), value: 'start' },
	{ label: __( 'End', 'gsap-block-animator' ), value: 'end' },
	{ label: __( '+=0.5', 'gsap-block-animator' ), value: '+=0.5' },
	{ label: __( '-=0.5', 'gsap-block-animator' ), value: '-=0.5' },
	{ label: __( 'Custom', 'gsap-block-animator' ), value: 'custom' },
];

const CONTROL_TABS = [
	{
		name: 'basic',
		title: __( 'Basic', 'gsap-block-animator' ),
		className: 'gsap-tab-basic',
	},
	{
		name: 'properties',
		title: __( 'Properties', 'gsap-block-animator' ),
		className: 'gsap-tab-properties',
	},
	{
		name: 'timing',
		title: __( 'Timing', 'gsap-block-animator' ),
		className: 'gsap-tab-timing',
	},
	{
		name: 'advanced',
		title: __( 'Advanced', 'gsap-block-animator' ),
		className: 'gsap-tab-advanced',
	},
];

function GSAPAnimationPanel( { attributes, setAttributes, clientId }: GSAPAnimationPanelProps ): JSX.Element {
	const [ isModalOpen, setIsModalOpen ] = useState( false );
	const [ currentTab, setCurrentTab ] = useState( 'basic' );

	const gsapAnimation: AnimationConfig = useMemo( () => ( {
		...DEFAULT_ANIMATION_CONFIG,
		...attributes.gsapAnimation,
	} ), [ attributes.gsapAnimation ] );

	// Add data attributes to block element in editor for previews
	useEffect( () => {
		if ( gsapAnimation.enabled && clientId ) {
			const blockElement = document.querySelector( `[data-block="${ clientId }"]` );

			if ( blockElement ) {
				blockElement.setAttribute( 'data-gsap-animation', JSON.stringify( gsapAnimation ) );
				blockElement.setAttribute( 'data-gsap-trigger', gsapAnimation.trigger );
				blockElement.setAttribute( 'data-gsap-block-id', clientId );
			}
		}
	}, [ gsapAnimation, clientId ] );

	const updateAnimation = ( updates: Partial<AnimationConfig> ): void => {
		const newConfig = { ...gsapAnimation, ...updates };

		setAttributes( {
			gsapAnimation: newConfig,
		} );
	};

	const updateProperty = ( key: string, value: unknown ): void => {
		const currentProperties = gsapAnimation.properties || {};
		updateAnimation( {
			properties: { ...currentProperties, [ key ]: value },
		} );
	};

	const updateTiming = ( key: keyof AnimationConfig['timing'], value: unknown ): void => {
		updateAnimation( {
			timing: { ...gsapAnimation.timing, [ key ]: value },
		} );
	};

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

	const renderBasicTab = (): React.ReactElement[] => {
		const controls: React.ReactElement[] = [];
		const enableAnimationAndUpdate = ( updates: Partial<AnimationConfig> ) => {
			updateAnimation( { enabled: true, ...updates } );
		};

		// Add enable/disable toggle at the top - full width
		controls.push(
			createElement( 'div', {
				key: 'enable-animation-container',
				style: { gridColumn: '1 / -1', marginBottom: '16px' },
			},
			createElement( ToggleControl, {
				key: 'enable-animation',
				label: __( 'Enable Animation', 'gsap-block-animator' ),
				checked: gsapAnimation.enabled,
				onChange: ( enabled: boolean ) => updateAnimation( { enabled } ),
				help: __( 'Turn animation on or off', 'gsap-block-animator' ),
			} ),
			),
		);

		controls.push(
			createElement( SelectControl, {
				key: 'animation-type',
				label: __( 'Animation Type', 'gsap-block-animator' ),
				value: gsapAnimation.type,
				options: ANIMATION_TYPE_OPTIONS,
				onChange: ( type: string ) => enableAnimationAndUpdate( { type: type as AnimationType } ),
				help: __( 'Choose how the animation should behave', 'gsap-block-animator' ),
			} ),
		);

		controls.push(
			createElement( SelectControl, {
				key: 'trigger',
				label: __( 'Trigger', 'gsap-block-animator' ),
				value: gsapAnimation.trigger,
				options: TRIGGER_TYPE_OPTIONS,
				onChange: ( trigger: string ) => enableAnimationAndUpdate( { trigger: trigger as TriggerType } ),
				help: __( 'When should the animation start?', 'gsap-block-animator' ),
			} ),
		);

		controls.push(
			createElement( TextControl, {
				key: 'selector',
				label: __( 'CSS Selector', 'gsap-block-animator' ),
				value: gsapAnimation.selector || '',
				onChange: ( selector: string ) => enableAnimationAndUpdate( { selector } ),
				placeholder: '.my-class, #my-id',
				help: __( 'Optional: Target specific elements within this block', 'gsap-block-animator' ),
			} ),
		);

		return controls;
	};

	const renderPropertiesTab = (): React.ReactElement[] => {
		const controls: React.ReactElement[] = [];
		const enableAnimationAndUpdateProperty = ( key: string, value: unknown ) => {
			updateAnimation( { enabled: true } );
			updateProperty( key, value );
		};

		// Transform section header - full width
		controls.push(
			createElement( 'h4', {
				key: 'transform-heading',
				style: {
					gridColumn: '1 / -1',
					margin: '0 0 16px 0',
					fontSize: '14px',
					fontWeight: '600',
					borderBottom: '1px solid #ddd',
					paddingBottom: '8px',
				},
			}, __( 'Transform Properties', 'gsap-block-animator' ) ),
			createElement( TextControl, {
				key: 'x-movement',
				label: __( 'X Movement', 'gsap-block-animator' ),
				value: ( gsapAnimation.properties?.x as string ) || '',
				onChange: ( value: string ) => enableAnimationAndUpdateProperty( 'x', value ),
				placeholder: '0px',
				help: __( 'Horizontal movement (px, %, em, etc.)', 'gsap-block-animator' ),
			} ),
			createElement( TextControl, {
				key: 'y-movement',
				label: __( 'Y Movement', 'gsap-block-animator' ),
				value: ( gsapAnimation.properties?.y as string ) || '',
				onChange: ( value: string ) => enableAnimationAndUpdateProperty( 'y', value ),
				placeholder: '0px',
				help: __( 'Vertical movement (px, %, em, etc.)', 'gsap-block-animator' ),
			} ),
			createElement( TextControl, {
				key: 'rotation',
				label: __( 'Rotation', 'gsap-block-animator' ),
				value: gsapAnimation.properties?.rotation?.toString() || '',
				onChange: ( value: string ) => enableAnimationAndUpdateProperty( 'rotation', parseFloat( value ) || 0 ),
				placeholder: '0',
				help: __( 'Rotation in degrees', 'gsap-block-animator' ),
			} ),
			createElement( TextControl, {
				key: 'scale',
				label: __( 'Scale', 'gsap-block-animator' ),
				value: gsapAnimation.properties?.scale?.toString() || '',
				onChange: ( value: string ) => enableAnimationAndUpdateProperty( 'scale', parseFloat( value ) || 1 ),
				placeholder: '1',
				help: __( 'Scale multiplier (1 = 100%)', 'gsap-block-animator' ),
			} ),
		);

		// Appearance section header - full width
		controls.push(
			createElement( 'h4', {
				key: 'appearance-heading',
				style: {
					gridColumn: '1 / -1',
					margin: '24px 0 16px 0',
					fontSize: '14px',
					fontWeight: '600',
					borderBottom: '1px solid #ddd',
					paddingBottom: '8px',
				},
			}, __( 'Appearance Properties', 'gsap-block-animator' ) ),
			createElement( RangeControl, {
				key: 'opacity',
				label: __( 'Opacity', 'gsap-block-animator' ),
				value: gsapAnimation.properties?.opacity !== undefined ? gsapAnimation.properties.opacity : 1,
				onChange: ( value: number | undefined ) => enableAnimationAndUpdateProperty( 'opacity', value || 1 ),
				min: 0,
				max: 1,
				step: 0.1,
				help: __( 'Element opacity (0–1)', 'gsap-block-animator' ),
			} ),
			createElement( TextControl, {
				key: 'background-color',
				label: __( 'Background Color', 'gsap-block-animator' ),
				value: gsapAnimation.properties?.backgroundColor?.toString() || '',
				onChange: ( value: string ) => enableAnimationAndUpdateProperty( 'backgroundColor', value ),
				placeholder: '#ffffff',
				help: __( 'Background color (hex, rgb, etc.)', 'gsap-block-animator' ),
			} ),
		);

		return controls;
	};

	const renderTimingTab = (): React.ReactElement[] => {
		const controls: React.ReactElement[] = [];
		const enableAnimationAndUpdateTiming = ( key: keyof TimingProperties, value: unknown ) => {
			updateAnimation( { enabled: true } );
			updateTiming( key, value );
		};
		controls.push(
			createElement( RangeControl, {
				key: 'duration',
				label: __( 'Duration (seconds)', 'gsap-block-animator' ),
				value: gsapAnimation.timing.duration,
				onChange: ( value?: number ) => enableAnimationAndUpdateTiming( 'duration', value || 0.5 ),
				min: 0.1,
				max: 5,
				step: 0.1,
				help: __( 'Animation duration in seconds', 'gsap-block-animator' ),
			} ),
			createElement( RangeControl, {
				key: 'delay',
				label: __( 'Delay (seconds)', 'gsap-block-animator' ),
				value: gsapAnimation.timing.delay,
				onChange: ( value?: number ) => enableAnimationAndUpdateTiming( 'delay', value || 0 ),
				min: 0,
				max: 3,
				step: 0.1,
				help: __( 'Delay before animation starts', 'gsap-block-animator' ),
			} ),
			createElement( RangeControl, {
				key: 'repeat',
				label: __( 'Repeat', 'gsap-block-animator' ),
				value: gsapAnimation.timing.repeat,
				onChange: ( value?: number ) => enableAnimationAndUpdateTiming( 'repeat', value || 0 ),
				min: 0,
				max: 10,
				step: 1,
				help: __( 'Number of times to repeat (0 = no repeat)', 'gsap-block-animator' ),
			} ),
			createElement( ToggleControl, {
				key: 'yoyo',
				label: __( 'Yoyo', 'gsap-block-animator' ),
				checked: gsapAnimation.timing.yoyo,
				onChange: ( yoyo: boolean ) => enableAnimationAndUpdateTiming( 'yoyo', yoyo ),
				help: __( 'Alternate direction on each repeat', 'gsap-block-animator' ),
			} ),
			createElement( SelectControl, {
				key: 'easing',
				label: __( 'Easing', 'gsap-block-animator' ),
				value: gsapAnimation.timing.ease,
				options: EASING_OPTIONS,
				onChange: ( ease: string ) => enableAnimationAndUpdateTiming( 'ease', ease as EaseType ),
			} ),
		);

		return controls;
	};

	const renderAdvancedTab = (): React.ReactElement[] => {
		const controls: React.ReactElement[] = [];
		const enableAnimationAndUpdateTimeline = ( key: keyof TimelineConfig, value: unknown ) => {
			updateAnimation( { enabled: true } );
			updateTimeline( key, value );
		};
		controls.push(
			createElement( 'h4', {
				key: 'timeline-heading',
				style: { margin: '16px 0 8px 0', fontSize: '14px', fontWeight: '600' },
			}, __( 'Timeline Settings', 'gsap-block-animator' ) ),
			createElement( ToggleControl, {
				key: 'create-timeline',
				label: __( 'Create Timeline', 'gsap-block-animator' ),
				checked: gsapAnimation.timeline?.isTimeline || false,
				onChange: ( isTimeline: boolean ) => enableAnimationAndUpdateTimeline( 'isTimeline', isTimeline ),
				help: __( 'Enable to create a GSAP timeline for this element', 'gsap-block-animator' ),
			} ),
		);

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

		// Configuration summary - full width
		controls.push(
			createElement( 'div', {
				key: 'summary-container',
				style: { gridColumn: '1 / -1' },
			}, [
				createElement( 'h4', {
					key: 'summary-heading',
					style: {
						margin: '24px 0 16px 0',
						fontSize: '14px',
						fontWeight: '600',
						borderBottom: '1px solid #ddd',
						paddingBottom: '8px',
					},
				}, __( 'Configuration Summary', 'gsap-block-animator' ) ),
				createElement( 'div', {
					key: 'summary',
					style: {
						padding: '15px',
						backgroundColor: '#f0f9ff',
						border: '1px solid #0073aa',
						borderRadius: '4px',
						marginTop: '8px',
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
			] ),
		);

		return controls;
	};

	const renderCustomTabContent = ( tabName: string ): React.ReactElement => {
		const containerStyle = {
			padding: '16px',
			display: 'grid',
			gridTemplateColumns: '1fr 1fr',
			gap: '16px',
			'--control-width': '100%',
		};

		switch ( tabName ) {
			case 'basic':
				return createElement( 'div', { style: containerStyle }, renderBasicTab() );
			case 'properties':
				return createElement( 'div', { style: containerStyle }, renderPropertiesTab() );
			case 'timing':
				return createElement( 'div', { style: containerStyle }, renderTimingTab() );
			case 'advanced':
				return createElement( 'div', { style: containerStyle }, renderAdvancedTab() );
			default:
				return createElement( 'div', {}, 'Select a tab to configure animation settings' );
		}
	};

	return createElement(
		PanelBody,
		{
			title: gsapAnimation.enabled
				? `🎬 ${ __( 'GSAP Animation', 'gsap-block-animator' ) }`
				: __( 'GSAP Animation', 'gsap-block-animator' ),
			initialOpen: false,
			className: `gsap-animation-panel ${ gsapAnimation.enabled ? 'animation-enabled' : 'animation-disabled' }`,
		},
		gsapAnimation.enabled && createElement( 'div', {
			style: {
				marginBottom: '12px',
				padding: '8px 12px',
				backgroundColor: '#e7f3ff',
				border: '1px solid #0073aa',
				borderRadius: '4px',
				fontSize: '12px',
				color: '#0073aa',
			},
		}, `✅ Animation active: ${ gsapAnimation.type } on ${ gsapAnimation.trigger }` ),
		createElement( Button, {
			isPrimary: true,
			onClick: () => setIsModalOpen( true ),
			style: { width: '100%', marginBottom: '8px' },
		}, __( 'Configure Animation', 'gsap-block-animator' ) ),
		isModalOpen && createElement( Modal, {
			title: __( 'GSAP Animation Settings', 'gsap-block-animator' ),
			onRequestClose: () => setIsModalOpen( false ),
			className: 'gsap-animation-modal',
			style: { width: '1000px', height: '600px', maxWidth: '1000px', maxHeight: '600px' },
			children: createElement( 'div', {
				className: 'gsap-modal-content',
				style: {
					padding: '20px',
					height: '100%',
					overflow: 'auto',
				},
			},
			createElement( 'div', {
				className: 'gsap-custom-tabs',
				style: {
					display: 'flex',
					flexDirection: 'column',
					height: '100%',
				},
			},
			createElement( 'div', {
				className: 'gsap-tab-nav',
				style: {
					display: 'flex',
					borderBottom: '1px solid #e2e8f0',
					marginBottom: '20px',
					paddingBottom: '0',
				},
			},
			CONTROL_TABS.map( ( tab ) =>
				createElement( 'button', {
					key: tab.name,
					className: `gsap-tab-button ${ currentTab === tab.name ? 'active' : '' }`,
					onClick: () => setCurrentTab( tab.name ),
					style: {
						background: 'none',
						border: 'none',
						padding: '8px 16px',
						cursor: 'pointer',
						fontSize: '14px',
						fontWeight: currentTab === tab.name ? '600' : '400',
						color: currentTab === tab.name ? '#0073aa' : '#6b7280',
						borderBottom: currentTab === tab.name ? '2px solid #0073aa' : '2px solid transparent',
						transition: 'all 0.2s ease',
					},
				}, tab.title ),
			),
			),
			createElement( 'div', {
				className: 'gsap-tab-content-wrapper',
				style: {
					flex: 1,
					overflow: 'auto',
				},
			}, renderCustomTabContent( currentTab ) ),
			),
			),
		} ),
	);
}

const withGSAPPanel = createHigherOrderComponent(
	( BlockEdit: React.ComponentType<BlockEditProps> ) => {
		return ( props: BlockEditProps ) => {
			const { name: blockName } = props;

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
					InspectorControls,
					null,
					createElement( GSAPAnimationPanel, props ),
				),
			);
		};
	},
	'withGSAPPanel',
);

function addGSAPAttributes( settings: Record<string, unknown>, name: string ) {
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

export { GSAPAnimationPanel, withGSAPPanel, addGSAPAttributes };
export type { GSAPAnimationPanelProps };
