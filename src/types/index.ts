export enum PaymentStatus {
  CREATED = 'created',
  AWAITING_PAYMENT = 'awaiting_payment',
  PENDING_CONFIRMATION = 'pending_confirmation',
  SETTLED = 'settled',
  EXPIRED = 'expired',
  FAILED = 'failed'
}

export enum PaymentMethod {
  WALLET_SIGNING = 'wallet_signing',
  MANUAL_TRANSFER = 'manual_transfer'
}

export interface PaymentIntent {
  id: string;
  amount: number;
  tokenMint: string; // 'SOL' or mint address
  tokenSymbol: string;
  method: PaymentMethod;
  status: PaymentStatus;
  walletAddress?: string; // Generated wallet for manual transfer
  transactionSignature?: string;
  destination: string;
  sender?: string;
  expiresAt: number;
  createdAt: number;
  metadata?: Record<string, any>;
}

export interface PayGridConfig {
  rpcUrl: string;
  treasuryPrivateKey: string;
  dbPath: string;
  apiSecret: string;
  network: 'mainnet-beta' | 'devnet' | 'testnet';
}

export interface AnalyticsData {
  totalRevenue: number;
  revenueGrowth: number;
  pastRevenue: number;
  transactionCount: number;
  settlementRate: number;
  history: { date: string; amount: number }[];
}

export interface ApiKey {
  id: string;
  keyHint: string; // First 4 characters
  hashedKey: string;
  name: string;
  createdAt: number;
}
