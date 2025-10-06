/**
 * Global type declarations for GSAP Block Animator
 * 
 * @package GSAPBlockAnimator
 * @since 2.0.0
 */

declare global {
    interface Window {
        wp: {
            element: any;
            components: any;
            blockEditor: any;
            blocks: any;
            hooks: any;
            compose: any;
            i18n: any;
            data: any;
        };
        gsap: {
            timeline: (config?: any) => any;
            to: (target: any, vars: any) => any;
            from: (target: any, vars: any) => any;
            fromTo: (target: any, fromVars: any, toVars: any) => any;
            set: (target: any, vars: any) => any;
            registerPlugin: (plugin: any) => void;
        };
        ScrollTrigger: {
            create: (config: any) => any;
            refresh: () => void;
        };
        GSAPBlockAnimator: {
            controller: any;
        };
        gsapBlockAnimatorSettings: {
            performanceMode: boolean;
            debugMode: boolean;
        };
    }
}

export {};