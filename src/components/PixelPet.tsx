import { cn } from "@/lib/utils";
import { PetMood, EvolutionStage, PetSkin } from "@/types/pet";

interface PixelPetProps {
  mood: PetMood;
  evolutionStage: EvolutionStage;
  skin: PetSkin;
  justEvolved?: boolean;
  className?: string;
}

const SKIN_COLORS: Record<PetSkin, { bg: string; accent: string }> = {
  creeper: { bg: "bg-grass", accent: "bg-grass" },
  slime: { bg: "bg-lime-400", accent: "bg-lime-300" },
  enderman: { bg: "bg-purple-900", accent: "bg-purple-600" },
  blaze: { bg: "bg-orange-500", accent: "bg-yellow-400" },
  zombie: { bg: "bg-teal-600", accent: "bg-teal-400" },
  skeleton: { bg: "bg-stone-200", accent: "bg-stone-100" },
  piglin: { bg: "bg-pink-400", accent: "bg-gold" },
  wither: { bg: "bg-stone-900", accent: "bg-stone-700" },
  robot: { bg: "bg-stone-400", accent: "bg-cyan-300" },
  ninja: { bg: "bg-stone-800", accent: "bg-red-600" },
  wizard: { bg: "bg-indigo-700", accent: "bg-gold" },
  samurai: { bg: "bg-red-700", accent: "bg-gold" },
};

const EVOLUTION_SIZES: Record<EvolutionStage, { body: string; feet: string; scale: number }> = {
  baby: { body: "w-16 h-16", feet: "w-4 h-3", scale: 0.7 },
  child: { body: "w-20 h-20", feet: "w-5 h-3", scale: 0.85 },
  teen: { body: "w-24 h-24", feet: "w-6 h-4", scale: 1 },
  adult: { body: "w-28 h-28", feet: "w-7 h-4", scale: 1.1 },
  elder: { body: "w-32 h-32", feet: "w-8 h-5", scale: 1.2 },
};

