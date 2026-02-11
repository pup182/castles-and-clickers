import { memo, useMemo } from 'react';
import { getSkillById, SKILL_TYPE } from '../data/skillTrees';
import HeroIcon from './icons/HeroIcon';
import { SkillIcon as SkillIconSprite } from './icons/skills';

// OPTIMIZATION: Memoized skill icon to prevent re-lookups
const SkillCooldownIcon = memo(({ skillId, cooldown }) => {
  const skill = getSkillById(skillId);
  if (!skill || skill.type !== SKILL_TYPE.ACTIVE) return null;

  const isReady = cooldown <= 0;

  return (
    <div
      className={`w-6 h-6 rounded flex items-center justify-center relative
        ${isReady ? 'bg-blue-600' : 'bg-gray-700'}`}
      title={`${skill.name}${isReady ? ' (Ready)' : ` (${cooldown} turns)`}`}
    >
      <div className={isReady ? '' : 'opacity-50'}>
        <SkillIconSprite skillId={skillId} size={20} />
      </div>
      {!isReady && (
        <span className="absolute -bottom-0.5 -right-0.5 bg-gray-900 text-[8px] text-gray-400
                         w-3 h-3 rounded-full flex items-center justify-center">
          {cooldown}
        </span>
      )}
    </div>
  );
});

// OPTIMIZATION: Memoized hero card
const HeroStatusCard = memo(({ hero, heroLevel, cooldowns }) => {
  const hpPercent = hero.stats.hp / hero.stats.maxHp;
  const hpColor = hpPercent > 0.5 ? 'bg-green-500' : hpPercent > 0.25 ? 'bg-yellow-500' : 'bg-red-500';
  const heroSkillIds = hero.skills || [];

  return (
    <div className="bg-gray-900 rounded-lg p-2 mb-2">
      {/* Name and Level */}
      <div className="flex items-center gap-2 mb-1">
        <HeroIcon classId={hero.classId} equipment={hero.equipment} size={24} />
        <div className="flex-1 min-w-0">
          <div className="text-sm text-white font-medium truncate">{hero.name}</div>
          <div className="text-xs text-gray-500">Lv.{heroLevel}</div>
        </div>
        <span className="text-xs text-gray-400">{hero.stats.hp}/{hero.stats.maxHp}</span>
      </div>

      {/* HP Bar */}
      <div className="h-1.5 bg-gray-700 rounded overflow-hidden mb-1.5">
        <div
          className={`h-full transition-all ${hpColor}`}
          style={{ width: `${hpPercent * 100}%` }}
        />
      </div>

      {/* Skill Cooldowns */}
      {heroSkillIds.length > 0 && (
        <div className="flex gap-1 flex-wrap">
          {heroSkillIds.map(skillId => (
            <SkillCooldownIcon
              key={skillId}
              skillId={skillId}
              cooldown={cooldowns[skillId] || 0}
            />
          ))}
        </div>
      )}
    </div>
  );
});

/**
 * Party status panel showing hero HP and skill cooldowns
 * OPTIMIZATION: Pre-build hero lookup map, memoize components
 */
const PartyStatus = ({ displayHeroes, heroes, skillCooldowns }) => {
  // OPTIMIZATION: Build hero level lookup map once instead of O(n) find per hero
  const heroLevelMap = useMemo(() => {
    const map = {};
    for (let i = 0; i < heroes.length; i++) {
      map[heroes[i].id] = heroes[i].level;
    }
    return map;
  }, [heroes]);

  return (
    <div>
      <h3 className="text-white font-bold mb-2">Party</h3>
      {displayHeroes.map(h => (
        <HeroStatusCard
          key={h.id}
          hero={h}
          heroLevel={heroLevelMap[h.id] || 1}
          cooldowns={skillCooldowns?.[h.id] || {}}
        />
      ))}
    </div>
  );
};

export default memo(PartyStatus);
