/**
 * Control types for animation settings
 *
 * @package
 * @since 2.0.0
 */

export type ControlType = 'range' | 'select' | 'toggle' | 'text' | 'number' | 'color';

export interface BaseControlProps<T = unknown> {
	label: string;
	value: T;
	onChange: ( value: T ) => void;
	help?: string;
	className?: string;
	disabled?: boolean;
}

export interface RangeControlProps extends BaseControlProps<number> {
	min: number;
	max: number;
	step: number;
}

export interface SelectControlProps extends BaseControlProps<string> {
	options: Array<{
		label: string;
		value: string;
	}>;
}

export interface ToggleControlProps extends BaseControlProps<boolean> {
	// No additional props needed
}

export interface TextControlProps extends BaseControlProps<string> {
	placeholder?: string;
	maxLength?: number;
	type?: 'text' | 'email' | 'url' | 'password';
}

export interface NumberControlProps extends BaseControlProps<number> {
	min?: number;
	max?: number;
	step?: number;
	placeholder?: string;
}

export interface ColorControlProps extends BaseControlProps<string> {
	alpha?: boolean;
	palette?: string[];
}

export interface ControlConfig {
	type: ControlType;
	props: BaseControlProps;
}

export type ControlProps =
	| RangeControlProps
	| SelectControlProps
	| ToggleControlProps
	| TextControlProps
	| NumberControlProps
	| ColorControlProps;
