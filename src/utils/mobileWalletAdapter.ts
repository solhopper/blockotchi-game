import { transact } from "@solana-mobile/mobile-wallet-adapter-protocol-web3js";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";

const MWA_AUTH_TOKEN_STORAGE_KEY = "mwa_auth_token";

const APP_IDENTITY = {
  name: "Blockotchi",
  uri: "https://blockotchi-game.vercel.app",
  icon: "/icon-512.png",
} as const;

function isAndroid(): boolean {
  return /android/i.test(navigator.userAgent);
}

function toUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function rebuildTransactionFromInstructions(original: Transaction): Transaction {
  const rebuilt = new Transaction();
  if (original.instructions?.length) {
    rebuilt.add(...original.instructions);
  }
  return rebuilt;
}

export async function sendTransactionWithBlockhash(
  connection: Connection,
  transaction: Transaction,
  sendTransaction: (tx: Transaction, connection: Connection, options?: any) => Promise<string>,
  publicKey: PublicKey | null
): Promise<string> {
  if (!publicKey) throw new Error("Wallet not connected");

  if (isAndroid()) {
    return await transact(async (wallet) => {
      const storedAuthToken = localStorage.getItem(MWA_AUTH_TOKEN_STORAGE_KEY) || undefined;

      const authResult = storedAuthToken
        ? await wallet.reauthorize({
            auth_token: storedAuthToken,
            identity: APP_IDENTITY,
          })
        : await wallet.authorize({
            cluster: "mainnet-beta",
            identity: APP_IDENTITY,
          });

      if (authResult.auth_token) {
        localStorage.setItem(MWA_AUTH_TOKEN_STORAGE_KEY, authResult.auth_token);
      }

      const base64Address = authResult.accounts[0].address;
      const fromPubkey = new PublicKey(toUint8Array(base64Address));

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("finalized");
      const txForSend = rebuildTransactionFromInstructions(transaction);

      txForSend.feePayer = fromPubkey;
      txForSend.recentBlockhash = blockhash;
      txForSend.signatures = [];

      const signatures = await wallet.signAndSendTransactions({
        transactions: [txForSend],
      });

      const signature = signatures[0];
      await connection.confirmTransaction(
        {
          signature,
          blockhash,
          lastValidBlockHeight,
        },
        "confirmed"
      );

      return signature;
    });
  }

  let lastError: Error | null = null;
  const maxRetries = 3;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
      const txForSend = rebuildTransactionFromInstructions(transaction);

      txForSend.feePayer = publicKey;
      txForSend.recentBlockhash = blockhash;
      txForSend.signatures = [];

      const signature = await sendTransaction(txForSend, connection, {
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
    } catch (error) {
      lastError = error as Error;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes("blockhash") && attempt < maxRetries - 1) {
        console.log(`Blockhash error, retrying... (${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
      
      throw error;
    }
  }

  throw lastError || new Error("Transaction failed after retries");
}
