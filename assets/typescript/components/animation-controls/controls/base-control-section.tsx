import { BaseControl } from '@wordpress/components';

interface BaseControlSectionProps {
	label: string;
	className?: string;
	children: JSX.Element | JSX.Element[];
}

export class BaseControlSection {
	static render( { label, className, children }: BaseControlSectionProps ): JSX.Element {
		return (
			<BaseControl
				id={ `gsap-control-${ label.toLowerCase().replace( /\s+/g, '-' ) }` }
				label={ label }
				className={ className }
			>
				{ children }
			</BaseControl>
		);
	}
}
