# Theming Guide

## Philosophy

**Single Source of Truth**: All colors are defined in ONE place (`app/styles/tenant.css`) so that:
1. Light/Dark mode works automatically across the entire app
2. Color changes can be made in one file, not scattered across hundreds of components
3. Consistency is guaranteed - no duplicate or conflicting color definitions
4. Maintenance is simple - update once, apply everywhere

**Rule of thumb:** 95% of colors should use theme variables.

---

## Available Theme Variables

### CSS Variables (in `app/styles/tenant.css`)

**Brand Colors:**
- `--tenant-primary` - Main brand color (buttons, links, primary actions)
- `--tenant-primary-dark` - Darker variant (hover states, headers)
- `--tenant-primary-light` - Lighter variant (sidebar, subtle highlights)
- `--tenant-primary-hover` - Hover state for primary elements
- `--tenant-accent` - Accent color (secondary buttons, badges)
- `--tenant-accent-light` - Lighter accent
- `--tenant-accent-hover` - Hover state for accent elements

**Backgrounds:**
- `--tenant-bg` - Main background (cards, modals)
- `--tenant-bg-secondary` - Page background
- `--tenant-bg-tertiary` - Highlighted areas, hover states

**Borders:**
- `--tenant-border` - Standard borders
- `--tenant-border-hover` - Hover state borders

**Text:**
- `--tenant-text-primary` - Headings, important text
- `--tenant-text-secondary` - Body text
- `--tenant-text-tertiary` - Subtle text, placeholders

**Status Colors:**
- `--tenant-success` - Success states, completed items
- `--tenant-warning` - Warnings, pending items
- `--tenant-danger` - Errors, destructive actions
- `--tenant-info` - Informational messages

**Shadows:**
- `--tenant-shadow-sm` / `--tenant-shadow-md` / `--tenant-shadow-lg`

### Tailwind Utilities (in `app/globals.css`)

**Brand:** `bg-brand`, `bg-brand-dark`, `bg-brand-light`, `bg-brand-accent`, `text-brand`, `text-brand-dark`, `border-brand`, `border-brand-dark`

**Backgrounds:** `bg-brand-bg`, `bg-brand-bg-secondary`, `bg-brand-bg-tertiary`

**Borders:** `border-brand-border`, `border-brand-border-hover`

**Text:** `text-brand-text`, `text-brand-text-secondary`, `text-brand-text-tertiary`

**Status:** `text-brand-success`, `bg-brand-success`, `text-brand-warning`, `bg-brand-warning`, `text-brand-danger`, `bg-brand-danger`, `text-brand-info`, `bg-brand-info`

---

## Rules

### ✅ DO: Use Theme Colors

Use theme colors for:
- Primary actions (buttons, CTAs)
- Navigation elements (sidebar, header, active states)
- Brand touchpoints (logos, gradients)
- Interactive elements (links, hover states)
- Form focus states
- Selected/active states
- Cards and containers
- Icons that represent brand actions
- Any element that might need to change color globally

### ❌ DON'T: Use Hardcoded Colors

Never use:
- Hex colors in className (e.g., `bg-[#4a7c59]`)
- Arbitrary Tailwind colors for brand elements (e.g., `bg-cyan-500` for buttons)
- Inline styles with hardcoded colors

### ⚠️ TEMPORARY EXCEPTION: Status Colors

Current state: Status indicators (PAID/green, PENDING/yellow, OVERDUE/red) use hardcoded Tailwind utilities like `bg-green-100 text-green-600`.

**Why this is temporary:**
- These colors don't adapt to theme changes
- They don't properly support dark mode customization
- Changing "success green" globally requires finding every instance

**Future improvement:** Move to CSS variables like `--tenant-status-success-bg` and `--tenant-status-success-text`.

### ✅ ACCEPTABLE: Neutral Structural Colors

True neutral grays for pure structure (not content) can use Tailwind utilities:
- Modal overlays
- Divider lines
- Disabled states
- Structural backgrounds

**When uncertain:** Use theme colors. Card borders, text colors, backgrounds should use theme even if they're currently gray - they're defined in ONE place and can be changed globally.

---

## Dark Mode

All theme variables automatically adjust for dark mode via the `.dark` class. Components using theme variables require no additional work for dark mode support.

Manual dark mode handling is only needed for truly neutral structural elements: `bg-white dark:bg-gray-800`

---

## Changing Global Theme

To change colors for ALL tenants, edit `app/styles/tenant.css`:

Update the CSS variables in `:root` (light mode) and `.dark` (dark mode) sections. All components using theme utilities will automatically update.

---

## Decision Tree

**Does this color need to be changed globally in the future?**
- YES → Use theme variable
- NO → Ask: Is it truly structural? (modal overlay, divider)
  - YES → Use gray
  - NO → Use theme variable

---

## Common Questions

**"Should I use theme or hardcoded color for X?"**  
Use theme. Always default to theme unless you have a specific reason not to.

**"What if I need a new color that doesn't exist in the theme?"**  
Add it to `tenant.css` as a CSS variable, then use it everywhere.

**"What about one-off colors?"**  
There's no such thing. If you use it once, you might use it again. Add it to the theme.

**"What if it's just a gray divider line?"**  
If it divides content, it might need to adapt to themes. Use `border-brand-border` which can be set to any color including gray.

**When in doubt, use theme colors.**

---

## Migration Checklist

When converting hardcoded colors to theme:

- [ ] Replace `#XXXXXX` hex colors with theme utilities
- [ ] Replace arbitrary Tailwind brand colors (`bg-purple-500`) with `bg-brand`
- [ ] Keep semantic status colors for now (`bg-green-100`, `text-red-600`)
- [ ] Keep neutral grays only for pure structural elements
- [ ] Test in both light and dark mode
- [ ] Verify hover states use theme colors
- [ ] Check focus states use theme colors

---

## Common Mistakes

**Mixing hex and theme colors** - Pick one approach, don't mix hardcoded and theme colors in the same component.

**Using wrong color for context** - Don't use semantic colors (green/red) for brand elements. Use brand colors for brand actions.

**Hardcoding hover states** - Hover states should use theme hover variables (`bg-brand hover:bg-brand-dark`), not hardcoded colors.

**Assuming "it's just gray"** - Today's gray border might be tomorrow's brand-colored accent. Use theme.
