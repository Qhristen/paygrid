import {
    Connection,
    Transaction,
    VersionedTransaction
} from "@solana/web3.js";

export async function signSolanaTransaction(
  unsigned_tx_base64: string,
  connection: Connection,
  signTransaction: (<T extends Transaction | VersionedTransaction>(transaction: T) => Promise<T>) | undefined
) {
  // 1. Decode the base64 transaction
  const txBuffer = Buffer.from(unsigned_tx_base64, "base64");

  // 2. Deserialize the transaction
  const transaction = VersionedTransaction.deserialize(txBuffer);

  // 3. Sign the transaction with the wallet
  const signedTx = signTransaction && await signTransaction(transaction);

  // 4. Get the latest blockhash for confirmation strategy
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();

  // 5. Send the signed transaction
  const signature = await connection.sendRawTransaction(signedTx?.serialize() as Uint8Array<ArrayBufferLike>, {
    skipPreflight: false,
    preflightCommitment: "confirmed",
  });

  // 6. Confirm
  const confirmation = await connection.confirmTransaction(
    {
      signature,
      blockhash,
      lastValidBlockHeight,
    },
    "confirmed",
  );

  if (confirmation.value.err) {
    throw new Error("Transaction failed");
  }

  console.log("Transaction confirmed:", signature);
  console.log("Explorer URL:", `https://solscan.io/tx/${signature}`);

  return {
    signature,
  };
}
