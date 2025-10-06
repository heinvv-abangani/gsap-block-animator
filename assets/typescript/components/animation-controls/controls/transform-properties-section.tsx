import { Fragment } from '@wordpress/element';
import { TextControl, RangeControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { BaseControlSection } from './base-control-section';
import type { AnimationProperties } from '../../../types/animation';

interface TransformPropertiesSectionProps {
	properties: Partial<AnimationProperties>;
	updateProperty: ( key: string, value: unknown ) => void;
}

export class TransformPropertiesSection {
	static render( { properties, updateProperty }: TransformPropertiesSectionProps ): JSX.Element {
		return BaseControlSection.render( {
			label: __( 'Transform Properties', 'gsap-block-animator' ),
			className: 'gsap-section-divider',
			children: (
				<div className="gsap-properties-grid">
					{ this.renderMovementControls( properties, updateProperty ) }
					{ this.renderTransformControls( properties, updateProperty ) }
					{ this.renderOpacityControl( properties, updateProperty ) }
					{ this.renderColorControl( properties, updateProperty ) }
				</div>
			),
		} );
	}

	private static renderMovementControls( properties: Partial<AnimationProperties>, updateProperty: ( key: string, value: unknown ) => void ): JSX.Element {
		return (
			<Fragment>
				<TextControl
					label={ __( 'X Movement', 'gsap-block-animator' ) }
					value={ properties.x?.toString() || '' }
					onChange={ ( value: string ) => updateProperty( 'x', value ) }
					placeholder="0px"
					help={ __( 'Horizontal movement (px, %, em, etc.)', 'gsap-block-animator' ) }
				/>
				<TextControl
					label={ __( 'Y Movement', 'gsap-block-animator' ) }
					value={ properties.y?.toString() || '' }
					onChange={ ( value: string ) => updateProperty( 'y', value ) }
					placeholder="0px"
					help={ __( 'Vertical movement (px, %, em, etc.)', 'gsap-block-animator' ) }
				/>
			</Fragment>
		);
	}

	private static renderTransformControls( properties: Partial<AnimationProperties>, updateProperty: ( key: string, value: unknown ) => void ): JSX.Element {
		return (
			<Fragment>
				<TextControl
					label={ __( 'Rotation', 'gsap-block-animator' ) }
					value={ properties.rotation?.toString() || '' }
					onChange={ ( value: string ) => updateProperty( 'rotation', parseFloat( value ) || 0 ) }
					placeholder="0"
					help={ __( 'Rotation in degrees', 'gsap-block-animator' ) }
				/>
				<TextControl
					label={ __( 'Scale', 'gsap-block-animator' ) }
					value={ properties.scale?.toString() || '' }
					onChange={ ( value: string ) => updateProperty( 'scale', parseFloat( value ) || 1 ) }
					placeholder="1"
					help={ __( 'Scale multiplier (1 = 100%)', 'gsap-block-animator' ) }
				/>
			</Fragment>
		);
	}

	private static renderOpacityControl( properties: Partial<AnimationProperties>, updateProperty: ( key: string, value: unknown ) => void ): JSX.Element {
		return (
			<RangeControl
				label={ __( 'Opacity', 'gsap-block-animator' ) }
				value={ properties.opacity || 1 }
				onChange={ ( value?: number ) => updateProperty( 'opacity', value || 1 ) }
				min={ 0 }
				max={ 1 }
				step={ 0.1 }
				help={ __( 'Element opacity (0–1)', 'gsap-block-animator' ) }
			/>
		);
	}

	private static renderColorControl( properties: Partial<AnimationProperties>, updateProperty: ( key: string, value: unknown ) => void ): JSX.Element {
		return (
			<TextControl
				label={ __( 'Background Color', 'gsap-block-animator' ) }
				value={ properties.backgroundColor || '' }
				onChange={ ( value: string ) => updateProperty( 'backgroundColor', value ) }
				placeholder="#ffffff"
				help={ __( 'Background color (hex, rgb, etc.)', 'gsap-block-animator' ) }
			/>
		);
	}

	static validateMovementValue( value: string ): boolean {
		if ( ! value ) {
			return true;
		}
		return /^-?\d+(\.\d+)?(px|em|rem|%|vw|vh)$/.test( value ) || ! isNaN( Number( value ) );
	}

	static validateRotationValue( value: string ): boolean {
		if ( ! value ) {
			return true;
		}
		const num = parseFloat( value );
		return ! isNaN( num ) && num >= -360 && num <= 360;
	}

	static validateScaleValue( value: string ): boolean {
		if ( ! value ) {
			return true;
		}
		const num = parseFloat( value );
		return ! isNaN( num ) && num >= 0.1 && num <= 10;
	}

	static validateOpacityValue( value: number ): boolean {
		return value >= 0 && value <= 1;
	}

	static validateColorValue( value: string ): boolean {
		if ( ! value ) {
			return true;
		}
		return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test( value ) ||
			/^rgba?\([^)]+\)$/.test( value );
	}
}
