import { useState } from 'react';
import { SKILL_TYPE } from '../data/skillTrees';
import { SkillIcon } from './icons/skills';
import { StarIcon } from './icons/ui';

const SkillNode = ({ skill, isUnlocked, isAvailable, onUnlock, canAfford }) => {
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
          w-16 h-16 rounded-lg border-2 flex flex-col items-center justify-center
          transition-all duration-200 relative
          ${bgColor} ${borderColor}
          ${isAvailable && !isUnlocked && canAfford ? 'hover:scale-110 hover:ring-2 cursor-pointer' : ''}
          ${ringColor}
          ${isUnlocked ? 'ring-2' : ''}
          ${justUnlocked ? 'animate-skill-activation' : ''}
        `}
      >
        <SkillIcon skillId={skill.id} size={32} />
        {isActive && (
          <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold
            ${isUnlocked ? 'bg-yellow-500 text-black' : isAvailable ? 'bg-blue-500 text-white' : 'bg-gray-600 text-gray-400'}`}>
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
          <div className="bg-gray-900 border border-gray-600 rounded-lg p-3 shadow-xl">
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
