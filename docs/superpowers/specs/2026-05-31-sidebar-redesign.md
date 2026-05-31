# Sidebar Redesign

## Scope

Transform the 48px icon-only sidebar into a 180px classic left-navigation panel with icon+text labels, 3D floating button effects, and animated transitions.

## 1. Layout

### IndexSidebar
- Width: **180px** (`w-[180px]`)
- Background: `bg-white`
- Border: `border-r border-stone-100` (separates from main content)
- Padding: `px-3 py-6`
- Flex column, gap between sections

### Sections (top → bottom)
1. **Brand area** — app icon (small SVG) + "Gallery" text, subtle, top-left, `pt-2 pb-6`
2. **Nav buttons** — 3 buttons (Home / Starred / Folders), icon + Chinese label
3. **Spacer** — `flex-1`
4. **Footer slot** — reserved empty space for future use

### PackSidebar
Same width and styling. Two buttons:
- "返回" (Back) — icon + label
- "打开文件夹" (Open) — icon + label
- Brand area shows pack title (truncated)

## 2. 3D Floating Buttons

### Structure
```
<button class="relative flex items-center gap-3 w-full h-11 px-3 
  rounded-xl transition-all duration-300 ease-bounce-sm btn-press
  [active/rest classes...]">
  <svg ... />           ← icon, 20x20
  <span ...>Home</span>  ← label, 13px
</button>
```

### States

| State | Shadow | Transform | Text Color | BG |
|-------|--------|-----------|------------|-----|
| Default | `shadow-sm` | `translate-y-0` | `text-stone-500` | `bg-transparent` |
| Hover | `shadow-md` | `-translate-y-0.5` | `text-stone-700` | `bg-stone-50` |
| Active | `shadow-inner` | `translate-y-px` | `text-white` | `bg-violet-500` |
| Active hover | `shadow-inner` | `translate-y-px` | `text-white` | `bg-violet-500` |

### Icon behavior
- Default: `text-stone-400`
- Hover: `text-stone-500`
- Active: `text-white`
- Hover rotation: `group-hover:rotate-6 transition-transform duration-300`

### Surface highlight
- Subtle gradient overlay on buttons for 3D sheen:
```
bg-gradient-to-b from-white/10 to-transparent
```
Applied as a pseudo-layer (inner span or bg layer).

## 3. Animations

- Button transition: `duration-300 ease-bounce-sm` (already in tailwind config)
- Icon rotation on hover: `group-hover:rotate-6`
- Activation: `animate-pop` on click
- Brand area: `animate-fade-in` on mount

## 4. Content.tsx Changes

- Sidebar `<nav>` width: `w-12` → `w-[180px]`
- Remove `items-center` (buttons now full-width left-aligned)
- Add `bg-white border-r border-stone-100`
- `gap-6` → `gap-1` (buttons closer together)

## 5. File Changes

| Action | File |
|--------|------|
| REWRITE | `src/components/sidebar/index-sidebar.tsx` |
| REWRITE | `src/components/sidebar/pack-sidebar.tsx` |
| MODIFY | `src/components/content.tsx` — sidebar width + styling |

## 6. Dependencies

No new dependencies. All classes already in `tailwind.config.js`: `ease-bounce-sm`, `animate-pop`, `animate-fade-in`, `shadow-sm/md`.
