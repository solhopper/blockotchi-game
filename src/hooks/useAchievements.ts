import { useState, useCallback } from "react";
import { AchievementId, PetState, ACHIEVEMENTS, SKINS } from "@/types/pet";

export const useAchievements = (
  petState: PetState,
  setPetState: React.Dispatch<React.SetStateAction<PetState>>
) => {
  const [newAchievement, setNewAchievement] = useState<AchievementId | null>(null);

  const unlockAchievement = useCallback((id: AchievementId) => {
    setPetState((prev) => {
      if (prev.unlockedAchievements.includes(id)) return prev;
      return {
        ...prev,
        unlockedAchievements: [...prev.unlockedAchievements, id],
      };
    });
    setNewAchievement(id);
    setTimeout(() => setNewAchievement(null), 3000);
  }, [setPetState]);

  const checkAchievements = useCallback(() => {
    const { 
      unlockedAchievements, 
      totalFeeds, 
      totalPlays, 
      totalSleeps,
      totalCoinsEarned,
      totalGamesPlayed,
      evolutionStage,
      unlockedSkins,
      age
    } = petState;

    const unlock = (id: AchievementId) => {
      if (!unlockedAchievements.includes(id)) {
        unlockAchievement(id);
      }
    };

    // Action achievements
    if (totalFeeds >= 1) unlock("first_feed");
    if (totalPlays >= 1) unlock("first_play");
    if (totalSleeps >= 1) unlock("first_sleep");

    // Coin achievements
    if (totalCoinsEarned >= 100) unlock("coin_collector");
    if (totalCoinsEarned >= 500) unlock("coin_hoarder");
    if (totalCoinsEarned >= 1000) unlock("coin_master");

    // Evolution achievements
    if (evolutionStage === "baby") unlock("baby_steps");
    if (["child", "teen", "adult", "elder"].includes(evolutionStage)) unlock("growing_up");
    if (["teen", "adult", "elder"].includes(evolutionStage)) unlock("teenager");
    if (["adult", "elder"].includes(evolutionStage)) unlock("all_grown_up");
    if (evolutionStage === "elder") unlock("elder_wisdom");

    // Collection achievements
    if (unlockedSkins.length >= 3) unlock("skin_collector");
    if (unlockedSkins.length >= SKINS.length) unlock("fashionista");

    // Mini-game achievements
    if (totalGamesPlayed >= 5) unlock("game_player");
    if (totalGamesPlayed >= 20) unlock("game_master");

    // Time achievements
    if (age >= 600) unlock("survivor"); // 10 minutes
    if (age >= 1800) unlock("dedicated"); // 30 minutes
  }, [petState, unlockAchievement]);

  const getAchievementInfo = useCallback((id: AchievementId) => {
    return ACHIEVEMENTS.find(a => a.id === id);
  }, []);

  return {
    newAchievement,
    checkAchievements,
    getAchievementInfo,
    unlockedCount: petState.unlockedAchievements.length,
    totalCount: ACHIEVEMENTS.length,
  };
};
