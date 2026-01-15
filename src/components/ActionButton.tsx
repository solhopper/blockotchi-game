import { cn } from "@/lib/utils";

interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "gold";
  className?: string;
}

const ActionButton = ({
  onClick,
  disabled = false,
  children,
  variant = "primary",
  className,
}: ActionButtonProps) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "primary":
        return "bg-grass hover:bg-grass/90";
      case "secondary":
        return "bg-stone-light hover:bg-muted";
      case "gold":
        return "bg-gold hover:bg-gold/90 text-foreground";
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "minecraft-btn px-4 py-3 text-card-foreground",
        "transition-all duration-100 active:translate-y-0.5",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        getVariantClasses(),
        className
      )}
    >
      {children}
    </button>
  );
};

export default ActionButton;
