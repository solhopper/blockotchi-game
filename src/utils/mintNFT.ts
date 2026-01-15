import { Connection, Transaction as SolTransaction } from "@solana/web3.js";
import { WalletAdapter } from "@solana/wallet-adapter-base";
import { 
  generateSigner, 
  publicKey as umiPublicKey,
  transactionBuilder,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { base58 } from "@metaplex-foundation/umi/serializers";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { create, mplCore } from "@metaplex-foundation/mpl-core";
import { transferSol } from "@metaplex-foundation/mpl-toolbox";
import { sol } from "@metaplex-foundation/umi";

interface MintResult {
  signature: string;
  mintAddress: string;
}

function walletSupportsSignTransaction(wallet: any): wallet is WalletAdapter & { signTransaction: (tx: SolTransaction) => Promise<SolTransaction> } {
  return 'signTransaction' in wallet && typeof wallet.signTransaction === 'function';
}

export async function mintTamagotchiNFT(
  wallet: WalletAdapter,
  connection: Connection
): Promise<MintResult> {
  try {
    if (!connection) throw new Error("Connection not established");

    const rawWallet = (wallet as any).adapter ? (wallet as any).adapter : wallet;
    if (!rawWallet.publicKey) throw new Error("Wallet public key is missing");

    if (!walletSupportsSignTransaction(rawWallet)) {
      throw new Error('Wallet does not support transaction signing.');
    }

    const metadataUri = import.meta.env.VITE_NFT_METADATA_URI as string;
    const treasuryAddress = import.meta.env.VITE_TREASURY_ADDRESS as string;
    const mintFee = parseFloat(import.meta.env.VITE_MINT_FEE_SOL as string || "0.0029");

    if (!metadataUri) throw new Error("NFT metadata URI not configured in .env");
    if (!treasuryAddress) throw new Error("Treasury address not configured in .env");

    const umi = createUmi(connection.rpcEndpoint)
      .use(mplTokenMetadata())
      .use(mplCore())
      .use(walletAdapterIdentity(rawWallet as any));

    if (!umi.identity) {
      throw new Error("Umi Identity is undefined after initialization.");
    }

    console.log("Minting Tamagotchi NFT...");

    const asset = generateSigner(umi);

    const mintIx = create(umi, {
      asset,
      name: "Pixel Critter Tamagotchi",
      uri: metadataUri,
      owner: umiPublicKey(new Uint8Array(rawWallet.publicKey.toBytes())),
    });

    const treasury = umiPublicKey(treasuryAddress);
    const amount = sol(mintFee);

    const transferIx = transferSol(umi, {
      source: umi.identity,
      destination: treasury,
      amount,
    });

    const builder = transactionBuilder()
      .add(mintIx)
      .add(transferIx);

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    const withTimeout = async <T,>(p: Promise<T>, ms: number): Promise<T> => {
      return await Promise.race([
        p,
        new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms)),
      ]);
    };

    let signatureBase58: string | null = null;
    try {
      const signature = await withTimeout(builder.send(umi), 60_000);
      signatureBase58 = base58.deserialize(signature)[0];
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      const match = message.match(/Signature\s+([1-9A-HJ-NP-Za-km-z]+)\s+has expired/i);
      if (match) {
        signatureBase58 = match[1];
      } else {
        throw e;
      }
    }

    if (signatureBase58) {
      const maxAttempts = 12;
      for (let i = 0; i < maxAttempts; i++) {
        try {
          const { value } = await withTimeout(
            connection.getSignatureStatuses([signatureBase58], {
              searchTransactionHistory: true,
            }),
            4_000
          );
          const status = value[0];
          if (status && !status.err && status.confirmationStatus) {
            break;
          }
        } catch {
        }
        await sleep(1500);
      }
    }

    const mintAddress = asset.publicKey.toString();

    console.log("Tamagotchi NFT Minted!", { signature: signatureBase58, mintAddress });

    return {
      signature: signatureBase58!,
      mintAddress,
    };
  } catch (error) {
    console.error("NFT minting failed:", error);
    throw error;
  }
}
