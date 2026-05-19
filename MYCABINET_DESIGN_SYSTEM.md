# MyCabinet Design System & Style Guide
## iOS-First Design for /mycabinet Routes

---

## 📱 Design Philosophy

All `/mycabinet` pages follow iOS-inspired design principles with **mobile-first** approach:
- **Clean, minimal UI** inspired by iOS HIG (Human Interface Guidelines)
- **Touch-optimized** with adequate tap targets (min 44x44px)
- **Hierarchical** typography and visual weight
- **Consistent spacing** and rhythm
- **Smooth animations** and transitions
- **Dark mode support** from day one

---

## 🎨 Color Palette

### Light Mode (Default)
```
Background:           #FFFFFF      oklch(1 0 0)
Foreground (Text):    #242424      oklch(0.145 0 0)
Card/Surface:         #FFFFFF      oklch(1 0 0)
Muted:                #F5F5F5      oklch(0.97 0 0)
Muted Foreground:     #8E8E93      oklch(0.556 0 0)
Border:               #EBEBF0      oklch(0.922 0 0)
Primary:              #3B82F6      oklch(0.205 0 0)  [Interactive]
Destructive:          #EF4444      oklch(0.577 0.245 27.325)
Accent:               #F5F5F5      oklch(0.97 0 0)
Success:              #22C55E      rgb(34, 197, 94)
Warning:              #F4A460      rgb(244, 164, 96)
```

### Dark Mode
```
Background:           #000000      oklch(0.145 0 0)
Foreground (Text):    #FFFFFF      oklch(0.985 0 0)
Card/Surface:         #242424      oklch(0.145 0 0)
Muted:                #3F3F46      oklch(0.269 0 0)
Muted Foreground:     #B4B4B8      oklch(0.708 0 0)
Border:               #454550      oklch(0.269 0 0)
Primary:              #60A5FA      oklch(0.488 0.243 264.376)
Destructive:          #F87171      oklch(0.396 0.141 25.723)
Accent:               #3F3F46      oklch(0.269 0 0)
Success:              #4ADE80      rgba(74, 222, 128)
Warning:              #FB923C      rgba(251, 147, 60)
```

---

## 🔤 Typography

### Font Family
```css
Font Sans: 'Geist', system-ui, -apple-system, sans-serif
Font Mono: 'Geist Mono', monospace
```

### Type Scales

| Level | Name | Size | Weight | Line-Height | Usage |
|-------|------|------|--------|-------------|-------|
| **H1** | Hero | 28px | 700 | 1.4 | Page titles, hero sections |
| **H2** | Heading 2 | 22px | 600 | 1.3 | Section titles, modals |
| **H3** | Heading 3 | 18px | 600 | 1.3 | Card titles, subsections |
| **Body** | Body | 16px | 400 | 1.5 | Main content, descriptions |
| **Caption** | Caption | 14px | 400 | 1.4 | Secondary info |
| **Small** | Small | 12px | 500 | 1.3 | Labels, hints, badges |
| **Tiny** | Tiny | 10px | 500 | 1.2 | Timestamps, metadata |

### CSS Classes
```css
/* Headings */
.text-h1 { font-size: 28px; font-weight: 700; line-height: 1.4; }
.text-h2 { font-size: 22px; font-weight: 600; line-height: 1.3; }
.text-h3 { font-size: 18px; font-weight: 600; line-height: 1.3; }

/* Body */
.text-body { font-size: 16px; font-weight: 400; line-height: 1.5; }
.text-caption { font-size: 14px; font-weight: 400; line-height: 1.4; }
.text-small { font-size: 12px; font-weight: 500; line-height: 1.3; }
.text-tiny { font-size: 10px; font-weight: 500; line-height: 1.2; }

/* Text Colors */
.text-primary { color: var(--foreground); }
.text-secondary { color: var(--muted-foreground); }
.text-muted { color: var(--muted-foreground); opacity: 0.7; }
```

---

## 📏 Spacing System

Based on **8px base unit** (iOS standard):

| Scale | Value | CSS |
|-------|-------|-----|
| **xs** | 4px | 0.25rem |
| **sm** | 8px | 0.5rem |
| **md** | 12px | 0.75rem |
| **lg** | 16px | 1rem |
| **xl** | 20px | 1.25rem |
| **2xl** | 24px | 1.5rem |
| **3xl** | 32px | 2rem |
| **4xl** | 40px | 2.5rem |
| **5xl** | 48px | 3rem |

### Common Spacing Patterns

