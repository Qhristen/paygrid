import { PayGridConfig, TokenSymbol as Symbol } from "../types";
import {
  DepositResponse,
  ShadowWireClient,
  TokenSymbol,
  TransferResponse,
} from "@radr/shadowwire";

export class PrivacyWrapper {
  private client: ShadowWireClient;
  private rpcUrl: string;
  private config: PayGridConfig;

  constructor(config: PayGridConfig) {
    this.config = config;
    this.rpcUrl = this.config.rpcUrl;
    this.client = new ShadowWireClient({
      network: "mainnet-beta",
      // apiBaseUrl: this.config.rpcUrl
      debug: false,
    });
  }

  async getPrivateBalance(walletAddress: string, symbol: TokenSymbol) {
    return await this.client.getBalance(walletAddress, symbol);
  }

  async withdraw({ symbol, recipient }: { symbol: string; recipient: string }) {
    const balance = await this.client.getBalance(
      recipient,
      symbol as TokenSymbol,
    );

    if (balance.available === 0) {
      console.log("No funds available");
      return;
    }

    const amount =
      symbol === Symbol.SOL
        ? (balance?.available ?? 0) / 1e9
        : (balance?.available ?? 0) / 1e6;

    return await this.client.withdraw({
      amount,
      wallet: recipient,
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
    return await this.client.transfer({
      amount,
      recipient: this.config.marchantWalletADdress,
      sender,
      token: symbol as TokenSymbol,
      type: "internal",
    });
  }

  async createTransferTransaction(params: {
    amount: number;
    walletAddress: string;
    symbol: TokenSymbol;
  }): Promise<TransferResponse> {
    const result = await this.client.transfer({
      sender: params.walletAddress,
      recipient: this.config.marchantWalletADdress,
      amount: params.amount,
      token: params.symbol,
      type: "external",
    });

    return result;
  }

  async createDepositTransaction(params: {
    amount: number;
    walletAddress: string;
    tokenMint: string;
    symbol: string;
  }): Promise<DepositResponse> {
    try {
      let response: DepositResponse;

      console.log(params, "params");
      if (params.symbol === "SOL") {
        response = await this.client.deposit({
          wallet: params.walletAddress,
          amount: params.amount * 1000000000,
        });
      } else {
        response = await this.client.deposit({
          wallet: params.walletAddress,
          amount: params.amount * 1000000,
          token_mint: params.tokenMint,
        });
      }

      return response;
    } catch (e: any) {
      throw new Error(
        `Failed to create privacy transaction: ${e?.message ?? String(e)}`,
      );
    }
  }
}
