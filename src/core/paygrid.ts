import { PayGridDB } from '../db';
import { SolanaService } from '../blockchain';
import { AuthService } from '../auth';
import { validateConfig, CONSTANTS } from '../config';
import { PaymentIntent, PayGridConfig, PaymentStatus, PaymentMethod, AnalyticsData } from '../types';
import crypto from 'crypto';

export class PayGrid {
  private db: PayGridDB;
  private solana: SolanaService;
  private auth: AuthService;
  private config: PayGridConfig;
  private watcherInterval?: NodeJS.Timeout;

  constructor(config: PayGridConfig) {
    this.config = config;
    this.db = new PayGridDB(config.dbPath);
    this.solana = new SolanaService(config.rpcUrl, config.treasuryPrivateKey);
    this.auth = new AuthService(config.apiSecret);
  }

  async init() {
    await this.db.init();
  }

  async startWatcher() {
    console.log('🚀 PayGrid Watcher started');
    // Run immediately once
    await this.checkPendingPayments();
    
    this.watcherInterval = setInterval(async () => {
      try {
        await this.checkPendingPayments();
      } catch (error) {
        console.error('PayGrid Watcher Error:', error);
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
        await this.db.updatePaymentStatus(payment.id, 'expired');
        continue;
      }

      if (payment.method === PaymentMethod.MANUAL_TRANSFER && payment.walletAddress) {
        const signature = await this.solana.findTransferTo(payment.walletAddress, payment.amount);
        if (signature) {
          await this.db.updatePaymentStatus(payment.id, 'settled', signature);
        }
      } else if (payment.status === 'pending_confirmation' && payment.transactionSignature) {
        const confirmed = await this.solana.confirmTransaction(payment.transactionSignature);
        if (confirmed) {
          await this.db.updatePaymentStatus(payment.id, 'settled');
        }
      }
    }
  }

  async createPaymentIntent(params: {
    amount: number;
    tokenMint: string;
    tokenSymbol?: string;
    method: 'wallet-signing' | 'manual-transfer';
    sender?: string;
    metadata?: Record<string, any>;
  }): Promise<PaymentIntent> {
    const id = crypto.randomUUID();
    let walletAddress: string | undefined;

    if (params.method === 'manual-transfer') {
      const { publicKey } = await this.solana.generateTemporaryWallet();
      walletAddress = publicKey;
    }

    const payment: PaymentIntent = {
      id,
      amount: params.amount,
      tokenMint: params.tokenMint,
      tokenSymbol: params.tokenSymbol || (params.tokenMint === 'SOL' ? 'SOL' : 'Unknown'),
      method: params.method as any,
      status: PaymentStatus.AWAITING_PAYMENT,
      walletAddress,
      destination: this.solana.getTreasuryPublicKey(),
      sender: params.sender,
      expiresAt: Date.now() + CONSTANTS.PAYMENT_EXPIRY_MS,
      createdAt: Date.now(),
      metadata: params.metadata,
    };

    await this.db.createPayment(payment);
    return payment;
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

  async getPayments() {
    return await this.db.getAllPayments();
  }

  async getAnalytics(): Promise<AnalyticsData> {
    const payments = await this.db.getAllPayments();
    const settled = payments.filter(p => p.status === 'settled');
    const totalRevenue = settled.reduce((sum, p) => sum + p.amount, 0);
    
    // Group by date for history (last 7 days by default if we want, but here we just take all for now)
    const historyMap = new Map<string, number>();
    settled.forEach(p => {
      const date = new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      historyMap.set(date, (historyMap.get(date) || 0) + p.amount);
    });

    const history = Array.from(historyMap.entries())
      .map(([date, amount]) => ({ date, amount }));

    return {
      totalRevenue,
      transactionCount: payments.length,
      settlementRate: payments.length > 0 ? (settled.length / payments.length) * 100 : 0,
      history: history.length > 0 ? history : [{ date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), amount: 0 }]
    };
  }
}

export async function initPayGrid(config?: Partial<PayGridConfig>) {
  const fullConfig = config ? { ...validateConfig(), ...config } : validateConfig();
  
  const paygrid = new PayGrid(fullConfig);
  await paygrid.init();
  await paygrid.startWatcher();

  return paygrid;
}
