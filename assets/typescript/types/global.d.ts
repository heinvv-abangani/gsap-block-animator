/**
 * Global type declarations for GSAP Block Animator
 *
 * @package
 * @since 2.0.0
 */

declare global {
    interface Window {
        wp: {
            element: Record<string, unknown>;
            components: Record<string, unknown>;
            blockEditor: Record<string, unknown>;
            blocks: Record<string, unknown>;
            hooks: Record<string, unknown>;
            compose: Record<string, unknown>;
            i18n: Record<string, unknown>;
            data: Record<string, unknown>;
        };
        gsap: {
            timeline: ( config?: Record<string, unknown> ) => unknown;
            to: ( target: unknown, vars: Record<string, unknown> ) => unknown;
            from: ( target: unknown, vars: Record<string, unknown> ) => unknown;
            fromTo: ( target: unknown, fromVars: Record<string, unknown>, toVars: Record<string, unknown> ) => unknown;
            set: ( target: unknown, vars: Record<string, unknown> ) => unknown;
            registerPlugin: ( plugin: unknown ) => void;
        };
        ScrollTrigger: {
            create: ( config: Record<string, unknown> ) => unknown;
            refresh: () => void;
        };
        GSAPBlockAnimator?: {
            controller?: {
                getAnimationService?: () => {
                    destroyAll?: () => void;
                };
                reinitialize?: () => void;
            };
        };
        gsapBlockAnimatorSettings?: {
            performanceMode: boolean;
            debugMode: boolean;
        };
    }
}

export {};
