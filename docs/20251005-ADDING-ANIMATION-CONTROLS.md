# Adding New Animation Controls

This guide explains how to add new animation controls to the GSAP Block Animator plugin with conditional logic, registration, and database persistence.

## Overview

The plugin uses a TypeScript-based architecture that compiles to clean JavaScript. Animation controls are built using WordPress Gutenberg components and follow a specific pattern for registration and data handling.

## File Structure

```
assets/typescript/
├── components/animation-panel/
│   └── gsap-animation-panel.tsx          # Main panel component
├── types/
│   ├── animation.ts                      # Animation type definitions
│   └── global.d.ts                       # Global type declarations
└── editor.ts                             # Editor entry point

includes/
├── plugin.php                           # Main plugin file (script registration)
└── services/
    └── block-extension-service.php      # Block attribute registration
```

## Step 1: Define the Type Structure

First, add your new control types to the animation configuration:

**File: `assets/typescript/types/animation.ts`**

```typescript
// Add to existing TransformProperties interface
export interface TransformProperties {
    x?: number | string;
    y?: number | string;
    rotation?: number;
    scale?: number;
    // Add your new property
    skew?: number;
    perspective?: number;
}

// Add new specialized interface if needed
export interface AdvancedProperties {
    morphPath?: string;
    textSplit?: 'chars' | 'words' | 'lines';
    stagger?: number;
}

// Update main AnimationConfig interface
export interface AnimationConfig {
    enabled: boolean;
    type: AnimationType;
    trigger: TriggerType;
    properties: TransformProperties & AppearanceProperties & AdvancedProperties;
    timing: TimingConfig;
    timeline?: TimelineConfig;
    // Add conditional logic properties
    conditions?: ConditionalConfig;
}

// Define conditional logic structure
export interface ConditionalConfig {
    enabled: boolean;
    trigger: 'viewport' | 'device' | 'scroll-position';
    viewport?: {
        minWidth?: number;
        maxWidth?: number;
    };
    device?: 'mobile' | 'tablet' | 'desktop';
    scrollPosition?: {
        start: string;
        end: string;
    };
}
```

## Step 2: Add the Control Component

**File: `assets/typescript/components/animation-panel/gsap-animation-panel.tsx`**

