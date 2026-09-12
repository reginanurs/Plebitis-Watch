# PLEBITIS WATCH

Plebitis Watch is a front-end-only prototype for a digital nursing application. It is designed to demonstrate and simulate:

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

This is a **prototype for demonstration and simulation purposes only**. It is not a certified medical device and must not be used for real clinical decision-making. As of Phase 20, authentication is backed by a real Supabase project; clinical/patient data still lives in local mock JSON + `localStorage` and will be migrated to Supabase in later phases.

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Lucide React (icons)
- Recharts (charts)
- Supabase (Auth — clinical data migration in progress, see Status below)

## Project Structure

```
src/
├── components/   # Reusable UI components
├── pages/        # Route-level page components
├── layouts/      # Shared page layouts
├── data/         # Local mock/seed data (JSON)
├── hooks/        # Custom React hooks
├── utils/        # Helper functions
├── types/        # Shared TypeScript types
├── App.tsx
├── main.tsx
└── index.css
```

## Supabase Setup

Authentication requires a Supabase project.

1. Copy `.env.example` to `.env` and fill in your project's URL and publishable/anon key (from Supabase Dashboard → Project Settings → API).
2. Run [`supabase/schema.sql`](supabase/schema.sql) once in Supabase Dashboard → SQL Editor. It creates the `profiles` table (used for login) plus all clinical-data tables as forward-looking foundation for later migration phases, with Row Level Security enabled.
3. Create demo users manually in Dashboard → Authentication → Users → Add user, with **Auto Confirm User** enabled and User Metadata such as:
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

Authentication is real, backed by Supabase Auth. Clinical/operational data (patients, PIVCs, assessments, photos, reminders, notifications) is still simulated locally using mock JSON seed data and browser `localStorage`; migrating each of these to Supabase is planned for later phases.
