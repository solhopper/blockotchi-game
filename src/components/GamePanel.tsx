import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GamePanelProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

const GamePanel = ({ children, className, title }: GamePanelProps) => {
  return (
    <div className={cn("pixel-panel bg-card p-4", className)}>
      {title && (
        <h2 className="text-[10px] text-card-foreground uppercase tracking-wider mb-3 text-shadow-pixel">
          {title}
        </h2>
      )}
      {children}
    </div>
  );
};

export default GamePanel;