```typescript
// Add to the renderControls function
const renderAdvancedControls = (): any[] => {
    const controls: any[] = [];

    // Example: Skew control with conditional logic
    controls.push(
        createElement(TextControl, {
            key: 'skew',
            label: __('Skew (degrees)', 'gsap-block-animator'),
            value: gsapAnimation.properties?.skew?.toString() || '',
            onChange: (value: string) => updateProperty('skew', parseFloat(value) || 0),
            placeholder: '0',
            help: __('Skew transformation in degrees', 'gsap-block-animator')
        })
    );

    // Conditional visibility based on animation type
    if (gsapAnimation.type === 'to' || gsapAnimation.type === 'fromTo') {
        controls.push(
            createElement(RangeControl, {
                key: 'perspective',
                label: __('Perspective', 'gsap-block-animator'),
                value: gsapAnimation.properties?.perspective || 1000,
                onChange: (value: number | undefined) => updateProperty('perspective', value || 1000),
                min: 100,
                max: 2000,
                step: 50,
                help: __('3D perspective value', 'gsap-block-animator')
            })
        );
    }

    return controls;
};

// Add conditional logic controls
const renderConditionalControls = (): any[] => {
    const controls: any[] = [];

    // Enable conditional logic
    controls.push(
        createElement(ToggleControl, {
            key: 'enable-conditions',
            label: __('Enable Conditional Logic', 'gsap-block-animator'),
            checked: gsapAnimation.conditions?.enabled || false,
            onChange: (enabled: boolean) => updateConditions('enabled', enabled),
            help: __('Enable animation based on conditions', 'gsap-block-animator')
        })
    );

    // Show conditional controls when enabled
    if (gsapAnimation.conditions?.enabled) {
        controls.push(
            createElement(SelectControl, {
                key: 'condition-trigger',
                label: __('Condition Type', 'gsap-block-animator'),
                value: gsapAnimation.conditions?.trigger || 'viewport',
                options: [
                    { label: __('Viewport Size', 'gsap-block-animator'), value: 'viewport' },
                    { label: __('Device Type', 'gsap-block-animator'), value: 'device' },
                    { label: __('Scroll Position', 'gsap-block-animator'), value: 'scroll-position' }
                ],
                onChange: (trigger: any) => updateConditions('trigger', trigger)
            })
        );

        // Viewport-specific controls
        if (gsapAnimation.conditions?.trigger === 'viewport') {
            controls.push(
                createElement(TextControl, {
                    key: 'min-width',
                    label: __('Min Width (px)', 'gsap-block-animator'),
                    value: gsapAnimation.conditions?.viewport?.minWidth?.toString() || '',
                    onChange: (value: string) => updateViewportCondition('minWidth', parseInt(value) || 0),
                    placeholder: '768'
                }),
                createElement(TextControl, {
                    key: 'max-width',
                    label: __('Max Width (px)', 'gsap-block-animator'),
                    value: gsapAnimation.conditions?.viewport?.maxWidth?.toString() || '',
                    onChange: (value: string) => updateViewportCondition('maxWidth', parseInt(value) || 0),
                    placeholder: '1200'
                })
            );
        }
    }

    return controls;
};

// Helper functions for updating nested state
const updateConditions = (key: keyof ConditionalConfig, value: any): void => {
    updateAnimation({
        conditions: {
            enabled: gsapAnimation.conditions?.enabled || false,
            trigger: gsapAnimation.conditions?.trigger || 'viewport',
            ...gsapAnimation.conditions,
            [key]: value
        }
    });
};

const updateViewportCondition = (key: keyof ConditionalConfig['viewport'], value: any): void => {
    updateAnimation({
        conditions: {
            ...gsapAnimation.conditions,
            viewport: {
                ...gsapAnimation.conditions?.viewport,
                [key]: value
            }
        }
    });
};

// Add to main renderControls function
if (gsapAnimation.enabled) {
    // ... existing controls ...
    
    // Add advanced controls section
    controls.push(
        createElement('h4', {
            key: 'advanced-title',
            style: { marginTop: '20px', marginBottom: '10px' }
        }, __('Advanced Properties', 'gsap-block-animator')),
        ...renderAdvancedControls()
    );

    // Add conditional logic section
    controls.push(
        createElement('h4', {
            key: 'conditional-title',
            style: { marginTop: '20px', marginBottom: '10px' }
        }, __('Conditional Logic', 'gsap-block-animator')),
        ...renderConditionalControls()
    );
}
```

## Step 3: Update Default Configuration

**File: `assets/typescript/components/animation-panel/gsap-animation-panel.tsx`**

```typescript
const DEFAULT_ANIMATION_CONFIG: AnimationConfig = {
    enabled: false,
    type: 'to',
    trigger: 'pageload',
    properties: {},
    timing: {
        duration: 0.5,
        delay: 0,
        repeat: 0,
        yoyo: false,
        ease: 'power1.out'
    },
    timeline: {
        isTimeline: false,
        timelineId: '',
        timelineName: '',
        timelinePosition: 'start'
    },
    // Add default conditional config
    conditions: {
        enabled: false,
        trigger: 'viewport'
    }
};
```

## Step 4: Register Block Attributes (PHP)

**File: `includes/services/block-extension-service.php`**

