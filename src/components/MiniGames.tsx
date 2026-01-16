import { useState, useEffect } from "react";
import GamePanel from "@/components/GamePanel";
import ActionButton from "@/components/ActionButton";
import ClickerGame from "@/components/games/ClickerGame";
import CatchGame from "@/components/games/CatchGame";
import { useSound } from "@/hooks/useSound";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { sendTransactionWithBlockhash } from "@/utils/mobileWalletAdapter";

interface MiniGamesProps {
  onEarnCoins: (coins: number, gameType?: "clicker" | "catch") => void;
  onClose: () => void;
  getGameCooldown: (gameType: "clicker" | "catch") => { isOnCooldown: boolean; timeLeftMs: number };
  resetGameCooldown: (gameType: "clicker" | "catch") => void;
}

type GameType = "menu" | "clicker" | "catch";

const MiniGames = ({ onEarnCoins, onClose, getGameCooldown, resetGameCooldown }: MiniGamesProps) => {
  const [activeGame, setActiveGame] = useState<GameType>("menu");
  const [cooldownTimers, setCooldownTimers] = useState<{ clicker: string; catch: string }>({ clicker: "", catch: "" });
  const [unlocking, setUnlocking] = useState<"clicker" | "catch" | null>(null);
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const { playSound } = useSound();
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  
  const UNLOCK_FEE_SOL = parseFloat(import.meta.env.VITE_GAME_UNLOCK_FEE_SOL || "0.001");
  const TREASURY_ADDRESS = import.meta.env.VITE_TREASURY_ADDRESS;

  // Update cooldown timers every second
  useEffect(() => {
    const interval = setInterval(() => {
      const clickerCooldown = getGameCooldown("clicker");
      const catchCooldown = getGameCooldown("catch");
      
      setCooldownTimers({
        clicker: formatTimeLeft(clickerCooldown.timeLeftMs),
        catch: formatTimeLeft(catchCooldown.timeLeftMs),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [getGameCooldown]);

  const formatTimeLeft = (ms: number): string => {
    if (ms <= 0) return "";
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const handleSelectGame = (game: "clicker" | "catch") => {
    const cooldown = getGameCooldown(game);
    if (cooldown.isOnCooldown) {
      playSound("click");
      return; // Don't allow playing if on cooldown
    }
    playSound("click");
    setActiveGame(game);
  };

  const handleUnlockGame = async (game: "clicker" | "catch") => {
    if (!publicKey || !TREASURY_ADDRESS) {
      setUnlockError("Wallet not connected");
      playSound("click");
      return;
    }

    setUnlocking(game);
    setUnlockError(null);

    try {
      const treasuryPubkey = new PublicKey(TREASURY_ADDRESS);
      const lamports = Math.floor(UNLOCK_FEE_SOL * LAMPORTS_PER_SOL);

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
        publicKey,
        "mainnet-beta"
      );

      playSound("coin");
      resetGameCooldown(game);
      setActiveGame(game);
    } catch (error) {
      console.error("Unlock failed:", error);
      setUnlockError(error instanceof Error ? error.message : "Transaction failed");
      playSound("click");
    } finally {
      setUnlocking(null);
    }
  };

  const handleComplete = (coins: number, gameType: "clicker" | "catch") => {
    onEarnCoins(coins, gameType);
    setActiveGame("menu");
  };

  return (
    <div className="fixed inset-0 bg-background/90 flex items-center justify-center z-50 p-4">
      <GamePanel title="Mini Games" className="w-full max-w-sm">
        {activeGame === "menu" && (
          <div className="space-y-4">
            <p className="text-[8px] text-foreground/70 text-center">
              Play games to earn extra coins!
            </p>

            <div className="space-y-2">
              {/* Speed Clicker */}
              <div className="space-y-1">
                <ActionButton
                  onClick={() => handleSelectGame("clicker")}
                  variant="primary"
                  className="w-full"
                  disabled={getGameCooldown("clicker").isOnCooldown}
                >
                  👆 Speed Clicker {cooldownTimers.clicker && `(${cooldownTimers.clicker})`}
                </ActionButton>
                {getGameCooldown("clicker").isOnCooldown && (
                  <ActionButton
                    onClick={() => handleUnlockGame("clicker")}
                    variant="gold"
                    className="w-full text-[9px]"
                    disabled={unlocking === "clicker" || !publicKey}
                  >
                    {unlocking === "clicker" ? "Processing..." : `Play earlier`}
                  </ActionButton>
                )}
                <p className="text-[8px] text-foreground/50 text-center">
                  Click as fast as you can in 10 seconds
                </p>
              </div>

              {/* Coin Catcher */}
              <div className="space-y-1 mt-3">
                <ActionButton
                  onClick={() => handleSelectGame("catch")}
                  variant="primary"
                  className="w-full"
                  disabled={getGameCooldown("catch").isOnCooldown}
                >
                  🧺 Coin Catcher {cooldownTimers.catch && `(${cooldownTimers.catch})`}
                </ActionButton>
                {getGameCooldown("catch").isOnCooldown && (
                  <ActionButton
                    onClick={() => handleUnlockGame("catch")}
                    variant="gold"
                    className="w-full text-[9px]"
                    disabled={unlocking === "catch" || !publicKey}
                  >
                    {unlocking === "catch" ? "Processing..." : `Play earlier`}
                  </ActionButton>
                )}
                <p className="text-[8px] text-foreground/50 text-center">
                  Catch falling coins, avoid bombs!
                </p>
              </div>
            </div>

            {/* Error Display */}
            {unlockError && (
              <div className="pixel-panel bg-destructive/20 border-destructive p-2 mt-2">
                <p className="text-[8px] text-destructive-foreground text-center">
                  {unlockError}
                </p>
              </div>
            )}

            <ActionButton onClick={onClose} variant="secondary" className="w-full mt-4">
              ✖ Close
            </ActionButton>
          </div>
        )}

        {activeGame === "clicker" && (
          <ClickerGame
            onComplete={(coins) => handleComplete(coins, "clicker")}
            onClose={() => setActiveGame("menu")}
          />
        )}

        {activeGame === "catch" && (
          <CatchGame
            onComplete={(coins) => handleComplete(coins, "catch")}
            onClose={() => setActiveGame("menu")}
          />
        )}
      </GamePanel>
    </div>
  );
};

export default MiniGames;
