import { useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import ClassIcon from './icons/ClassIcon';
import { PARTY_SLOTS } from '../data/classes';

const HeroPortrait = ({ hero, slot, onClick, isActive = false }) => {
  // Get current HP from heroHp store
  const heroHp = useGameStore(state => state.heroHp);

  const { currentHp, maxHp, hpPercent, isDead } = useMemo(() => {
    if (!hero || !hero.stats) return { currentHp: 0, maxHp: 0, hpPercent: 0, isDead: false };

    const max = hero.stats.maxHp || 100;
    const current = heroHp[hero.id] ?? max;
    const percent = max > 0 ? Math.max(0, Math.min(100, (current / max) * 100)) : 0;
    const dead = current <= 0;

    return { currentHp: current, maxHp: max, hpPercent: percent, isDead: dead };
  }, [hero, heroHp]);

  // Empty slot
  if (!hero) {
    return (
      <div
        onClick={onClick}
        className="w-12 h-14 flex flex-col items-center justify-center cursor-pointer group"
      >
        <div className="w-10 h-10 border-2 border-dashed border-gray-600 rounded flex items-center justify-center group-hover:border-gray-400 transition-colors">
          <span className="text-gray-600 text-xl group-hover:text-gray-400">+</span>
        </div>
        <div className="h-1.5 w-10 mt-1 bg-gray-700 rounded-sm" />
      </div>
    );
  }

  // Get HP bar color
  const getHpColor = () => {
    if (isDead) return 'bg-gray-600';
    if (hpPercent > 50) return 'bg-green-500';
    if (hpPercent > 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div
      onClick={onClick}
      className={`w-12 h-14 flex flex-col items-center cursor-pointer group transition-transform ${
        isActive ? 'scale-110' : 'hover:scale-105'
      }`}
    >
      {/* Portrait */}
      <div
        className={`relative w-10 h-10 rounded border-2 flex items-center justify-center ${
          isDead
            ? 'border-gray-600 bg-gray-800/80'
            : isActive
            ? 'border-amber-400 bg-gray-700/80'
            : 'border-gray-500 bg-gray-700/80 group-hover:border-gray-400'
        }`}
      >
        <ClassIcon classId={hero.classId} size={28} />

        {/* Level badge */}
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-gray-800 border border-gray-600 rounded-full flex items-center justify-center">
          <span className="text-[8px] text-gray-300 font-bold">{hero.level}</span>
        </div>

        {/* Dead overlay */}
        {isDead && (
          <div className="absolute inset-0 bg-black/60 rounded flex items-center justify-center">
            <span className="text-red-500 text-lg font-bold">X</span>
          </div>
        )}
      </div>

      {/* HP Bar */}
      <div className="w-10 h-1.5 mt-1 bg-gray-700 rounded-sm overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${getHpColor()}`}
          style={{ width: `${hpPercent}%` }}
        />
      </div>
    </div>
  );
};

const HeroPortraitBar = ({ onHeroClick }) => {
  const heroes = useGameStore(state => state.heroes);
  const maxPartySize = useGameStore(state => state.maxPartySize);
  const highestDungeonCleared = useGameStore(state => state.highestDungeonCleared);

  // Determine which slots to show (unlocked slots up to maxPartySize)
  const slots = useMemo(() => {
    const result = [];
    for (let i = 0; i < maxPartySize && i < PARTY_SLOTS.length; i++) {
      const slot = PARTY_SLOTS[i];
      const isUnlocked = highestDungeonCleared >= slot.dungeonRequired;
      if (isUnlocked) {
        result.push({
          index: i,
          hero: heroes[i] || null,
          slot,
        });
      }
    }
    return result;
  }, [heroes, maxPartySize, highestDungeonCleared]);

  return (
    <div className="flex items-center gap-1">
      {slots.map(({ index, hero }) => (
        <HeroPortrait
          key={index}
          hero={hero}
          slot={index}
          onClick={() => onHeroClick?.(index)}
        />
      ))}
    </div>
  );
};

export default HeroPortraitBar;
