import { useState, useEffect, useCallback } from "react";
import ActionButton from "@/components/ActionButton";
import { useSound } from "@/hooks/useSound";

interface ClickerGameProps {
  onComplete: (coins: number) => void;
  onClose: () => void;
}

const GAME_DURATION = 10; // seconds
const COINS_PER_CLICK = 0.5;

const ClickerGame = ({ onComplete, onClose }: ClickerGameProps) => {
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const { playSound } = useSound();

  useEffect(() => {
    if (!isPlaying || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsPlaying(false);
          setIsFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, timeLeft]);

  const handleClick = useCallback(() => {
    if (!isPlaying) return;
    setClicks((prev) => prev + 1);
    playSound("click");
  }, [isPlaying, playSound]);

  const startGame = () => {
    setClicks(0);
    setTimeLeft(GAME_DURATION);
    setIsPlaying(true);
    setIsFinished(false);
    playSound("play");
  };

  const claimReward = () => {
    const coins = Math.floor(clicks * COINS_PER_CLICK);
    playSound("coin");
    onComplete(coins);
  };

  return (
    <div className="space-y-4 text-center">
      <h3 className="text-sm text-gold uppercase">Speed Clicker</h3>
      <p className="text-[8px] text-foreground/70">
        Click as fast as you can!
      </p>

      <div className="flex justify-center gap-4 text-[10px]">
        <div className="pixel-panel bg-card px-3 py-2">
          <span className="text-foreground/60">Time:</span>{" "}
          <span className="text-energy">{timeLeft}s</span>
        </div>
        <div className="pixel-panel bg-card px-3 py-2">
          <span className="text-foreground/60">Clicks:</span>{" "}
          <span className="text-happiness">{clicks}</span>
        </div>
      </div>

      {!isPlaying && !isFinished && (
        <ActionButton onClick={startGame} variant="primary" className="w-full">
          🎮 Start Game
        </ActionButton>
      )}

      {isPlaying && (
        <button
          onClick={handleClick}
          className="w-32 h-32 mx-auto pixel-panel bg-primary hover:bg-primary/80 active:scale-95 transition-transform flex items-center justify-center"
        >
          <span className="text-2xl">👆</span>
        </button>
      )}

      {isFinished && (
        <div className="space-y-3">
          <div className="pixel-panel bg-card p-3">
            <p className="text-[10px] text-foreground/70">You clicked</p>
            <p className="text-lg text-happiness">{clicks} times!</p>
            <p className="text-[10px] text-gold mt-1">
              🪙 +{Math.floor(clicks * COINS_PER_CLICK)} coins
            </p>
          </div>
          <div className="flex gap-2">
            <ActionButton onClick={startGame} variant="secondary" className="flex-1">
              🔄 Retry
            </ActionButton>
            <ActionButton onClick={claimReward} variant="gold" className="flex-1">
              🪙 Claim
            </ActionButton>
          </div>
        </div>
      )}

      <ActionButton onClick={onClose} variant="secondary" className="w-full mt-2">
        ← Back
      </ActionButton>
    </div>
  );
};

export default ClickerGame;
