/**
 * GSAP Block Animator - Editor Entry Point
 *
 * @package GSAPBlockAnimator
 * @since 2.0.0
 */

console.log('🚀 GSAP Block Animator: Starting TypeScript editor');

// Import the TypeScript animation panel
import './components/animation-panel/gsap-animation-panel';

// Global types are included automatically via tsconfig.json

// Log to confirm the editor script is loaded
console.log('GSAP Block Animator: TypeScript editor script loaded');

// Ensure WordPress dependencies are available
if (typeof window !== 'undefined' && typeof window.wp !== 'undefined') {
	console.log('GSAP Block Animator: WordPress dependencies available');
	
	// GSAP will be loaded externally via WordPress wp_enqueue_script
	if (typeof window.gsap !== 'undefined') {
		console.log('GSAP Block Animator: GSAP available for editor previews');
	} else {
		console.log('GSAP Block Animator: GSAP will be loaded by WordPress');
	}
} else {
	console.error('GSAP Block Animator: WordPress dependencies not available');
}