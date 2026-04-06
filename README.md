# Medhub

Pharmacy & inventory management API with real-time data sync across devices.

## Stack
- **API**: Express 5 + TypeScript → Vercel serverless functions
- **Database**: PostgreSQL via Neon (serverless-compatible)
- **Real-time**: Pusher Channels (WebSocket broadcast to all devices)
- **ORM**: Drizzle ORM + drizzle-zod
- **Monorepo**: pnpm workspaces

## Project structure
```
medhub/
├── artifacts/
│   └── api-server/
│       ├── api/index.ts          ← Vercel serverless entry point
│       └── src/
│           ├── app.ts            ← Express app
│           ├── lib/pusher.ts     ← Pusher broadcaster
│           ├── middleware/       ← Error handler
│           └── routes/           ← products, sales, stock-updates,
│                                    transactions, activity-log, auth
├── lib/
│   ├── db/
│   │   └── src/schema/           ← Drizzle table definitions
│   └── api-client-react/
│       └── src/hooks/
│           └── useRealtimeSync.ts ← React hook for live sync
├── vercel.json
└── .env.example
```

## Quick start

### 1. Clone and install
```bash
git clone https://github.com/mwajonah-arch/Medhub.git
cd Medhub
pnpm install
```

### 2. Set up environment
```bash
cp .env.example .env
# Fill in DATABASE_URL from neon.tech
# Fill in PUSHER_* keys from pusher.com
```

### 3. Push schema to database
```bash
pnpm db:push
```

### 4. Run locally
```bash
pnpm dev
# API available at http://localhost:3000/api
```

## Deploy to Vercel
1. Connect this repo on [vercel.com](https://vercel.com)
2. Add all env vars from `.env.example` in Vercel dashboard
3. Push to `main` — auto-deploys on every push

## Real-time sync (frontend usage)
```tsx
import { useRealtimeSync } from "@workspace/api-client-react";

function ProductsPage() {
  // Auto-refetches on any device change — no polling needed
  useRealtimeSync(["products", "sales"]);

  const { data } = useGetProducts(); // your existing React Query hook
  return <ProductList products={data} />;
}
```

## API endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/health | Health check |
| POST | /api/auth/login | Login |
| GET/POST/PATCH/DELETE | /api/products | Products CRUD |
| GET/POST/PATCH/DELETE | /api/sales | Sales CRUD |
| GET/POST/PATCH/DELETE | /api/stock-updates | Stock updates |
| GET/POST | /api/transactions | Transactions |
| GET/POST | /api/activity-log | Activity log |
