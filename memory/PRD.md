# Farmer Helper — Product Requirements Document

## Problem Statement (original)
Build a full-scale, production-ready 'Farmer Helper' Web Application using React.js and Tailwind CSS. The target audience is rural Indian farmers, so the UI must be extremely clean, intuitive, and mobile-first. Core features: Mandi Bhav table/cards, Weather widget, Government Schemes, Affiliate Product grid, Google AdSense placeholders. UI/UX: Nature-inspired green palette, large fonts, Lucide icons, bottom tab bar. Error handling, mobile-first, performance, clean folder structure, hooks, z-index.

## User Personas
- **Rural Indian Farmer (primary)** — views prices, weather, schemes, products on a low-end mobile in sunlight.
- **Admin (content manager)** — logs in and manages Schemes & Products.

## Architecture
- **Frontend**: React 19 + Tailwind + Shadcn UI + lucide-react + i18next (EN/HI/MR/PA)
- **Backend**: FastAPI + MongoDB (motor) + bcrypt + PyJWT
- **External APIs**: data.gov.in (Mandi Bhav), OpenWeather (weather)
- **Auth**: JWT Bearer tokens in localStorage (admin-only)

## Core Requirements
- Mobile-first, 360px-wide safe, bottom tab nav
- Primary green #059669, white, soft grays
- Min 16px font for readability; high contrast
- Lucide icons everywhere
- AdSense placeholder divs (top banner, sidebar, in-list)
- Error + loading states on every API call
- Language switcher EN/HI/MR/PA

## Implemented (Feb 2026 — initial MVP)
- Backend endpoints: auth/login, auth/me, mandi (data.gov.in proxy), weather (OpenWeather proxy), schemes CRUD, products CRUD
- Admin seeding + content seeding (6 schemes, 6 products)
- Frontend pages: Home, Mandi Bhav, Weather, Schemes, Products, Admin Login, Admin Dashboard
- Bottom tab bar nav, top header with language switcher
- AdSense placeholder component
- i18n with 4 languages

## Implemented (Feb 2026 — Pro-Mandi upgrade, iteration 2)
- **Dynamic District dropdown** dependent on selected State (with 1-hour in-memory cache)
- **Refresh button** on Mandi + Insights pages (re-fetches, shows "Updated: HH:MM:SS")
- **'Made with Emergent' badge removed** via MutationObserver in App.js
- **Clickable crop cards** → new `/insights/:commodity` page
- **Market Insights page** with:
  - Min / Modal / Max price stat cards
  - 7-Day Price Trend Bar Chart (recharts) with green/amber deltas
  - Market Arrivals list (price spread, % diff)
  - Historical Price list (up to 100 records)
  - Auto-adaptive "Additional Info" block (shows any field returned by data.gov.in)
  - Professional "Data Updating" empty state when data missing
- **Skeleton loaders** (shimmer animation) replace spinners everywhere
- **Emerald + Slate** color palette, all Lucide icons
- Auto-adaptive UI that renders any extra data.gov.in fields under "Additional details"
- Insights translated into EN/HI/MR/PA

## Implemented (Feb 2026 — Control Center + Performance, iteration 3)
- **Home redesigned**: 4 titled feature containers with distinct tints — Weather (light emerald), Mandi (slate), Schemes (amber), Products (slate). Bold Lucide icons in each header.
- **Global Refresh** button + "Last updated: HH:MM:SS" timestamp on Home
- **Parallel data fetching** with `Promise.all` on Home (zero-lag)
- **30-minute localStorage SWR cache** (`fh_cache::*` keys) — instant reloads with background revalidation
- **500ms debounce** on Mandi search input
- **Notifications system**:
  - Backend: `/api/notifications` CRUD + `broadcast-scheme/{id}` + `broadcast-product/{id}` endpoints
  - Frontend: `NotificationsProvider` polls every 30s, triggers browser Notification API + sonner toast
  - **Bell in TopHeader** with unread badge + dropdown
  - **Admin → "Notify Users" button** on every Scheme & Product row
  - **Admin → Notifications tab** with custom broadcast form + history + delete
- **Admin Dashboard redesigned** with left sidebar (Govt Schemes / Store Products / Notifications / Back to App) on desktop; mobile drawer with hamburger menu
- **Permanent badge removal** — `#emergent-badge` content stripped from `public/index.html` at build time + MutationObserver as safety net
- **Upstream reliability** — data.gov.in calls now use 45s timeout + 1 automatic retry

## Implemented (Feb 2026 — AdSense readiness + deployment, iteration 4)
- **Admin credentials updated** to `sakkusaifi07@gmail.com` / `Aa670623@`; old admin auto-purged on startup
- **Backend slimmed for production**: removed `Request`/`logging` wrapper noise; switched to `os.environ.get(...)` config; added `if __name__ == "__main__": uvicorn.run(host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))` for Railway/Render
- **`requirements.txt` reduced to 9 packages** (fastapi, uvicorn[standard], motor, pymongo, pydantic[email], requests, PyJWT, bcrypt, python-dotenv) — emergentintegrations, pandas, numpy, pytest, black, isort, flake8, mypy, boto3, requests-oauthlib, cryptography, passlib, python-jose, jq, typer, python-multipart, tzdata all removed
- **`public/index.html` cleaned** — removed PostHog telemetry block, emergent-main.js, emergent-badge stub. Title now "Farmer Helper — Mandi Bhav, Weather & Govt Schemes"
- **Professional AdSense slots** — new `<AdSensePlaceholder>` renders `<ins class="adsbygoogle">` automatically when `REACT_APP_ADSENSE_CLIENT` + `slotId` are set; otherwise shows clean "Sponsored / Advertisement / Your ad could be here" placeholder with reserved height (no CLS post-approval)
- **AdSense-approval pages added**:
  - `/about` — full app description, principles, decision-disclaimer
  - `/terms` — purpose, informational nature, non-guarantee disclaimer, user-responsibility, AdSense disclosure
  - `/privacy` — minimal-data collection, third-party services, AdSense cookies + opt-out links
  - `/contact` — verified support email **shaklensaifi@gmail.com** prominent, copy-button + mailto form + FAQ
- **Site-wide Footer** with About / Terms / Privacy / Contact links + data-source credits
- **Tested**: 34/34 backend tests + 100 % frontend acceptance criteria passed; lint clean

## Backlog (P1 / P2)
- P1: Admin panel — add image upload for products/schemes (object storage)
- P1: Favorite / save scheme for later
- P1: Push notifications for weather alerts
- P2: Farmer forum / Q&A
- P2: Voice search (for low-literacy users)
- P2: Offline support (PWA / service worker)
- P2: SMS alerts for price changes via Twilio
