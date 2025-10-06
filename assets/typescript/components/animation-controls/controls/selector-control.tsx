import { TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

interface SelectorControlProps {
	value: string;
	onChange: ( selector: string ) => void;
}

export class SelectorControl {
	static render( { value, onChange }: SelectorControlProps ): JSX.Element {
		return (
			<TextControl
				label={ __( 'Custom Selector (Optional)', 'gsap-block-animator' ) }
				value={ value || '' }
				onChange={ onChange }
				placeholder={ __( 'Leave empty for auto-generated', 'gsap-block-animator' ) }
				help={ __( 'CSS selector to target specific elements', 'gsap-block-animator' ) }
			/>
		);
	}

	static validateSelector( selector: string ): boolean {
		if ( ! selector || '' === selector.trim() ) {
			return true;
		}

		const forbiddenPatterns = [
			'javascript:', 'data:', 'vbscript:', 'on\\w+\\s*=', '<script', '</script',
		];

		for ( const pattern of forbiddenPatterns ) {
			if ( new RegExp( pattern, 'i' ).test( selector ) ) {
				return false;
			}
		}

		return selector.length <= 200;
	}

	static sanitizeSelector( selector: string ): string {
		if ( ! selector ) {
			return '';
		}

		return selector
			.trim()
			.replace( /[^\w\s\-\.#\[\]=:,()\'>+~]/g, '' )
			.substring( 0, 200 );
	}

	static getPlaceholderText(): string {
		return __( 'Leave empty for auto-generated', 'gsap-block-animator' );
	}
}
