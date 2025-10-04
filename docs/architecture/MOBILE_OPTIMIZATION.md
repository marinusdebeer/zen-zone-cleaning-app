# Mobile Optimization Guide

## Philosophy

**Mobile-First Responsive Design**: The application is optimized for all screen sizes with a focus on mobile usability, touch interactions, and performance.

---

## Key Optimizations Implemented

### 1. Viewport & Meta Tags

**Location:** `app/layout.tsx`

```typescript
viewport: {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}
```

**Benefits:**
- Proper rendering on mobile devices
- Allows user zoom for accessibility
- Sets theme color for browser chrome

### 2. Touch Target Sizing

**Standard:** Minimum 44px × 44px per Apple/Google guidelines

**Implementation:** `app/globals.css`

```css
@media (max-width: 768px) {
  button, a, [role="button"] {
    min-height: 44px;
    min-width: 44px;
  }
}
```

**Why:** Ensures comfortable tapping on mobile devices.

### 3. Mobile-Optimized Typography

**Input Font Size:** 16px minimum on mobile

```css
@media (max-width: 768px) {
  input, select, textarea {
    font-size: 16px; /* Prevents iOS auto-zoom */
  }
}
```

**Why:** Prevents unwanted zoom on iOS when focusing inputs.

### 4. Responsive Tables

**Component:** `src/ui/components/responsive-table.tsx`

**Features:**
- Desktop: Traditional table layout
- Mobile: Card-based layout
- Follows theming guidelines
- Touch-friendly interactions

**Usage:**
```typescript
<ResponsiveTable
  headers={['Name', 'Status', 'Amount']}
  rows={data}
  renderRow={(item) => (
    <>
      <ResponsiveTableCell label="Name">{item.name}</ResponsiveTableCell>
      <ResponsiveTableCell label="Status">
        <StatusBadge status={item.status} />
      </ResponsiveTableCell>
      <ResponsiveTableCell label="Amount">
        ${item.amount.toFixed(2)}
      </ResponsiveTableCell>
    </>
  )}
  onRowClick={(item) => router.push(`/items/${item.id}`)}
/>
```

**Benefits:**
- Maintains data visibility on small screens
- Touch-friendly clickable cards
- Consistent with theme variables

---

## Responsive Breakpoints

```css
--breakpoint-sm: 640px;   /* Small tablets */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Laptops */
--breakpoint-xl: 1280px;  /* Desktops */
```

**Mobile:** < 640px  
**Tablet:** 640px - 1024px  
**Desktop:** > 1024px

---

## Layout Guidelines

### Spacing

**Mobile:**
- Padding: 1rem (16px)
- Gap between elements: 0.75rem-1rem

**Desktop:**
- Padding: 1.5rem (24px)
- Gap between elements: 1.5rem

**Implementation:**
```typescript
className="px-4 py-4 sm:px-6 sm:py-6"  // Responsive padding
className="gap-4 md:gap-6"              // Responsive gaps
```

### Grid Layouts

**Pattern:**
```typescript
// Single column on mobile, 2 on tablet, 4 on desktop
className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6"
```

**Examples:**
- **Stats Cards:** 1 → 2 → 4 columns
- **Forms:** 1 → 2 columns
- **Lists:** Always single column

---

## Mobile Navigation

### Sidebar Behavior

**Desktop (>1024px):**
- Persistent sidebar
- Collapsible to icon-only view
- Main content shifts with sidebar

**Mobile (<1024px):**
- Hidden by default
- Overlay when opened
- Full-screen drawer
- Closes on navigation

**Implementation:** `src/ui/components/app-sidebar.tsx`

### Header

**Mobile Optimizations:**
- Hamburger menu button (44px touch target)
- Simplified search (icon-only on mobile)
- Stacked user menu items
- Proper dropdown positioning

---

## Form Optimization

### Input Fields

**Mobile-Friendly:**
```typescript
className="
  w-full 
  px-4 py-3          // Larger padding
  text-base          // 16px minimum
  rounded-lg         // Easier to tap
  touch-manipulation // Prevents double-tap zoom
"
```

### Buttons

**Sizing:**
- Minimum height: 44px
- Padding: py-3 px-6 (12px 24px)
- Full-width on mobile when appropriate

**Example:**
```typescript
<button className="w-full sm:w-auto py-3 px-6">
  Submit
</button>
```

### Dropdowns & Selects

- Native selects on mobile (better UX)
- Custom selects should be touch-optimized
- Minimum 44px height for options

---

## Cards & Containers

### Mobile Cards

```typescript
className="
  bg-brand-bg 
  rounded-xl 
  p-4 md:p-6          // Responsive padding
  shadow-sm 
  border border-brand-border
  active:bg-brand-bg-tertiary  // Touch feedback
"
```

**Touch Feedback:**
- Use `active:` pseudo-class for immediate feedback
- Avoid hover-only interactions

---

## Performance

### Image Optimization

- Use Next.js `<Image>` component
- Provide appropriate sizes for mobile
- Lazy load off-screen images

### Bundle Size

