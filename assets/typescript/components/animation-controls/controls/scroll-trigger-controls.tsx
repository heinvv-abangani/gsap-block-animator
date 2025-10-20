import { Fragment } from '@wordpress/element';
import { TextControl, SelectControl, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { BaseControlSection } from './base-control-section';

interface ScrollTriggerConfig {
	start?: string;
	end?: string;
	scrub?: boolean | number;
	pin?: boolean;
	markers?: boolean;
	toggleActions?: string;
}

interface ScrollTriggerControlsProps {
	scrollConfig: ScrollTriggerConfig;
	updateScrollConfig: ( key: string, value: unknown ) => void;
}

export class ScrollTriggerControls {
	private static readonly TOGGLE_ACTION_OPTIONS = [
		{ 
			label: __( 'Play & Reverse on Scroll Up (Recommended)', 'gsap-block-animator' ), 
			value: 'play none none reverse' 
		},
		{ 
			label: __( 'Play & Reverse Both Directions', 'gsap-block-animator' ), 
			value: 'play reverse play reverse' 
		},
		{ 
			label: __( 'Play Forward, Reverse Backward', 'gsap-block-animator' ), 
			value: 'play pause reverse reset' 
		},
		{ 
			label: __( 'Play Only Once (No Reverse)', 'gsap-block-animator' ), 
			value: 'play none none none' 
		},
		{ 
			label: __( 'Play & Complete on Each Pass', 'gsap-block-animator' ), 
			value: 'play complete play complete' 
		},
		{ 
			label: __( 'Advanced: Pause & Resume', 'gsap-block-animator' ), 
			value: 'play pause resume reset' 
		},
	];

	static render( { scrollConfig, updateScrollConfig }: ScrollTriggerControlsProps ): JSX.Element {
		return BaseControlSection.render( {
			label: __( 'Scroll Trigger Settings', 'gsap-block-animator' ),
			className: 'gsap-section-divider gsap-scroll-trigger-section',
			children: (
				<Fragment>
					<TextControl
						label={ __( 'Start Position', 'gsap-block-animator' ) }
						value={ scrollConfig.start || 'top 80%' }
						onChange={ ( value: string ) => updateScrollConfig( 'start', value ) }
						placeholder="top 80%"
						help={ __( 'When the animation should start (e.g., "top center", "top 80%")', 'gsap-block-animator' ) }
					/>

					<TextControl
						label={ __( 'End Position', 'gsap-block-animator' ) }
						value={ scrollConfig.end || 'bottom 20%' }
						onChange={ ( value: string ) => updateScrollConfig( 'end', value ) }
						placeholder="bottom 20%"
						help={ __( 'When the animation should end (e.g., "bottom center", "+=500")', 'gsap-block-animator' ) }
					/>

					<SelectControl
						label={ __( 'Scroll Behavior', 'gsap-block-animator' ) }
						value={ scrollConfig.toggleActions || 'play none none reverse' }
						options={ this.TOGGLE_ACTION_OPTIONS }
						onChange={ ( value: string ) => updateScrollConfig( 'toggleActions', value ) }
						help={ __( 'Controls animation behavior when scrolling up and down', 'gsap-block-animator' ) }
					/>

					<ToggleControl
						label={ __( 'Scrub', 'gsap-block-animator' ) }
						checked={ !! scrollConfig.scrub }
						onChange={ ( value: boolean ) => updateScrollConfig( 'scrub', value ? 1 : false ) }
						help={ __( 'Tie animation progress to scroll position', 'gsap-block-animator' ) }
					/>

					<ToggleControl
						label={ __( 'Pin Element', 'gsap-block-animator' ) }
						checked={ !! scrollConfig.pin }
						onChange={ ( value: boolean ) => updateScrollConfig( 'pin', value ) }
						help={ __( 'Pin the element during animation', 'gsap-block-animator' ) }
					/>

					<ToggleControl
						label={ __( 'Show Markers (Debug)', 'gsap-block-animator' ) }
						checked={ !! scrollConfig.markers }
						onChange={ ( value: boolean ) => updateScrollConfig( 'markers', value ) }
						help={ __( 'Show visual markers for debugging (frontend only)', 'gsap-block-animator' ) }
					/>

					<div className="gsap-scroll-help">
						<p><strong>{ __( 'Scroll Behavior Explained:', 'gsap-block-animator' ) }</strong></p>
						<ul>
							<li><strong>Play & Reverse on Scroll Up</strong> - { __( 'Animation plays when scrolling down, reverses when scrolling back up (recommended)', 'gsap-block-animator' ) }</li>
							<li><strong>Play & Reverse Both Directions</strong> - { __( 'Animation plays/reverses every time you enter/leave the trigger zone', 'gsap-block-animator' ) }</li>
							<li><strong>Play Only Once</strong> - { __( 'Animation plays once and never repeats or reverses', 'gsap-block-animator' ) }</li>
						</ul>
						
						<p><strong>{ __( 'Position Guide:', 'gsap-block-animator' ) }</strong></p>
						<ul>
							<li><code>top center</code> - { __( 'Element top hits viewport center', 'gsap-block-animator' ) }</li>
							<li><code>top 80%</code> - { __( 'Element top hits 80% down viewport', 'gsap-block-animator' ) }</li>
							<li><code>bottom center</code> - { __( 'Element bottom hits viewport center', 'gsap-block-animator' ) }</li>
							<li><code>+=500</code> - { __( '500px after start position', 'gsap-block-animator' ) }</li>
						</ul>
					</div>
				</Fragment>
			),
		} );
	}
}

