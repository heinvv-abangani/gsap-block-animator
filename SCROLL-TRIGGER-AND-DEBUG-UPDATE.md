# ✅ Scroll Trigger Controls + Preview Debugging

**Date:** October 13, 2025  
**Features Added:**
1. Scroll Trigger Configuration Controls
2. Preview Debug Logging

---

## 🎯 What's New

### 1. Scroll Trigger Configuration Controls

When you select **"On Scroll"** as the trigger, you now get full control over ScrollTrigger settings!

#### New Controls Available:

**Start Position**
- When the animation should start
- Examples: `top 80%`, `top center`, `center center`
- Default: `top 80%`

**End Position**
- When the animation should end
- Examples: `bottom 20%`, `+=500`, `bottom center`
- Default: `bottom 20%`

**Toggle Actions**
- Controls what happens on scroll events
- Options:
  - `play none none reverse` (default) - Play on enter, reverse on leave back
  - `play pause resume reset` - Full control on all events
  - `play complete complete reset` - Complete animation on enter
  - `play none none none` - Only play once
  - `play play reverse reverse` - Play/reverse on all events

**Scrub**
- Toggle ON: Animation tied to scroll position
- Toggle OFF: Animation plays at normal speed
- Great for parallax effects!

**Pin Element**
- Toggle ON: Element stays fixed during animation
- Toggle OFF: Normal scroll behavior
- Perfect for sticky sections!

**Show Markers (Debug)**
- Toggle ON: Visual markers show on frontend (for testing)
- Toggle OFF: No markers (for production)
- Helps visualize start/end points!

---

## 🧪 How to Use Scroll Trigger Controls

### Example 1: Fade In On Scroll
1. Select a block
2. Enable Animation
3. **Trigger:** On Scroll
4. **Scroll Trigger Settings:**
   - Start: `top 80%`
   - End: `bottom 20%`
   - Toggle Actions: `play none none reverse`
5. **Properties:**
   - Opacity: `1` (or any value)
   - Y Movement: `50px`
6. Save and view on frontend

**Result:** Block fades in and moves up as you scroll

### Example 2: Scrub Animation (Parallax)
1. Select an image block
2. Enable Animation
3. **Trigger:** On Scroll
4. **Scroll Trigger Settings:**
   - Start: `top bottom`
   - End: `bottom top`
   - **Scrub: ON** ✅
5. **Properties:**
   - Y Movement: `-100px`

**Result:** Image moves smoothly with scroll position (parallax effect)

### Example 3: Pinned Section
1. Select a section/group
2. Enable Animation
3. **Trigger:** On Scroll
4. **Scroll Trigger Settings:**
   - Start: `top top`
   - End: `+=500`
   - **Pin: ON** ✅
5. **Properties:**
   - Opacity: `0.5`

**Result:** Section pins at top of viewport for 500px, fading out

---

## 🔍 Preview Debug Logging

Preview now outputs detailed console logs to help diagnose issues!

### How to Use Debug Logs

1. Open your browser console (F12 or Cmd+Option+I)
2. Configure an animation
3. Click "Preview Animation"
4. Check console for detailed info:

```javascript
[GSAP Preview] Starting preview for block: abc-123-def
[GSAP Preview] Config: { type: "to", trigger: "pageload", ... }
[GSAP Preview] Found element: <p class="wp-block">
[GSAP Preview] Element tag: P
[GSAP Preview] Element classes: wp-block wp-block-paragraph
[GSAP Preview] Animation started successfully
```

### What Each Log Means:

**`Starting preview for block:`**
- Shows the block ID being animated
- Confirms preview button was clicked

**`Config:`**
- Shows full animation configuration
- Verify your settings are correct

**`Found element:`**
- Shows the actual DOM element that will animate
- If this is wrong, the element selector has issues

**`Element tag:`**
- The HTML tag (P, DIV, FIGURE, etc.)
- Helps identify if correct element is targeted

**`Element classes:`**
- All CSS classes on the element
- Useful for debugging selector issues

**`Animation started successfully:`**
- Animation was created and is running
- If you don't see this, check for errors above

### Common Debug Scenarios:

**Scenario 1: Nothing in console**
- Preview button might not be working
- Check if animation is enabled
- Check if properties are set

**Scenario 2: "Animation is disabled" warning**
- Animation toggle is OFF
- Turn on "Enable Animation"

**Scenario 3: "Block element not found" error**
- Editor canvas not detected
- Refresh the page
- Check if block exists in editor

**Scenario 4: Wrong element in logs**
- Targeting nested content instead of block
- Check the "Found element" and "Element tag"
- Should be the block itself, not an image/button inside

---

## 📁 Files Modified

### TypeScript
✅ `assets/typescript/types/animation.ts` - Added `ScrollTriggerConfig`  
✅ `assets/typescript/components/animation-controls/controls/scroll-trigger-controls.tsx` - NEW FILE  
✅ `assets/typescript/components/animation-controls/animation-controls-manager.tsx` - Integrated scroll controls  
✅ `assets/typescript/components/animation-preview/animation-preview.tsx` - Added debug logging  
✅ `assets/typescript/services/animation-service.ts` - Use scroll trigger config  

