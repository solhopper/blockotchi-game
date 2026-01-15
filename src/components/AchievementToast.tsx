import { useEffect, useState } from "react";
import { AchievementId, ACHIEVEMENTS } from "@/types/pet";
import { useSound } from "@/hooks/useSound";

interface AchievementToastProps {
  achievementId: AchievementId | null;
}

const AchievementToast = ({ achievementId }: AchievementToastProps) => {
  const [visible, setVisible] = useState(false);
  const { playSound } = useSound();

  useEffect(() => {
    if (achievementId) {
      setVisible(true);
      playSound("evolve");
      const timer = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [achievementId, playSound]);

  if (!visible || !achievementId) return null;

  const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
  if (!achievement) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
      <div className="pixel-panel bg-gold/90 px-4 py-3 flex items-center gap-3">
        <span className="text-2xl">{achievement.icon}</span>
        <div>
          <p className="text-[8px] text-foreground/70 uppercase">Achievement Unlocked!</p>
          <p className="text-[10px] text-foreground font-bold">{achievement.name}</p>
        </div>
      </div>
    </div>
  );
};

export default AchievementToast;
