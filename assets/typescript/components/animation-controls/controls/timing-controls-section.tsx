import { Fragment } from '@wordpress/element';
import { RangeControl, ToggleControl, SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { BaseControlSection } from './base-control-section';
import type { EaseType, TimingProperties } from '../../../types/animation';

interface TimingControlsSectionProps {
	timing: TimingProperties;
	updateTiming: ( key: string, value: unknown ) => void;
}

export class TimingControlsSection {
	private static readonly EASE_OPTIONS = [
		{ label: __( 'None', 'gsap-block-animator' ), value: 'none' as EaseType },
		{ label: __( 'Power1 Out', 'gsap-block-animator' ), value: 'power1.out' as EaseType },
		{ label: __( 'Power2 Out', 'gsap-block-animator' ), value: 'power2.out' as EaseType },
		{ label: __( 'Power3 Out', 'gsap-block-animator' ), value: 'power3.out' as EaseType },
		{ label: __( 'Back Out', 'gsap-block-animator' ), value: 'back.out' as EaseType },
		{ label: __( 'Elastic Out', 'gsap-block-animator' ), value: 'elastic.out' as EaseType },
		{ label: __( 'Bounce Out', 'gsap-block-animator' ), value: 'bounce.out' as EaseType },
	];

	static render( { timing, updateTiming }: TimingControlsSectionProps ): JSX.Element {
		return BaseControlSection.render( {
			label: __( 'Animation Settings', 'gsap-block-animator' ),
			className: 'gsap-section-divider',
			children: (
				<Fragment>
					{ this.renderDurationControl( timing, updateTiming ) }
					{ this.renderDelayControl( timing, updateTiming ) }
					{ this.renderRepeatControl( timing, updateTiming ) }
					{ this.renderYoyoControl( timing, updateTiming ) }
					{ this.renderEaseControl( timing, updateTiming ) }
				</Fragment>
			),
		} );
	}

	private static renderDurationControl( timing: TimingProperties, updateTiming: ( key: string, value: unknown ) => void ): JSX.Element {
		return (
			<RangeControl
				label={ __( 'Duration (seconds)', 'gsap-block-animator' ) }
				value={ timing.duration }
				onChange={ ( value?: number ) => updateTiming( 'duration', value || 0.1 ) }
				min={ 0.1 }
				max={ 5 }
				step={ 0.1 }
				help={ __( 'Animation duration in seconds', 'gsap-block-animator' ) }
			/>
		);
	}

	private static renderDelayControl( timing: TimingProperties, updateTiming: ( key: string, value: unknown ) => void ): JSX.Element {
		return (
			<RangeControl
				label={ __( 'Delay (seconds)', 'gsap-block-animator' ) }
				value={ timing.delay }
				onChange={ ( value?: number ) => updateTiming( 'delay', value || 0 ) }
				min={ 0 }
				max={ 3 }
				step={ 0.1 }
				help={ __( 'Delay before animation starts', 'gsap-block-animator' ) }
			/>
		);
	}

	private static renderRepeatControl( timing: TimingProperties, updateTiming: ( key: string, value: unknown ) => void ): JSX.Element {
		return (
			<RangeControl
				label={ __( 'Repeat', 'gsap-block-animator' ) }
				value={ timing.repeat }
				onChange={ ( value?: number ) => updateTiming( 'repeat', value || 0 ) }
				min={ 0 }
				max={ 10 }
				step={ 1 }
				help={ __( 'Number of times to repeat (0 = no repeat)', 'gsap-block-animator' ) }
			/>
		);
	}

	private static renderYoyoControl( timing: TimingProperties, updateTiming: ( key: string, value: unknown ) => void ): JSX.Element {
		return (
			<ToggleControl
				label={ __( 'Yoyo', 'gsap-block-animator' ) }
				checked={ timing.yoyo }
				onChange={ ( value: boolean ) => updateTiming( 'yoyo', value ) }
				help={ __( 'Alternate direction on each repeat', 'gsap-block-animator' ) }
			/>
		);
	}

	private static renderEaseControl( timing: TimingProperties, updateTiming: ( key: string, value: unknown ) => void ): JSX.Element {
		return (
			<SelectControl
				label={ __( 'Easing', 'gsap-block-animator' ) }
				value={ timing.ease }
				options={ this.EASE_OPTIONS }
				onChange={ ( ease: string ) => updateTiming( 'ease', ease as EaseType ) }
				help={ __( 'Animation easing function', 'gsap-block-animator' ) }
			/>
		);
	}

	static getEaseOptions() {
		return this.EASE_OPTIONS;
	}

	static getEaseLabel( ease: EaseType ): string {
		const option = this.EASE_OPTIONS.find( ( opt ) => opt.value === ease );
		return option?.label || ease;
	}

	static validateDuration( duration: number ): boolean {
		return duration >= 0.1 && duration <= 60;
	}

	static validateDelay( delay: number ): boolean {
		return delay >= 0 && delay <= 30;
	}

	static validateRepeat( repeat: number ): boolean {
		return repeat >= 0 && repeat <= 1000;
	}

	static getDefaultTiming() {
		return {
			duration: 0.5,
			delay: 0,
			repeat: 0,
			yoyo: false,
			ease: 'power1.out' as EaseType,
		};
	}
}
