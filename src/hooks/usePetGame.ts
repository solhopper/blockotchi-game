import { useState, useEffect, useCallback } from "react";
import { 
  PetMood, 
  PetState, 
  EvolutionStage, 
  PetSkin,
  AchievementId,
  EVOLUTION_MILESTONES,
  SKINS 
} from "@/types/pet";

const MAX_STAT = 100;
const DECAY_RATE = 0.5;
const NIGHT_CYCLE = 60;
const COIN_RATE = 1; // Coins earned per action
const COIN_REWARD_HAPPY = 1;
const COIN_REWARD_VERY_HAPPY = 3;
const GAME_COOLDOWN_MS = 2 * 60 * 60 * 1000; // 2 hours
const CHECKIN_DEADLINE_MS = 24 * 60 * 60 * 1000; // 24 hours

const getEvolutionStageFromAge = (age: number): EvolutionStage => {
  if (age >= EVOLUTION_MILESTONES.elder) return "elder";
  if (age >= EVOLUTION_MILESTONES.adult) return "adult";
  if (age >= EVOLUTION_MILESTONES.teen) return "teen";
  if (age >= EVOLUTION_MILESTONES.child) return "child";
  return "baby";
};

const getEvolutionStageFromTxCount = (txCount: number): EvolutionStage => {
  if (txCount >= 40) return "elder";
  if (txCount >= 30) return "adult";
  if (txCount >= 20) return "teen";
  if (txCount >= 10) return "child";
  return "baby";
};

const DEFAULT_STATE: PetState = {
  hunger: 80,
  happiness: 70,
  energy: 90,
  mood: "happy" as PetMood,
  age: 0,
  isNight: false,
  coins: 0,
  evolutionStage: "baby" as EvolutionStage,
  currentSkin: "creeper" as PetSkin,
  unlockedSkins: ["creeper"] as PetSkin[],
  unlockedAchievements: [] as AchievementId[],
  totalFeeds: 0,
  totalPlays: 0,
  totalSleeps: 0,
  totalGamesPlayed: 0,
  totalCoinsEarned: 0,

  walletAddress: null,
  walletTrackingStartedAt: null,
  walletTxBaselineInitialized: false,
  walletTxCountBaseline: 0,
  walletTxCountCurrent: 0,
  walletTxCountSinceStart: 0,
  walletLastSeenSignature: null,
  walletGrowthUnitsApplied: 0,
  lastUpdateTimestamp: Date.now(),
  hasMintedNFT: false,
  nftMintAddress: null,
  lastGamePlayed: {
    clicker: null,
    catch: null,
  },
  lastCheckIn: Date.now(),
  isDead: false,
  hasSeenWelcome: false,
};

