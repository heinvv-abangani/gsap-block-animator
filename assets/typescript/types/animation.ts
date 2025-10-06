/**
 * Animation configuration types
 *
 * @package GSAPBlockAnimator
 * @since 2.0.0
 */

export type AnimationType = 'to' | 'from' | 'fromTo' | 'set';
export type TriggerType = 'pageload' | 'scroll' | 'click' | 'hover';
export type EaseType = 'none' | 'power1.out' | 'power2.out' | 'power3.out' | 'back.out' | 'elastic.out' | 'bounce.out';

export interface TransformProperties {
	x?: number | string;
	y?: number | string;
	z?: number | string;
	rotation?: number;
	rotationX?: number;
	rotationY?: number;
	rotationZ?: number;
	scale?: number;
	scaleX?: number;
	scaleY?: number;
	scaleZ?: number;
	skewX?: number;
	skewY?: number;
}

export interface AppearanceProperties {
	opacity?: number;
	backgroundColor?: string;
	borderColor?: string;
	color?: string;
	borderRadius?: number | string;
}

export interface SizeProperties {
	width?: number | string;
	height?: number | string;
}

export interface PositionProperties {
	left?: number | string;
	top?: number | string;
	right?: number | string;
	bottom?: number | string;
}

export interface TimingProperties {
	duration: number;
	delay: number;
	repeat: number;
	yoyo: boolean;
	ease: EaseType;
}

export interface AnimationProperties extends TransformProperties, AppearanceProperties, SizeProperties, PositionProperties {
	// All properties are included via intersection
}

export interface TimelineConfig {
	isTimeline: boolean;
	timelineId?: string;
	timelineName?: string;
	parentTimelineId?: string;
	timelinePosition?: string;
	customPosition?: string;
	scrollStart?: string;
	scrollEnd?: string;
}

export interface AnimationConfig {
	id?: string;
	enabled: boolean;
	type: AnimationType;
	trigger: TriggerType;
	selector?: string;
	properties: Partial<AnimationProperties>;
	timing: TimingProperties;
	timeline?: TimelineConfig;
}

export interface Animation {
	id: string;
	blockId: string;
	config: AnimationConfig;
	createdAt: Date;
	updatedAt: Date;
}

export interface ValidationError {
	field: string;
	message: string;
	code?: string;
}

export interface ValidationResult {
	isValid: boolean;
	errors: ValidationError[];
	warnings: string[];
}

export interface AnimationPreviewOptions {
	element: Element;
	config: AnimationConfig;
	onComplete?: () => void;
	onError?: (error: Error) => void;
}