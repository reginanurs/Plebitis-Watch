# PLEBITIS WATCH

Plebitis Watch is a front-end application, backed by Supabase, for a digital nursing prototype. It is designed to demonstrate and simulate:

- Patient management
- Peripheral Intravenous Catheter (PIVC) monitoring
- VIP Score assessment (Visual Infusion Phlebitis Scale)
- Insertion-site photo documentation
- Assessment history
- VIP Score trend visualization
- Monitoring reminders
- Notifications
- Education
- Real authentication via Supabase Auth

This is a **prototype for demonstration and simulation purposes only**. It is not a certified medical device and must not be used for real clinical decision-making. All clinical/operational data (patients, PIVCs, assessments, photos, reminders, notifications, reminder settings) and authentication are backed by a real Supabase project — see Status below.

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Lucide React (icons)
- Recharts (charts)
- Supabase (Auth, Postgres, Storage)

## Project Structure

```
src/
├── components/   # Reusable UI components
├── pages/        # Route-level page components
├── layouts/      # Shared page layouts
├── data/         # Static app config (VIP rules, recommendations, education, default reminder settings)
├── hooks/        # Custom React hooks
├── utils/        # Helper functions
├── types/        # Shared TypeScript types
├── App.tsx
├── main.tsx
└── index.css
```

## Supabase Setup

The app requires a Supabase project — it is the only backend, for both authentication and all clinical/operational data.

1. Copy `.env.example` to `.env` and fill in your project's URL and publishable/anon key (from Supabase Dashboard → Project Settings → API).
2. Run [`supabase/schema.sql`](supabase/schema.sql) once in Supabase Dashboard → SQL Editor. It creates the `profiles` table (used for login), every clinical-data table (patients, pivcs, assessments, photos, reminders, notifications, reminder_settings), and a private `photos` Storage bucket — all with Row Level Security enabled.
3. Run [`supabase/seed.sql`](supabase/seed.sql) afterward to populate demo patients/PIVCs/assessments/reminders (matching the app's original mock data). Demo insertion-site photos are not included — those require a real Storage upload, so the "Dokumentasi Foto" timeline starts empty for seed patients until new photos are captured through the app.
4. Create demo users manually in Dashboard → Authentication → Users → Add user, with **Auto Confirm User** enabled and User Metadata such as:
   ```json
   { "name": "Perawat Demo", "role": "Perawat" }
   ```
   A trigger auto-creates the matching `profiles` row from this metadata. `name`/`role` are shown in the app header.

Never commit `.env` — it holds real credentials. `.env.example` holds placeholders only.

## Run Locally

```bash
npm install
npm run dev
```

Then open the URL shown in the terminal (typically http://localhost:5173).

## Build

```bash
npm run build
```

Output is generated in `dist/`.

## Production Preview

```bash
npm run preview
```

Serves the production build locally so you can verify it before deploying.

## Demo Login

Login uses **real Supabase Auth** (email + password) — there are no hardcoded demo credentials in the codebase. Create accounts yourself following the Supabase Setup section above, then sign in with the email/password you chose when creating each user in the Dashboard.

## Deployment

This project is a static frontend and is intended to be deployed to **Vercel** (or any static host):

- Build command: `npm run build`
- Output directory: `dist`
- `vercel.json` includes a SPA rewrite (`/(.*) → /index.html`) so client-side routes (e.g. `/pasien`, `/hasil-penilaian/:id`) work correctly when opened directly instead of returning a 404.
- Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables in the hosting provider (e.g. Vercel Project Settings → Environment Variables) so the deployed build can authenticate.

## Important Note

This is a prototype. It is **not** a certified medical device or a replacement for professional clinical assessment and judgment. All clinical logic (VIP Score, recommendations) follows configured rules only and never fabricates values.

## Status

Authentication and all clinical/operational data (patients, PIVCs, assessments, photos, reminders, notifications, reminder settings) are backed by Supabase — Postgres (with Row Level Security), Storage for photos, and Supabase Auth. `src/data/*.json` now holds only static app configuration (VIP Score rules, recommendations, education content, default reminder settings), not patient/clinical records. There is no `localStorage`-based persistence left in the app.