```css
/* Padding */
.p-xs  { padding: 4px; }
.p-sm  { padding: 8px; }
.p-md  { padding: 12px; }
.p-lg  { padding: 16px; }
.p-xl  { padding: 20px; }
.p-2xl { padding: 24px; }

/* Margins */
.m-xs  { margin: 4px; }
.m-sm  { margin: 8px; }
.m-md  { margin: 12px; }

/* Gaps (Flex/Grid) */
.gap-xs  { gap: 4px; }
.gap-sm  { gap: 8px; }
.gap-md  { gap: 12px; }
.gap-lg  { gap: 16px; }
```

### Specific Component Spacing

```css
/* Page Layout */
Page top padding:       14px (3.5rem) [Header height]
Page side padding:      12px (0.75rem) mobile, 24px (1.5rem) tablet
Page bottom padding:    80px (5rem) [Navigation height]

/* Cards */
Card padding:           16px (1rem) mobile, 24px (1.5rem) tablet
Card margin bottom:     16px (1rem)
Card border radius:     10px (0.625rem)

/* Buttons */
Button padding:         12px 16px (0.75rem 1rem)
Button height:          44px minimum (touch target)
Button border radius:   8px (0.5rem)

/* Form Inputs */
Input padding:          12px 16px (0.75rem 1rem)
Input height:           44px minimum
Input border radius:    8px (0.5rem)
Input border width:     1px

/* Lists */
List item padding:      16px (1rem)
List item height:       56px minimum (touch target)
List item gap:          12px (0.75rem)
```

---

## 🧩 Component Library

### 1. Navigation Bars

#### Top Navigation Bar
```css
Height:              56px (3.5rem)
Background:          var(--background)
Border bottom:       1px solid var(--border)
Padding:             0 12px (0.75rem)
Z-index:             40

Title font-size:     18px
Title font-weight:   600

Back button size:    40x40px (icon 24x24px)
Avatar size:         32x32px
```

**iOS Principle**: Always provide back navigation on child views. Use system back arrow icon.

#### Bottom Navigation Bar
```css
Height:              80px (5rem) [56px content + 24px safe area]
Background:          var(--background)
Border top:          1px solid var(--border)
Display:             flex, space-around
Z-index:             40
Position:            fixed, bottom 0

Item icon size:      24x24px
Item label font:     10px, weight 500
Item label margin:   4px (0.25rem) top
Item tap area:       64x64px minimum
```

**iOS Principle**: Bottom tabs work great for 3-5 items. Icons with labels for clarity.

### 2. Cards & Containers

#### Standard Card
```css
Background:          var(--card)
Border:              1px solid var(--border)
Border radius:       10px (0.625rem)
Padding:             16px (1rem)
Margin bottom:       16px (1rem)
Box shadow:          0 1px 2px rgba(0,0,0,0.05)
Transition:          all 200ms ease
```

**Hover/Active State** (Touch):
```css
Background:          var(--muted)
Border color:        var(--primary)
Box shadow:          0 2px 4px rgba(0,0,0,0.1)
```

#### Payment Card
```css
Background:          Linear gradient (Primary color)
Border radius:       16px (1rem)
Padding:             24px (1.5rem)
Color:               var(--primary-foreground)
Aspect ratio:        1.586:1 (16:9 variation)

Pattern overlay:     Subtle dot pattern (50px grid, 1px dots)
Pattern opacity:     10%

Content z-index:     1 (above pattern)
```

**Typography on Payment Card**:
- Card type: 12px, weight 500, opacity 90%
- Card number: 20px, weight 600, letter-spacing 2px, monospace
- Holder/Expiry: 12px, weight 400

### 3. Buttons

#### Primary Button
```css
Background:          var(--primary)
Color:               var(--primary-foreground)
Padding:             12px 16px (0.75rem 1rem)
Height:              44px minimum
Border radius:       8px (0.5rem)
Font size:           16px
Font weight:         600
Border:              none
Cursor:              pointer
Transition:          all 200ms ease
```

**States**:
```css
Hover:   opacity 90%
Active:  opacity 80%, scale 0.98
Disabled: opacity 50%, cursor not-allowed
```

#### Secondary Button
```css
Background:          var(--secondary)
Color:               var(--secondary-foreground)
Same padding/sizing as primary
```

#### Outline Button
```css
Background:          transparent
Color:               var(--primary)
Border:              1.5px solid var(--primary)
Hover:               background var(--primary), color var(--primary-foreground)
```

#### Icon Button
```css
Width:               44px minimum
Height:              44px minimum
Border radius:       8px
Background:          transparent
Color:               var(--foreground)
Display:             flex, center alignment
Transition:          all 200ms ease
Hover:               background var(--muted)
```

### 4. Forms & Inputs

#### Text Input
```css
Background:          var(--input)
Border:              1px solid var(--border)
Border radius:       8px (0.5rem)
Padding:             12px 16px (0.75rem 1rem)
Height:              44px minimum
Font size:           16px (prevents auto-zoom on iOS)
Font family:         inherit

States:
- Focus:             border-color var(--primary), box-shadow 0 0 0 3px rgba(primary, 0.1)
- Error:             border-color var(--destructive)
- Disabled:          background var(--muted), opacity 50%, cursor not-allowed
```

