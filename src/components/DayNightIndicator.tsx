import { cn } from "@/lib/utils";

interface DayNightIndicatorProps {
  isNight: boolean;
}

const DayNightIndicator = ({ isNight }: DayNightIndicatorProps) => {
  return (
    <div className="flex items-center gap-2 text-[10px] text-card-foreground uppercase">
      <div
        className={cn(
          "w-8 h-8 border-2 border-foreground flex items-center justify-center transition-colors duration-500",
          isNight ? "bg-night-sky" : "bg-happiness"
        )}
      >
        {isNight ? (
          <span className="text-base">🌙</span>
        ) : (
          <span className="text-base">☀️</span>
        )}
      </div>
      <span>{isNight ? "Night" : "Day"}</span>
    </div>
  );
};

export default DayNightIndicator;
