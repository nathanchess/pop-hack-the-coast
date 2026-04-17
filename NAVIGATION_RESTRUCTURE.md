# Sidebar Navigation Restructure

## Overview
Simplified and reorganized the sidebar navigation to focus on core functionality with a cleaner, more streamlined structure.

## New Navigation Structure

### Main Navigation
1. **Dashboard** - Home overview
2. **Demand Intelligence**
   - True Demand Analysis (new)
   - Promo Finder (renamed from Promo Detection)
   - Channels (simplified from Channel Segmentation)
3. **Reorder Center**
   - Alerts & Actions
   - Draft POs
   - Communications (new)
4. **AI Agent** - Single page (no sub-navigation)
5. **Data Explorer** - Single page (moved from bottom section)

### Bottom Section (After Divider)
- **Source Code (GitHub)** - External link with icon
- **Exports & Reports**
- **Settings**

## Changes Made

### Navigation Updates
- ✅ Removed Supply Chain section entirely
- ✅ Removed AI Agent sub-navigation (Live Runs, Run History, Model Config)
- ✅ Removed Multi-Warehouse View from Reorder Center
- ✅ Moved Data Explorer to main navigation
- ✅ Added Source Code (GitHub) link with external link icon
- ✅ Added visual divider before bottom section

### New Pages Created
- `/app/demand/true-demand/page.tsx` - True Demand Analysis
- `/app/demand/promo-finder/page.tsx` - Promo Finder
- `/app/demand/channels/page.tsx` - Channels (updated)
- `/app/reorder/communications/page.tsx` - Communications hub
- `/app/agent/page.tsx` - Simplified AI Agent page

### Removed Pages
- ~~`/app/demand/sku-analysis/page.tsx`~~
- ~~`/app/demand/promo/page.tsx`~~
- ~~`/app/reorder/warehouses/page.tsx`~~
- ~~`/app/agent/live/page.tsx`~~
- ~~`/app/agent/history/page.tsx`~~
- ~~`/app/agent/config/page.tsx`~~
- ~~`/app/supply-chain/*` (entire section)~~

### Icon Updates
- Added **GitHub icon** (filled style) for Source Code link
- Updated **Reorder Center icon** to clipboard/document icon (more appropriate)
- All icons remain minimalistic SVG line-art style
- No emojis used anywhere

## Visual Enhancements

### Divider Section
- Added horizontal line separator before bottom section
- Creates clear visual separation between main nav and utility links
- Subtle gray divider matches glass-morphism aesthetic

### External Link Indicator
- GitHub link shows small external link icon (↗)
- Opens in new tab with `target="_blank"`
- Proper security attributes (`rel="noopener noreferrer"`)

### Animations
- All new pages include fade-up animations
- Staggered delays for smooth appearance
- Glass-panel styling consistent throughout

## Route Structure

```
/                           → Dashboard
/demand                     → Demand Intelligence (overview)
  /true-demand              → True Demand Analysis
  /promo-finder             → Promo Finder
  /channels                 → Channels
/reorder                    → Reorder Center (overview)
  /alerts                   → Alerts & Actions
  /draft-pos                → Draft POs
  /communications           → Communications
/agent                      → AI Agent (single page)
/data                       → Data Explorer
/export                     → Exports & Reports
/settings                   → Settings
```

## Benefits

1. **Simplified Navigation**: Reduced from 8 main sections to 5
2. **Focused Features**: Removed rarely-used pages
3. **Clearer Hierarchy**: Main actions vs. utility functions
4. **Better Grouping**: Related features consolidated
5. **Modern Design**: Clean icons, glass effects, smooth animations

## GitHub Integration

The Source Code link provides quick access to the repository:
- Positioned in bottom section for easy access
- External link icon indicates it opens new window
- Can be updated to point to actual repository URL
