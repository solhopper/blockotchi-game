import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import PixelPet from "./PixelPet";
import { mintTamagotchiNFT } from "@/utils/mintNFT";

interface MintNFTModalProps {
  onMintSuccess: (mintAddress: string) => void;
}

export const MintNFTModal = ({ onMintSuccess }: MintNFTModalProps) => {
  const { connection } = useConnection();
  const { publicKey, wallet } = useWallet();
  const [isMinting, setIsMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMint = async () => {
    if (!publicKey || !wallet) {
      setError("Please connect your wallet first");
      return;
    }

    setIsMinting(true);
    setError(null);

    try {
      const result = await mintTamagotchiNFT(wallet.adapter, connection);
      console.log("Mint successful:", result);
      onMintSuccess(result.mintAddress);
    } catch (err) {
      console.error("Mint failed:", err);
      setError(err instanceof Error ? err.message : "Failed to mint NFT");
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="pixel-panel bg-card max-w-md w-full p-6 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-lg font-pixel text-gold uppercase">
            Mint Your Blockotchi NFT
          </h2>
          <p className="text-[10px] text-card-foreground/80">
            To play the game, you have to mint your unique Pixel Critter NFT on Solana
          </p>
        </div>

        {/* Character Preview */}
        <div className="flex justify-center py-6 bg-background/20 rounded pixel-panel">
          <div className="relative">
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-0">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 bg-dirt border-2 border-foreground"
                  style={{
                    background: `linear-gradient(to bottom, hsl(var(--grass)) 0%, hsl(var(--grass)) 30%, hsl(var(--dirt)) 30%)`,
                  }}
                />
              ))}
            </div>
            <PixelPet 
              mood="happy" 
              evolutionStage="baby"
              skin="creeper"
              justEvolved={false}
            />
          </div>
        </div>

        {/* Mint Info
        <div className="space-y-3">
          <div className="flex justify-between text-[10px] text-card-foreground/80">
            <span>Mint Fee:</span>
            <span className="text-gold">{import.meta.env.VITE_MINT_FEE_SOL || "0.0029"} SOL</span>
          </div>
          <div className="flex justify-between text-[10px] text-card-foreground/80">
            <span>Network:</span>
            <span className="text-gold uppercase">
              {connection.rpcEndpoint.includes("devnet") ? "DEVNET" : "MAINNET"}
            </span>
          </div>
        </div> */}

        {/* Wallet Connection / Mint Button */}
        <div className="space-y-3">
          {!publicKey ? (
            <div className="flex flex-col items-center gap-2">
              <p className="text-[10px] text-card-foreground/60 text-center">
                Connect your wallet to continue
              </p>
              <WalletMultiButton className="minecraft-btn" />
            </div>
          ) : (
            <button
              onClick={handleMint}
              disabled={isMinting}
              className="w-full minecraft-btn bg-gold hover:bg-gold/90 text-foreground font-pixel text-xs uppercase py-3 px-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isMinting ? "Minting..." : "Mint NFT & Play"}
            </button>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="pixel-panel bg-destructive/20 border-destructive p-3">
            <p className="text-[9px] text-destructive-foreground text-center">
              {error}
            </p>
          </div>
        )}

        {/* Info Text */}
        <p className="text-[8px] text-card-foreground/60 text-center">
          This NFT represents your Pixel Critter and is stored on the Solana blockchain.
        </p>
      </div>
    </div>
  );
};
