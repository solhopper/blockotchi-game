import { cn } from "@/lib/utils";
import { EvolutionStage, EVOLUTION_MILESTONES, EVOLUTION_TX_MILESTONES } from "@/types/pet";

interface EvolutionBadgeProps {
  currentStage: EvolutionStage;
  age: number;
  txCount?: number;
  className?: string;
}

const STAGE_INFO: Record<EvolutionStage, { icon: string; label: string }> = {
  baby: { icon: "", label: "Baby" },
  child: { icon: "", label: "Child" },
  teen: { icon: "", label: "Teen" },
  adult: { icon: "", label: "Adult" },
  elder: { icon: "", label: "Elder" },
};

const STAGES: EvolutionStage[] = ["baby", "child", "teen", "adult", "elder"];

const EvolutionBadge = ({ currentStage, age, txCount, className }: EvolutionBadgeProps) => {
  const currentIndex = STAGES.indexOf(currentStage);
  const nextStage = STAGES[currentIndex + 1];
  const milestones = typeof txCount === "number" ? EVOLUTION_TX_MILESTONES : EVOLUTION_MILESTONES;
  const progressValue = typeof txCount === "number" ? txCount : age;
  const nextMilestone = nextStage ? milestones[nextStage] : null;
  
  const progress = nextMilestone 
    ? ((progressValue - milestones[currentStage]) / (nextMilestone - milestones[currentStage])) * 100
    : 100;

  return (
    <div className={cn("pixel-panel bg-card p-2", className)}>
      {/* Current stage */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-base">{STAGE_INFO[currentStage].icon}</span>
          <span className="text-[8px] text-card-foreground uppercase">
            {STAGE_INFO[currentStage].label}
          </span>
        </div>
        {nextStage && (
          <span className="text-[6px] text-card-foreground/60 uppercase">
            → {STAGE_INFO[nextStage].label}
          </span>
        )}
      </div>

      {/* Evolution progress */}
      {nextStage && (
        <div className="stat-bar bg-stone-dark h-3">
          <div 
            className="h-full bg-diamond transition-all duration-300"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      )}

      {/* Stage indicators */}
      <div className="flex justify-between mt-2">
        {STAGES.map((stage, i) => (
          <div 
            key={stage}
            className={cn(
              "w-4 h-4 border border-foreground flex items-center justify-center text-[6px]",
              i <= currentIndex ? "bg-diamond" : "bg-stone-dark"
            )}
          >
            {i <= currentIndex ? "✓" : ""}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EvolutionBadge;
