<p align="center">
  <img src="app/icon.svg" width="64" height="64" alt="Blockly icon" />
</p>

<h1 align="center">Blockly</h1>

<p align="center">
  Self-hosted school schedule &amp; task tracker for individual students.<br/>
  <strong>One Supabase project = one student's data.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-blue?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/MUI-7-007FFF?logo=mui" alt="MUI" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/PWA-installable-5A0FC8?logo=pwa" alt="PWA" />
  <img src="https://img.shields.io/badge/license-MIT-green" alt="MIT" />
</p>

---

## Features

- **Today view** — color-coded timeline with "NOW" / "UP NEXT" indicators, day progress bar, and greeting
- **Week view** — 5- or 7-day grid showing every block per day at a glance
- **Calendar** — month view to set schedule overrides and mark holidays
- **Tasks** — due dates, class linking, relative dates ("Due tomorrow"), overdue highlighting
- **Quick-add** — add a task directly from the Today tab
- **Schedule templates** — Traditional, A/B, 4×4, Rotating, and Custom presets
- **User preferences** — 24h/12h clock, default schedule type, show weekends (saved locally)
- **Dark mode** — full light/dark toggle
- **PWA** — installable on any device
- **Keyboard shortcuts** — `←/→` navigate days, `Ctrl+1‑5` switch tabs

## Architecture

```
Browser (Student)
    ↓
Supabase JS Client
    ↓
Supabase
  ├── Auth (email + optional OAuth)
  ├── PostgreSQL (4 tables)
  └── Row Level Security (RLS)
```

No backend server. No custom API layer. Frontend talks directly to Supabase.

## Tech Stack

| Layer       | Technology                                    |
|-------------|-----------------------------------------------|
| Framework   | Next.js 15 (App Router)                       |
| UI          | React 19, Material UI 7, Material Icons       |
| Fonts       | Outfit (headings), Inter (body)               |
| Auth        | Supabase Auth (email/password + OAuth)        |
| Database    | Supabase PostgreSQL with RLS + FORCE RLS      |
| Dates       | Day.js                                        |
| PWA         | next-pwa                                      |

---

## Setup

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- A free [Supabase](https://supabase.com) account

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/Blockly-Student-Tracker.git
cd Blockly-Student-Tracker
npm install
```

### 2. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Copy your **Project URL** and **anon public key** from **Settings → API**.

### 3. Run the Database Script

Open the **SQL Editor** in your Supabase project and paste the contents of [`supabase/setup.sql`](supabase/setup.sql), then click **Run**.

This creates four tables (`schedule_types`, `schedule_blocks`, `schedule_overrides`, `tasks`) with:
- Row Level Security on every table
- `FORCE RLS` enabled — even table owners go through policies
- Cross-table ownership foreign keys (users can only reference their own data)
- CHECK constraints on times, indices, and lunch settings

### 4. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key
```

#### Optional: OAuth Providers

To enable social sign-in (Google, GitHub, etc.):

1. In Supabase Dashboard → **Authentication → Providers**, enable desired providers and fill in their credentials.
2. Add them to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_AUTH_PROVIDERS=google,github
```

Supported providers: `apple`, `azure`, `discord`, `facebook`, `github`, `gitlab`, `google`, `linkedin_oidc`, `twitter`, and [more](https://supabase.com/docs/guides/auth/social-login).

### 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to sign in — create an account with email/password.

### 6. Load Demo Data (Optional)

After signing in, click **Load Demo Data** in the top bar to seed sample schedules, blocks, tasks, and an override.

---

## Deployment

Deploy to any platform that supports Next.js:

| Platform         | How                                           |
|------------------|-----------------------------------------------|
| **Vercel**       | Connect GitHub repo, add env vars, deploy     |
| **Netlify**      | Same as above, uses `@netlify/plugin-nextjs`  |
| **Cloudflare**   | `npx @cloudflare/next-on-pages` or Pages      |
| **Self-hosted**  | `npm run build && npm start`                  |

Make sure to set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as environment variables on your host.

---

## Security

| Principle                  | Implementation                                                |
|----------------------------|---------------------------------------------------------------|
| Auth                       | Supabase Auth only — email/password + optional OAuth          |
| Row isolation              | Every table has `user_id` + RLS policy `WHERE user_id = auth.uid()` |
| Force RLS                  | `ALTER TABLE ... FORCE ROW LEVEL SECURITY` on all tables       |
| Cross-table integrity      | Composite FK `(id, user_id)` prevents linking to other users' rows |
| No secrets in frontend     | Only the anon key is used — never the service role key         |
| Frontend treated as untrusted | All authorization enforced server-side by Supabase            |

### Recommended Production Settings

- **Never** put the service role key in `.env.local` or frontend code.
- In Supabase → **Authentication → URL Configuration**, restrict redirect URLs to your production domain.
- If single-user: disable sign-up in Supabase after creating your account.
- Enable email confirmation in Supabase → **Authentication → Email Templates**.

---

## Project Structure

```
app/
  layout.tsx          Root layout, fonts, metadata, providers
  page.tsx            Auth gate → Dashboard
  signin/page.tsx     Sign-in page
  icon.svg            Favicon (auto-served by Next.js)
  apple-icon.svg      Apple touch icon
  globals.css         Base styles

components/
  AppProviders.tsx     MUI theme, dark mode, block colors
  AuthGate.tsx         Session check → redirect or render Dashboard
  Dashboard.tsx        Tab shell (Today, Week, Calendar, Tasks, Setup)
  DayView.tsx          Daily schedule timeline
  WeekView.tsx         Weekly grid view
  CalendarManager.tsx  Month calendar for overrides
  TaskManager.tsx      Task CRUD
  ScheduleManager.tsx  Schedule type & block CRUD with templates
  SettingsPanel.tsx    User preferences UI
  SupabaseSignIn.tsx   Custom auth form (sign in / sign up / reset)
  BlocklyLogo.tsx      Logo component
  DemoDataButton.tsx   Seeds demo data
  DevPanel.tsx         Dev-only floating tools (hidden in production)

lib/
  supabase.ts          Supabase client init
  types.ts             TypeScript interfaces
  preferences.tsx      User preferences context + formatTime utility

public/
  icons/               PWA icons (SVG)
  manifest.json        PWA manifest

supabase/
  setup.sql            Database schema + RLS policies
```

---

## Environment Variables

| Variable                              | Required | Description                                      |
|---------------------------------------|----------|--------------------------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL`            | Yes      | Your Supabase project URL                        |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`       | Yes      | Your Supabase anon/public key                    |
| `NEXT_PUBLIC_SUPABASE_AUTH_PROVIDERS`  | No       | Comma-separated OAuth providers (e.g. `google,github`) |

---

## Development

```bash
npm run dev       # Start dev server on :3000
npm run build     # Production build
npm run lint      # ESLint
npx tsc --noEmit  # Type check
```

A small **Dev Tools** panel (bug icon, bottom-left) appears only in development mode with shortcuts to reset preferences and clear storage.

---

## License

MIT — see [LICENSE](LICENSE).
