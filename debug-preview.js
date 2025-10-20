/**
 * Debug Helper for GSAP Block Animator Preview
 * 
 * Usage:
 * 1. Open browser console in Gutenberg editor
 * 2. Copy and paste this entire file into console
 * 3. Call: debugGSAPPreview('YOUR_BLOCK_CLIENT_ID')
 * 
 * This will help diagnose why preview might not be working
 */

window.debugGSAPPreview = function( blockId ) {
	console.group( '🔍 GSAP Preview Debugger' );
	
	console.log( '📋 Block ID:', blockId );
	
	// Check GSAP availability
	console.group( '🎬 GSAP Availability' );
	console.log( 'window.gsap:', typeof window.gsap !== 'undefined' ? '✅ Loaded' : '❌ Not Loaded' );
	console.log( 'window.ScrollTrigger:', typeof window.ScrollTrigger !== 'undefined' ? '✅ Loaded' : '❌ Not Loaded' );
	console.groupEnd();
	
	// Check editor canvas
	console.group( '📝 Editor Canvas' );
	const editorCanvas = document.querySelector( '.editor-styles-wrapper, .block-editor-writing-flow, .edit-post-visual-editor' );
	console.log( 'Editor canvas found:', editorCanvas ? '✅ Found' : '❌ Not Found', editorCanvas );
	if ( editorCanvas ) {
		console.log( 'Canvas class:', editorCanvas.className );
	}
	console.groupEnd();
	
	// Try all selectors
	console.group( '🎯 Element Selectors (within editor canvas)' );
	
	if ( ! editorCanvas ) {
		console.error( '❌ Cannot search for elements - editor canvas not found!' );
		console.groupEnd();
		return;
	}
	
	const selector1 = `[data-block="${ blockId }"]`;
	const element1 = editorCanvas.querySelector( selector1 );
	console.log( `editorCanvas.querySelector("${ selector1 }"):`, element1 ? '✅ Found' : '❌ Not Found', element1 );
	
	const selector2 = `.wp-block[data-block="${ blockId }"]`;
	const element2 = editorCanvas.querySelector( selector2 );
	console.log( `editorCanvas.querySelector("${ selector2 }"):`, element2 ? '✅ Found' : '❌ Not Found', element2 );
	
	const selector3 = `#block-${ blockId }`;
	const element3 = editorCanvas.querySelector( selector3 );
	console.log( `editorCanvas.querySelector("${ selector3 }"):`, element3 ? '✅ Found' : '❌ Not Found', element3 );
	
	if ( element3 ) {
		const contentSelectors = [
			'.block-editor-block-list__block-edit > [data-type] > .wp-block',
			'.block-editor-block-list__block-edit [data-block]',
			'.wp-block',
			'[data-type]',
			'[contenteditable="true"]',
		];
		
		console.log( '  🔍 Searching for content elements:' );
		contentSelectors.forEach( ( sel ) => {
			const found = element3.querySelector( sel );
			console.log( `    ${ sel }:`, found ? '✅ Found' : '❌ Not Found', found );
		} );
	}
	
	console.groupEnd();
	
	// Check which element would be used
	console.group( '✨ Selected Element' );
	let finalElement = null;
	
	if ( element3 ) {
		finalElement = element3.querySelector( '.block-editor-block-list__block-edit > [data-type] > .wp-block' ) ||
			element3.querySelector( '.block-editor-block-list__block-edit [data-block]' ) ||
			element3.querySelector( '.wp-block' ) ||
			element3.querySelector( '[data-type]' );
		
		if ( ! finalElement ) {
			const editableContent = element3.querySelector( '[contenteditable="true"]' );
			if ( editableContent ) {
				finalElement = editableContent.closest( '.wp-block' ) || editableContent.parentElement;
			}
		}
		
		console.log( '🎯 Using element from editor block wrapper:', finalElement );
	} else {
		finalElement = element1 || element2;
		console.log( '🎯 Using fallback element:', finalElement );
	}
	
	if ( finalElement ) {
		console.log( '✅ Element to animate:', finalElement );
		console.log( '📐 Element dimensions:', {
			width: finalElement.offsetWidth + 'px',
			height: finalElement.offsetHeight + 'px',
			top: finalElement.offsetTop + 'px',
			left: finalElement.offsetLeft + 'px',
		} );
		console.log( '🎨 Computed style:', window.getComputedStyle( finalElement ) );
		console.log( '🏷️ Element attributes:', finalElement.attributes );
		
		// Highlight the element temporarily
		const originalOutline = finalElement.style.outline;
		finalElement.style.outline = '3px solid red';
		console.log( '🔴 Element highlighted in RED for 3 seconds' );
		
		setTimeout( () => {
			finalElement.style.outline = originalOutline;
			console.log( '✅ Highlight removed' );
		}, 3000 );
	} else {
		console.error( '❌ No element found with any selector!' );
		console.log( '💡 Tip: Check if blockId is correct' );
	}
	
	console.groupEnd();
	
	// Check WordPress editor
	console.group( '📝 WordPress Editor Data' );
	if ( typeof wp !== 'undefined' && wp.data ) {
		console.log( 'wp.data:', '✅ Available' );
		
		try {
			const block = wp.data.select( 'core/block-editor' ).getBlock( blockId );
			console.log( 'Block data:', block );
			
			if ( block ) {
				console.log( '  - Name:', block.name );
				console.log( '  - Attributes:', block.attributes );
				console.log( '  - GSAP Animation:', block.attributes.gsapAnimation );
			}
		} catch ( error ) {
			console.warn( 'Could not fetch block data:', error.message );
		}
	} else {
		console.log( 'wp.data:', '❌ Not Available' );
	}
	console.groupEnd();
	
	// Test animation
	console.group( '🎭 Test Animation' );
	if ( finalElement && typeof window.gsap !== 'undefined' ) {
		console.log( '🚀 Running test animation...' );
		
		try {
			window.gsap.to( finalElement, {
				x: 50,
				duration: 0.5,
				ease: 'power1.out',
				onComplete: () => {
					console.log( '✅ Animation completed!' );
					// Reset
					window.gsap.set( finalElement, { x: 0 } );
					console.log( '↩️ Element reset to original position' );
				},
				onStart: () => {
					console.log( '▶️ Animation started' );
				},
			} );
		} catch ( error ) {
			console.error( '❌ Animation error:', error );
		}
	} else {
		if ( ! finalElement ) {
			console.error( '❌ Cannot test: Element not found' );
		}
		if ( typeof window.gsap === 'undefined' ) {
			console.error( '❌ Cannot test: GSAP not loaded' );
		}
	}
	console.groupEnd();
	
	console.groupEnd();
	
	return {
		blockId,
		element: finalElement,
		gsapLoaded: typeof window.gsap !== 'undefined',
		scrollTriggerLoaded: typeof window.ScrollTrigger !== 'undefined',
	};
};

console.log( `
🎯 GSAP Preview Debugger Loaded!

Usage:
  debugGSAPPreview('your-block-client-id')

To find your block's client ID:
  1. Select the block in the editor
  2. In console, run: wp.data.select('core/block-editor').getSelectedBlockClientId()
  3. Copy the returned ID
  4. Run: debugGSAPPreview('PASTE_ID_HERE')

This will:
  ✓ Check if GSAP is loaded
  ✓ Try all element selectors
  ✓ Highlight the found element
  ✓ Show block data
  ✓ Run a test animation
` );

