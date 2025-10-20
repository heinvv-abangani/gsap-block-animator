# Preview Functionality Fix for Gutenberg Editor

**Date:** October 13, 2025  
**Branch:** TH_20251013  
**Issue:** Animation preview not working in Gutenberg editor

## Problem

The animation preview feature was not working in the Gutenberg block editor because the element finding logic was not compatible with how Gutenberg structures blocks in the editor.

### Root Causes

1. **Different DOM Structure in Editor vs Frontend**
   - Frontend: Blocks have `data-gsap-block-id` attribute added via PHP
   - Editor: Blocks use `clientId` and have different wrapper structure

2. **Inadequate Element Selectors**
   - Original code only checked for `[data-block="${blockId}"]`
   - Gutenberg editor wraps blocks with ID `block-{clientId}`
   - Inner content elements need to be targeted for animation

3. **Block ID Extraction Issues**
   - `extractBlockId` method didn't account for editor-specific attributes
   - Didn't traverse parent elements to find block wrapper

## Solution

### 1. Enhanced Element Finding in AnimationPreview

**File:** `assets/typescript/components/animation-preview/animation-preview.tsx`

Implemented multi-step fallback logic:

```typescript
const findBlockElement = useCallback((): Element => {
    // Step 1: Try data-block attribute
    let blockElement = document.querySelector(`[data-block="${blockId}"]`);
    
    // Step 2: Try .wp-block with data-block
    if (!blockElement) {
        blockElement = document.querySelector(`.wp-block[data-block="${blockId}"]`);
    }
    
    // Step 3: Try block-{id} format (editor wrapper)
    if (!blockElement) {
        const editorBlock = document.getElementById(`block-${blockId}`);
        if (editorBlock) {
            // Find actual content element inside editor wrapper
            const contentElement = editorBlock.querySelector('.wp-block, [data-type]');
            blockElement = contentElement || editorBlock;
        }
    }
    
    if (!blockElement) {
        throw new Error('Block element not found...');
    }
    
    return blockElement;
}, [blockId]);
```

### 2. Enhanced Element Finding in AnimationService

**File:** `assets/typescript/services/animation-service.ts`

Updated `findElementByBlockId` method with same multi-step approach:

```typescript
private findElementByBlockId(blockId: string): Element | null {
    // Try multiple selectors in order of likelihood
    let element = document.querySelector(`[data-gsap-block-id="${blockId}"]`);
    
    if (!element) {
        element = document.querySelector(`[data-block="${blockId}"]`);
    }
    
    if (!element) {
        element = document.querySelector(`.wp-block[data-block="${blockId}"]`);
    }
    
    if (!element) {
        const editorBlock = document.getElementById(`block-${blockId}`);
        if (editorBlock) {
            const contentElement = editorBlock.querySelector('.wp-block, [data-type]');
            element = contentElement || editorBlock;
        }
    }
    
    return element;
}
```

### 3. Improved Block ID Extraction

Updated `extractBlockId` method to handle editor context:

```typescript
private extractBlockId(element: Element): string {
    // Step 1: Check direct attributes
    let blockId = element.getAttribute('data-gsap-block-id') ||
                  element.getAttribute('data-block');
    
    // Step 2: Check if element itself has block- ID
    if (!blockId && element.id && element.id.startsWith('block-')) {
        blockId = element.id.replace('block-', '');
    }
    
    // Step 3: Traverse parent elements
    if (!blockId) {
        let parentBlock = element.closest('[data-block]');
        if (!parentBlock) {
            let current = element.parentElement;
            while (current) {
                if (current.id && current.id.startsWith('block-')) {
                    parentBlock = current;
                    break;
                }
                current = current.parentElement;
            }
        }
        
        if (parentBlock) {
            blockId = parentBlock.getAttribute('data-block');
            if (!blockId && parentBlock.id && parentBlock.id.startsWith('block-')) {
                blockId = parentBlock.id.replace('block-', '');
            }
        }
    }
    
    return blockId || `fallback-${Date.now()}`;
}
```

## How It Works

### In Gutenberg Editor

