import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { InspectorControls } from '@wordpress/block-editor';
import { createElement } from '@wordpress/element';

import { AnimationPanel } from './components/animation-panel/animation-panel';
import type { BlockEditProps } from './types/block';

console.log('GSAP Block Animator: AnimationPanel imported:', typeof AnimationPanel);
console.log('GSAP Block Animator: AnimationPanel component:', AnimationPanel);

// Global types handled in types/global.d.ts

const withAnimationPanel = createHigherOrderComponent((BlockEdit: any) => {
	return (props: BlockEditProps) => {
		const { name: blockName } = props;
		
		console.log('GSAP Block Animator: withAnimationPanel called for block:', blockName);

		if (shouldSkipBlock(blockName)) {
			console.log('GSAP Block Animator: Skipping block:', blockName);
			return createElement(BlockEdit, props);
		}

		console.log('GSAP Block Animator: Adding animation panel to block:', blockName);
		console.log('GSAP Block Animator: Block props:', props);

		return createElement(
			'div',
			{},
			createElement(BlockEdit, props),
			createElement(
				InspectorControls,
				null,
				createElement(AnimationPanel, props)
			)
		);
	};
}, 'withAnimationPanel');

const shouldSkipBlock = (blockName: string): boolean => {
	const skipBlocks = [
		'core/block',
		'core/template',
		'core/template-part',
		'core/navigation',
		'core/freeform',
		'core/html',
	];

	return skipBlocks.includes(blockName);
};

const registerAnimationControls = (): void => {
	console.log('GSAP Block Animator: Starting registerAnimationControls');
	console.log('GSAP Block Animator: addFilter function:', typeof addFilter);
	console.log('GSAP Block Animator: withAnimationPanel function:', typeof withAnimationPanel);
	
	addFilter(
		'editor.BlockEdit',
		'gsap-block-animator/add-animation-controls',
		withAnimationPanel
	);
	
	console.log('GSAP Block Animator: Filter registered successfully');
};

// Ensure we register the controls when WordPress is ready
console.log('GSAP Block Animator: Checking WordPress availability...');
console.log('GSAP Block Animator: window:', typeof window);
console.log('GSAP Block Animator: window.wp:', typeof window?.wp);
console.log('GSAP Block Animator: window.wp.hooks:', typeof (window?.wp as any)?.hooks);

if (typeof window !== 'undefined' && window.wp && (window.wp as any).hooks) {
	console.log('GSAP Block Animator: WordPress hooks available, registering animation controls');
	registerAnimationControls();
	console.log('GSAP Block Animator: Animation controls registration complete');
} else {
	console.error('GSAP Block Animator: WordPress hooks not available for registration');
	console.error('GSAP Block Animator: window:', typeof window);
	console.error('GSAP Block Animator: window.wp:', typeof window?.wp);
	console.error('GSAP Block Animator: window.wp.hooks:', typeof (window?.wp as any)?.hooks);
}

export { registerAnimationControls, withAnimationPanel };