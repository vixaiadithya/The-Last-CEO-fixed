# The Last CEO: RPG Business Simulator (Frontend Console)

A premium, highly interactive sci-fi RPG-style business simulation game built with React, TypeScript, and Vite. Define your founder credentials, choose your starting capital, and guide your venture quarterly through strategic operations parameters to achieve a legendary Unicorn exit in Year 2035 or face corporate bankruptcy.

---

## 🚀 Key Features

*   **CEO Profile HUD Configuration:** Customize founder parameters, industry classes (Technology, Healthcare, Finance, Retail, Manufacturing), and description parameters.
*   **Runway Funding Tiers:** Choose your operational difficulty scale:
    *   **Bootstrapper:** $100K (Hard Mode - tight margins, operational pressure)
    *   **Seed Round:** $500K (Medium Mode - balanced starting runway)
    *   **Venture Backed:** $1.5M (Normal Mode - standard credit runway)
    *   **Enterprise Scale:** $5.0M (Easy Mode - focus on scaling and long-term yields)
*   **Console Operations Dashboard:** Monitor core corporate health metrics (Reserves budget, Cumulative ROI percentage, Staff Workforce capacity, Vitality Morale index) under real-time telemetry scans.
*   **Decisions Engine:** Select strategic options each quarter (e.g. Hire employees, Launch marketing campaigns, Advanced R&D products) and observe instantaneous metrics shifts.
*   **AI Resolution Reports:** Review LLM-simulated quarterly evaluations detailing expenses, revenues, recommendations, and highlighted risk vectors.
*   **Outcome Achival ending Matrix:** Discover 8 unique endings based on your simulation variables, complete with unlockable retro-scifi achievement badges:
    1.  `🦄 Unicorn Exit` - Survive to 2035 with >$3M budget or >150% ROI
    2.  `🔔 IPO Public Listing` - Survive with >=30 staff and >=$2M budget
    3.  `💼 Megacorp Acquisition` - Exit with >$1.5M budget or >100% ROI
    4.  `👑 Bootstrap Legend` - Complete simulation starting with $100K bootstrapper capital
    5.  `☕ Sustainable Lifestyle` - Prioritize life balance over hype scaling (<15 staff, <=$1.5M budget)
    6.  `🤖 Rogue AI Singularity` - Technology sector startup with >200% ROI
    7.  `🤝 Talent Acquisition` - Face bankruptcy but maintain high ROI (>50%) or morale (>80%)
    8.  `💥 Crash & Burn` - Run out of budget capital before Year 2035

---

## 🛠 Technology Stack

*   **Framework:** React 18 + Vite (fast HMR bundles)
*   **State Management:** Zustand (lightweight global state store)
*   **Styling:** Vanilla Tailwind CSS with custom neon glowing effects, animations, scanlines, and scifi-matrix sweeps
*   **Interactive Visualizations:** Recharts (responsive line chart diagnostics)
*   **Icon Library:** Lucide React
*   **API Client:** Axios (REST server ready)
*   **Language:** TypeScript (strongly typed architecture)

---

## 💻 Setup & Development

### 1. Installation
Clone the repository and install dependencies inside the `frontend` folder:
```bash
cd frontend
npm install
```

### 2. Run Locally
Start the local Vite development server:
```bash
npm run dev
```
By default, the server runs on http://localhost:5173 (or tries adjacent ports like 5174/5175 if occupied).

### 3. Production Build
Compile and bundle the frontend distribution files:
```bash
npm run build
```
Build files will be generated under the `dist/` directory, optimized for rapid static hosting.

---

## 📂 Architecture Structure

```
frontend/
├── public/                 # Static vector assets
└── src/
    ├── assets/             # Images and design textures
    ├── components/
    │   ├── dashboard/      # Telemetry graphs and HUD metric cards
    │   ├── game/           # Strategic timeline and quarterly decision engine
    │   ├── layout/         # Scifi navigation bars and sidebar menus
    │   ├── shared/         # Loading indicators, LLM modals, game over dialogs
    │   └── ui/             # Reusable custom UI components (Buttons, Cards, Inputs, Labels)
    ├── hooks/              # Custom hook handlers (game loops and API drivers)
    ├── lib/                # API client axios instance and styling utils
    ├── pages/              # Primary route view entrypoints (Home, Console Engine, Outcome matrix)
    ├── store/              # Zustand state store
    └── types/              # TypeScript interface definitions
```