const PixelPet = ({ mood, evolutionStage, skin, justEvolved, className }: PixelPetProps) => {
  const colors = SKIN_COLORS[skin];
  const size = EVOLUTION_SIZES[evolutionStage];

  const getEyes = () => {
    const eyeScale = 1;
    const eyeSize = `w-${Math.max(2, Math.floor(4 * eyeScale))} h-${Math.max(2, Math.floor(4 * eyeScale))}`;

    switch (mood) {
      case "sleeping":
        return (
          <>
            <div className="absolute top-[25%] left-[16%] w-4 h-1 bg-foreground" style={{ transform: `scale(${size.scale * 0.8})` }} />
            <div className="absolute top-[25%] right-[16%] w-4 h-1 bg-foreground" style={{ transform: `scale(${size.scale * 0.8})` }} />
          </>
        );
      case "happy":
      case "playing":
        return (
          <>
            <div className="absolute top-[20%] left-[16%] w-4 h-4 bg-foreground flex items-end justify-center" style={{ transform: `scale(${size.scale * 0.8})` }}>
              <div className={cn("w-2 h-2", colors.accent)} />
            </div>
            <div className="absolute top-[20%] right-[16%] w-4 h-4 bg-foreground flex items-end justify-center" style={{ transform: `scale(${size.scale * 0.8})` }}>
              <div className={cn("w-2 h-2", colors.accent)} />
            </div>
          </>
        );
      case "hungry":
        return (
          <>
            <div className="absolute top-[25%] left-[16%] w-4 h-3 bg-foreground" style={{ transform: `scale(${size.scale * 0.8})` }} />
            <div className="absolute top-[25%] right-[16%] w-4 h-3 bg-foreground" style={{ transform: `scale(${size.scale * 0.8})` }} />
          </>
        );
      case "tired":
        return (
          <>
            <div className="absolute top-[28%] left-[16%] w-4 h-2 bg-foreground" style={{ transform: `scale(${size.scale * 0.8})` }} />
            <div className="absolute top-[28%] right-[16%] w-4 h-2 bg-foreground" style={{ transform: `scale(${size.scale * 0.8})` }} />
          </>
        );
      default:
        return (
          <>
            <div className="absolute top-[20%] left-[16%] w-4 h-4 bg-foreground" style={{ transform: `scale(${size.scale * 0.8})` }} />
            <div className="absolute top-[20%] right-[16%] w-4 h-4 bg-foreground" style={{ transform: `scale(${size.scale * 0.8})` }} />
          </>
        );
    }
  };

  const getMouth = () => {
    switch (mood) {
      case "happy":
      case "playing":
        return (
          <div className="absolute bottom-[16%] left-1/2 -translate-x-1/2 w-8 h-3 flex" style={{ transform: `translateX(-50%) scale(${size.scale * 0.8})` }}>
            <div className="w-2 h-3 bg-foreground" />
            <div className="w-4 h-2 bg-foreground mt-1" />
            <div className="w-2 h-3 bg-foreground" />
          </div>
        );
      case "hungry":
        return (
          <div className="absolute bottom-[12%] left-1/2 -translate-x-1/2 w-6 h-4 border-2 border-foreground bg-card" style={{ transform: `translateX(-50%) scale(${size.scale * 0.8})` }} />
        );
      case "eating":
        return (
          <div className="absolute bottom-[12%] left-1/2 -translate-x-1/2 w-8 h-4 bg-foreground" style={{ transform: `translateX(-50%) scale(${size.scale * 0.8})` }} />
        );
      case "sleeping":
        return (
          <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-4 h-2 bg-foreground" style={{ transform: `translateX(-50%) scale(${size.scale * 0.8})` }} />
        );
      case "tired":
        return (
          <div className="absolute bottom-[16%] left-1/2 -translate-x-1/2 w-6 h-1 bg-foreground" style={{ transform: `translateX(-50%) scale(${size.scale * 0.8})` }} />
        );
      default:
        return (
          <div className="absolute bottom-[16%] left-1/2 -translate-x-1/2 w-6 h-2 bg-foreground" style={{ transform: `translateX(-50%) scale(${size.scale * 0.8})` }} />
        );
    }
  };

  const getAnimation = () => {
    if (justEvolved) return "evolve-glow";
    switch (mood) {
      case "playing":
        return "pixel-bounce";
      case "sleeping":
        return "";
      default:
        return "pet-idle";
    }
  };

  const getEvolutionDecor = () => {
    switch (evolutionStage) {
      case "elder":
        return (
          <>
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-3 bg-gold border-2 border-foreground" />
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-[8px]">👑</div>
          </>
        );
      case "adult":
        return (
          <div className="absolute -top-3 -right-3 text-xs">⭐</div>
        );
      default:
        return null;
    }
  };

  const getSkinSpecialEffects = () => {
    switch (skin) {
      case "blaze":
        return (
          <>
            <div className="absolute -top-2 left-0 text-[8px] animate-pulse">🔥</div>
            <div className="absolute -top-3 right-0 text-[8px] animate-pulse delay-100">🔥</div>
          </>
        );
      case "enderman":
        return (
          <div className="absolute inset-0 opacity-20 bg-purple-500 animate-pulse" />
        );
      case "slime":
        return (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-full h-2 bg-lime-300/50 rounded-full blur-sm" />
        );
      case "wither":
        return (
          <>
            <div className="absolute -top-2 left-1 text-[6px]">💀</div>
            <div className="absolute -top-2 right-1 text-[6px]">💀</div>
          </>
        );
      default:
        return null;
    }
  };

  const getSkinAccessories = () => {
    switch (skin) {
      case "robot":
        return (
          <>
            <div className="absolute top-[12%] left-1/2 -translate-x-1/2 w-10 h-4 bg-stone-700 border-2 border-foreground" style={{ transform: `translateX(-50%) scale(${size.scale * 0.9})` }}>
              <div className="absolute inset-y-0 left-1 right-1 bg-cyan-300" />
            </div>
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-foreground" style={{ transform: `translateX(-50%) scale(${size.scale * 0.9})` }} />
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-1 h-3 bg-foreground" style={{ transform: `translateX(-50%) scale(${size.scale * 0.9})` }} />
          </>
        );
      case "ninja":
        return (
          <>
            <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-12 h-2 bg-red-600 border-2 border-foreground" style={{ transform: `translateX(-50%) scale(${size.scale * 0.9})` }} />
            <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-12 h-5 bg-stone-900 border-2 border-foreground" style={{ transform: `translateX(-50%) scale(${size.scale * 0.9})` }} />
            <div className="absolute top-[18%] left-[15%] w-1 h-6 bg-red-600" style={{ transform: `scale(${size.scale * 0.9})` }} />
          </>
        );
      case "wizard":
        return (
          <>
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[14px] border-r-[14px] border-b-[22px] border-l-transparent border-r-transparent border-b-indigo-900" style={{ transform: `translateX(-50%) scale(${size.scale * 0.9})` }} />
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-14 h-2 bg-indigo-900 border-2 border-foreground" style={{ transform: `translateX(-50%) scale(${size.scale * 0.9})` }} />
            <div className="absolute top-1 left-2 text-[8px]">✦</div>
            <div className="absolute top-4 right-2 text-[8px]">✦</div>
          </>
        );
      case "samurai":
        return (
          <>
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-14 h-4 bg-red-800 border-2 border-foreground" style={{ transform: `translateX(-50%) scale(${size.scale * 0.9})` }} />
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-10 h-3 bg-gold border-2 border-foreground" style={{ transform: `translateX(-50%) scale(${size.scale * 0.9})` }} />
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px]">⚔</div>
            <div className="absolute bottom-[6%] left-1/2 -translate-x-1/2 w-12 h-2 bg-red-800 border-2 border-foreground" style={{ transform: `translateX(-50%) scale(${size.scale * 0.9})` }} />
          </>
        );
      case "skeleton":
        return (
          <>
            <div className="absolute top-[48%] left-1/2 -translate-x-1/2 w-10 h-1 bg-foreground/40" style={{ transform: `translateX(-50%) scale(${size.scale * 0.9})` }} />
            <div className="absolute top-[58%] left-1/2 -translate-x-1/2 w-10 h-1 bg-foreground/40" style={{ transform: `translateX(-50%) scale(${size.scale * 0.9})` }} />
          </>
        );
      case "piglin":
        return (
          <>
            <div className="absolute top-[28%] right-[10%] w-2 h-2 bg-gold border border-foreground" style={{ transform: `scale(${size.scale * 0.9})` }} />
            <div className="absolute top-[34%] right-[10%] w-1 h-3 bg-gold border border-foreground" style={{ transform: `scale(${size.scale * 0.9})` }} />
          </>
        );
      case "enderman":
        return (
          <>
            <div className="absolute top-[22%] left-[14%] w-5 h-2 bg-purple-400 opacity-70" style={{ transform: `scale(${size.scale * 0.8})` }} />
            <div className="absolute top-[22%] right-[14%] w-5 h-2 bg-purple-400 opacity-70" style={{ transform: `scale(${size.scale * 0.8})` }} />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn("relative", className)}>
      {justEvolved && (
        <div className="absolute -inset-4 animate-pulse">
          <div className="absolute inset-0 bg-gold/30 blur-xl" />
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[8px] text-gold font-pixel uppercase animate-bounce">
            Evolved!
          </div>
        </div>
      )}

      {getEvolutionDecor()}

      {/* Main body */}
      <div
        className={cn(
          "relative border-4 border-foreground",
          colors.bg,
          size.body,
          getAnimation(),
        )}
        style={{ imageRendering: "pixelated" }}
      >
        {getSkinSpecialEffects()}
        {getSkinAccessories()}

        {/* Pixel texture overlay */}
        <div className="absolute inset-0 opacity-20">
          <div className="grid grid-cols-6 grid-rows-6 w-full h-full">
            {Array.from({ length: 36 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-full h-full",
                  i % 3 === 0 ? "bg-foreground/10" : ""
                )}
              />
            ))}
          </div>
        </div>

        {/* Eyes */}
        {getEyes()}

        {/* Mouth */}
        {getMouth()}

        {/* Sleeping Z's */}
        {mood === "sleeping" && (
          <div className="absolute -top-8 -right-4 text-foreground text-shadow-pixel text-xs animate-pulse">
            Z z z
          </div>
        )}

        {/* Playing sparkles */}
        {mood === "playing" && (
          <>
            <div className="absolute -top-4 -left-2 text-gold text-xs">✦</div>
            <div className="absolute -top-6 right-0 text-gold text-xs animate-pulse">✦</div>
          </>
        )}
      </div>

      {/* Feet */}
      <div className="flex justify-center gap-4 -mt-1">
        <div className={cn(colors.bg, "border-2 border-foreground border-t-0", size.feet)} />
        <div className={cn(colors.bg, "border-2 border-foreground border-t-0", size.feet)} />
      </div>
    </div>
  );
};

export default PixelPet;
