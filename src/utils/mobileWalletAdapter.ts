import { Connection, PublicKey, Transaction } from "@solana/web3.js";

export async function sendTransactionWithBlockhash(
  connection: Connection,
  transaction: Transaction,
  sendTransaction: (tx: Transaction, connection: Connection, options?: any) => Promise<string>,
  publicKey: PublicKey | null
): Promise<string> {
  if (!publicKey) throw new Error("Wallet not connected");
  
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
  transaction.feePayer = publicKey;
  transaction.recentBlockhash = blockhash;

  const signature = await sendTransaction(transaction, connection, {
    skipPreflight: false,
    preflightCommitment: "confirmed",
  });
  
  await connection.confirmTransaction(
    {
      signature,
      blockhash,
      lastValidBlockHeight,
    },
    "confirmed"
  );
  
  return signature;
}
