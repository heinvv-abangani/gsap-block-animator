# ✅ Scroll Reverse Animation Guide

**Feature:** Animations that reverse when scrolling up  
**Status:** AVAILABLE ✅

---

## How to Enable Reverse on Scroll

The reverse functionality is built into the **Scroll Behavior** setting in the Scroll Trigger controls.

### Steps:

1. Select your block
2. Enable Animation
3. **Trigger:** On Scroll
4. Configure your animation properties (x, y, opacity, etc.)
5. In **Scroll Trigger Settings**, look for **"Scroll Behavior"** dropdown
6. Choose your preferred reverse behavior

---

## Scroll Behavior Options

### 1. ✅ Play & Reverse on Scroll Up (Recommended)

**Value:** `play none none reverse`

**What it does:**
- Scrolling DOWN → Animation plays forward
- Scrolling UP (going back) → Animation reverses

**Best for:** Most common use case - elements that should "undo" their animation when you scroll back up

**Example:**
```
Element fades in and moves up when scrolling down
↓
When scrolling back up, it fades out and moves back down
```

---

### 2. 🔄 Play & Reverse Both Directions

**Value:** `play reverse play reverse`

**What it does:**
- Scrolling DOWN into trigger → Animation plays forward
- Scrolling DOWN past trigger → Animation reverses
- Scrolling UP into trigger → Animation plays forward again
- Scrolling UP past trigger → Animation reverses again

**Best for:** Elements that should animate every time they enter the viewport from any direction

**Example:**
```
Element scales up when entering viewport (both directions)
Element scales back down when leaving viewport (both directions)
```

---

### 3. ⏩ Play Forward, Reverse Backward

**Value:** `play pause reverse reset`

**What it does:**
- Scrolling DOWN → Plays forward
- Stop scrolling → Pauses
- Scrolling UP → Reverses back
- Scrolling UP past start → Resets

**Best for:** Smooth, controlled animations tied to scroll direction

---

### 4. 🎬 Play Only Once (No Reverse)

**Value:** `play none none none`

**What it does:**
- Animation plays once when you first scroll down
- Never reverses or repeats
- Stays in final state

**Best for:** One-time entrance animations that should stay visible

---

### 5. ✨ Play & Complete on Each Pass

**Value:** `play complete play complete`

**What it does:**
- Animation completes every time you enter the trigger zone
- Works in both directions

**Best for:** Elements that should complete their animation state each time

---

### 6. 🎛️ Advanced: Pause & Resume

**Value:** `play pause resume reset`

**What it does:**
- Entering trigger → Play
- Leaving trigger (down) → Pause
- Re-entering trigger (up) → Resume
- Leaving trigger (up) → Reset

**Best for:** Complex scroll-based interactions

---

## Quick Examples

### Example 1: Fade In with Reverse

**Configuration:**
```
Trigger: On Scroll
Scroll Behavior: Play & Reverse on Scroll Up ✅
Properties:
  - Opacity: 1
  - Y Movement: -50px
Start: top 80%
End: bottom 20%
```

**Result:**
- Scroll down → Element fades in and moves up
- Scroll back up → Element fades out and moves back down

---

### Example 2: Scale Animation with Reverse

**Configuration:**
```
Trigger: On Scroll
Scroll Behavior: Play & Reverse Both Directions ✅
Properties:
  - Scale: 1.2
  - Rotation: 10
Start: center center
End: bottom top
```

**Result:**
- Element scales up and rotates every time it enters viewport
- Scales back down and rotates back every time it leaves

---

### Example 3: Parallax with Reverse

**Configuration:**
```
Trigger: On Scroll
Scroll Behavior: Play & Reverse on Scroll Up ✅
Scrub: ON ✅
Properties:
  - Y Movement: -100px
Start: top bottom
End: bottom top
```

**Result:**
- Smooth parallax movement tied to scroll
- Automatically reverses when scrolling up

---

## Understanding Toggle Actions

The scroll behavior dropdown uses ScrollTrigger's `toggleActions` format:

**Format:** `onEnter onLeave onEnterBack onLeaveBack`

- **onEnter** = Scrolling down, entering trigger
- **onLeave** = Scrolling down, leaving trigger  
- **onEnterBack** = Scrolling up, entering trigger
- **onLeaveBack** = Scrolling up, leaving trigger

**Actions:**
- `play` = Play animation
- `reverse` = Reverse animation
- `pause` = Pause animation
- `resume` = Resume animation
- `reset` = Reset to beginning
- `complete` = Jump to end
- `none` = Do nothing

---

## Visual Guide

```
Page Layout:
════════════════
    Content
════════════════  ← Start Trigger (top 80%)
    
    [Element]
    
════════════════  ← End Trigger (bottom 20%)
    Content
════════════════


Scroll Down ↓
- Element enters start trigger → Animation PLAYS
- Element exits end trigger → Depends on scroll behavior

Scroll Up ↑
- Element enters end trigger → Depends on scroll behavior  
- Element exits start trigger → Animation REVERSES (if enabled)
```

---

## Tips for Best Results

### For Smooth Reverse:

1. **Use symmetric properties**
   - If animating X: 100px, the reverse will go back to X: 0
   - Make sure starting position is where you want to reverse to

2. **Adjust timing**
   - Duration affects both forward and reverse
   - Ease affects both directions

3. **Test with scrub**
   - Turn on Scrub to see smooth scroll-tied animation
   - Great for testing if reverse looks good

### For One-Direction Animations:

Use **"Play Only Once (No Reverse)"** when:
- Element should fade in and stay visible
- Animation is permanent (like revealing content)
- You don't want reverse behavior

---

## Testing Your Reverse Animation

1. **Configure animation** with reverse behavior
2. **Save** your page/post
3. **View on frontend** (not preview in editor)
4. **Scroll down slowly** → Watch animation play
5. **Scroll back up** → Watch animation reverse
6. Adjust **start/end positions** if needed
7. Try **different scroll behaviors** to compare

---

## Common Issues

### Reverse Doesn't Work

✅ **Check:** Scroll Behavior is set to option with "reverse"  
✅ **Check:** You're testing on frontend (not editor preview)  
✅ **Check:** You scrolled past the start trigger then back  
✅ **Check:** Animation has completed before scrolling back  

### Reverse is Too Fast/Slow

- Duration affects both forward and reverse
- Adjust in Timing Controls → Duration

### Reverse Looks Jumpy

- Try enabling **Scrub** for smooth scroll-tied animation
- Or adjust start/end positions for more scroll space

---

## Build Status

```
✅ Enhanced scroll behavior options
✅ Clearer labels and descriptions
✅ Built-in help guide
✅ Compiled to editor.js (29.7 KB)
```

---

## Ready to Use!

**Refresh your editor** and look for the **"Scroll Behavior"** dropdown in Scroll Trigger Settings. The recommended option **"Play & Reverse on Scroll Up"** is already selected by default! 🚀

