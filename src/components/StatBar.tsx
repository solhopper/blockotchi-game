import { cn } from "@/lib/utils";

interface StatBarProps {
  label: string;
  value: number;
  maxValue: number;
  color: "hunger" | "happiness" | "energy";
  icon: React.ReactNode;
}

const StatBar = ({ label, value, maxValue, color, icon }: StatBarProps) => {
  const percentage = Math.min((value / maxValue) * 100, 100);

  const getColorClass = () => {
    switch (color) {
      case "hunger":
        return "bg-hunger";
      case "happiness":
        return "bg-happiness";
      case "energy":
        return "bg-energy";
    }
  };

  const getLowWarning = () => {
    if (percentage < 20) return "animate-pulse";
    return "";
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[10px] text-card-foreground">
        <div className="flex items-center gap-2">
          <span className={getLowWarning()}>{icon}</span>
          <span className="uppercase tracking-wider">{label}</span>
        </div>
        <span>{Math.round(value)}/{maxValue}</span>
      </div>
      <div className="stat-bar bg-stone-dark">
        <div
          className={cn(
            "h-full transition-all duration-300",
            getColorClass(),
            getLowWarning()
          )}
          style={{ width: `${percentage}%` }}
        >
          {/* Pixel segments */}
          <div className="h-full flex">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-full flex-1 border-r border-foreground/20",
                  percentage >= (i + 1) * 10 ? "" : "opacity-0"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatBar;