```php
<?php
namespace GSAPBlockAnimator\Services;

class Block_Extension_Service {
    
    public function register_extensions(): void {
        add_filter('register_block_type_args', [$this, 'add_gsap_attributes'], 10, 2);
    }

    public function add_gsap_attributes(array $args, string $block_type): array {
        // Skip certain blocks
        $skip_blocks = [
            'core/block',
            'core/template',
            'core/template-part',
            'core/navigation',
            'core/freeform',
            'core/html'
        ];

        if (in_array($block_type, $skip_blocks, true)) {
            return $args;
        }

        // Add gsapAnimation attribute with full schema
        $args['attributes']['gsapAnimation'] = [
            'type' => 'object',
            'default' => [
                'enabled' => false,
                'type' => 'to',
                'trigger' => 'pageload',
                'properties' => [
                    'x' => '',
                    'y' => '',
                    'rotation' => 0,
                    'scale' => 1,
                    'opacity' => 1,
                    // Add new properties
                    'skew' => 0,
                    'perspective' => 1000
                ],
                'timing' => [
                    'duration' => 0.5,
                    'delay' => 0,
                    'repeat' => 0,
                    'yoyo' => false,
                    'ease' => 'power1.out'
                ],
                'timeline' => [
                    'isTimeline' => false,
                    'timelineId' => '',
                    'timelineName' => '',
                    'timelinePosition' => 'start'
                ],
                // Add conditional configuration
                'conditions' => [
                    'enabled' => false,
                    'trigger' => 'viewport',
                    'viewport' => [
                        'minWidth' => null,
                        'maxWidth' => null
                    ],
                    'device' => null,
                    'scrollPosition' => [
                        'start' => 'top 80%',
                        'end' => 'bottom 20%'
                    ]
                ]
            ]
        ];

        return $args;
    }
}
```

## Step 5: Handle Frontend Logic

**File: `assets/typescript/frontend-animation-controller.ts`**

```typescript
private prepareAnimationProperties(config: AnimationConfig): AnimationProperties {
    const properties: AnimationProperties = {
        duration: config.timing.duration || 0.5,
        delay: config.timing.delay || 0,
        ease: config.timing.ease || 'power1.out'
    };

    // Add timing properties
    if (config.timing.repeat) {
        properties.repeat = config.timing.repeat;
    }
    if (config.timing.yoyo) {
        properties.yoyo = config.timing.yoyo;
    }

    const animProps = config.properties;
    if (animProps) {
        // Existing properties
        if (animProps.x !== undefined && animProps.x !== '') {
            properties.x = animProps.x;
        }
        
        // Add new properties
        if (animProps.skew !== undefined) {
            const skewValue = String(animProps.skew);
            if (skewValue !== '' && skewValue !== '0') {
                properties.skew = animProps.skew;
            }
        }
        
        if (animProps.perspective !== undefined) {
            properties.perspective = animProps.perspective;
        }
    }

    return properties;
}

private shouldExecuteAnimation(config: AnimationConfig): boolean {
    // Check conditional logic
    if (config.conditions?.enabled) {
        return this.evaluateConditions(config.conditions);
    }
    
    return true; // Execute if no conditions or conditions disabled
}

private evaluateConditions(conditions: ConditionalConfig): boolean {
    switch (conditions.trigger) {
        case 'viewport':
            return this.checkViewportConditions(conditions.viewport);
        case 'device':
            return this.checkDeviceConditions(conditions.device);
        case 'scroll-position':
            return this.checkScrollConditions(conditions.scrollPosition);
        default:
            return true;
    }
}

private checkViewportConditions(viewport?: ConditionalConfig['viewport']): boolean {
    if (!viewport) return true;
    
    const windowWidth = window.innerWidth;
    
    if (viewport.minWidth && windowWidth < viewport.minWidth) {
        return false;
    }
    
    if (viewport.maxWidth && windowWidth > viewport.maxWidth) {
        return false;
    }
    
    return true;
}

private checkDeviceConditions(device?: ConditionalConfig['device']): boolean {
    if (!device) return true;
    
    const userAgent = navigator.userAgent.toLowerCase();
    const windowWidth = window.innerWidth;
    
    switch (device) {
        case 'mobile':
            return windowWidth <= 768;
        case 'tablet':
            return windowWidth > 768 && windowWidth <= 1024;
        case 'desktop':
            return windowWidth > 1024;
        default:
            return true;
    }
}

// Update main createAnimation method
public createAnimation(element: Element, config: AnimationConfig): void {
    try {
        if (!this.checkGSAPAvailability()) {
            return;
        }

        // Check conditional logic before proceeding
        if (!this.shouldExecuteAnimation(config)) {
            console.log('GSAP Block Animator: Animation skipped due to conditions');
            return;
        }

        const properties = this.prepareAnimationProperties(config);

        if (!this.hasAnimationProperties(properties)) {
            console.warn('GSAP Block Animator: No animation properties found!');
            return;
        }

        this.executeAnimationByTrigger(element, config, properties);
    } catch (error) {
        console.error('GSAP Block Animator: Failed to create animation:', error);
    }
}
```

