import { useState, useEffect, useRef } from "react";
import PixelPet from "@/components/PixelPet";
import StatBar from "@/components/StatBar";
import ActionButton from "@/components/ActionButton";
import DayNightIndicator from "@/components/DayNightIndicator";
import GamePanel from "@/components/GamePanel";
import EvolutionBadge from "@/components/EvolutionBadge";
import SkinsStore from "@/components/SkinsStore";
import MiniGames from "@/components/MiniGames";
import AchievementsPanel from "@/components/AchievementsPanel";
import AchievementToast from "@/components/AchievementToast";
import { MintNFTModal } from "@/components/MintNFTModal";
import DeathScreen from "@/components/DeathScreen";
import DailyCheckIn from "@/components/DailyCheckIn";
import { usePetGame } from "@/hooks/usePetGame";
import { useSound } from "@/hooks/useSound";
import { useAchievements } from "@/hooks/useAchievements";
import { useWalletTxGrowth } from "@/hooks/useWalletTxGrowth";
import { cn } from "@/lib/utils";
import { ACHIEVEMENTS } from "@/types/pet";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

const Index = () => {
  const { petState, setPetState, isActioning, justEvolved, feed, play, sleep, buySkin, selectSkin, addCoins, markNFTMinted, getGameCooldown, resetGameCooldown, getCheckInStatus, markCheckInComplete, revivePet, startNewGame } = usePetGame();
  const [showStore, setShowStore] = useState(false);
  const [showMiniGames, setShowMiniGames] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const { playSound } = useSound();
  const prevCoins = useRef(petState.coins);
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const { isSyncing: isWalletSyncing, txProgress, txsPerGrowthUnit } = useWalletTxGrowth(petState, setPetState);

  const { newAchievement, checkAchievements, unlockedCount, totalCount } = useAchievements(petState, setPetState);

  // Check achievements whenever state changes
  useEffect(() => {
    checkAchievements();
  }, [petState, checkAchievements]);

  // Play evolution sound
  useEffect(() => {
    if (justEvolved) {
      playSound("evolve");
    }
  }, [justEvolved, playSound]);

  // Play coin sound when coins increase
  useEffect(() => {
    if (petState.coins > prevCoins.current) {
      playSound("coin");
    }
    prevCoins.current = petState.coins;
  }, [petState.coins, playSound]);

  const handleFeed = () => {
    playSound("feed");
    feed();
  };

  const handlePlay = () => {
    playSound("play");
    play();
  };

  const handleSleep = () => {
    playSound("sleep");
    sleep();
  };

  const handleOpenStore = () => {
    playSound("click");
    setShowStore(true);
  };

  const handleOpenMiniGames = () => {
    playSound("click");
    setShowMiniGames(true);
  };

  const handleOpenAchievements = () => {
    playSound("click");
    setShowAchievements(true);
  };

  const handleEarnCoins = (coins: number, gameType?: "clicker" | "catch") => {
    addCoins(coins, gameType);
  };

  const formatAge = (seconds: number) => {
    const days = Math.floor(seconds / 120);
    return `Day ${days + 1}`;
  };

  return (
    <div
      className={cn(
        "min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-1000",
        petState.isNight ? "bg-night-sky" : "bg-background"
      )}
    >
      {/* NFT Mint Gate */}
      {publicKey && !petState.hasMintedNFT && (
        <MintNFTModal onMintSuccess={markNFTMinted} />
      )}

      {/* Death Screen */}
      {petState.isDead && (
        <DeathScreen
          onRevive={revivePet}
          onRestart={startNewGame}
        />
      )}

      {/* Achievement Toast */}
      <AchievementToast achievementId={newAchievement} />

      {/* Title */}
      <h1 className="text-lg md:text-xl text-foreground text-shadow-pixel mb-4 text-center">
        BLOCKOTCHI
      </h1>

      {/* Main Game Container */}
      <div className="w-full max-w-sm space-y-3">
        {/* Status Bar */}
        <div className="flex items-center justify-between">
          <DayNightIndicator isNight={petState.isNight} />
          <div className="ml-1 grid gap-2">
            <div className="flex items-center gap-2">
            <div className="pixel-panel bg-card px-2 py-1">
              <WalletMultiButton style={{ height: 22, padding: "0 8px", fontSize: 10 }} />
            </div>
            {/* <div className="text-[10px] text-foreground uppercase tracking-wider pixel-panel bg-card px-2 py-1">
              RPC {connection.rpcEndpoint.includes("devnet") ? "DEVNET" : "CUSTOM"}
            </div> */}
            {/* {publicKey && (
              <div className="text-[10px] text-foreground uppercase tracking-wider pixel-panel bg-card px-2 py-1">
                {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
              </div>
            )} */}
            {publicKey && (
              <div className="text-[10px] text-foreground uppercase tracking-wider pixel-panel bg-card px-2 py-1">
                TX {txProgress}/{txsPerGrowthUnit}{isWalletSyncing ? "" : ""}
              </div>
            )}
            </div>
            <div className="flex items-center gap-2">

            <button
              onClick={handleOpenAchievements}
              className="text-[10px] text-gold uppercase tracking-wider pixel-panel bg-card px-2 py-1 flex items-center gap-1 hover:bg-card/80 transition-colors"
            >
              🏆 {unlockedCount}/{totalCount}
            </button>

            <div className="text-[10px] text-gold uppercase tracking-wider pixel-panel bg-card px-2 py-1 flex items-center gap-1">
              <img src="/coin.svg" alt="coin" className="w-4 h-4" />
              {petState.coins}
            </div>
            <div className="text-[10px] text-foreground uppercase tracking-wider pixel-panel bg-card px-2 py-1">
              {formatAge(petState.age)}
            </div>
            </div>
          </div>
        </div>

        {/* Evolution Badge */}
        <EvolutionBadge 
          currentStage={petState.evolutionStage} 
          age={publicKey ? petState.age : 0}
          txCount={publicKey ? petState.walletTxCountSinceStart : undefined}
        />

        {/* Pet Display */}
        <GamePanel className="flex items-center justify-center min-h-[200px]">
          <div className="relative">
            {/* Ground blocks */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-0">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 bg-dirt border-2 border-foreground"
                  style={{
                    background: `linear-gradient(to bottom, hsl(var(--grass)) 0%, hsl(var(--grass)) 30%, hsl(var(--dirt)) 30%)`,
                  }}
                />
              ))}
            </div>

            {/* Pet */}
            <PixelPet 
              mood={petState.mood} 
              evolutionStage={petState.evolutionStage}
              skin={petState.currentSkin}
              justEvolved={justEvolved}
            />

            {/* Action indicator */}
            {isActioning && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[8px] text-card-foreground uppercase animate-pulse">
                {petState.mood === "eating" && "NOM NOM..."}
                {petState.mood === "playing" && "WHEEE!"}
                {petState.mood === "sleeping" && "ZZZ..."}
              </div>
            )}
          </div>
        </GamePanel>

        {/* Stats Panel */}
        <GamePanel title="Stats" className="space-y-3">
          <StatBar
            label="Hunger"
            value={petState.hunger}
            maxValue={100}
            color="hunger"
            icon={<span>🍖</span>}
          />
          <StatBar
            label="Happiness"
            value={petState.happiness}
            maxValue={100}
            color="happiness"
            icon={<span className="heart-pulse inline-block">❤️</span>}
          />
          <StatBar
            label="Energy"
            value={petState.energy}
            maxValue={100}
            color="energy"
            icon={<span>⚡</span>}
          />
        </GamePanel>

        {/* Daily Check-In */}
        {publicKey && petState.hasMintedNFT && (
          <DailyCheckIn
            getCheckInStatus={getCheckInStatus}
            onCheckInComplete={markCheckInComplete}
          />
        )}

        {/* Actions Panel */}
        <GamePanel title="Actions">
          <div className="grid grid-cols-3 grid-rows-2 gap-2">
            <ActionButton
              onClick={handleFeed}
              disabled={isActioning}
              variant="primary"
            >
              🍖 Feed
            </ActionButton>
            <ActionButton
              onClick={handlePlay}
              disabled={isActioning || petState.energy < 10}
              variant="gold"
            >
              🎮 Play
            </ActionButton>
            <ActionButton
              onClick={handleSleep}
              disabled={isActioning}
              variant="secondary"
            >
              😴 Sleep
            </ActionButton>
            <ActionButton
              onClick={handleOpenMiniGames}
              variant="primary"
            >
              🕹️ Games
            </ActionButton>
            <ActionButton
              onClick={handleOpenStore}
              variant="gold"
            >
              🎨 Skins
            </ActionButton>
          </div>

          {/* Temporary developer button for quickly adding coins */}
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={() => addCoins(1000)}
              className="text-[8px] text-foreground/60 hover:text-foreground underline"
            >
              DEV: +1000 coins
            </button>
          </div>
        </GamePanel>

        {/* Tip */}
        <p className="text-[8px] text-foreground/60 text-center uppercase tracking-wider">
          Keep your pet happy to earn coins & evolve!
        </p>
      </div>

      {/* Skins Store Modal */}
      {showStore && (
        <SkinsStore
          coins={petState.coins}
          currentSkin={petState.currentSkin}
          unlockedSkins={petState.unlockedSkins}
          onBuySkin={buySkin}
          onSelectSkin={selectSkin}
          onClose={() => setShowStore(false)}
        />
      )}

      {/* Mini Games Modal */}
      {showMiniGames && (
        <MiniGames
          onEarnCoins={handleEarnCoins}
          onClose={() => setShowMiniGames(false)}
          getGameCooldown={getGameCooldown}
          resetGameCooldown={resetGameCooldown}
        />
      )}

      {/* Achievements Panel */}
      {showAchievements && (
        <AchievementsPanel
          unlockedAchievements={petState.unlockedAchievements}
          onClose={() => setShowAchievements(false)}
        />
      )}
    </div>
  );
};

export default Index;
