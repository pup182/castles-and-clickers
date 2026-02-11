import { useGameStore } from '../store/gameStore';
import { BUILDINGS, getUpgradeCost, getBuildingBonus, getBuildingList } from '../data/homestead';
import {
  CastleIcon, GoldIcon, HeartIcon, SwordIcon, ShieldIcon, ChartIcon,
  ClockIcon, RegenIcon, BarracksIcon, ArmoryIcon, FortressIcon,
  TrainingIcon, TreasuryIcon, AcademyIcon, InfirmaryIcon, StarIcon
} from './icons/ui';

// Map building IDs to icon components
const BUILDING_ICONS = {
  barracks: BarracksIcon,
  armory: ArmoryIcon,
  fortress: FortressIcon,
  trainingGrounds: TrainingIcon,
  treasury: TreasuryIcon,
  academy: AcademyIcon,
  infirmary: InfirmaryIcon,
};

// Map stat types to icon components
const STAT_ICONS = {
  barracks: HeartIcon,
  armory: SwordIcon,
  fortress: ShieldIcon,
  trainingGrounds: ChartIcon,
  treasury: GoldIcon,
  academy: ClockIcon,
  infirmary: RegenIcon,
};

const HomesteadScreen = () => {
  const { gold, homestead, upgradeBuilding } = useGameStore();
  const buildings = getBuildingList();

  const handleUpgrade = (buildingId) => {
    upgradeBuilding(buildingId);
  };

  const formatBonus = (building, level) => {
    const bonus = getBuildingBonus(building, level);
    const effect = building.effect;

    switch (effect.type) {
      case 'hp':
        return `+${Math.round(bonus * 100)}% HP`;
      case 'attack':
        return `+${Math.round(bonus * 100)}% Attack`;
      case 'defense':
        return `+${Math.round(bonus * 100)}% Defense`;
      case 'xpGain':
        return `+${Math.round(bonus * 100)}% XP`;
      case 'goldFind':
        return `+${Math.round(bonus * 100)}% Gold`;
      case 'healBetweenDungeons':
        return `+${Math.round(bonus * 100)}% Regen`;
      case 'cooldownReduction':
        return `-${Math.round(bonus)} Cooldown`;
      default:
        return `+${Math.round(bonus * 100)}%`;
    }
  };

  const formatNextBonus = (building) => {
    const perLevel = building.effect.valuePerLevel;
    switch (building.effect.type) {
      case 'cooldownReduction':
        return `-${perLevel} turn`;
      default:
        return `+${Math.round(perLevel * 100)}%`;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <CastleIcon size={24} /> Homestead
        </h2>
        <div className="text-yellow-400 font-bold flex items-center gap-1">
          <GoldIcon size={18} /> {gold.toLocaleString()} gold
        </div>
      </div>

      <p className="text-gray-400 text-sm">
        Upgrade buildings to gain permanent bonuses for your party.
      </p>

      <div className="grid grid-cols-2 gap-4">
        {buildings.map(building => {
          const currentLevel = homestead[building.id] || 0;
          const isMaxed = currentLevel >= building.maxLevel;
          const cost = isMaxed ? 0 : getUpgradeCost(building, currentLevel);
          const canAfford = gold >= cost;

          return (
            <div
              key={building.id}
              className={`bg-gray-800 rounded-lg p-4 border-2 transition-all ${
                isMaxed
                  ? 'border-yellow-500/50'
                  : canAfford
                  ? 'border-green-500/30 hover:border-green-500/60'
                  : 'border-gray-700'
              }`}
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-2">
                {(() => {
                  const BuildingIcon = BUILDING_ICONS[building.id] || CastleIcon;
                  return <BuildingIcon size={40} />;
                })()}
                <div className="flex-1">
                  <div className="text-white font-bold">{building.name}</div>
                  <div className="text-xs text-gray-500">
                    Level {currentLevel}/{building.maxLevel}
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-400 text-sm mb-3">{building.description}</p>

              {/* Current Bonus */}
              {currentLevel > 0 && (
                <div className="bg-gray-900 rounded px-3 py-2 mb-3">
                  <span className="text-gray-500 text-xs">Current: </span>
                  <span className="text-green-400 font-bold">
                    {formatBonus(building, currentLevel)}
                  </span>
                </div>
              )}

              {/* Level Progress Bar */}
              <div className="h-2 bg-gray-700 rounded-full mb-3 overflow-hidden">
                <div
                  className={`h-full transition-all ${isMaxed ? 'bg-yellow-500' : 'bg-blue-500'}`}
                  style={{ width: `${(currentLevel / building.maxLevel) * 100}%` }}
                />
              </div>

              {/* Upgrade Button */}
              {isMaxed ? (
                <div className="text-center text-yellow-400 font-bold py-2 flex items-center justify-center gap-1">
                  <StarIcon size={16} /> MAX LEVEL <StarIcon size={16} />
                </div>
              ) : (
                <button
                  onClick={() => handleUpgrade(building.id)}
                  disabled={!canAfford}
                  className={`w-full py-2 px-4 rounded-lg font-bold transition-all ${
                    canAfford
                      ? 'bg-green-600 hover:bg-green-500 text-white'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>Upgrade</span>
                    <span className="text-yellow-300 flex items-center gap-1">
                      <GoldIcon size={14} /> {cost.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs opacity-75">
                    {formatNextBonus(building)}
                  </div>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Total Bonuses Summary */}
      <div className="bg-gray-800 rounded-lg p-4 mt-6">
        <h3 className="text-white font-bold mb-3 flex items-center gap-2">
          <ChartIcon size={20} /> Total Bonuses
        </h3>
        <div className="grid grid-cols-4 gap-4 text-center">
          {[
            { id: 'barracks', label: 'HP' },
            { id: 'armory', label: 'Attack' },
            { id: 'fortress', label: 'Defense' },
            { id: 'trainingGrounds', label: 'XP' },
            { id: 'treasury', label: 'Gold' },
            { id: 'academy', label: 'Cooldown' },
            { id: 'infirmary', label: 'Heal' },
          ].map(({ id, label }) => {
            const building = BUILDINGS[id];
            const level = homestead[id] || 0;
            const bonus = getBuildingBonus(building, level);
            const effectType = building.effect.type;
            const StatIcon = STAT_ICONS[id] || StarIcon;

            let displayValue;
            if (effectType === 'cooldownReduction') {
              displayValue = bonus > 0 ? `-${bonus}` : '0';
            } else if (effectType === 'recruitBonus') {
              displayValue = bonus > 0 ? `+${bonus}` : '0';
            } else {
              displayValue = `+${Math.round(bonus * 100)}%`;
            }

            return (
              <div key={id} className="bg-gray-900 rounded p-2">
                <div className="flex justify-center">
                  <StatIcon size={24} />
                </div>
                <div className="text-xs text-gray-500">{label}</div>
                <div className={`font-bold ${level > 0 ? 'text-green-400' : 'text-gray-600'}`}>
                  {displayValue}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HomesteadScreen;