### Compiled
✅ `assets/dist/js/editor.js` - Updated (28.9 KB)

---

## 🎨 UI Changes

### Before:
```
Trigger: [On Scroll]
  ↓
Transform Properties
```

### After:
```
Trigger: [On Scroll]
  ↓
📋 Scroll Trigger Settings
   • Start Position
   • End Position
   • Toggle Actions
   • Scrub
   • Pin Element
   • Show Markers
   • Position Guide (help text)
  ↓
Transform Properties
```

Scroll trigger controls **only appear when "On Scroll" is selected**.

---

## 📚 Scroll Position Guide

Included in the UI as a helpful reference:

**Common Start/End Positions:**

| Value | Meaning |
|-------|---------|
| `top center` | Element top hits viewport center |
| `top 80%` | Element top hits 80% down viewport |
| `bottom center` | Element bottom hits viewport center |
| `center center` | Element center hits viewport center |
| `+=500` | 500px after start position |
| `-=200` | 200px before start position |
| `top top` | Element top hits viewport top |
| `bottom bottom` | Element bottom hits viewport bottom |

---

## ✅ Testing Checklist

### Test Preview with Debug Logs:
- [ ] Configure animation with properties
- [ ] Open browser console
- [ ] Click "Preview Animation"
- [ ] Verify console shows all debug logs
- [ ] Verify correct element is found
- [ ] Verify animation actually runs

### Test Scroll Trigger Controls:
- [ ] Select "On Scroll" trigger
- [ ] Verify scroll trigger section appears
- [ ] Change start position → verify on frontend
- [ ] Change end position → verify on frontend
- [ ] Toggle Scrub ON → verify smooth scroll animation
- [ ] Toggle Pin ON → verify element stays fixed
- [ ] Toggle Markers ON → verify markers appear on frontend
- [ ] Change toggle actions → verify behavior changes

### Test Other Triggers (Scroll Controls Should Hide):
- [ ] Select "On Page Load" → scroll controls hide
- [ ] Select "On Click" → scroll controls hide
- [ ] Select "On Hover" → scroll controls hide
- [ ] Switch back to "On Scroll" → controls reappear

---

## 🔧 Troubleshooting

### Preview Still Not Working?

**Step 1:** Check Console Logs
```javascript
// Do you see [GSAP Preview] logs?
// If NO: JavaScript not loaded or button not wired up
// If YES: Check what the logs say
```

**Step 2:** Check Element Found
```javascript
// Look for: [GSAP Preview] Found element:
// Is it the correct element?
// Is it a nested element (wrong)?
```

**Step 3:** Check GSAP Loaded
```javascript
// In console, type:
window.gsap
window.ScrollTrigger

// Should both return objects, not undefined
```

**Step 4:** Use Debug Tool
```javascript
// Run the debug tool:
debugGSAPPreview(wp.data.select('core/block-editor').getSelectedBlockClientId())

// Check all the diagnostic info
```

### Scroll Animations Not Working on Frontend?

1. **Check if published/saved**
   - Preview mode uses different logic
   - Must save to see on frontend

2. **Check markers**
   - Turn on "Show Markers" to see trigger points
   - Markers appear on frontend only

3. **Check scroll position**
   - Make sure you scroll to trigger point
   - Check start/end positions are correct

4. **Check browser console**
   - Look for JavaScript errors
   - Check if GSAP/ScrollTrigger loaded

---

## 🎓 Learning Resources

### ScrollTrigger Positions

Format: `[element position] [viewport position]`

Example: `top 80%`
- Element position: `top` of element
- Viewport position: `80%` down the viewport

Example: `center center`
- Element center hits viewport center

### Toggle Actions

Format: `onEnter onLeave onEnterBack onLeaveBack`

Example: `play none none reverse`
- `onEnter`: play
- `onLeave`: none
- `onEnterBack`: none
- `onLeaveBack`: reverse

---

## 🚀 Build Status

```
✅ TypeScript compilation: SUCCESS
✅ No linting errors
✅ Webpack build: SUCCESS
✅ Bundle: 28.9 KB
✅ New controls rendered
✅ Debug logging active
```

---

## 📝 Next Steps

1. **Refresh Your Editor**
   - Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)
   - Loads new compiled code

2. **Test Preview with Console Open**
   - Configure any animation
   - Open console (F12)
   - Click "Preview Animation"
   - Read the debug logs

3. **Test Scroll Trigger Controls**
   - Select "On Scroll"
   - Configure scroll settings
   - Save and view on frontend
   - Verify animation triggers correctly

4. **Share Console Output**
   - If preview still doesn't work
   - Copy console logs
   - Share for further debugging

---

**Status: COMPLETE** ✅  
Scroll Trigger controls implemented + Preview debugging enabled!