## Step 6: Database Persistence

The WordPress block editor automatically handles database persistence for block attributes. The data is stored in the `post_content` field as part of the block's comment delimiters:

```html
<!-- wp:paragraph {"gsapAnimation":{"enabled":true,"type":"to","properties":{"skew":15,"perspective":800},"conditions":{"enabled":true,"trigger":"viewport","viewport":{"minWidth":768}}}} -->
<p>Animated content</p>
<!-- /wp:paragraph -->
```

## Step 7: Compile and Test

1. **Build the TypeScript:**
   ```bash
   npm run build
   ```

2. **Verify the compiled files:**
   - `assets/dist/js/editor.js` - Contains your new controls
   - `assets/dist/js/frontend.js` - Contains animation logic

3. **Test in WordPress:**
   - Add a block in the editor
   - Check the GSAP Animation panel for your new controls
   - Test the conditional logic
   - Verify frontend animation execution

## Best Practices

1. **Type Safety:** Always define TypeScript interfaces for new properties
2. **Conditional Logic:** Use helper functions to keep conditions readable
3. **Default Values:** Provide sensible defaults in the configuration
4. **Validation:** Add client-side validation for user inputs
5. **Performance:** Only execute animations when conditions are met
6. **Backwards Compatibility:** Ensure new properties don't break existing animations

## File Registration Summary

| Component | File Location | Purpose |
|-----------|---------------|---------|
| **Type Definitions** | `assets/typescript/types/animation.ts` | Define data structure |
| **UI Controls** | `assets/typescript/components/animation-panel/gsap-animation-panel.tsx` | Render editor interface |
| **Block Attributes** | `includes/services/block-extension-service.php` | Register with WordPress |
| **Frontend Logic** | `assets/typescript/frontend-animation-controller.ts` | Handle animation execution |
| **Script Registration** | `includes/plugin.php` | Enqueue compiled assets |

## Example: Adding a Text Animation Control

```typescript
// 1. Add to types/animation.ts
export interface TextProperties {
    textSplit?: 'chars' | 'words' | 'lines';
    stagger?: number;
}

// 2. Add to gsap-animation-panel.tsx
if (gsapAnimation.type === 'to' && gsapAnimation.properties?.textSplit) {
    controls.push(
        createElement(SelectControl, {
            key: 'text-split',
            label: __('Text Split', 'gsap-block-animator'),
            value: gsapAnimation.properties.textSplit || 'chars',
            options: [
                { label: __('Characters', 'gsap-block-animator'), value: 'chars' },
                { label: __('Words', 'gsap-block-animator'), value: 'words' },
                { label: __('Lines', 'gsap-block-animator'), value: 'lines' }
            ],
            onChange: (value: any) => updateProperty('textSplit', value)
        }),
        createElement(RangeControl, {
            key: 'stagger',
            label: __('Stagger Delay', 'gsap-block-animator'),
            value: gsapAnimation.properties.stagger || 0.1,
            onChange: (value: number | undefined) => updateProperty('stagger', value || 0.1),
            min: 0,
            max: 1,
            step: 0.05
        })
    );
}
```

This creates a complete workflow for adding new animation controls with conditional logic, proper registration, and database persistence.