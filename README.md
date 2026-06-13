# FinTrack – AI-Powered Personal Finance Manager

**A production-ready, AI-driven personal finance platform** built to help you track income, expenses, budgets, and gain deep financial insights.

This project highlights modern full-stack development using Next.js 16 (App Router), Prisma, and PostgreSQL, enriched with **AI Financial Analysis** via OpenRouter. It works seamlessly offline as a Progressive Web App (PWA), supports fully Right-to-Left (RTL) Arabic interfaces, and is optimized for edge deployments.

[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-5A0FC8?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

---

## 📸 Screenshots

<p align="center">
<img src="https://raw.githubusercontent.com/Mohannad7Ali/FinTrack-finance/main/assets/screenshots/transactions.png" alt="transactions" width="48%">
<img src="https://raw.githubusercontent.com/Mohannad7Ali/FinTrack-finance/main/assets/screenshots/dashboard_overview.png" alt="dashboard" width="48%">
<img src="https://raw.githubusercontent.com/Mohannad7Ali/FinTrack-finance/main/assets/screenshots/ai.png" alt="ai" width="48%">
<img src="https://raw.githubusercontent.com/Mohannad7Ali/FinTrack-finance/main/assets/screenshots/reports.png" alt="reports" width="48%">
</p>

## 🚀 Quick Start

```bash
# 1. Clone the repository
git clone [https://github.com/Mohannad7Ali/fintrack](https://github.com/Mohannad7Ali/fintrack)
cd fintrack

# 2. Set up environment variables
cp .env.example .env.local

# 3. Install dependencies
npm install

# 4. Set up the database (Supabase/PostgreSQL)
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed # Optional: seeds categories/wallets

# 5. Start the development server
npm run dev
```

## ✨ Features

### 🤖 AI Financial Analysis & Insights

- **Smart Summaries** – Analyzes the last 6 months of transactions using OpenRouter (Llama 3.2, Gemma, Phi-3).
- **Actionable Data** – Provides a financial health rating, top spending patterns, saving opportunities, and risk alerts.
- **Optimized Caching** – AI results are cached for 24 hours to respect free API limits, with an on-demand "Refresh Analysis" option.

### 💼 Core Finance Management

- **Multi-Wallet System** – Manage separate balances for cash, bank accounts, and credit cards.
- **Real-time Dashboard** – Track monthly income, expenses, and net cash flow with interactive charts.
- **Transaction Management** – Full CRUD capabilities with categories, descriptions, and easy CSV exports.

### 🌐 Modern UX/UI & PWA

- **Offline Support** – Installable Progressive Web App (PWA) that caches your dashboard and AI analysis for offline viewing.
- **RTL & Arabic First** – Fully right-to-left localized UI tailored specifically for Arabic speakers.
- **Secure Authentication** – JWT combined with Google OAuth 2.0 for seamless and secure access.

---

> Built for users who want actionable financial insights without compromising on privacy, usability, or modern web standards.

## 🛠️ Tech Stack

| Layer            | Technology                                 | Purpose                                      |
| ---------------- | ------------------------------------------ | -------------------------------------------- |
| **Frontend**     | Next.js 16 (App Router) + React 19         | UI/UX & Server-side rendering                |
| **Styling**      | Tailwind CSS 4 + shadcn/ui + Framer Motion | Modern, responsive, and animated components  |
| **Backend**      | Next.js API Routes                         | Serverless API architecture                  |
| **Database**     | PostgreSQL (Supabase) + Prisma ORM         | Type-safe queries & robust data storage      |
| **AI Engine**    | OpenRouter API (openrouter/free models)    | Financial analysis and intelligent insights  |
| **State / Data** | SWR + React Hook Form + Zod                | Client-side state, data fetching, validation |
| **PWA**          | next-pwa                                   | Service workers and offline caching manifest |

## 📁 Project Structure

```bash
fintrack/
├── 📂 app/                          # Next.js App Router (pages, layouts, API)
│   ├── 📂 (dashboard)/              # Protected dashboard routes (grouped layout)
│   ├── 📂 api/                      # Serverless API endpoints
│   ├── 📂 login/                    # Login page & handlers
│   ├── 📂 register/                 # Registration page
│   ├── 📂 recovery/                 # Password recovery flow
│   ├── 📂 maintenance/              # Maintenance mode page
│   ├── 📄 layout.tsx                # Root layout (RTL, PWA, fonts)
│   ├── 📄 page.tsx                  # Landing/home page
│   └── 📄 providers.tsx             # Global providers (Theme, Auth, SWR)
│
├── 📂 components/                   # Reusable UI components
│   ├── 📂 common/                   # Shared generic components (modals, loaders, toasts)
│   ├── 📂 dashboard/                # Dashboard-specific components (charts, wallet cards)
│   ├── 📂 ui/                       # shadcn/ui primitive components
│   └── 📄 AiFinancialAnalysis.tsx   # AI insights card & refresh logic
│
├── 📂 hooks/                        # Custom React hooks
│   ├── 📄 useMe.ts                  # Fetch current user data
│   ├── 📄 useExchangeRate.ts        # Live currency conversion
│   ├── 📄 useWeather.ts             # Optional weather widget
│   ├── 📄 useReports.ts             # Generate financial reports
│   └── 📄 ...                       # Other domain-specific hooks
│
├── 📂 lib/                          # Core logic & utilities
│   ├── 📄 prisma.ts                 # Prisma client singleton
│   ├── 📂 auth/                     # JWT + Google OAuth 2.0 logic
│   ├── 📂 constant/                 # App constants (categories, wallet types, locales)
│   ├── 📂 utils/                    # Helper functions (date, currency, formatting)
│   ├── 📄 fetcher.ts                # SWR fetcher wrapper with error handling
│   ├── 📄 validator.ts              # Zod schemas & validation rules
│   └── 📄 openrouter.ts             # OpenRouter API client (AI analysis)
│
├── 📂 prisma/                       # Database ORM layer
│   ├── 📄 schema.prisma             # Data models (User, Wallet, Transaction)
│   └── 📂 migrations/               # Auto-generated migration files
│
├── 📂 types/                        # Global TypeScript type definitions
│   └── 📄 index.ts                  # Shared interfaces (User, Transaction, API responses)
│
├── 📂 public/                       # Static assets & PWA files
│   ├── 📄 manifest.json             # PWA manifest
│   ├── 📄 sw.js                     # Service worker (generated by next-pwa)
│   └── 📂 icons/                    # App icons for all devices
│
├── 📄 .env.local                    # Environment variables (DB, OpenRouter, OAuth)
├── 📄 next.config.ts                # Next.js config (PWA, RTL, image domains)
├── 📄 tailwind.config.ts            # Tailwind CSS 4 + shadcn/ui preset
└── 📄 package.json                  # Dependencies & scripts
```

## 🔒 Security & Best Practices

- **Authentication Handling:** Secure Google OAuth 2.0 integration and robust JWT validation.
- **Database Pooling:** Utilizes Supabase transaction pooler (`?pgbouncer=true` on port 6543) to prevent connection exhaustion in serverless edge environments.
- **Intelligent Caching:** SWR for aggressive frontend data caching, combined with `localStorage` fallback to ensure continuous PWA operation during network outages.

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="center">
  Built with <b>passion</b> and <b>precision</b> by <a href="https://github.com/Mohannad7Ali">Mohannad Ali</a>.
</p>
