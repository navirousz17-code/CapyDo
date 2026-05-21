# 🌿 TODEI-LIST

A cozy, fully functional task manager built with **Next.js 14**, **Supabase**, and **Tailwind CSS**.

![TODEI-LIST](./public/splashlogo.png)

---

## ✨ Features

- 🔐 **Real Supabase Authentication** – Sign up, login, protected routes, session persistence
- ✅ **Full Task CRUD** – Create, edit, delete, complete, archive tasks
- 🗂️ **Categories** – Color-coded with icons, auto-seeded defaults on signup
- 📅 **Due Dates** – Overdue detection, today filter
- ⚡ **Priority Levels** – Low, Medium, High, Urgent
- 🔄 **Realtime Sync** – Live updates via Supabase Realtime
- 📊 **Dashboard** – Stats, completion rate, recent tasks
- 🔍 **Search & Filter** – By status, category, due date, priority
- 📱 **Responsive** – Mobile-first with collapsible sidebar

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <your-repo>
cd todei-list
npm install
```

### 2. Set Up Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the migration:

```bash
# Copy and run contents of:
supabase/migrations/001_initial_schema.sql
```

3. In Supabase Dashboard → **Authentication → Settings**:
   - Set **Site URL**: `http://localhost:3000`
   - Add **Redirect URLs**: `http://localhost:3000/api/auth/callback`
   - Optionally disable email confirmation for easier local dev

### 3. Configure Environment Variables

```bash
cp .env.example .env.local
```

Fill in your values from **Supabase → Settings → API**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run the App

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) 🎉

---

## 📁 Project Structure

```
todei-list/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout
│   ├── loading.tsx                 # Global loading
│   ├── not-found.tsx               # 404 page
│   ├── auth/
│   │   ├── layout.tsx              # Auth layout (split panel)
│   │   ├── login/page.tsx          # Login page
│   │   └── signup/page.tsx         # Signup page
│   ├── dashboard/
│   │   ├── layout.tsx              # Dashboard shell (sidebar)
│   │   ├── loading.tsx             # Dashboard skeleton
│   │   ├── page.tsx                # Dashboard home
│   │   ├── tasks/page.tsx          # Task management
│   │   └── categories/page.tsx     # Categories management
│   └── api/
│       ├── auth/callback/route.ts  # OAuth callback + category seeding
│       ├── tasks/
│       │   ├── route.ts            # GET all / POST create
│       │   └── [id]/route.ts       # GET one / PATCH / DELETE
│       └── categories/
│           ├── route.ts            # GET all / POST create
│           └── seed/route.ts       # Seed default categories
├── components/
│   ├── layout/
│   │   └── DashboardShell.tsx      # Sidebar + topbar layout
│   └── tasks/
│       ├── TaskCard.tsx            # Individual task card
│       └── TaskFormModal.tsx       # Create/edit task modal
├── hooks/
│   ├── useAuth.ts                  # Auth state + signOut
│   ├── useRealtime.ts              # Supabase realtime subscriptions
│   └── useTaskStore.ts             # Zustand global state
├── lib/
│   └── supabase/
│       ├── client.ts               # Browser Supabase client
│       ├── server.ts               # Server Supabase client
│       └── database.types.ts       # Generated DB types
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # Full DB schema + RLS + triggers
├── types/index.ts                  # TypeScript interfaces
├── utils/index.ts                  # Helper functions
├── styles/globals.css              # Tailwind + custom CSS
├── middleware.ts                   # Route protection
├── tailwind.config.ts              # Custom theme (bark, moss, cream palette)
├── next.config.mjs
├── tsconfig.json
└── .env.example
```

---

## 🎨 Design System

Custom palette inspired by earthy, cozy aesthetics:

| Token | Color | Usage |
|-------|-------|-------|
| `bark-*` | Browns | Text, buttons, borders |
| `moss-*` | Greens | Success, categories, accents |
| `cream-*` | Warm whites | Backgrounds, cards |
| `parchment` | Warm beige | Page background |

Fonts: **Baloo 2** (headings) + **Nunito** (body)

---

## 🔒 Security

- All routes protected via Next.js middleware
- Supabase Row Level Security (RLS) on all tables
- Server-side session validation on all API routes
- No sensitive keys exposed to client

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Auth + DB | Supabase |
| State | Zustand |
| Styling | Tailwind CSS |
| Animations | Framer Motion ready, CSS keyframes |
| Icons | Lucide React |
| Toasts | React Hot Toast |
| Language | TypeScript |

---

## 🌿 Made with love for TODEI-LIST
