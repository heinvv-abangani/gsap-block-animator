import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { InspectorControls } from '@wordpress/block-editor';
import { createElement } from '@wordpress/element';

import { AnimationPanel } from './components/animation-panel/animation-panel';
import type { BlockEditProps } from './types/block';

// Global types handled in types/global.d.ts

const withAnimationPanel = createHigherOrderComponent( ( BlockEdit: any ) => {
	return ( props: BlockEditProps ) => {
		const { name: blockName } = props;

		if ( shouldSkipBlock( blockName ) ) {
			return createElement( BlockEdit, props );
		}

		return createElement(
			'div',
			{},
			createElement( BlockEdit, props ),
			createElement(
				InspectorControls,
				null,
				createElement( AnimationPanel, props ),
			),
		);
	};
}, 'withAnimationPanel' );

const shouldSkipBlock = ( blockName: string ): boolean => {
	const skipBlocks = [
		'core/block',
		'core/template',
		'core/template-part',
		'core/navigation',
		'core/freeform',
		'core/html',
	];

	return skipBlocks.includes( blockName );
};

const registerAnimationControls = (): void => {
	addFilter(
		'editor.BlockEdit',
		'gsap-block-animator/add-animation-controls',
		withAnimationPanel,
	);
};

// Ensure we register the controls when WordPress is ready
if ( typeof window !== 'undefined' && window.wp && ( window.wp as any ).hooks ) {
	registerAnimationControls();
}

export { registerAnimationControls, withAnimationPanel };
