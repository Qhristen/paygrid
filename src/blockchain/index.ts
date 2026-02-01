import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey
} from "@solana/web3.js";
import bs58 from "bs58";

export class SolanaService {
  private connection: Connection;

  constructor(rpcUrl: string) {
    this.connection = new Connection(rpcUrl, "confirmed");
    
  }

  async generateTemporaryWallet(): Promise<{
    publicKey: string;
    privateKey: string;
  }> {
    const keypair = Keypair.generate();
    return {
      publicKey: keypair.publicKey.toBase58(),
      privateKey: bs58.encode(keypair.secretKey),
    };
  }

  async checkBalance(publicKey: string): Promise<number> {
    const balance = await this.connection.getBalance(new PublicKey(publicKey));
    return balance / LAMPORTS_PER_SOL;
  }

  async confirmTransaction(signature: string): Promise<boolean> {
    try {
      const result = await this.connection.confirmTransaction(
        signature,
        "confirmed",
      );
      return !result.value.err;
    } catch (error) {
      console.error("Error confirming transaction:", error);
      return false;
    }
  }

  async findTransferTo(
    targetWallet: string,
    amount: number,
  ): Promise<string | null> {
    const pubkey = new PublicKey(targetWallet);
    const signatures = await this.connection.getSignaturesForAddress(pubkey, {
      limit: 10,
    });

    for (const sigInfo of signatures) {
      const tx = await this.connection.getTransaction(sigInfo.signature, {
        commitment: "confirmed",
          maxSupportedTransactionVersion: 0, // 👈 REQUIRED now
      });
      if (!tx) continue;

      // Basic SOL transfer check - this is simplified for now
      // A more robust check would involve parsing instructions
      const meta = tx.meta;
      if (!meta) continue;

      const preBalances = meta.preBalances;
      const postBalances = meta.postBalances;
      const accountKeys = tx.transaction.message.staticAccountKeys;

      const targetIndex = accountKeys.findIndex((key) => key.equals(pubkey));
      if (targetIndex === -1) continue;

      const receivedAmount =
        (postBalances[targetIndex] - preBalances[targetIndex]) /
        LAMPORTS_PER_SOL;

      if (receivedAmount >= amount) {
        return sigInfo.signature;
      }
    }

    return null;
  }
}
