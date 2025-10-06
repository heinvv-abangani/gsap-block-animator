// Simple debug test to check if GSAP controls are registering
console.log('=== GSAP Block Animator Debug ===');

// Check if WordPress objects are available
console.log('window.wp available:', !!window.wp);
console.log('window.wp.hooks available:', !!window.wp?.hooks);
console.log('window.wp.blockEditor available:', !!window.wp?.blockEditor);
console.log('window.wp.compose available:', !!window.wp?.compose);

// Check if GSAP is loaded
console.log('window.gsap available:', !!window.gsap);

// Check if our scripts are loaded
console.log('Document scripts:', Array.from(document.scripts).map(s => s.src).filter(src => src.includes('gsap-block-animator')));

// Log any JavaScript errors
window.addEventListener('error', function(e) {
    if (e.filename && e.filename.includes('gsap-block-animator')) {
        console.error('GSAP Block Animator JS Error:', e.message, 'at', e.filename, e.lineno);
    }
});

// Check if the editor filters are being applied
if (window.wp && window.wp.hooks) {
    console.log('WordPress hooks system available');
    
    // Add a debug hook to see if our filters are working
    window.wp.hooks.addFilter(
        'blocks.registerBlockType',
        'gsap-debug/test',
        function(settings, name) {
            if (settings.attributes && settings.attributes.gsapAnimation) {
                console.log('GSAP animation attribute found on block:', name);
            }
            return settings;
        }
    );
} else {
    console.error('WordPress hooks system not available');
}