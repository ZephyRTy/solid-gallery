---
name: Obsidian Gallery
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#c7c4d8'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#918fa1'
  outline-variant: '#464555'
  surface-tint: '#c3c0ff'
  primary: '#c3c0ff'
  on-primary: '#1d00a5'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#4d44e3'
  secondary: '#d2bbff'
  on-secondary: '#3f008e'
  secondary-container: '#6001d1'
  on-secondary-container: '#c9aeff'
  tertiary: '#6bd8cb'
  on-tertiary: '#003732'
  tertiary-container: '#006c63'
  on-tertiary-container: '#81eddf'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#eaddff'
  secondary-fixed-dim: '#d2bbff'
  on-secondary-fixed: '#25005a'
  on-secondary-fixed-variant: '#5a00c6'
  tertiary-fixed: '#89f5e7'
  tertiary-fixed-dim: '#6bd8cb'
  on-tertiary-fixed: '#00201d'
  on-tertiary-fixed-variant: '#005049'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 64px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0.01em
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.1em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1440px
  gutter: 32px
  margin-desktop: 80px
  margin-mobile: 24px
---

## Brand & Style

This design system embodies the "Luxe Digital Gallery" aesthetic—a sophisticated, high-end environment where content is treated as art. The target audience includes discerning users who value exclusivity, precision, and avant-garde digital experiences.

The style is a refined fusion of **Glassmorphism** and **Minimalism**. It utilizes deep, atmospheric depth, translucent layering, and expansive whitespace to create a sense of calm authority. Every interaction should feel intentional and fluid, evoking an emotional response of prestige and effortless modern luxury.

## Colors

The palette is rooted in a "Deep Night" foundation, using a dark mode default to allow glass effects and vibrant accents to resonate.

- **Primary & Secondary:** A rich Indigo-to-Purple gradient represents the core brand energy, used for high-intent actions and focal points.
- **Tertiary:** A soft, muted Teal is used sparingly for success states or subtle highlights to prevent the palette from feeling monochromatic.
- **Neutral:** A deep Navy-Black (`#0F172A`) serves as the canvas. 
- **Surface Layering:** Surfaces are not solid colors but rather semi-transparent overlays (Alpha 40-60%) with background blurs to create the "gallery" depth.

## Typography

The typography system relies on a high-contrast pairing to establish a premium editorial feel.

- **Headlines:** *Playfair Display* provides a timeless, high-fashion authority. Use generous leading and tight letter-spacing for large display sizes.
- **Body:** *Manrope* ensures modern readability with a balanced, neutral tone that doesn't compete with the headlines.
- **Labels:** *JetBrains Mono* is used for technical metadata and small labels, adding a "curated" or "cataloged" feel to the gallery interface.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy on desktop to maintain the composed look of an editorial magazine, transitioning to a fluid model on mobile.

- **Whitespace:** Use extreme padding (1.5x to 2x standard ratios) to isolate elements and signify importance.
- **Grid:** A 12-column grid with wide gutters (32px) to allow content to breathe.
- **Breakpoints:** 
  - Mobile: < 768px (4 columns)
  - Tablet: 768px - 1279px (8 columns)
  - Desktop: 1280px+ (12 columns)

## Elevation & Depth

Depth is achieved through **Glassmorphism** rather than traditional drop shadows.

- **Backdrop Blur:** All elevated surfaces must use a `20px` to `40px` blur radius.
- **Subtle Borders:** Containers are defined by a 1px "Light Leak" border—a top-left to bottom-right linear gradient (White @ 15% to White @ 0%).
- **Shadows:** Use "Ambient Shadows"—extremely soft, large-radius blurs (60px+) with very low opacity (10%) tinted with the primary Indigo color to simulate light reflecting off the surface.

## Shapes

To maintain a sophisticated and architectural feel, the design system uses "Soft" roundedness. 

- **Standard Elements:** 0.25rem (4px) corner radius for a precise, sharp look.
- **Large Containers/Cards:** 0.75rem (12px) to soften the layout without appearing "bubbly" or "juvenile."
- **Icons:** Use thin-stroke (1.5pt) linear icons with sharp terminals to match the typography.

## Components

- **Buttons:** Primary buttons use the Indigo-to-Purple gradient with a subtle glow on hover. Secondary buttons are "Ghost" style with the "Light Leak" glass border.
- **Cards:** Use a `glass-surface` class with 40% opacity background and 32px backdrop blur. Content should have 32px internal padding.
- **Inputs:** Minimalist bottom-border only or very subtle glass-filled containers. Focus state expands the border thickness slightly or adds a subtle outer indigo glow.
- **Lists:** Separated by low-opacity (10%) white lines. Use *JetBrains Mono* for list numbering or metadata to enhance the "archival" aesthetic.
- **Chips/Badges:** Small, high-contrast pills using the Tertiary Teal or Primary Indigo at 10% opacity with solid text.
- **Specialty Component - The Hero Frame:** A component designed to house primary imagery, featuring a double-border (inner glass, outer solid 1px) to mimic physical gallery framing.