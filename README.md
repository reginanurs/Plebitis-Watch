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
- Prototype login simulation

This is a **prototype for demonstration and simulation purposes only**. It is not a certified medical device and must not be used for real clinical decision-making.

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Lucide React (icons)
- Recharts (charts)

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

Login is a **front-end simulation only** — there is no backend, no real authentication server, and no password hashing. Credentials are checked against a small fictional demo user list in `src/data/users.json`.

Demo credentials (fictional, for prototype use only):

| Identitas Pengguna | Kata Sandi   |
| ------------------ | ------------ |
| `perawat1`         | `perawat123` |
| `admin`            | `admin123`   |

## Deployment

This project is a static frontend and is intended to be deployed to **Vercel** (or any static host):

- Build command: `npm run build`
- Output directory: `dist`
- `vercel.json` includes a SPA rewrite (`/(.*) → /index.html`) so client-side routes (e.g. `/pasien`, `/hasil-penilaian/:id`) work correctly when opened directly instead of returning a 404.
- No environment variables are required.

## Important Note

This is a prototype. It is **not** production authentication, a certified medical device, or a replacement for professional clinical assessment and judgment. All clinical logic (VIP Score, recommendations) follows configured rules only and never fabricates values.

## Status

All data is simulated locally using mock JSON seed data and, where persistence across sessions is needed, browser `localStorage`. There is no backend, database, or authentication server.
