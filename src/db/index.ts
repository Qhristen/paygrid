import { createClient, Client } from '@libsql/client';
import { PaymentIntent, ApiKey } from '../types';

export class PayGridDB {
  private client: Client;

  constructor(dbPath: string) {
    // For local files, libsql uses file:path
    const url = dbPath.startsWith('file:') ? dbPath : `file:${dbPath}`;
    this.client = createClient({
      url: url,
    });
  }

  async init() {
    await this.client.execute(`
      CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY,
        amount REAL NOT NULL,
        tokenMint TEXT NOT NULL,
        tokenSymbol TEXT NOT NULL,
        method TEXT NOT NULL,
        status TEXT NOT NULL,
        walletAddress TEXT,
        transactionSignature TEXT,
        destination TEXT NOT NULL,
        sender TEXT,
        expiresAt INTEGER NOT NULL,
        createdAt INTEGER NOT NULL,
        metadata TEXT
      );
    `);

    await this.client.execute(`
      CREATE TABLE IF NOT EXISTS api_keys (
        id TEXT PRIMARY KEY,
        keyHint TEXT NOT NULL,
        hashedKey TEXT NOT NULL,
        name TEXT NOT NULL,
        createdAt INTEGER NOT NULL
      );
    `);

    await this.client.execute(`
      CREATE TABLE IF NOT EXISTS analytics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp INTEGER NOT NULL,
        type TEXT NOT NULL,
        value REAL NOT NULL,
        metadata TEXT
      );
    `);
  }

  // Payment Operations
  async createPayment(payment: PaymentIntent) {
    await this.client.execute({
      sql: `INSERT INTO payments (id, amount, tokenMint, tokenSymbol, method, status, walletAddress, transactionSignature, destination, sender, expiresAt, createdAt, metadata)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        payment.id,
        payment.amount,
        payment.tokenMint,
        payment.tokenSymbol,
        payment.method,
        payment.status,
        payment.walletAddress || null,
        payment.transactionSignature || null,
        payment.destination,
        payment.sender || null,
        payment.expiresAt,
        payment.createdAt,
        payment.metadata ? JSON.stringify(payment.metadata) : null
      ]
    });
  }

  async getPayment(id: string): Promise<PaymentIntent | undefined> {
    const rs = await this.client.execute({
      sql: 'SELECT * FROM payments WHERE id = ?',
      args: [id]
    });
    
    const row = rs.rows[0];
    if (!row) return undefined;
    
    return {
      id: row.id as string,
      amount: row.amount as number,
      tokenMint: row.tokenMint as string,
      method: row.method as any,
      status: row.status as any,
      tokenSymbol: row.tokenSymbol as string,
      walletAddress: (row.walletAddress as string) || undefined,
      transactionSignature: (row.transactionSignature as string) || undefined,
      destination: row.destination as string,
      sender: (row.sender as string) || undefined,
      expiresAt: row.expiresAt as number,
      createdAt: row.createdAt as number,
      metadata: row.metadata ? JSON.parse(row.metadata as string) : undefined
    };
  }

  async updatePaymentStatus(id: string, status: string, signature?: string) {
    await this.client.execute({
      sql: 'UPDATE payments SET status = ?, transactionSignature = COALESCE(?, transactionSignature) WHERE id = ?',
      args: [status, signature || null, id]
    });
  }

  async getAllPayments(): Promise<PaymentIntent[]> {
    const rs = await this.client.execute('SELECT * FROM payments ORDER BY createdAt DESC');
    return rs.rows.map((row: any) => ({
      id: row.id as string,
      amount: row.amount as number,
      tokenMint: row.tokenMint as string,
      method: row.method as any,
      status: row.status as any,
      tokenSymbol: row.tokenSymbol as string,
      walletAddress: (row.walletAddress as string) || undefined,
      transactionSignature: (row.transactionSignature as string) || undefined,
      destination: row.destination as string,
      sender: (row.sender as string) || undefined,
      expiresAt: row.expiresAt as number,
      createdAt: row.createdAt as number,
      metadata: row.metadata ? JSON.parse(row.metadata as string) : undefined
    }));
  }

  async getPendingPayments(): Promise<PaymentIntent[]> {
    const rs = await this.client.execute("SELECT * FROM payments WHERE status IN ('awaiting_payment', 'pending_confirmation')");
    return rs.rows.map((row: any) => ({
      id: row.id as string,
      amount: row.amount as number,
      tokenMint: row.tokenMint as string,
      method: row.method as any,
      status: row.status as any,
      tokenSymbol: row.tokenSymbol as string,
      walletAddress: (row.walletAddress as string) || undefined,
      transactionSignature: (row.transactionSignature as string) || undefined,
      destination: row.destination as string,
      sender: (row.sender as string) || undefined,
      expiresAt: row.expiresAt as number,
      createdAt: row.createdAt as number,
      metadata: row.metadata ? JSON.parse(row.metadata as string) : undefined
    }));
  }

  // API Key Operations
  async createApiKey(apiKey: ApiKey) {
    await this.client.execute({
      sql: 'INSERT INTO api_keys (id, keyHint, hashedKey, name, createdAt) VALUES (?, ?, ?, ?, ?)',
      args: [apiKey.id, apiKey.keyHint, apiKey.hashedKey, apiKey.name, apiKey.createdAt]
    });
  }

  async getApiKey(id: string): Promise<ApiKey | undefined> {
    const rs = await this.client.execute({
      sql: 'SELECT * FROM api_keys WHERE id = ?',
      args: [id]
    });
    const row = rs.rows[0];
    if (!row) return undefined;
    return {
      id: row.id as string,
      keyHint: row.keyHint as string,
      hashedKey: row.hashedKey as string,
      name: row.name as string,
      createdAt: row.createdAt as number
    };
  }

  async listApiKeys(): Promise<ApiKey[]> {
    const rs = await this.client.execute('SELECT * FROM api_keys');
    return rs.rows.map((row: any) => ({
      id: row.id as string,
      keyHint: row.keyHint as string,
      hashedKey: row.hashedKey as string,
      name: row.name as string,
      createdAt: row.createdAt as number
    }));
  }

  async deleteApiKey(id: string) {
    await this.client.execute({
      sql: 'DELETE FROM api_keys WHERE id = ?',
      args: [id]
    });
  }
}
