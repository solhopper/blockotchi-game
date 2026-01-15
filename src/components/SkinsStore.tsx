import { cn } from "@/lib/utils";
import { PetSkin, SKINS } from "@/types/pet";
import ActionButton from "./ActionButton";
import GamePanel from "./GamePanel";

interface SkinsStoreProps {
  coins: number;
  currentSkin: PetSkin;
  unlockedSkins: PetSkin[];
  onBuySkin: (skinId: PetSkin) => boolean;
  onSelectSkin: (skinId: PetSkin) => boolean;
  onClose: () => void;
}

const SKIN_DISPLAY_COLORS: Record<PetSkin, string> = {
  creeper: "bg-grass",
  slime: "bg-lime-400",
  enderman: "bg-purple-900",
  blaze: "bg-orange-500",
  zombie: "bg-teal-600",
  skeleton: "bg-stone-200",
  piglin: "bg-pink-400",
  wither: "bg-stone-900",
  robot: "bg-stone-400",
  ninja: "bg-stone-800",
  wizard: "bg-indigo-700",
  samurai: "bg-red-700",
};

const SkinsStore = ({ 
  coins, 
  currentSkin, 
  unlockedSkins, 
  onBuySkin, 
  onSelectSkin, 
  onClose 
}: SkinsStoreProps) => {
  return (
    <div className="fixed inset-0 bg-foreground/80 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md">
        <GamePanel title="Skins Store" className="space-y-4">
          {/* Coins display */}
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] text-card-foreground uppercase">Your Coins</span>
            <span className="text-xs text-gold flex items-center gap-1">
              🪙 {coins}
            </span>
          </div>

          {/* Skins grid */}
          <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1">
            {SKINS.map((skin) => {
              const isOwned = unlockedSkins.includes(skin.id);
              const isEquipped = currentSkin === skin.id;
              const canAfford = coins >= skin.price;

              return (
                <div
                  key={skin.id}
                  className={cn(
                    "pixel-panel bg-card p-3 space-y-2",
                    isEquipped && "ring-2 ring-gold"
                  )}
                >
                  {/* Skin preview */}
                  <div className="flex justify-center">
                    <div 
                      className={cn(
                        "w-12 h-12 border-2 border-foreground",
                        SKIN_DISPLAY_COLORS[skin.id],
                        !isOwned && "opacity-50"
                      )}
                    >
                      {/* Mini face */}
                      <div className="relative w-full h-full">
                        <div className="absolute top-2 left-1 w-2 h-2 bg-foreground" />
                        <div className="absolute top-2 right-1 w-2 h-2 bg-foreground" />
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-4 h-1 bg-foreground" />
                      </div>
                    </div>
                  </div>

                  {/* Skin name */}
                  <div className="text-center">
                    <p className="text-[8px] text-card-foreground uppercase font-bold">
                      {skin.name}
                    </p>
                    <p className="text-[6px] text-card-foreground/70 mt-0.5">
                      {skin.description}
                    </p>
                  </div>

                  {/* Action button */}
                  {isEquipped ? (
                    <div className="text-[8px] text-gold text-center uppercase py-1">
                      ✓ Equipped
                    </div>
                  ) : isOwned ? (
                    <button
                      onClick={() => onSelectSkin(skin.id)}
                      className="w-full minecraft-btn bg-primary text-primary-foreground px-2 py-1 text-[8px]"
                    >
                      Equip
                    </button>
                  ) : (
                    <button
                      onClick={() => onBuySkin(skin.id)}
                      disabled={!canAfford}
                      className={cn(
                        "w-full minecraft-btn px-2 py-1 text-[8px]",
                        canAfford 
                          ? "bg-gold text-accent-foreground" 
                          : "bg-muted text-muted-foreground cursor-not-allowed"
                      )}
                    >
                      🪙 {skin.price}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Close button */}
          <div className="pt-2">
            <ActionButton onClick={onClose} variant="secondary" className="w-full">
              ✕ Close
            </ActionButton>
          </div>
        </GamePanel>
      </div>
    </div>
  );
};

export default SkinsStore;
