import { DepositResponse } from "@radr/shadowwire";
import crypto from "crypto";
import { AuthService } from "../auth";
import { SolanaService } from "../blockchain";
import { CONSTANTS, SUPPORTED_TOKENS, validateConfig } from "../config";
import { PayGridDB } from "../db";
import {
  AnalyticsData,
  PayGridConfig,
  PaymentIntent,
  PaymentMethod,
  PaymentStatus,
  TokenSymbol,
} from "../types";
import { PrivacyWrapper } from "./privacy-wrapper";

export class PayGrid {
  private db: PayGridDB;
  private solana: SolanaService;
  private privacy: PrivacyWrapper;
  private auth: AuthService;
  private config: PayGridConfig;
  private watcherInterval?: NodeJS.Timeout;

  constructor(config: PayGridConfig) {
    this.config = config;
    this.db = new PayGridDB(this.config.dbPath);
    this.solana = new SolanaService(this.config.rpcUrl);

    // Initialize Privacy Wrapper
    this.privacy = new PrivacyWrapper(this.config);

    this.auth = new AuthService(this.config.apiSecret);
  }

  async init() {
    await this.db.init();

    try {
      const apiKeys = await this.listApiKeys();
      if (apiKeys.length === 0) {
        const { key, apiKey } = await this.createApiKey("default");
        console.log(`
      *****************************************
      🔑 Created default API key: ${key}
      Please save this key, it won't be shown again.
      *****************************************
      `);
      }
    } catch (error) {
      console.error("Error during PayGrid initialization:", error);
      throw error;
    }
  }

  async startWatcher() {
    console.log("🚀 PayGrid Watcher started");
    // Run immediately once

    await this.checkPendingPayments();

    this.watcherInterval = setInterval(async () => {
      try {
        await this.checkPendingPayments();
      } catch (error) {
        console.error("PayGrid Watcher Error:", error);
      }
    }, CONSTANTS.CHECK_INTERVAL_MS);
  }

  stopWatcher() {
    if (this.watcherInterval) {
      clearInterval(this.watcherInterval);
    }
  }

  private async checkPendingPayments() {
    const pending = await this.db.getPendingPayments();
    const now = Date.now();

    for (const payment of pending) {
      if (payment.expiresAt < now) {
        await this.db.updatePaymentStatus(payment.id, "expired");
        continue;
      }

      if (
        payment.method === PaymentMethod.MANUAL_TRANSFER &&
        payment.walletAddress
      ) {
        const signature = await this.solana.findTransferTo(
          payment.walletAddress,
          payment.amount,
        );
        if (signature) {
          await this.db.updatePaymentStatus(payment.id, "settled", signature);
        }
      } else if (
        payment.status === "pending_confirmation" &&
        payment.transactionSignature
      ) {
        const confirmed = await this.solana.confirmTransaction(
          payment.transactionSignature,
        );
        if (confirmed) {
          await this.db.updatePaymentStatus(payment.id, "settled");
        }
      }
    }
  }

  async createPaymentIntent(params: {
    amount: number;
    tokenSymbol: TokenSymbol;
    method: "wallet-signing" | "manual-transfer";
    sender?: string;
    metadata?: Record<string, any>;
  }): Promise<PaymentIntent & { depositResponse: DepositResponse }> {
    try {
      const id = crypto.randomUUID();
      // Resolve token mint if symbol is provided
      let mintAddress;
      let symbol = params.tokenSymbol;

      if (params.tokenSymbol === TokenSymbol.SOL) {
        mintAddress = SUPPORTED_TOKENS.find(
          (t) => t.symbol === TokenSymbol.SOL,
        )?.mint;
      } else if (params.tokenSymbol === TokenSymbol.USDC) {
        mintAddress = SUPPORTED_TOKENS.find(
          (t) => t.symbol === TokenSymbol.USDC,
        )?.mint;
      } else if (params.tokenSymbol === TokenSymbol.BONK) {
        mintAddress = SUPPORTED_TOKENS.find(
          (t) => t.symbol === TokenSymbol.BONK,
        )?.mint;
      }

      let response: DepositResponse | undefined;

      if (params.method === "wallet-signing") {
        try {
          const result = await this.privacy.createDepositTransaction({
            amount: params.amount,
            tokenMint: mintAddress ?? "",
            symbol: params.tokenSymbol,
            walletAddress: params.sender ?? "",
          });
          response = result;
        } catch (e: any) {
          console.error("Failed to create privacy transaction", e);
          throw new Error("Failed to create privacy transaction: " + e.message);
        }
      }

      const amount =
        symbol === TokenSymbol.SOL
          ? (response?.amount ?? 0) / 1e9
          : (response?.amount ?? 0) / 1e6;

      const payment: PaymentIntent = {
        id,
        amount: params.method === "wallet-signing" ? amount : params.amount,
        tokenMint: mintAddress?.toString() ?? "",
        tokenSymbol: symbol,
        method: params.method as PaymentMethod,
        status: PaymentStatus.AWAITING_PAYMENT,
        walletAddress: this.config.marchantWalletADdress,
        destination: this.config.marchantWalletADdress,
        sender: params.sender,
        expiresAt: Date.now() + CONSTANTS.PAYMENT_EXPIRY_MS,
        createdAt: Date.now(),
        metadata: params.metadata,
      };

      await this.db.createPayment(payment);

      return { ...payment, depositResponse: response! };
    } catch (error) {
      console.error("Error creating payment intent:", error);
      throw error;
    }
  }

