import { z } from 'zod';
import { PayGridConfig } from '../types';

export const configSchema = z.object({
  SOLANA_RPC_URL: z.string().url(),
  MERCHANT_WALLET_ADDRESS: z.string().min(44), // Base58 encoded private key
  DB_PATH: z.string().default('./paygrid.db'),
  NEXT_PUBLIC_PAYGRID_API_SECRET: z.string().min(32),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(5),
  NETWORK: z.enum(['mainnet-beta', 'devnet', 'testnet']).default('mainnet-beta'),
});

export function validateConfig(): PayGridConfig {
  const result = configSchema.safeParse({
    SOLANA_RPC_URL: process.env.NEXT_PUBLIC_SOLANA_RPC_URL!,
    MERCHANT_WALLET_ADDRESS: process.env.NEXT_PUBLIC_MERCHANT_WALLET_ADDRESS!,
    DB_PATH: process.env.DB_PATH!,
    NEXT_PUBLIC_PAYGRID_API_SECRET: process.env.NEXT_PUBLIC_PAYGRID_API_SECRET!,
    NETWORK: process.env.NEXT_PUBLIC_NETWORK!,
    ADMIN_EMAIL: process.env.NEXT_PUBLIC_ADMIN_EMAIL!,
    ADMIN_PASSWORD: process.env.NEXT_PUBLIC_ADMIN_PASSWORD!,
  });

  if (!result.success) {
    console.error('❌ Invalid PayGrid Configuration:', result.error.format());
    throw new Error(`Invalid PayGrid configuration: ${result.error.message}`);
  }

  return {
    rpcUrl: result.data.SOLANA_RPC_URL,
    marchantWalletADdress: result.data.MERCHANT_WALLET_ADDRESS,
    dbPath: result.data.DB_PATH,
    apiSecret: result.data.NEXT_PUBLIC_PAYGRID_API_SECRET,
    network: result.data.NETWORK,
    adminEmail: result.data.ADMIN_EMAIL,
    adminPassword: result.data.ADMIN_PASSWORD
  };
}

export const CONSTANTS = {
  PAYMENT_EXPIRY_MS: 30 * 60 * 1000, // 30 minutes
  CHECK_INTERVAL_MS: 10 * 1000, // 10 seconds
  CONFIRMATIONS_REQUIRED: 1,
};


export const SUPPORTED_TOKENS = [
  { symbol: 'SOL', mint: '11111111111111111111111111111111', color: '#14F195', disabled: true },
  { symbol: 'USDC', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', color: '#2775CA', disabled: false },
  { symbol: 'BONK', mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', color: '#FFA500', disabled: true }
];