- Code splitting per route
- Dynamic imports for heavy components
- Tree-shake unused code

### Loading States

- Show loading indicators for async actions
- Skeleton screens for initial loads
- Optimistic UI updates where appropriate

---

## Testing Checklist

### Device Testing

- [ ] iPhone SE (375px width)
- [ ] iPhone 12/13/14 (390px width)
- [ ] iPhone 12/13/14 Pro Max (428px width)
- [ ] iPad (768px width)
- [ ] iPad Pro (1024px width)

### Browser Testing

- [ ] Mobile Safari (iOS)
- [ ] Chrome (Android)
- [ ] Chrome (iOS)
- [ ] Firefox (Android)

### Functionality

- [ ] All buttons are tappable (44px minimum)
- [ ] Forms don't cause zoom on iOS
- [ ] Tables/lists are readable
- [ ] Navigation works smoothly
- [ ] No horizontal scroll
- [ ] Touch feedback visible
- [ ] Modals fit on screen
- [ ] Keyboard doesn't hide inputs

### Accessibility

- [ ] Touch targets meet minimum size
- [ ] Contrast ratios pass WCAG AA
- [ ] Screen reader navigation works
- [ ] Keyboard navigation works
- [ ] Focus indicators visible

---

## Common Patterns

### Responsive Container

```typescript
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  {children}
</div>
```

### Responsive Grid

```typescript
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>
```

### Responsive Text

```typescript
<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
  Heading
</h1>
```

### Mobile-First Visibility

```typescript
{/* Show on mobile only */}
<div className="block md:hidden">Mobile Menu</div>

{/* Hide on mobile */}
<div className="hidden md:block">Desktop Sidebar</div>
```

---

## Theme Integration

All mobile components **must** use theme variables:

```typescript
// ✅ Correct
className="bg-brand-bg text-brand-text border-brand-border"

// ❌ Wrong
className="bg-white text-gray-900 border-gray-200"
```

**See:** [Theming Guide](./THEMING_GUIDE.md)

---

## Tools & Components

### Available Components

1. **ResponsiveTable** - `src/ui/components/responsive-table.tsx`
   - Auto-converts to cards on mobile
   - Theme-compliant
   - Touch-friendly

2. **CustomSelect** - `src/ui/components/custom-select.tsx`
   - Works on all devices
   - Proper touch targets
   - Keyboard accessible

3. **AppSidebar** - `src/ui/components/app-sidebar.tsx`
   - Mobile drawer behavior
   - Desktop persistent sidebar

4. **AppHeader** - `src/ui/components/app-header.tsx`
   - Responsive navigation
   - Mobile menu toggle

---

## Best Practices

### DO ✅

- Use responsive Tailwind classes (`sm:`, `md:`, `lg:`)
- Test on real devices when possible
- Provide touch feedback (`active:` states)
- Use 16px minimum font size for inputs
- Follow 44px touch target minimum
- Use theme variables for all colors
- Optimize images for mobile
- Test with slow 3G network

### DON'T ❌

- Assume desktop-only usage
- Use hover-only interactions
- Create touch targets smaller than 44px
- Use fixed widths that don't scale
- Hardcode colors (use theme)
- Ignore mobile performance
- Force landscape orientation
- Disable user zoom

---

## Migration Guide

### Converting Existing Tables

**Before:**
```typescript
<table className="w-full">
  <thead>
    <tr>
      <th>Name</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
    {data.map(item => (
      <tr key={item.id}>
        <td>{item.name}</td>
        <td>{item.status}</td>
      </tr>
    ))}
  </tbody>
</table>
```

**After:**
```typescript
<ResponsiveTable
  headers={['Name', 'Status']}
  rows={data}
  renderRow={(item) => (
    <>
      <ResponsiveTableCell label="Name">{item.name}</ResponsiveTableCell>
      <ResponsiveTableCell label="Status">{item.status}</ResponsiveTableCell>
    </>
  )}
  onRowClick={(item) => router.push(`/items/${item.id}`)}
/>
```

### Making Grids Responsive

**Before:**
```typescript
<div className="grid grid-cols-4 gap-6">
```

**After:**
```typescript
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
```

---

## Resources

- [Apple Human Interface Guidelines - Touch Targets](https://developer.apple.com/design/human-interface-guidelines/inputs/touchscreen-gestures/)
- [Material Design - Touch Targets](https://m3.material.io/foundations/accessible-design/accessibility-basics#28032e45-c598-450c-b355-f9fe737b1cd8)
- [Web.dev - Mobile Performance](https://web.dev/mobile/)
- [WCAG 2.1 - Target Size](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)

---

## Related Documentation

- [Theming Guide](./THEMING_GUIDE.md) - Theme variables and colors
- [Components](./COMPONENTS.md) - Component architecture
- [Best Practices](../BEST_PRACTICES.md) - General coding standards
- [Code Standards](../development/CODE_STANDARDS.md) - Coding conventions

---

**Last Updated:** October 2025  
**Status:** ✅ Active - Follow these guidelines for all mobile development