**Placeholder**:
```css
Color:               var(--muted-foreground)
Opacity:             60%
```

#### Textarea
```css
Same as input, but:
Min height:          120px
Resize:              vertical
Line height:         1.5
```

#### Form Label
```css
Font size:           14px
Font weight:         600
Color:               var(--foreground)
Margin bottom:       8px (0.5rem)
```

#### Form Group
```css
Margin bottom:       16px (1rem)
Display:             flex, flex-direction column
Gap:                 8px (0.5rem)
```

### 5. Lists & Collections

#### List Item
```css
Background:          var(--card)
Border:              1px solid var(--border)
Border radius:       10px (0.625rem)
Padding:             16px (1rem)
Height:              auto (min 56px for touch)
Margin bottom:       12px (0.75rem)
Display:             flex, space-between, items-center
Transition:          all 200ms ease

Hover:               background var(--muted), border-color var(--primary)
Active:              opacity 80%
```

#### List Item Structure
```
[Icon/Avatar] [Title + Subtitle] [Value/Action]
     32x32         flex: 1           auto
     12px gap      12px gap          16px
```

**Typography**:
- Title: 14px, weight 600, foreground color
- Subtitle: 12px, weight 400, muted-foreground color
- Value: 14px, weight 600, text-align right

#### Status Badge
```css
Padding:             4px 8px (xs lg)
Border radius:       4px
Font size:           12px
Font weight:         500
Line height:         1.3
Display:             inline-flex

.status-completed { background rgba(34, 197, 94, 0.1); color: #22C55E; }
.status-pending   { background rgba(244, 164, 96, 0.1); color: #F4A460; }
.status-failed    { background rgba(239, 68, 68, 0.1); color: #EF4444; }
```

### 6. Tabs

```css
Display:             flex
Gap:                 8px (0.5rem)
Border bottom:       1px solid var(--border)
Margin bottom:       16px (1rem)
Overflow-x:          auto (horizontal scroll on mobile)

Tab item:
- Padding:           12px 16px (0.75rem 1rem)
- Border:            none
- Background:        transparent
- Color:             var(--muted-foreground)
- Font size:         14px
- Font weight:       500
- White-space:       nowrap
- Cursor:            pointer
- Position:          relative
- Transition:        color 200ms ease

Tab hover:           color var(--foreground)

Tab active:
- Color:             var(--primary)
- After pseudo:      1px height, var(--primary), bottom: -1px, full width
```

### 7. Empty States

```css
Text align:          center
Padding:             32px 16px (2rem 1rem)

Icon:
- Size:              48x48px (3rem)
- Color:             var(--muted-foreground)
- Margin bottom:     16px (1rem)

Title:
- Font size:         16px
- Font weight:       600
- Color:             var(--foreground)
- Margin bottom:     8px (0.5rem)

Description:
- Font size:         14px
- Font weight:       400
- Color:             var(--muted-foreground)
```

---

## ⚡ Animations & Transitions

### Standard Durations
```css
Fast:     150ms   /* Quick feedback (hover, focus) */
Normal:   200ms   /* Default transitions */
Slow:     300ms   /* Important state changes */
Slower:   500ms   /* Modals, major animations */
```

### Easing Functions
```css
ease-out-quart:      cubic-bezier(0.165, 0.84, 0.44, 1)
ease-in-out-quart:   cubic-bezier(0.77, 0, 0.175, 1)
ease-out-expo:       cubic-bezier(0.19, 1, 0.22, 1)

Default:             cubic-bezier(0.4, 0, 0.6, 1)  /* ease-in-out-cubic */
```

### Common Animations

```css
/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
animation: fadeIn 200ms ease-out;

/* Slide Up */
@keyframes slideUp {
  from { transform: translateY(16px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
animation: slideUp 300ms cubic-bezier(0.165, 0.84, 0.44, 1);

/* Scale + Fade (Button press) */
@keyframes scaleActive {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(0.98); opacity: 0.9; }
}
animation: scaleActive 150ms ease-out;

/* Pulse (Loading) */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
```

---

## 📐 Responsive Breakpoints

All `/mycabinet` designs are **mobile-first**, with progressive enhancement:

### Breakpoints
```css
Mobile:   < 640px    /* Default, optimized for touch */
Tablet:   ≥ 768px    /* iPad, 2-column layouts */
Desktop:  ≥ 1024px   /* Laptop, hide bottom nav */
```

### Mobile-First CSS Patterns

