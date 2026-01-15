import { useState, useEffect, useCallback, useRef } from "react";
import ActionButton from "@/components/ActionButton";
import { useSound } from "@/hooks/useSound";

interface CatchGameProps {
  onComplete: (coins: number) => void;
  onClose: () => void;
}

interface FallingItem {
  id: number;
  x: number;
  y: number;
  type: "coin" | "bomb";
}

const GAME_DURATION = 15;
const SPAWN_INTERVAL = 600;
const FALL_SPEED = 3;

const CatchGame = ({ onComplete, onClose }: CatchGameProps) => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [items, setItems] = useState<FallingItem[]>([]);
  const [catcherX, setCatcherX] = useState(50);
  const [lives, setLives] = useState(1);
  const { playSound } = useSound();
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const itemIdRef = useRef(0);

  // Timer
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

  // Spawn items
  useEffect(() => {
    if (!isPlaying) return;

    const spawner = setInterval(() => {
      const isBomb = Math.random() < 0.25;
      setItems((prev) => [
        ...prev,
        {
          id: itemIdRef.current++,
          x: Math.random() * 80 + 10,
          y: 0,
          type: isBomb ? "bomb" : "coin",
        },
      ]);
    }, SPAWN_INTERVAL);

    return () => clearInterval(spawner);
  }, [isPlaying]);

  // Move items down
  useEffect(() => {
    if (!isPlaying) return;

    const mover = setInterval(() => {
      setItems((prev) => {
        const updated = prev
          .map((item) => ({ ...item, y: item.y + FALL_SPEED }))
          .filter((item) => {
            // Check if caught
            if (item.y >= 85 && item.y <= 95) {
              const catcherLeft = catcherX - 10;
              const catcherRight = catcherX + 10;
              if (item.x >= catcherLeft && item.x <= catcherRight) {
                if (item.type === "coin") {
                  setScore((s) => s + 1);
                  playSound("coin");
                } else {
                  setLives((l) => {
                    const newLives = l - 1;
                    if (newLives <= 0) {
                      setIsPlaying(false);
                      setIsFinished(true);
                    }
                    return newLives;
                  });
                  playSound("click");
                }
                return false;
              }
            }
            return item.y < 100;
          });
        return updated;
      });
    }, 50);

    return () => clearInterval(mover);
  }, [isPlaying, catcherX, playSound]);

  const handleMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isPlaying || !gameAreaRef.current) return;

      const rect = gameAreaRef.current.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const x = ((clientX - rect.left) / rect.width) * 100;
      setCatcherX(Math.max(10, Math.min(90, x)));
    },
    [isPlaying]
  );

  const startGame = () => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setItems([]);
    setLives(1);
    setIsPlaying(true);
    setIsFinished(false);
    playSound("play");
  };

  const claimReward = () => {
    playSound("coin");
    onComplete(score);
  };

  return (
    <div className="space-y-3 text-center">
      <h3 className="text-sm text-gold uppercase">Coin Catcher</h3>
      <p className="text-[8px] text-foreground/70">
        Catch coins, avoid bombs! 💣
      </p>

      <div className="flex justify-center gap-3 text-[10px]">
        <div className="pixel-panel bg-card px-2 py-1">
          <span className="text-foreground/60">Time:</span>{" "}
          <span className="text-energy">{timeLeft}s</span>
        </div>
        <div className="pixel-panel bg-card px-2 py-1">
          <span className="text-foreground/60">Score:</span>{" "}
          <span className="text-gold">{score}</span>
        </div>
        <div className="pixel-panel bg-card px-2 py-1">
          <span className="text-foreground/60">Lives:</span>
          <span className="text-hunger">{"❤️".repeat(lives)}</span>
        </div>
      </div>

      {!isPlaying && !isFinished && (
        <ActionButton onClick={startGame} variant="primary" className="w-full">
          🎮 Start Game
        </ActionButton>
      )}

      {isPlaying && (
        <div
          ref={gameAreaRef}
          onMouseMove={handleMove}
          onTouchMove={handleMove}
          className="relative w-full h-48 pixel-panel bg-night-sky overflow-hidden cursor-none touch-none"
        >
          {/* Falling items */}
          {items.map((item) => (
            <div
              key={item.id}
              className="absolute text-lg transition-none"
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {item.type === "coin" ? (
                <img src="/coin.svg" alt="coin" className="w-5 h-5" />
              ) : (
                "💣"
              )}
            </div>
          ))}

          {/* Catcher */}
          <div
            className="absolute bottom-2 w-12 h-6 pixel-panel bg-primary"
            style={{
              left: `${catcherX}%`,
              transform: "translateX(-50%)",
            }}
          >
            <span className="text-[10px]">🧺</span>
          </div>
        </div>
      )}

      {isFinished && (
        <div className="space-y-3">
          <div className="pixel-panel bg-card p-3">
            <p className="text-[10px] text-foreground/70">You caught</p>
            <p className="text-lg text-gold">{score} coins!</p>
            <p className="text-[10px] text-gold mt-1 flex items-center justify-center gap-1">
              <img src="/coin.svg" alt="coin" className="w-4 h-4" />
              +{score} coins
            </p>
          </div>
          <div className="flex gap-2">
            <ActionButton onClick={startGame} variant="secondary" className="flex-1">
              🔄 Retry
            </ActionButton>
            <ActionButton onClick={claimReward} variant="gold" className="flex-1">
              <span className="flex items-center justify-center gap-1">
                <img src="/coin.svg" alt="coin" className="w-4 h-4" />
                Claim
              </span>
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

export default CatchGame;
