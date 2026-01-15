export type PetMood = "happy" | "hungry" | "tired" | "sleeping" | "eating" | "playing";

export type EvolutionStage = "baby" | "child" | "teen" | "adult" | "elder";

export type PetSkin = 
  | "creeper"      // Default green
  | "enderman"     // Purple/black
  | "slime"        // Lime green bouncy
  | "blaze"        // Orange fire
  | "zombie"       // Green undead
  | "skeleton"     // White bones
  | "piglin"       // Pink/gold
  | "wither"       // Dark black
  | "robot"        // Metal + visor
  | "ninja"        // Mask + headband
  | "wizard"       // Hat + stars
  | "samurai"      // Kabuto + crest

export interface SkinInfo {
  id: PetSkin;
  name: string;
  price: number;
  color: string;
  unlocked: boolean;
  description: string;
}

export type AchievementId = 
  | "first_feed"
  | "first_play"
  | "first_sleep"
  | "coin_collector"
  | "coin_hoarder"
  | "coin_master"
  | "baby_steps"
  | "growing_up"
  | "teenager"
  | "all_grown_up"
  | "elder_wisdom"
  | "skin_collector"
  | "fashionista"
  | "game_player"
  | "game_master"
  | "survivor"
  | "dedicated";

export interface Achievement {
  id: AchievementId;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export interface PetState {
  hunger: number;
  happiness: number;
  energy: number;
  mood: PetMood;
  age: number;
  isNight: boolean;
  coins: number;
  evolutionStage: EvolutionStage;
  currentSkin: PetSkin;
  unlockedSkins: PetSkin[];
  unlockedAchievements: AchievementId[];
  totalFeeds: number;
  totalPlays: number;
  totalSleeps: number;
  totalGamesPlayed: number;
  totalCoinsEarned: number;

  walletAddress: string | null;
  walletTrackingStartedAt: number | null;
  walletTxBaselineInitialized: boolean;
  walletTxCountBaseline: number;
  walletTxCountCurrent: number;
  walletTxCountSinceStart: number;
  walletLastSeenSignature: string | null;
  walletGrowthUnitsApplied: number;
  lastUpdateTimestamp: number;
  hasMintedNFT: boolean;
  nftMintAddress: string | null;
  lastGamePlayed: {
    clicker: number | null;
    catch: number | null;
  };
  lastCheckIn: number | null;
  isDead: boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Action achievements
  { id: "first_feed", name: "First Meal", description: "Feed your pet for the first time", icon: "🍖", unlocked: false },
  { id: "first_play", name: "Playtime!", description: "Play with your pet for the first time", icon: "🎮", unlocked: false },
  { id: "first_sleep", name: "Sweet Dreams", description: "Put your pet to sleep for the first time", icon: "😴", unlocked: false },
  
  // Coin achievements
  { id: "coin_collector", name: "Coin Collector", description: "Earn 100 coins total", icon: "💰", unlocked: false },
  { id: "coin_hoarder", name: "Coin Hoarder", description: "Earn 500 coins total", icon: "💰", unlocked: false },
  { id: "coin_master", name: "Coin Master", description: "Earn 1000 coins total", icon: "👑", unlocked: false },
  
  // Evolution achievements
  { id: "baby_steps", name: "Baby Steps", description: "Hatch from an egg", icon: "🥚", unlocked: false },
  { id: "growing_up", name: "Growing Up", description: "Evolve to child stage", icon: "🌱", unlocked: false },
  { id: "teenager", name: "Teenager", description: "Evolve to teen stage", icon: "🌿", unlocked: false },
  { id: "all_grown_up", name: "All Grown Up", description: "Evolve to adult stage", icon: "🌳", unlocked: false },
  { id: "elder_wisdom", name: "Elder Wisdom", description: "Reach elder stage", icon: "🏆", unlocked: false },
  
  // Collection achievements
  { id: "skin_collector", name: "Skin Collector", description: "Unlock 3 different skins", icon: "🎨", unlocked: false },
  { id: "fashionista", name: "Fashionista", description: "Unlock all skins", icon: "✨", unlocked: false },
  
  // Mini-game achievements
  { id: "game_player", name: "Game Player", description: "Play 5 mini-games", icon: "🕹️", unlocked: false },
  { id: "game_master", name: "Game Master", description: "Play 20 mini-games", icon: "🎯", unlocked: false },
  
  // Dedication achievements
  { id: "survivor", name: "Survivor", description: "Keep your pet alive for 10 minutes", icon: "⭐", unlocked: false },
  { id: "dedicated", name: "Dedicated", description: "Keep your pet alive for 30 minutes", icon: "💎", unlocked: false },
];

export const EVOLUTION_MILESTONES: Record<EvolutionStage, number> = {
  baby: 0,
  child: 180,    // 3 minutes
  teen: 360,     // 6 minutes
  adult: 600,    // 10 minutes
  elder: 900,    // 15 minutes
};

export const EVOLUTION_TX_MILESTONES: Record<EvolutionStage, number> = {
  baby: 0,
  child: 10,
  teen: 20,
  adult: 30,
  elder: 40,
};

export const SKINS: SkinInfo[] = [
  { id: "creeper", name: "Creeper", price: 0, color: "grass", unlocked: true, description: "The classic green friend" },
  { id: "slime", name: "Slime", price: 50, color: "lime", unlocked: false, description: "Bouncy and squishy!" },
  { id: "enderman", name: "Enderman", price: 100, color: "purple", unlocked: false, description: "Tall, dark, mysterious" },
  { id: "blaze", name: "Blaze", price: 150, color: "orange", unlocked: false, description: "Hot-headed companion" },
  { id: "zombie", name: "Zombie", price: 75, color: "teal", unlocked: false, description: "Undead but friendly" },
  { id: "skeleton", name: "Skeleton", price: 80, color: "bone", unlocked: false, description: "All bones, all fun" },
  { id: "piglin", name: "Piglin", price: 200, color: "pink", unlocked: false, description: "Loves gold!" },
  { id: "wither", name: "Wither", price: 500, color: "wither", unlocked: false, description: "Ultimate power!" },
  { id: "robot", name: "Robot", price: 250, color: "steel", unlocked: false, description: "Visor online. Beep boop." },
  { id: "wizard", name: "Wizard", price: 350, color: "arcane", unlocked: false, description: "Mystic hat, tiny spells." },
  { id: "samurai", name: "Samurai", price: 400, color: "crimson", unlocked: false, description: "Armor up. Honor bound." },
];