1. User configures animation in Inspector Controls sidebar
2. Clicks "Preview Animation" button
3. `AnimationPreview` component receives `clientId` as `blockId`
4. `findBlockElement` searches for block in editor DOM:
   - Looks for `#block-{clientId}` (editor wrapper)
   - Finds actual content element inside wrapper
   - Targets that element for animation
5. GSAP animates the element
6. "Reset Element" restores original state

### On Frontend

1. PHP adds `data-gsap-block-id` to rendered blocks
2. Frontend controller finds elements using that attribute
3. Animations run based on configured triggers

## Testing

### Manual Testing Steps

1. **Basic Preview Test:**
   - Open any post/page in Gutenberg editor
   - Add a Paragraph or Heading block
   - In sidebar, open "GSAP Animation" panel
   - Enable animation
   - Select "To" type
   - Set X Movement to "100px"
   - Set Duration to 1 second
   - Click "Preview Animation"
   - ✅ Block should slide 100px to the right

2. **Different Block Types:**
   - Test with: Paragraph, Heading, Image, Button, Group
   - Each should preview correctly

3. **Different Animation Types:**
   - Test: To, From, FromTo, Set
   - FromTo: Set from x:-100, to x:100
   - Should preview correctly

4. **Reset Functionality:**
   - Run preview
   - Click "Reset Element"
   - ✅ Block should return to original position instantly

5. **Error Handling:**
   - If preview fails, error message should display
   - Message should be clear and actionable

### Expected Console Output

During successful preview, you might see:
```
// No errors - preview runs smoothly
```

During failed preview (if block not found):
```
Error: Block element not found for preview. Please save and refresh the editor.
```

## Debugging Tips

### If Preview Still Doesn't Work

1. **Check Browser Console:**
   ```javascript
   // In browser console, find your block's clientId
   const blockId = 'YOUR_CLIENT_ID';
   
   // Try each selector
   console.log('data-block:', document.querySelector(`[data-block="${blockId}"]`));
   console.log('block-id:', document.getElementById(`block-${blockId}`));
   console.log('wp-block:', document.querySelector(`.wp-block[data-block="${blockId}"]`));
   ```

2. **Verify ClientId is Passed:**
   ```javascript
   // Add this temporarily to AnimationPreview component
   console.log('Block ID (clientId):', blockId);
   ```

3. **Check GSAP Loading:**
   ```javascript
   // In browser console
   console.log('GSAP:', window.gsap);
   console.log('ScrollTrigger:', window.ScrollTrigger);
   ```

4. **Inspect Block Structure:**
   - Right-click block in editor
   - "Inspect Element"
   - Look for ID attributes and data attributes
   - Verify wrapper structure matches expectations

### Common Issues

**Issue 1: "Block element not found"**
- **Cause:** Block selector doesn't match DOM structure
- **Solution:** Inspect element, check ID/class attributes, update selectors if needed

**Issue 2: Animation doesn't reset**
- **Cause:** Element reference lost between preview and reset
- **Solution:** Ensure blockId remains consistent

**Issue 3: Animation runs on wrong element**
- **Cause:** Multiple blocks have similar IDs
- **Solution:** Verify clientId is unique, check querySelector results

## Files Modified

1. `assets/typescript/components/animation-preview/animation-preview.tsx`
   - Enhanced `findBlockElement` with fallback logic

2. `assets/typescript/services/animation-service.ts`
   - Enhanced `findElementByBlockId` with fallback logic
   - Enhanced `extractBlockId` with parent traversal

## Build Status

✅ TypeScript compilation successful  
✅ No linting errors  
✅ Webpack build completed successfully

## Compatibility

- **WordPress:** 6.0+
- **Gutenberg:** Block Editor
- **GSAP:** 3.x
- **Browsers:** Modern browsers (Chrome, Firefox, Safari, Edge)

## Notes

- Solution maintains backward compatibility
- Frontend functionality unchanged
- Editor-specific code doesn't affect production
- Follows established architectural patterns
- Uses TypeScript strict mode
- No breaking changes

## Future Improvements

1. Add visual indicator during preview (e.g., highlight border)
2. Add "Play in Loop" option for testing repeat animations
3. Add timeline scrubber for manual animation control
4. Add screenshot/video capture of preview
5. Add preset testing (test all properties at once)

