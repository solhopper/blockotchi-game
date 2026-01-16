import { useState } from "react";
import GamePanel from "@/components/GamePanel";
import ActionButton from "@/components/ActionButton";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useSound } from "@/hooks/useSound";
import { sendTransactionWithBlockhash } from "@/utils/mobileWalletAdapter";

interface DeathScreenProps {
  onRevive: () => void;
  onRestart: () => void;
}

const DeathScreen = ({ onRevive, onRestart }: DeathScreenProps) => {
  const [isReviving, setIsReviving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const { playSound } = useSound();

  const REVIVAL_FEE_SOL = parseFloat(import.meta.env.VITE_REVIVAL_FEE_SOL || "0.002");
  const TREASURY_ADDRESS = import.meta.env.VITE_TREASURY_ADDRESS;

  const handleRevive = async () => {
    if (!publicKey || !TREASURY_ADDRESS) {
      setError("Wallet not connected");
      return;
    }

    setIsReviving(true);
    setError(null);

    try {
      const treasuryPubkey = new PublicKey(TREASURY_ADDRESS);
      const lamports = Math.floor(REVIVAL_FEE_SOL * LAMPORTS_PER_SOL);

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: treasuryPubkey,
          lamports,
        })
      );

      await sendTransactionWithBlockhash(
        connection,
        transaction,
        sendTransaction,
        publicKey
      );

      playSound("evolve");
      onRevive();
    } catch (err) {
      console.error("Revival failed:", err);
      setError(err instanceof Error ? err.message : "Transaction failed");
      playSound("click");
    } finally {
      setIsReviving(false);
    }
  };

  const handleRestart = () => {
    playSound("click");
    onRestart();
  };

  return (
    <div className="fixed inset-0 bg-background/95 flex items-center justify-center z-50 p-4">
      <GamePanel title="💀 Your Blockotchi Has Passed" className="w-full max-w-md">
        <div className="space-y-4">
          {/* Death Message */}
          <div className="text-center space-y-2">
            <div className="text-6xl mb-4">💀</div>
            <p className="text-[10px] text-foreground/90 leading-relaxed">
              Your Tamagotchi has passed away...
            </p>
            <p className="text-[8px] text-foreground/60 leading-relaxed">
              You must check in every 24 hours to keep your pet alive!
              Don't forget to pet and play with it!
            </p>
          </div>

          {/* Options */}
          <div className="space-y-2 pt-2">
            <p className="text-[9px] text-gold text-center uppercase tracking-wider font-bold">
              Choose Your Path
            </p>

            {/* Revive Option */}
            <ActionButton
              onClick={handleRevive}
              disabled={isReviving || !publicKey}
              variant="gold"
              className="w-full"
            >
              {isReviving ? "Processing..." : `✨ Revive Pet`}
            </ActionButton>
            <p className="text-[7px] text-foreground/50 text-center">
              Revive your Blockotchi
            </p>

            {/* Start New Game */}
            <ActionButton
              onClick={handleRestart}
              variant="secondary"
              className="w-full mt-3"
            >
              🔄 Start New Game
            </ActionButton>
            <p className="text-[7px] text-foreground/50 text-center">
              Begin fresh with a new Blockotchi (all progress lost)
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="pixel-panel bg-destructive/20 border-destructive p-2 mt-2">
              <p className="text-[8px] text-destructive-foreground text-center">
                {error}
              </p>
            </div>
          )}

          {/* Reminder */}
          <div className="pixel-panel bg-card/50 p-2 mt-4">
            <p className="text-[7px] text-foreground/70 text-center leading-relaxed">
              💡 Remember: Complete daily check-ins to keep your pet alive!
            </p>
          </div>
        </div>
      </GamePanel>
    </div>
  );
};

export default DeathScreen;
