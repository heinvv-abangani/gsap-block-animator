import * as React from 'react';
import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
// Import { InspectorControls } from '@wordpress/block-editor';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { InspectorControls } = ( window.wp as any ).blockEditor;
import { createElement } from '@wordpress/element';

import { AnimationPanel } from './components/animation-panel/animation-panel';
import type { BlockEditProps } from './types/block';

// Global types handled in types/global.d.ts

const withAnimationPanel = createHigherOrderComponent( ( BlockEdit: React.ComponentType<BlockEditProps> ) => {
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
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				InspectorControls as any,
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
	try {
		addFilter(
			'editor.BlockEdit',
			'gsap-block-animator/add-animation-controls',
			withAnimationPanel,
		);
	} catch ( error ) {
		// Silently handle registration errors
	}
};

if ( typeof window !== 'undefined' && window.wp && window.wp.hooks ) {
	registerAnimationControls();
} else {
	// Try again after a delay
	setTimeout( () => {
		if ( typeof window !== 'undefined' && window.wp && window.wp.hooks ) {
			registerAnimationControls();
		}
	}, 1000 );
}

export { registerAnimationControls, withAnimationPanel };
