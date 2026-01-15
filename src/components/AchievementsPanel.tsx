import GamePanel from "@/components/GamePanel";
import ActionButton from "@/components/ActionButton";
import { ACHIEVEMENTS, AchievementId } from "@/types/pet";
import { cn } from "@/lib/utils";

interface AchievementsPanelProps {
  unlockedAchievements: AchievementId[];
  onClose: () => void;
}

const AchievementsPanel = ({ unlockedAchievements, onClose }: AchievementsPanelProps) => {
  const unlockedCount = unlockedAchievements.length;
  const totalCount = ACHIEVEMENTS.length;

  return (
    <div className="fixed inset-0 bg-background/90 flex items-center justify-center z-50 p-4">
      <GamePanel title="Achievements" className="w-full max-w-sm max-h-[80vh] overflow-hidden flex flex-col">
        <div className="text-center mb-3">
          <p className="text-[10px] text-gold">
            🏆 {unlockedCount} / {totalCount} Unlocked
          </p>
          <div className="w-full h-2 bg-muted mt-2 pixel-panel">
            <div 
              className="h-full bg-gold transition-all duration-300"
              style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>

        <div className="overflow-y-auto no-scrollbar flex-1 space-y-2 pr-1">
          {ACHIEVEMENTS.map((achievement) => {
            const isUnlocked = unlockedAchievements.includes(achievement.id);
            
            return (
              <div
                key={achievement.id}
                className={cn(
                  "pixel-panel p-2 flex items-center gap-3 transition-all",
                  isUnlocked 
                    ? "bg-card" 
                    : "bg-muted/50 opacity-60"
                )}
              >
                <div className={cn(
                  "w-10 h-10 flex items-center justify-center text-xl pixel-panel",
                  isUnlocked ? "bg-gold/20" : "bg-muted"
                )}>
                  {isUnlocked ? achievement.icon : "🔒"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-[10px] font-bold truncate",
                    isUnlocked ? "text-foreground" : "text-foreground/50"
                  )}>
                    {achievement.name}
                  </p>
                  <p className="text-[8px] text-foreground/60 truncate">
                    {achievement.description}
                  </p>
                </div>
                {isUnlocked && (
                  <span className="text-[8px] text-gold">✓</span>
                )}
              </div>
            );
          })}
        </div>

        <ActionButton onClick={onClose} variant="secondary" className="w-full mt-3">
          ✖ Close
        </ActionButton>
      </GamePanel>
    </div>
  );
};

export default AchievementsPanel;
