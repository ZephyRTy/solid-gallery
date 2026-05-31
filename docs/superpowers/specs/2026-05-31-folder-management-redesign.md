# Folder Management Redesign

## Scope

Refactor pack selection, folder add/move UI, and FolderPage interactions. Keep manage-mode toggle paradigm; replace modal dialog with bottom action bar + slide-in drawer.

## 1. Selection Mode & Bottom Action Bar

### Entry
- TopBar right side: a "select" icon button to enter manage mode
- Escape key or clicking empty area exits manage mode

### UI states
| State | Behavior |
|-------|----------|
| Normal | Pack cards: click → navigate to detail. No checkboxes visible. |
| Managing | Checkboxes appear on all cards. Bottom action bar slides up. |

### Bottom Action Bar
- Fixed at bottom of viewport, `animate-slide-up`
- Left: "已选 N 个" count badge
- Right actions:
  - **Move to folder** (opens drawer)
  - **Batch star/unstar**
  - **Select all / Deselect all**
- Exiting manage mode clears selection and hides bar

### File changes
- `src/components/top-bar/index.tsx` — add select toggle button
- `src/components/image-components/index-item.tsx` — checkbox stays, manage-mode detection unchanged
- New: `src/components/selection-bar/index.tsx` — bottom action bar component
- `src/components/content.tsx` — render SelectionBar when `isManaging()`

## 2. Folder Selection Drawer

Replaces the center-modal `FolderDialog`.

### Layout
- **Width**: 320px (w-80)
- **Position**: Fixed right edge, full height
- **Animation**: `translate-x-full → translate-x-0` (slide-in-right)
- **Overlay**: None or barely-visible (transparent, click-to-close)

### Header
- Title: "移动到文件夹"
- Close button (X icon, top-right)

### Body (top → bottom)
1. **Search bar** — full-width input, filters folder list via `fuzzyMatch`
2. **New folder row** — "+" button, when clicked becomes inline input + "Add" / "Cancel"
3. **Folder list** — scrollable, each row: folder icon + name + count badge
   - Selected folder: `bg-violet-50 text-accent-violet`
   - Hover: `bg-stone-50`
4. **Footer** — "取消" (secondary) + "移动到此文件夹" (violet solid, disabled when none selected)

### Behavior
- Selecting a folder → enable confirm button
- Confirm → call `galleryOperator.addFileToDir()` → close drawer → exit manage mode → refresh
- Opening drawer resets search text and collapses new-folder row

### File changes
- Delete: `src/components/dialog/folder-dialog.tsx`
- New: `src/components/drawer/folder-drawer.tsx`
- Update: `src/components/page-toolbar/index.tsx` — remove folder dialog trigger (handled by SelectionBar)

## 3. FolderPage Optimizations

Keep left-sidebar + right-grid layout. Enhancements:

### Folder List Sidebar
- **Add folder**: "+" button next to search icon in header. Click → inline input appears, confirm on Enter or "Add" button, cancel on Escape.
- **Right-click menu** (new): on folder item → popup with "Rename" / "Delete"
  - Rename: inline edit the title
  - Delete: confirmation prompt then remove
- **Hover actions**: "..." icon appears on folder row hover, click opens same right-click menu
- Active indicator: violet left border (`border-l-2 border-accent-violet`), keeps current style

### URL Sync
- Replace `sessionStorage.getItem('currentDir')` with URL search param `?dir=<id>`
- On mount: read `?dir=` from URL, fall back to first folder
- On folder click: `setSearchParams({ dir: item.id.toString() })`

### Styling
- Folder items: slightly larger hit area, 48px height
- Folder count badge: muted, right-aligned
- Search stays at top, same style as current

### File changes
- `src/components/folder-list/index.tsx` — add folder creation, right-click menu, URL param sync, hover actions
- `src/components/pages/folder.tsx` — update to use URL params instead of sessionStorage

## 4. Shared State

| Signal | Purpose | Set by |
|--------|---------|--------|
| `signalStore.isManaging` | Whether manage mode is active | TopBar select button, Escape key |
| `signalStore.selectedPacks` | Array of selected pack IDs | PackItem checkbox toggles |
| `signalStore.drawerVisible` | Whether folder drawer is open | SelectionBar "move" button, drawer close |

## 5. Animations (add to tailwind.config.js if missing)

- `slide-up`: `0% { transform: translateY(100%) } 100% { transform: translateY(0) }`
- `slide-in-right`: `0% { transform: translateX(100%) } 100% { transform: translateX(0) }`

## 6. Components Map

```
Before                              After
├── dialog/folder-dialog.tsx   →   (deleted)
├── page-toolbar/index.tsx     →   (simplified: remove folder button)
└── ─                          →   selection-bar/index.tsx (new)
                                  drawer/folder-drawer.tsx (new)
```

## 7. What Stays the Same

- `galleryOperator.getDirMap()`, `addNewDir()`, `addFileToDir()` — no changes
- `galleryOperator.getPacks()` for DirContent mode — no changes
- `PackItem` checkbox logic — no changes
- `signalStore` shared signal infrastructure — no changes
- TopBar window controls — no changes
- Sidebar nav (IndexSidebar, PackSidebar) — no changes
