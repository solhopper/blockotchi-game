import { transact } from "@solana-mobile/mobile-wallet-adapter-protocol-web3js";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";

export const APP_IDENTITY = {
  name: "Blockotchi",
  uri: "https://blockotchi-game.vercel.app",
  icon: "/icon-512.png",
};

export function toUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function isMobileEnvironment(): boolean {
  return /android/i.test(navigator.userAgent);
}

export async function sendTransactionWithBlockhash(
  connection: Connection,
  transaction: Transaction,
  sendTransaction: (tx: Transaction, connection: Connection, options?: any) => Promise<string>,
  publicKey: PublicKey | null,
  cluster: "mainnet-beta" | "devnet" = "mainnet-beta"
): Promise<string> {
  if (isMobileEnvironment()) {
    return await transact(async (wallet) => {
      const authResult = await wallet.authorize({
        cluster,
        identity: APP_IDENTITY,
      });

      const base64Address = authResult.accounts[0].address;
      const fromPubkeyBytes = toUint8Array(base64Address);
      const fromPubkey = new PublicKey(fromPubkeyBytes);

      const { blockhash } = await connection.getLatestBlockhash("confirmed");
      transaction.feePayer = fromPubkey;
      transaction.recentBlockhash = blockhash;

      const signatures = await wallet.signAndSendTransactions({
        transactions: [transaction],
      });

      const signature = signatures[0];
      await connection.confirmTransaction(signature, "confirmed");

      return signature;
    });
  } else {
    if (!publicKey) throw new Error("Wallet not connected");
    
    const { blockhash } = await connection.getLatestBlockhash("confirmed");
    transaction.feePayer = publicKey;
    transaction.recentBlockhash = blockhash;

    const signature = await sendTransaction(transaction, connection, {
      skipPreflight: false,
      preflightCommitment: "confirmed",
    });
    
    await connection.confirmTransaction(signature, "confirmed");
    return signature;
  }
}
