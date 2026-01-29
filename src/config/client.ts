// Client-safe constants only
export const SUPPORTED_TOKENS = [
  { symbol: "SOL", mint: "11111111111111111111111111111111", color: "#14F195" },
  {
    symbol: "USDC",
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    color: "#2775CA",
  },
  {
    symbol: "USDT",
    mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    color: "#26A17B",
  },
];

export const CONSTANTS = {
  PAYMENT_EXPIRY_MS: 30 * 60 * 1000, // 30 minutes
  CHECK_INTERVAL_MS: 10 * 1000, // 10 seconds
  CONFIRMATIONS_REQUIRED: 1,
};
