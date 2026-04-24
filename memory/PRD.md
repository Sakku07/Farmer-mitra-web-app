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

## Backlog (P1 / P2)
- P1: Admin panel — add image upload for products/schemes (object storage)
- P1: Favorite / save scheme for later
- P1: Push notifications for weather alerts
- P2: Farmer forum / Q&A
- P2: Voice search (for low-literacy users)
- P2: Offline support (PWA / service worker)
- P2: SMS alerts for price changes via Twilio
