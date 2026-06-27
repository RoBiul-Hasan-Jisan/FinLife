# FinLife — Personal Finance & Life Manager

A full-stack personal finance and life management app built with Next.js, Express, Firebase Auth, and MongoDB Atlas.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, Tailwind CSS 4, Recharts |
| Backend | Node.js, Express |
| Auth | Firebase Authentication |
| Database | MongoDB Atlas |
| State | React Context API |

## Features

- **Authentication** — Firebase email/password login, register, logout
- **Expenses** — Track spending with categories and dates
- **Income** — Log all income sources
- **Budgets** — Set category budgets by period
- **Savings Goals** — Track progress toward financial goals
- **Investments** — Portfolio tracking with gain/loss
- **Subscriptions** — Monitor recurring payments
- **Habits** — Daily habit tracker with streaks
- **Tasks** — Kanban-style task manager
- **Notes** — Colorful sticky notes with tags and pin
- **Dashboard** — Charts, summaries, recent transactions
- **Multi-Currency** — USD, EUR, GBP, INR, JPY, BDT (৳)
- **Dark/Light Mode** — System-aware theme switching
- **Responsive** — Mobile-friendly design
- **Modern UI** — Glassmorphism effects, gradient accents, smooth animations

---

## Quick Start

### 1. Clone & Install

```bash
git clone <your-repo>

# Backend
cd backend
npm install
cp .env.example .env     # fill in your values

# Frontend
cd frontend
npm install
cp .env.local.example .env.local   # fill in your values
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com) → Create Project
2. Enable **Authentication → Email/Password**
3. **Frontend keys**: Project Settings → General → Your Apps → Web App  
   → copy into `frontend/.env.local`
4. **Backend keys**: Project Settings → Service Accounts → Generate new private key  
   → copy `project_id`, `client_email`, `private_key` into `backend/.env`

### 3. MongoDB Atlas Setup

1. Create free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a database user
3. Whitelist IP (0.0.0.0/0 for dev)
4. Copy connection string into `backend/.env` as `MONGODB_URI`

### 4. Run Development

```bash
# Terminal 1 — Backend (port 5000)
cd backend
npm run dev

# Terminal 2 — Frontend (port 3000)
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

### `backend/.env`

```env
PORT=5000
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/finlife
FRONTEND_URL=http://localhost:3000

FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-email@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
```

### `frontend/.env.local`

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## Project Structure

```
finlife/
├── backend/
│   ├── config/
│   │   └── firebase.js          # Firebase Admin SDK init
│   ├── middleware/
│   │   └── auth.js              # JWT token verification
│   ├── models/
│   │   ├── User.js
│   │   ├── Expense.js
│   │   ├── Income.js
│   │   ├── Budget.js
│   │   └── index.js             # Goal, Investment, Subscription, Habit, Task, Note, Settings
│   ├── routes/
│   │   ├── crudFactory.js       # Reusable CRUD router
│   │   ├── dashboard.js         # Aggregation & analytics
│   │   ├── users.js
│   │   ├── expenses.js / income.js / budgets.js
│   │   ├── goals.js / investments.js / subscriptions.js
│   │   ├── habits.js            # With streak calculation
│   │   ├── tasks.js / notes.js / settings.js
│   │   └── users.js
│   └── server.js
│
└── frontend/
    ├── app/
    │   ├── layout.tsx            # Root layout with providers
    │   ├── page.tsx              # Redirect to login/dashboard
    │   ├── auth/
    │   │   ├── login/page.tsx
    │   │   └── register/page.tsx
    │   └── dashboard/
    │       ├── layout.tsx        # Sidebar + topbar
    │       ├── page.tsx          # Main dashboard with charts
    │       ├── expenses/page.tsx
    │       ├── income/page.tsx
    │       ├── budgets/page.tsx
    │       ├── goals/page.tsx
    │       ├── investments/page.tsx
    │       ├── subscriptions/page.tsx
    │       ├── habits/page.tsx   # Habit tracker with streaks
    │       ├── tasks/page.tsx    # Kanban task board
    │       ├── notes/page.tsx    # Sticky notes
    │       ├── settings/page.tsx
    │       └── profile/page.tsx
    ├── components/
    │   └── CrudPage.tsx          # Reusable CRUD table + modal
    └── lib/
        ├── firebase.ts           # Firebase client
        ├── api.ts                # Axios + auto auth token
        ├── auth-context.tsx      # Auth provider
        ├── currency-context.tsx  # Currency provider
        └── currency.ts           # Format helpers (BDT ৳ etc.)
```

## API Endpoints

All routes require `Authorization: Bearer <firebase_token>` header.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard/summary` | Dashboard analytics |
| GET/POST/PUT/DELETE | `/api/expenses` | Expense CRUD |
| GET/POST/PUT/DELETE | `/api/income` | Income CRUD |
| GET/POST/PUT/DELETE | `/api/budgets` | Budget CRUD |
| GET/POST/PUT/DELETE | `/api/goals` | Goals CRUD |
| GET/POST/PUT/DELETE | `/api/investments` | Investments CRUD |
| GET/POST/PUT/DELETE | `/api/subscriptions` | Subscriptions CRUD |
| GET/POST/PUT/DELETE | `/api/habits` | Habits CRUD |
| POST | `/api/habits/:id/complete` | Toggle today's completion |
| GET/POST/PUT/DELETE | `/api/tasks` | Tasks CRUD |
| GET/POST/PUT/DELETE | `/api/notes` | Notes CRUD |
| GET/PUT | `/api/settings` | User settings |
| GET/PUT | `/api/users/me` | User profile |

## Supported Currencies

| Code | Symbol | Name |
|---|---|---|
| USD | $ | US Dollar |
| EUR | € | Euro |
| GBP | £ | British Pound |
| INR | ₹ | Indian Rupee |
| JPY | ¥ | Japanese Yen |
| BDT | ৳ | Bangladeshi Taka |

---

## License

MIT
