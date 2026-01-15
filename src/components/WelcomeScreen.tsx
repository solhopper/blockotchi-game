import GamePanel from "@/components/GamePanel";
import ActionButton from "@/components/ActionButton";
import { useSound } from "@/hooks/useSound";

interface WelcomeScreenProps {
  onClose: () => void;
}

const WelcomeScreen = ({ onClose }: WelcomeScreenProps) => {
  const { playSound } = useSound();

  const handleClose = () => {
    playSound("click");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-background/95 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="w-full max-w-2xl my-8">
        <GamePanel title="🎮 Welcome to Blockotchi!" className="space-y-4">
          {/* Introduction */}
          <div className="text-center space-y-2 pb-3 border-b-2 border-foreground/20">
            <p className="text-[11px] text-white uppercase tracking-wider font-bold">
              Your Virtual Pet Adventure Begins!
            </p>
            <p className="text-[9px] text-white leading-relaxed">
              Take care of your Blockotchi by feeding, playing, and keeping it happy.
            </p>
          </div>

          {/* Game Rules */}
          <div className="space-y-3">
            <h3 className="text-[10px] text-white uppercase tracking-wider font-bold">
              📋 Game Rules
            </h3>
            
            {/* Daily Check-In */}
            <div className="pixel-panel bg-card/50 p-3 space-y-1.5">
              <div className="flex items-start gap-2">
                <span className="text-[14px]">📅</span>
                <div className="flex-1">
                  <p className="text-[9px] text-white font-bold">Daily Check-In (CRITICAL!)</p>
                  <p className="text-[8px] text-white leading-relaxed">
                    You have to complete a daily check-in every 24 hours.
                    If you miss it, your Blockotchi will die! Check in regularly to keep your pet alive.
                  </p>
                </div>
              </div>
            </div>

            {/* Basic Care */}
            <div className="pixel-panel bg-card/50 p-3 space-y-1.5">
              <div className="flex items-start gap-2">
                <span className="text-[14px]">❤️</span>
                <div className="flex-1">
                  <p className="text-[9px] text-white font-bold">Basic Care</p>
                  <p className="text-[8px] text-white leading-relaxed">
                    Feed (🍖), Play (🎮), and Sleep (😴) to maintain your pet's stats. 
                    Stats decay over time, so check in regularly. Happy pets earn more coins!
                  </p>
                </div>
              </div>
            </div>

            {/* Evolution */}
            <div className="pixel-panel bg-card/50 p-3 space-y-1.5">
              <div className="flex items-start gap-2">
                <span className="text-[14px]">🌟</span>
                <div className="flex-1">
                  <p className="text-[9px] text-white font-bold">Evolution System</p>
                  <p className="text-[8px] text-white leading-relaxed">
                    Your pet grows based on your wallet's on-chain transactions! 
                    More transactions = faster evolution through stages: Baby → Child → Teen → Adult → Elder.
                  </p>
                </div>
              </div>
            </div>

            {/* Mini-Games */}
            <div className="pixel-panel bg-card/50 p-3 space-y-1.5">
              <div className="flex items-start gap-2">
                <span className="text-[14px]">🎯</span>
                <div className="flex-1">
                  <p className="text-[9px] text-white font-bold">Mini-Games</p>
                  <p className="text-[8px] text-white leading-relaxed">
                    Play Clicker or Coin Catcher to earn coins! Each game has a 2-hour cooldown.
                  </p>
                </div>
              </div>
            </div>

            {/* Skins & Customization */}
            <div className="pixel-panel bg-card/50 p-3 space-y-1.5">
              <div className="flex items-start gap-2">
                <span className="text-[14px]">🎨</span>
                <div className="flex-1">
                  <p className="text-[9px] text-white font-bold">Skins & Customization</p>
                  <p className="text-[8px] text-white leading-relaxed">
                    Spend coins in the Skins Store to unlock new looks: Creeper, Enderman, Blaze, and more!
                    Collect them all to show off your style.
                  </p>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="pixel-panel bg-card/50 p-3 space-y-1.5">
              <div className="flex items-start gap-2">
                <span className="text-[14px]">🏆</span>
                <div className="flex-1">
                  <p className="text-[9px] text-white font-bold">Achievements</p>
                  <p className="text-[8px] text-white leading-relaxed">
                    Unlock achievements by completing tasks: first meal, earning coins, buying skins, and more!
                    Track your progress in the Achievements panel.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="pixel-panel bg-hunger/20 border-gold p-3 space-y-2">
            <p className="text-[9px] text-white font-bold uppercase tracking-wider">💡 Pro Tips</p>
            <ul className="space-y-1 text-[8px] text-white leading-relaxed">
              <li>• Set a daily reminder to check in and keep your pet alive!</li>
              <li>• Keep stats above 70 for "Very Happy" mood = 3x coin rewards</li>
              <li>• More on-chain transactions = faster evolution</li>
              <li>• Play mini-games regularly to stack up coins for rare skins</li>
            </ul>
          </div>

          {/* Close Button */}
          <div className="pt-2">
            <ActionButton
              onClick={handleClose}
              variant="gold"
              className="w-full"
            >
              Let's Play! 🎮
            </ActionButton>
          </div>
        </GamePanel>
      </div>
    </div>
  );
};

export default WelcomeScreen;