```css
/* Default: Mobile */
.container {
  padding: 0.75rem;
}

/* Tablet and up */
@media (min-width: 768px) {
  .container {
    padding: 1.5rem;
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .container {
    padding: 2rem;
  }
}
```

### Component Responsive Changes

| Component | Mobile | Tablet | Desktop |
|-----------|--------|--------|---------|
| Card padding | 16px | 24px | 24px |
| Button height | 44px | 44px | 40px |
| Font size (body) | 16px | 16px | 15px |
| Column count | 1 | 2-3 | 3-4 |
| Bottom nav | Visible | Visible | Hidden |
| Side nav | Hidden | Hidden | Visible |

---

## 🎯 Touch Target Sizes (iOS Standard)

```css
Minimum touch target:  44x44px (iOS HIG standard)

Button:               44px height, 16px+ width
Icon button:          44x44px minimum
List item:            56px height minimum
Input field:          44px height minimum
Tab:                  44px height minimum (but can be narrower width)
Checkbox/Radio:       44x44px tap area
```

---

## 🌙 Dark Mode Implementation

All colors automatically switch via `.dark` class:

```css
/* Light mode (default) */
.cabinet-card {
  background: var(--card);           /* #FFFFFF */
  color: var(--foreground);          /* #242424 */
  border: 1px solid var(--border);   /* #EBEBF0 */
}

/* Dark mode (automatic via .dark) */
.dark .cabinet-card {
  background: var(--card);           /* #242424 */
  color: var(--foreground);          /* #FFFFFF */
  border: 1px solid var(--border);   /* #454550 */
}
```

---

## 💡 Design Principles

### 1. **Clarity**
- Use hierarchy to guide the eye
- Clear, legible text at all sizes
- Consistent iconography

### 2. **Efficiency**
- Minimize taps to complete actions
- Progressive disclosure of information
- Quick access to frequent actions

### 3. **Delight**
- Smooth, purposeful animations
- Feedback on every interaction
- Consistent micro-interactions

### 4. **Accessibility**
- Contrast ratios ≥ 4.5:1 for text
- Touch targets ≥ 44x44px
- Clear focus indicators
- Keyboard navigation support

### 5. **Performance**
- Optimize for first paint
- Lazy load images
- Minimize repaints
- Hardware acceleration for animations

---

## 🔧 Usage Examples

### Creating a New Component

```tsx
// Use CSS classes from design system
<div className="cabinet-card">
  <div className="cabinet-card-header">
    <h3 className="text-h3">Card Title</h3>
    <span className="text-small text-secondary">Action</span>
  </div>
  <div className="space-y-md">
    <p className="text-body">Content here</p>
  </div>
</div>
```

### Form Example

```tsx
<form className="cabinet-form">
  <div className="cabinet-form-group">
    <label className="cabinet-form-label">Email Address</label>
    <input 
      type="email"
      className="cabinet-form-input"
      placeholder="Enter your email"
    />
  </div>
  <button className="cabinet-button cabinet-button-primary">
    Submit
  </button>
</form>
```

### List Example

```tsx
<div className="cabinet-list">
  <a href="#" className="cabinet-list-item">
    <div className="cabinet-list-item-main">
      <div className="cabinet-list-item-title">Payment Received</div>
      <div className="cabinet-list-item-subtitle">2 hours ago</div>
    </div>
    <div>
      <div className="cabinet-list-item-amount">+$50.00</div>
      <div className="cabinet-list-item-status cabinet-list-item-status-completed">
        Completed
      </div>
    </div>
  </a>
</div>
```

---

## 📱 Safe Area Considerations

For devices with notches/Dynamic Island:

```css
/* Top: Account for notch */
padding-top: max(56px, env(safe-area-inset-top));

/* Bottom: Account for home indicator */
padding-bottom: max(80px, env(safe-area-inset-bottom) + 56px);

/* Sides: Account for rounded corners */
padding-left: max(12px, env(safe-area-inset-left));
padding-right: max(12px, env(safe-area-inset-right));
```

---

## 📋 Checklist for New Pages

- [ ] Use semantic HTML (`<main>`, `<nav>`, `<header>`, etc.)
- [ ] Import `@/styles/mycabinet.css`
- [ ] Apply `cabinet-*` classes for styling
- [ ] Use typography scales (text-h1, text-body, etc.)
- [ ] Respect spacing system (gap-md, p-lg, etc.)
- [ ] Ensure 44px+ touch targets
- [ ] Test in dark mode
- [ ] Test on mobile (375px-425px), tablet (768px+), desktop (1024px+)
- [ ] Check focus states for keyboard navigation
- [ ] Verify color contrast ratios
- [ ] Test animations performance (60fps target)

---

**Last Updated**: May 2026  
**Version**: 1.0  
**Maintained By**: Design System Team