  async getPayment(id: string) {
    return await this.db.getPayment(id);
  }

  async createApiKey(name: string) {
    const { key, apiKey } = this.auth.generateApiKey(name);
    await this.db.createApiKey(apiKey);
    return { key, apiKey };
  }

  async validateApiKey(rawKey: string): Promise<boolean> {
    const keys = await this.db.listApiKeys();
    for (const key of keys) {
      if (this.auth.verifyApiKey(rawKey, key.hashedKey)) {
        return true;
      }
    }
    return false;
  }

  async listApiKeys() {
    return await this.db.listApiKeys();
  }

  async deleteApiKey(id: string) {
    return await this.db.deleteApiKey(id);
  }

  async getPayments() {
    return await this.db.getAllPayments();
  }
  async deposit(
    amount: number,
    walletAddress: string,
    tokenMint: string,
    symbol: string,
  ) {
    return await this.privacy.createDepositTransaction({
      amount,
      walletAddress,
      tokenMint,
      symbol,
    });
  }
  async transfer({
    symbol,
    sender,
    amount,
  }: {
    symbol: string;
    sender: string;
    amount: number;
  }) {
    return await this.privacy.transfer({ symbol, sender, amount });
  }
  async withdraw({ symbol, recipient }: { symbol: string; recipient: string }) {
    return await this.privacy.withdraw({ symbol, recipient });
  }

  async getAnalytics(days: number = 30): Promise<AnalyticsData> {
    const payments = await this.db.getAllPayments();
    const now = Date.now();
    const startTime = now - days * 24 * 60 * 60 * 1000;

    const settled = payments.filter((p) => p.status === "settled");

    // Current period metrics
    const filteredSettled = settled.filter((p) => p.createdAt >= startTime);
    const totalRevenue = filteredSettled.reduce((sum, p) => sum + p.amount, 0);

    // Previous period metrics
    const prevStartTime = startTime - days * 24 * 60 * 60 * 1000;
    const prevPeriodSettled = settled.filter(
      (p) => p.createdAt >= prevStartTime && p.createdAt < startTime,
    );
    const pastRevenue = prevPeriodSettled.reduce((sum, p) => sum + p.amount, 0);

    let revenueGrowth = 0;
    if (pastRevenue > 0) {
      revenueGrowth = ((totalRevenue - pastRevenue) / pastRevenue) * 100;
    } else if (totalRevenue > 0) {
      revenueGrowth = 100;
    }

    // Group by date for history
    const historyMap = new Map<string, number>();

    // Initialize map with all dates in the range to ensure zero values are shown
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      historyMap.set(dateStr, 0);
    }

    filteredSettled.forEach((p) => {
      const date = new Date(p.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      if (historyMap.has(date)) {
        historyMap.set(date, (historyMap.get(date) || 0) + p.amount);
      }
    });

    const history = Array.from(historyMap.entries()).map(([date, amount]) => ({
      date,
      amount,
    }));

    // Filter all payments for the period for transactionCount and settlementRate calculations
    const filteredPayments = payments.filter((p) => p.createdAt >= startTime);
    const filteredSettledCount = filteredPayments.filter(
      (p) => p.status === "settled",
    ).length;

    return {
      totalRevenue,
      revenueGrowth,
      pastRevenue,
      transactionCount: filteredPayments.length,
      settlementRate:
        filteredPayments.length > 0
          ? (filteredSettledCount / filteredPayments.length) * 100
          : 0,
      history,
    };
  }

  // Withdraw funds from the privacy pool to a recipient
  async withdrawFromPrivacy(params: {
    tokenSymbol: TokenSymbol;
    recipient: string;
  }) {
    try {
      const res = await this.privacy.withdraw({
        recipient: params.recipient,
        symbol: params.tokenSymbol,
      });

      console.log(res, "withdrawal response");
      return res;
    } catch (error) {
      console.error("Error withdrawing from privacy:", error);
      throw error;
    }
  }

  async transferFromPrivacy(params: {
    tokenSymbol: TokenSymbol;
    sender: string;
    amount: number;
  }) {
    try {
      const res = await this.privacy.transfer({
        symbol: params.tokenSymbol,
        amount: params.amount,
        sender: params.sender,
      });
    } catch (error) {
      console.error("Error withdrawing from privacy:", error);
      throw error;
    }
  }
}

export async function initPayGrid(config?: Partial<PayGridConfig>) {
  const fullConfig = config
    ? { ...validateConfig(), ...config }
    : validateConfig();

  const paygrid = new PayGrid(fullConfig);
  await paygrid.init();
  await paygrid.startWatcher();

  return paygrid;
}