export const usePetGame = () => {
  const [petState, setPetState] = useState<PetState>(() => {
    const saved = localStorage.getItem("blockotchi-save");
    if (saved) {
      const parsed = JSON.parse(saved);
      const now = Date.now();
      const lastUpdate = parsed.lastUpdateTimestamp || now;
      const elapsedSeconds = Math.floor((now - lastUpdate) / 1000);
      
      // Apply accumulated offline decay
      const offlineHungerDecay = elapsedSeconds * DECAY_RATE;
      const offlineHappinessDecay = elapsedSeconds * DECAY_RATE * 0.5;
      const offlineEnergyDecay = elapsedSeconds * DECAY_RATE * 0.3;
      
      const newHunger = Math.max(0, (parsed.hunger || DEFAULT_STATE.hunger) - offlineHungerDecay);
      const newHappiness = Math.max(0, (parsed.happiness || DEFAULT_STATE.happiness) - offlineHappinessDecay);
      const newEnergy = Math.max(0, (parsed.energy || DEFAULT_STATE.energy) - offlineEnergyDecay);
      
      // Check if pet should die (missed daily check-in)
      const lastCheckIn = parsed.lastCheckIn || now;
      const timeSinceCheckIn = now - lastCheckIn;
      const shouldDie = !parsed.isDead && timeSinceCheckIn > CHECKIN_DEADLINE_MS;
      
      return {
        ...DEFAULT_STATE,
        ...parsed,
        hunger: newHunger,
        happiness: newHappiness,
        energy: newEnergy,
        lastUpdateTimestamp: now,
        isDead: shouldDie || parsed.isDead,
        evolutionStage:
          parsed.walletTrackingStartedAt && typeof parsed.walletTxCountSinceStart === "number"
            ? getEvolutionStageFromTxCount(parsed.walletTxCountSinceStart)
            : "baby",
      };
    }
    return DEFAULT_STATE;
  });

  const [isActioning, setIsActioning] = useState(false);
  const [justEvolved, setJustEvolved] = useState(false);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("blockotchi-save", JSON.stringify(petState));
  }, [petState]);

  const calculateMood = useCallback((hunger: number, happiness: number, energy: number): PetMood => {
    if (energy < 20) return "tired";
    if (hunger < 30) return "hungry";
    if (happiness > 60 && hunger > 50 && energy > 40) return "happy";
    return "hungry";
  }, []);

  // Decay stats over time
  useEffect(() => {
    const interval = setInterval(() => {
      setPetState((prev) => {
        if (prev.mood === "sleeping" || prev.mood === "eating" || prev.mood === "playing") {
          return prev;
        }

        const newAge = prev.age + 1;
        const newEvolution = prev.walletTrackingStartedAt
          ? getEvolutionStageFromTxCount(prev.walletTxCountSinceStart)
          : prev.evolutionStage;
        const hasEvolved = newEvolution !== prev.evolutionStage;
        
        if (hasEvolved) {
          setJustEvolved(true);
          setTimeout(() => setJustEvolved(false), 3000);
        }

        const newHunger = Math.max(0, prev.hunger - DECAY_RATE);
        const newHappiness = Math.max(0, prev.happiness - DECAY_RATE * 0.5);
        const newEnergy = Math.max(0, prev.energy - DECAY_RATE * 0.3);
        const newIsNight = Math.floor(newAge / NIGHT_CYCLE) % 2 === 1;
        
        // Earn passive coins
        const coinBonus = newAge % 10 === 0 ? 1 : 0;

        return {
          ...prev,
          hunger: newHunger,
          happiness: newHappiness,
          energy: newEnergy,
          mood: calculateMood(newHunger, newHappiness, newEnergy),
          age: newAge,
          isNight: newIsNight,
          evolutionStage: newEvolution,
          coins: prev.coins + coinBonus,
          totalCoinsEarned: prev.totalCoinsEarned + coinBonus,
          lastUpdateTimestamp: Date.now(),
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [calculateMood]);

  const feed = useCallback(() => {
    if (isActioning) return;
    setIsActioning(true);

    setPetState((prev) => ({
      ...prev,
      mood: "eating",
    }));

    setTimeout(() => {
      setPetState((prev) => {
        const coinsEarned = COIN_RATE * 2;
        return {
          ...prev,
          hunger: Math.min(MAX_STAT, prev.hunger + 30),
          happiness: Math.min(MAX_STAT, prev.happiness + 5),
          coins: prev.coins + coinsEarned,
          totalCoinsEarned: prev.totalCoinsEarned + coinsEarned,
          totalFeeds: prev.totalFeeds + 1,
          mood: calculateMood(prev.hunger + 30, prev.happiness + 5, prev.energy),
        };
      });
      setIsActioning(false);
    }, 2000);
  }, [isActioning, calculateMood]);

  const play = useCallback(() => {
    if (isActioning || petState.energy < 10) return;
    setIsActioning(true);

    setPetState((prev) => ({
      ...prev,
      mood: "playing",
    }));

    setTimeout(() => {
      setPetState((prev) => {
        const coinsEarned = COIN_RATE * 5;
        return {
          ...prev,
          happiness: Math.min(MAX_STAT, prev.happiness + 25),
          energy: Math.max(0, prev.energy - 15),
          coins: prev.coins + coinsEarned,
          totalCoinsEarned: prev.totalCoinsEarned + coinsEarned,
          totalPlays: prev.totalPlays + 1,
          mood: calculateMood(prev.hunger, prev.happiness + 25, prev.energy - 15),
        };
      });
      setIsActioning(false);
    }, 3000);
  }, [isActioning, petState.energy, calculateMood]);

  const sleep = useCallback(() => {
    if (isActioning) return;
    setIsActioning(true);

    setPetState((prev) => ({
      ...prev,
      mood: "sleeping",
    }));

    setTimeout(() => {
      setPetState((prev) => {
        const coinsEarned = COIN_RATE;
        return {
          ...prev,
          energy: Math.min(MAX_STAT, prev.energy + 40),
          hunger: Math.max(0, prev.hunger - 10),
          coins: prev.coins + coinsEarned,
          totalCoinsEarned: prev.totalCoinsEarned + coinsEarned,
          totalSleeps: prev.totalSleeps + 1,
          mood: calculateMood(prev.hunger - 10, prev.happiness, prev.energy + 40),
        };
      });
      setIsActioning(false);
    }, 4000);
  }, [isActioning, calculateMood]);

  const buySkin = useCallback((skinId: PetSkin) => {
    const skin = SKINS.find(s => s.id === skinId);
    if (!skin) return false;
    
    if (petState.unlockedSkins.includes(skinId)) {
      // Already owned, just equip
      setPetState(prev => ({ ...prev, currentSkin: skinId }));
      return true;
    }

    if (petState.coins < skin.price) return false;

    setPetState(prev => ({
      ...prev,
      coins: prev.coins - skin.price,
      unlockedSkins: [...prev.unlockedSkins, skinId],
      currentSkin: skinId,
    }));
    return true;
  }, [petState.coins, petState.unlockedSkins]);

  const selectSkin = useCallback((skinId: PetSkin) => {
    if (!petState.unlockedSkins.includes(skinId)) return false;
    setPetState(prev => ({ ...prev, currentSkin: skinId }));
    return true;
  }, [petState.unlockedSkins]);

  const addCoins = useCallback((amount: number, gameType?: "clicker" | "catch") => {
    setPetState(prev => ({ 
      ...prev, 
      coins: prev.coins + amount,
      totalCoinsEarned: prev.totalCoinsEarned + amount,
      totalGamesPlayed: prev.totalGamesPlayed + 1,
      lastGamePlayed: gameType ? {
        ...prev.lastGamePlayed,
        [gameType]: Date.now(),
      } : prev.lastGamePlayed,
    }));
  }, []);

  const getGameCooldown = useCallback((gameType: "clicker" | "catch"): { isOnCooldown: boolean; timeLeftMs: number } => {
    const lastPlayed = petState.lastGamePlayed[gameType];
    if (!lastPlayed) return { isOnCooldown: false, timeLeftMs: 0 };
    
    const now = Date.now();
    const timeSinceLastPlay = now - lastPlayed;
    const timeLeft = GAME_COOLDOWN_MS - timeSinceLastPlay;
    
    return {
      isOnCooldown: timeLeft > 0,
      timeLeftMs: Math.max(0, timeLeft),
    };
  }, [petState.lastGamePlayed]);

  const resetGameCooldown = useCallback((gameType: "clicker" | "catch") => {
    setPetState(prev => ({
      ...prev,
      lastGamePlayed: {
        ...prev.lastGamePlayed,
        [gameType]: null, // Reset cooldown
      },
    }));
  }, []);

  const markNFTMinted = useCallback((mintAddress: string) => {
    setPetState(prev => ({
      ...prev,
      hasMintedNFT: true,
      nftMintAddress: mintAddress,
    }));
  }, []);

  const getCheckInStatus = useCallback((): { needsCheckIn: boolean; timeLeftMs: number; isOverdue: boolean } => {
    const lastCheckIn = petState.lastCheckIn || Date.now();
    const now = Date.now();
    const timeSinceCheckIn = now - lastCheckIn;
    const timeLeft = CHECKIN_DEADLINE_MS - timeSinceCheckIn;
    
    return {
      needsCheckIn: timeSinceCheckIn > 0,
      timeLeftMs: Math.max(0, timeLeft),
      isOverdue: timeLeft <= 0,
    };
  }, [petState.lastCheckIn]);

  const markCheckInComplete = useCallback(() => {
    setPetState(prev => ({
      ...prev,
      lastCheckIn: Date.now(),
    }));
  }, []);

  const revivePet = useCallback(() => {
    setPetState(prev => ({
      ...prev,
      isDead: false,
      lastCheckIn: Date.now(),
      hunger: 50,
      happiness: 50,
      energy: 50,
    }));
  }, []);

  const startNewGame = useCallback(() => {
    setPetState({
      ...DEFAULT_STATE,
      hasMintedNFT: petState.hasMintedNFT,
      nftMintAddress: petState.nftMintAddress,
      lastCheckIn: Date.now(),
      isDead: false,
    });
  }, [petState.hasMintedNFT, petState.nftMintAddress]);

  const markWelcomeSeen = useCallback(() => {
    setPetState(prev => ({
      ...prev,
      hasSeenWelcome: true,
    }));
  }, []);

  return {
    petState,
    setPetState,
    isActioning,
    justEvolved,
    feed,
    play,
    sleep,
    buySkin,
    selectSkin,
    addCoins,
    markNFTMinted,
    getGameCooldown,
    resetGameCooldown,
    getCheckInStatus,
    markCheckInComplete,
    revivePet,
    startNewGame,
    markWelcomeSeen,
  };
};
