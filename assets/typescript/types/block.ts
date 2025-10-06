/**
 * WordPress block related types
 *
 * @package
 * @since 2.0.0
 */

import type { AnimationConfig } from './animation';

export interface BlockAttributes {
	gsapAnimation?: AnimationConfig;
	[key: string]: unknown;
}

export interface BlockProps {
	attributes: BlockAttributes;
	setAttributes: ( attributes: Partial<BlockAttributes> ) => void;
	clientId: string;
	name: string;
	isSelected: boolean;
}

export interface BlockEditProps extends BlockProps {
	className?: string;
	isSelected: boolean;
	toggleSelection: () => void;
}

export interface BlockType {
	name: string;
	title: string;
	category: string;
	icon: string;
	description: string;
	supports: Record<string, unknown>;
	attributes: Record<string, unknown>;
}

export interface BlockConfiguration {
	name: string;
	shouldSkip: boolean;
	supportedAnimations: string[];
	defaultConfig?: Partial<AnimationConfig>;
}
