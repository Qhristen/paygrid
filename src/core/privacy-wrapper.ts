import { Connection, PublicKey } from '@solana/web3.js';
import { PrivacyCash } from 'privacycash';


export const TOKENS = {
  USDC: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
  USDT: new PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'),
};

export class PrivacyWrapper {
  private client: PrivacyCash;
  private connection: Connection;
  private rpcUrl: string;
  private privateKey: string;

  constructor(rpcUrl: string, privateKey: string) {
    this.rpcUrl = rpcUrl;
    this.privateKey = privateKey;
    this.connection = new Connection(rpcUrl, 'confirmed');
    
    this.client = new PrivacyCash({
        RPC_url: rpcUrl,
        owner: privateKey
    });
  }


  async getPrivateBalance() {
    return await this.client.getPrivateBalance();
  }

  async getPrivateBalanceSpl(mint: PublicKey | string) {
    return await this.client.getPrivateBalanceSpl(typeof mint === 'string' ? mint : mint.toBase58());
  }

  async withdraw({ lamports, recipient }: { lamports: number; recipient: string }) {
    // PrivacyCash withdraw takes lamports as amount
    return await this.client.withdraw({
        lamports,
        recipientAddress: recipient
    });
  }

  async withdrawSPL({ amount, mint, recipient }: { amount: number; mint: PublicKey | string; recipient: string }) {
      return await this.client.withdrawSPL({
          base_units: amount,
          recipientAddress: recipient,
          mintAddress: typeof mint === 'string' ? mint : mint.toBase58()
      });
  }

  async createDepositTransaction(params: {
    amount: number;
    tokenMint?: string;
    tokenSymbol?: string;
  }): Promise<{ transaction: string; msg: string }> {

    try {
        if (params.tokenSymbol && params.tokenSymbol !== 'SOL') {
            await this.client.depositSPL({
                amount: params.amount,
                mintAddress: params.tokenMint ?? ""
            });
        } else {
            await this.client.deposit({
                lamports: params.amount * 1_000_000_000
            });
        }
    } catch (e: any) {
        throw e;
    }
    
    throw new Error("Failed to capture transaction");
  }
}
