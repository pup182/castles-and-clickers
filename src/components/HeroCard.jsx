import { CLASSES } from '../data/classes';
import { useGameStore, calculateHeroStats, xpForLevel, calculateSkillPoints, calculateUsedSkillPoints } from '../store/gameStore';
import ClassIcon from './icons/ClassIcon';
import ItemIcon, { WeaponSlotIcon, ArmorSlotIcon, AccessorySlotIcon } from './icons/ItemIcon';
import { HeartIcon, SwordIcon, ShieldIcon, SpeedIcon } from './icons/ui';

const HeroCard = ({ hero, onSelect, isSelected, showEquipment = true }) => {
  const classData = CLASSES[hero.classId];
  const heroes = useGameStore(state => state.heroes);
  const stats = calculateHeroStats(hero, heroes);
  const xpNeeded = xpForLevel(hero.level);
  const xpPercent = (hero.xp / xpNeeded) * 100;

  // Calculate available skill points
  const totalPoints = calculateSkillPoints(hero.level);
  const usedPoints = calculateUsedSkillPoints(hero);
  const availablePoints = totalPoints - usedPoints;

  return (
    <div
      onClick={onSelect}
      className={`
        bg-gray-800 rounded-lg p-4 cursor-pointer transition-all relative
        border-2 ${isSelected ? 'border-yellow-500' : 'border-gray-700 hover:border-gray-500'}
      `}
    >
      {/* Skill point indicator */}
      {availablePoints > 0 && (
        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold
                        w-6 h-6 rounded-full flex items-center justify-center
                        animate-pulse shadow-lg shadow-green-500/50">
          +{availablePoints}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <ClassIcon classId={hero.classId} size={40} />
        <div className="flex-1">
          <h3 className="text-white font-bold">{hero.name}</h3>
          <p className="text-gray-400 text-sm">{classData.name} Lv.{hero.level}</p>
        </div>
      </div>

      {/* XP Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>XP</span>
          <span>{hero.xp} / {xpNeeded}</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-500 transition-all"
            style={{ width: `${xpPercent}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
        <div className="flex items-center gap-2">
          <HeartIcon size={16} />
          <span className="text-gray-300">{stats.maxHp}</span>
        </div>
        <div className="flex items-center gap-2">
          <SwordIcon size={16} />
          <span className="text-gray-300">{stats.attack}</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldIcon size={16} />
          <span className="text-gray-300">{stats.defense}</span>
        </div>
        <div className="flex items-center gap-2">
          <SpeedIcon size={16} />
          <span className="text-gray-300">{stats.speed}</span>
        </div>
      </div>

      {/* Equipment */}
      {showEquipment && (
        <div className="flex gap-2 pt-2 border-t border-gray-700">
          {['weapon', 'armor', 'accessory'].map(slot => {
            const item = hero.equipment[slot];
            const SlotIcon = slot === 'weapon' ? WeaponSlotIcon : slot === 'armor' ? ArmorSlotIcon : AccessorySlotIcon;
            return (
              <div
                key={slot}
                className="flex-1 bg-gray-900 rounded p-2 flex flex-col items-center justify-center"
                title={item ? `${item.name}` : `No ${slot}`}
              >
                {item ? <ItemIcon item={item} size={24} /> : <SlotIcon size={24} />}
                {!item && <span className="text-gray-600 text-xs">Empty</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HeroCard;
