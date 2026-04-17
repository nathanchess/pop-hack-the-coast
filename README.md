# Prince of Peace - Demand Intelligence Platform

A modern Next.js frontend for AI-powered demand planning and purchase order intelligence.

## Features

### Navigation Structure

- **📊 Dashboard** - Overview of demand intelligence and PO recommendations
- **📈 Demand Intelligence**
  - SKU Analysis - Deep dive into individual SKU performance
  - Channel Segmentation - Understand demand patterns across retail channels
  - Promo Detection - Identify promotional sales vs organic demand
- **🎯 Reorder Center**
  - Alerts & Actions - Critical reorder alerts and recommendations
  - Multi-Warehouse View - Inventory status across all locations
  - Draft POs - AI-generated purchase order recommendations
- **🤖 AI Agent**
  - Live Runs - Real-time agent execution visualization
  - Run History - Past executions and performance metrics
  - Model Config - Configure AI model parameters
- **🚚 Supply Chain**
  - In-Transit Inventory - Monitor shipments in transit
  - Warehouse Transfers - Track internal transfers
  - Import Shipments - International shipment status
- **📊 Data Explorer** - SQL-like table view of all data
- **📤 Export & Reports** - Generate and export reports
- **⚙️ Settings** - System preferences

## Design System

### Color Palette

- **Primary**: `#0080C8` (Prince of Peace blue)
- **Neutrals**: `#FAFAFA` to `#1A1A1A`
- **AI Accent**: `#8B7FFF` (purple)
- **Semantic Colors**: Success, Warning, Danger

### Typography

- Font: Geist Sans (modern, clean sans-serif)
- Smooth antialiasing and proper spacing

### UI Components

- Glass-morphism effects with backdrop blur
- Smooth animations (300ms cubic-bezier easing)
- Rounded corners (12px for cards, 8px for buttons)
- Hover states with subtle transforms

## Tech Stack

- **Framework**: Next.js 16.2.4 (App Router)
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript
- **Icons**: Emoji-based navigation

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
my-app/
├── app/                    # Next.js App Router pages
│   ├── agent/             # AI Agent pages
│   ├── demand/            # Demand Intelligence pages
│   ├── reorder/           # Reorder Center pages
│   ├── supply-chain/      # Supply Chain pages
│   ├── data/              # Data Explorer
│   ├── export/            # Export & Reports
│   ├── settings/          # Settings
│   ├── layout.tsx         # Root layout with sidebar
│   └── page.tsx           # Dashboard home
├── components/
│   ├── sidebar.tsx        # Main navigation sidebar
│   └── page-header.tsx    # Reusable page header
└── public/
    └── data/              # CSV data files
```

## Next Steps

1. Implement dashboard cards with AI insights
2. Build Langgraph visualization for AI agent observability
3. Create data tables with TanStack Table
4. Add SSE integration for real-time agent streaming
5. Build chart components with Recharts
6. Implement PDF export functionality
7. Add notification integrations (SMS, Email, Slack)

## Design Philosophy

- **Minimalist & Modern**: Clean interfaces with plenty of white space
- **AI-First**: Prominent AI agent insights and recommendations
- **Action-Oriented**: Easy-to-use controls for buyer actions
- **Glass-Morphism**: Smooth, translucent UI elements
- **Responsive**: Mobile-friendly layouts
