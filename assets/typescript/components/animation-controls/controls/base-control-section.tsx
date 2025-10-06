import { BaseControl } from '@wordpress/components';

interface BaseControlSectionProps {
	label: string;
	className?: string;
	children: JSX.Element | JSX.Element[];
}

export class BaseControlSection {
	static render({ label, className, children }: BaseControlSectionProps): JSX.Element {
		return (
			<BaseControl
				label={label}
				className={className}
			>
				{children}
			</BaseControl>
		);
	}
}