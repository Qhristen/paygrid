# PayGrid

**PayGrid** is a self-hosted, embeddable Web3 payments infrastructure for Solana. It allows you to accept SOL and SPL token payments directly within your Next.js application without relying on third-party payment processors.

---

## 🚀 Features

- **Self-Hosted:** Full control over your data and treasury keys.
- **Dual Payment Flows:**
  - **Wallet-Signing:** Direct transaction signing with Solana wallets (Phantom, Solflare, etc.).
  - **Manual Transfer:** Unique temporary wallet generation for manual transfers.
- **Embedded Dashboard:** Built-in React components for managing payments and API keys.
- **SQLite Powered:** No heavy database setup required; data is stored locally in an embedded SQLite file.
- **Status Monitoring:** Background watcher automatically settles payments by monitoring the blockchain.

---

## 🛠 Installation

```bash
npm install @qhristen/paygrid
```

---

## 🏗 Setup

### 1. Environment Variables

Create a `.env` file in your Next.js project:

```bash
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_MERCHANT_WALLET_ADDRESS=
NEXT_PUBLIC_PAYGRID_API_SECRET=
DB_PATH=../test.db
NEXT_PUBLIC_NETWORK=mainnet-beta
NEXT_PUBLIC_ADMIN_EMAIL=admin-test@paygrid.com
NEXT_PUBLIC_ADMIN_PASSWORD=securepassword12345
```

### 2. Initialize PayGrid (API Route)

Create a file at `app/api/paygrid/[...path]/route.ts`:

```typescript
import { initPayGrid } from "@qhristen/paygrid";
import { createApiHandler } from "@qhristen/paygrid/server";

// Initialize core
const paygrid = await initPayGrid();

// Create handler
const handler = createApiHandler(paygrid);

export { handler as GET, handler as POST };
```

### 3. Embed the Dashboard

Create a dashboard page at `app/dashboard/payments/page.tsx`:

```tsx
"use client";

import { PayGridDashboard } from "@qhristen/paygrid";

export default function DashboardPage() {
  return (
    <div className="pg-dashboard-wrapper">
      <PayGridDashboard apiUrl="/api/paygrid" />
    </div>
  );
}
```

---

## 💳 Usage

### Create a Payment Intent

```typescript
const response = await fetch("/api/paygrid/payment-intents", {
  method: "POST",
  headers: {
    "x-api-key": "your_api_key",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    amount: 1.5,
    tokenMint: "SOL",
    method: "wallet-signing", // or 'manual-transfer'
    metadata: { orderId: "12345" },
  }),
});

const intent = await response.json();
console.log("Payment Intent Created:", intent.id);
```

---

## 🔐 Security

- **Treasury Keys:** Your treasury private key is only used to sign transactions for settlements (if applicable) and is never exposed via the API.
- **API Keys:** Keys are hashed using `bcrypt` before being stored in the database.
- **Validation:** Every transaction is validated against the blockchain state before being marked as `settled`.

---

## 🧱 Architecture

- `core/`: Payment lifecycle and state machine logic.
- `blockchain/`: Solana Web3.js integration and watchers.
- `db/`: Embedded SQLite storage.
- `api/`: Next.js request handlers.
- `dashboard/` & `checkout/`: React UI components.
- `auth/`: API key generation and validation.

---

## ⚖️ License

MIT
