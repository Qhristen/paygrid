import { z } from 'zod';
import { PayGridConfig } from '../types';

export const configSchema = z.object({
  SOLANA_RPC_URL: z.string().url(),
  TREASURY_PRIVATE_KEY: z.string().min(44), // Base58 encoded private key
  DB_PATH: z.string().default('./paygrid.db'),
  NEXT_PUBLIC_PAYGRID_API_SECRET: z.string().min(32),
  NETWORK: z.enum(['mainnet-beta', 'devnet', 'testnet']).default('mainnet-beta'),
});

export function validateConfig(): PayGridConfig {
  const result = configSchema.safeParse({
    SOLANA_RPC_URL: process.env.SOLANA_RPC_URL,
    TREASURY_PRIVATE_KEY: process.env.TREASURY_PRIVATE_KEY,
    DB_PATH: process.env.DB_PATH,
    NEXT_PUBLIC_PAYGRID_API_SECRET: process.env.NEXT_PUBLIC_PAYGRID_API_SECRET,
    NETWORK: process.env.NETWORK,
  });

  if (!result.success) {
    console.error('❌ Invalid PayGrid Configuration:', result.error.format());
    throw new Error('Missing or invalid environment variables for PayGrid');
  }

  return {
    rpcUrl: result.data.SOLANA_RPC_URL,
    treasuryPrivateKey: result.data.TREASURY_PRIVATE_KEY,
    dbPath: result.data.DB_PATH,
    apiSecret: result.data.NEXT_PUBLIC_PAYGRID_API_SECRET,
    network: result.data.NETWORK,
  };
}

export const CONSTANTS = {
  PAYMENT_EXPIRY_MS: 30 * 60 * 1000, // 30 minutes
  CHECK_INTERVAL_MS: 10 * 1000, // 10 seconds
  CONFIRMATIONS_REQUIRED: 1,
};
