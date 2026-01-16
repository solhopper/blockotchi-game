import { useState, useEffect } from "react";
import ActionButton from "@/components/ActionButton";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useSound } from "@/hooks/useSound";
import { sendTransactionWithBlockhash } from "@/utils/mobileWalletAdapter";

interface DailyCheckInProps {
  getCheckInStatus: () => { needsCheckIn: boolean; timeLeftMs: number; isOverdue: boolean };
  onCheckInComplete: () => void;
}

const DailyCheckIn = ({ getCheckInStatus, onCheckInComplete }: DailyCheckInProps) => {
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState("");
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const { playSound } = useSound();

  const CHECKIN_FEE_SOL = parseFloat(import.meta.env.VITE_DAILY_CHECKIN_FEE_SOL || "0.0005");
  const TREASURY_ADDRESS = import.meta.env.VITE_TREASURY_ADDRESS;

  useEffect(() => {
    const updateTimer = () => {
      const status = getCheckInStatus();
      const hours = Math.floor(status.timeLeftMs / (1000 * 60 * 60));
      const minutes = Math.floor((status.timeLeftMs % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(status.isOverdue ? "OVERDUE!" : `${hours}h ${minutes}m`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [getCheckInStatus]);

  const handleCheckIn = async () => {
    if (!publicKey || !TREASURY_ADDRESS) {
      setError("Wallet not connected");
      playSound("click");
      return;
    }

    setIsCheckingIn(true);
    setError(null);

    try {
      const treasuryPubkey = new PublicKey(TREASURY_ADDRESS);
      const lamports = Math.floor(CHECKIN_FEE_SOL * LAMPORTS_PER_SOL);

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

      playSound("coin");
      onCheckInComplete();
    } catch (err) {
      console.error("Check-in failed:", err);
      setError(err instanceof Error ? err.message : "Transaction failed");
      playSound("click");
    } finally {
      setIsCheckingIn(false);
    }
  };

  const status = getCheckInStatus();

  return (
    <div className="pixel-panel bg-card p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[9px] text-gold uppercase tracking-wider font-bold">
            📅 Daily Check-In
          </p>
          <p className="text-[7px] text-foreground/60 mt-0.5">
            {status.isOverdue ? "⚠️ Overdue - Pet will die!" : `Next check-in: ${timeLeft}`}
          </p>
        </div>
        <ActionButton
          onClick={handleCheckIn}
          disabled={isCheckingIn || !publicKey}
          variant={status.isOverdue ? "gold" : "primary"}
          className="text-[9px] px-2 py-1.5 min-w-[90px]"
        >
          {isCheckingIn ? "..." : `Check In`}
        </ActionButton>
      </div>

      {error && (
        <p className="text-[7px] text-destructive text-center">
          {error}
        </p>
      )}
    </div>
  );
};

export default DailyCheckIn;
