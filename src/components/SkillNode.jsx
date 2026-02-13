import { useState } from 'react';
import { SKILL_TYPE } from '../data/skillTrees';
import { SkillIcon } from './icons/skills';
import { StarIcon } from './icons/ui';

const SkillNode = ({ skill, tier, isUnlocked, isAvailable, onUnlock, canAfford }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [justUnlocked, setJustUnlocked] = useState(false);

  const isActive = skill.type === SKILL_TYPE.ACTIVE;
  const isStarter = skill.starterSkill;

  // Determine node state and styling
  let bgColor, borderColor, textColor, ringColor;
  if (isUnlocked) {
    bgColor = 'bg-yellow-500/20';
    borderColor = 'border-yellow-400';
    textColor = 'text-yellow-400';
    ringColor = 'ring-yellow-400/30';
  } else if (isAvailable && canAfford) {
    bgColor = 'bg-blue-500/20';
    borderColor = 'border-blue-400';
    textColor = 'text-blue-400';
    ringColor = 'ring-blue-400/30';
  } else if (isAvailable && !canAfford) {
    bgColor = 'bg-blue-500/10';
    borderColor = 'border-blue-400/50';
    textColor = 'text-blue-400/50';
    ringColor = '';
  } else {
    bgColor = 'bg-gray-800/50';
    borderColor = 'border-gray-600';
    textColor = 'text-gray-500';
    ringColor = '';
  }

  const sizeClass = tier === 3 ? 'w-[4.5rem] h-[4.5rem]' : 'w-16 h-16';
  const iconSize = tier === 3 ? 36 : 32;

  const animClass = isUnlocked
    ? tier === 3 ? 'skill-capstone-glow' : 'skill-unlocked'
    : isAvailable && canAfford ? 'skill-available-breathe' : '';

  const activeClass = isUnlocked && skill.type === SKILL_TYPE.ACTIVE ? 'skill-active-pulse' : '';

  const handleClick = () => {
    if (isAvailable && !isUnlocked && canAfford) {
      onUnlock(skill.id);
      setJustUnlocked(true);
      setTimeout(() => setJustUnlocked(false), 300);
    }
  };

  // Format effect description
  const getEffectDescription = () => {
    if (skill.type === SKILL_TYPE.PASSIVE && skill.passive) {
      return skill.description;
    }
    if (skill.type === SKILL_TYPE.ACTIVE && skill.effect) {
      return `${skill.description} (${skill.cooldown} turn CD)`;
    }
    return skill.description;
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <button
        onClick={handleClick}
        disabled={isUnlocked || !isAvailable || !canAfford}
        className={`
          ${sizeClass} rounded-lg border-2 flex flex-col items-center justify-center
          transition-all duration-200 relative
          ${bgColor} ${borderColor}
          ${isAvailable && !isUnlocked && canAfford ? 'hover:scale-110 hover:ring-2 cursor-pointer' : ''}
          ${ringColor}
          ${isUnlocked ? 'ring-2' : ''}
          ${animClass} ${activeClass}
          ${justUnlocked ? 'animate-skill-activation' : ''}
        `}
      >
        <SkillIcon skillId={skill.id} size={iconSize} />
        {isActive && (
          <div className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border border-black/50 shadow-sm
            ${isUnlocked ? 'bg-yellow-500 text-black' : isAvailable ? 'bg-blue-500 text-white' : 'bg-gray-600 text-gray-300'}`}>
            A
          </div>
        )}
        {isStarter && isUnlocked && (
          <div className="absolute -bottom-1 -right-1">
            <StarIcon size={12} />
          </div>
        )}
      </button>

      {/* Tooltip - positioned below to avoid modal header clipping */}
      {showTooltip && (
        <div className="absolute z-[100] top-full left-1/2 -translate-x-1/2 mt-2 w-56 pointer-events-none">
          {/* Arrow pointing up */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-[-1px]">
            <div className="border-8 border-transparent border-b-gray-600" />
          </div>
          <div className="pixel-panel-dark p-3 shadow-xl">
            <div className="flex items-center gap-2 mb-1">
              <SkillIcon skillId={skill.id} size={24} />
              <span className={`font-bold ${textColor}`}>{skill.name}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded ${
                isActive ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'
              }`}>
                {isActive ? 'Active' : 'Passive'}
              </span>
            </div>

            <p className="text-sm text-gray-300 mb-2">{getEffectDescription()}</p>

            {isActive && (
              <div className="text-xs text-gray-400 flex gap-3">
                <span>Cooldown: {skill.cooldown}</span>
                <span>Target: {skill.targetType?.replace(/_/g, ' ')}</span>
              </div>
            )}

            {skill.tier !== undefined && (
              <div className="text-xs text-gray-500 mt-2 border-t border-gray-700 pt-2">
                {skill.tier === 3 ? 'Capstone Skill' : `Tier ${skill.tier}`}
              </div>
            )}

            {/* Status message */}
            <div className={`text-xs mt-2 font-medium ${
              isUnlocked ? 'text-yellow-400' :
              isAvailable && canAfford ? 'text-green-400' :
              isAvailable && !canAfford ? 'text-orange-400' :
              'text-gray-500'
            }`}>
              {isUnlocked && 'Unlocked'}
              {!isUnlocked && isAvailable && canAfford && 'Click to unlock'}
              {!isUnlocked && isAvailable && !canAfford && 'No skill points'}
              {!isUnlocked && !isAvailable && 'Locked - unlock prerequisites'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillNode;
