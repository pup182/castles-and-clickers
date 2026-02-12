import { useMemo } from 'react';
import { UNIQUE_TRIGGER } from '../../data/uniqueItems';
import { WORLD_BOSSES } from '../../data/worldBosses';
import { RAIDS } from '../../data/raids';
import ItemIcon from '../icons/ItemIcon';
import { StarIcon } from '../icons/ui';

// Stat display names
const STAT_NAMES = {
  maxHp: 'HP',
  attack: 'ATK',
  defense: 'DEF',
  speed: 'SPD',
};

// Get stat color
const getStatColor = (stat) => {
  switch (stat) {
    case 'maxHp': return 'text-green-400';
    case 'attack': return 'text-red-400';
    case 'defense': return 'text-blue-400';
    case 'speed': return 'text-yellow-400';
    default: return 'text-gray-300';
  }
};

// Get trigger display name
const getTriggerDisplay = (trigger) => {
  switch (trigger) {
    case UNIQUE_TRIGGER.PASSIVE: return 'Passive';
    case UNIQUE_TRIGGER.ON_HIT: return 'On Hit';
    case UNIQUE_TRIGGER.ON_CRIT: return 'On Critical Hit';
    case UNIQUE_TRIGGER.ON_KILL: return 'On Kill';
    case UNIQUE_TRIGGER.ON_DAMAGE_TAKEN: return 'On Damage Taken';
    case UNIQUE_TRIGGER.ON_COMBAT_START: return 'Combat Start';
    case UNIQUE_TRIGGER.ON_ROOM_START: return 'Room Start';
    case UNIQUE_TRIGGER.ON_LOW_HP: return 'When Low HP';
    case UNIQUE_TRIGGER.ON_DEATH: return 'Cheat Death';
    case UNIQUE_TRIGGER.ON_HEAL: return 'On Heal';
    case UNIQUE_TRIGGER.ON_SKILL: return 'On Skill Use';
    case UNIQUE_TRIGGER.ON_PARTY_DAMAGE: return 'Party Damage';
    case UNIQUE_TRIGGER.ON_LETHAL: return 'On Lethal Damage';
    case UNIQUE_TRIGGER.ACTIVE: return 'Active Ability';
    default: return trigger || 'Unknown';
  }
};

// Get drop source name
const getDropSourceName = (dropSource) => {
  if (!dropSource) return null;

  if (dropSource.worldBoss) {
    const boss = WORLD_BOSSES[dropSource.worldBoss];
    return boss ? boss.name : dropSource.worldBoss;
  }

  if (dropSource.raid) {
    const raid = RAIDS[dropSource.raid];
    if (raid) {
      const wing = raid.wings?.find(w => w.id === dropSource.wing);
      return wing ? `${raid.name} - ${wing.name}` : raid.name;
    }
    return dropSource.raid;
  }

  return null;
};

const UniqueItemTooltip = ({ item, template = null }) => {
  // Support both item instances and templates
  const uniqueData = useMemo(() => {
    if (template) return template;
    if (item?.isUnique && item?.uniquePower) return item;
    return null;
  }, [item, template]);

  if (!uniqueData) return null;

  const stats = item?.stats || uniqueData.baseStats || {};
  const uniquePower = uniqueData.uniquePower;
  const dropSource = uniqueData.dropSource || template?.dropSource;
  const dropSourceName = getDropSourceName(dropSource);

  return (
    <div className="min-w-[280px] max-w-[320px]">
      {/* Header with gold legendary gradient */}
      <div
        className="px-3 py-2 rounded-t-lg -mx-3 -mt-2 mb-2"
        style={{
          background: 'linear-gradient(135deg, #f59e0b40 0%, #f59e0b10 100%)',
          borderBottom: '2px solid #f59e0b',
        }}
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded bg-amber-900/50 border border-amber-600/50">
            <StarIcon size={20} className="text-amber-400" />
          </div>
          <div className="flex-1">
            <div className="font-bold text-amber-400 flex items-center gap-1">
              <span className="text-amber-500">*</span>
              {uniqueData.name}
              <span className="text-amber-500">*</span>
            </div>
            <div className="text-xs text-amber-300/70 capitalize">
              Legendary {uniqueData.slot}
            </div>
          </div>
        </div>
      </div>

      {/* Flavor text */}
      {uniqueData.flavor && (
        <div className="text-sm italic text-gray-400 mb-3 px-1 border-l-2 border-amber-600/50 pl-2">
          "{uniqueData.flavor}"
        </div>
      )}

      {/* Stats */}
      <div className="space-y-1 mb-3">
        {Object.entries(stats).map(([stat, value]) => (
          <div key={stat} className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">{STAT_NAMES[stat] || stat}</span>
            <span className={`font-medium ${value >= 0 ? getStatColor(stat) : 'text-red-400'}`}>
              {value >= 0 ? '+' : ''}{value}
            </span>
          </div>
        ))}
      </div>

      {/* Unique Power Section */}
      {uniquePower && (
        <div className="border-t border-amber-600/30 pt-3">
          {/* Power header */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-amber-500 transform rotate-45" />
            <span className="font-bold text-amber-400 uppercase text-xs tracking-wide">
              Unique Power: {uniquePower.name}
            </span>
          </div>

          {/* Trigger type */}
          <div className="text-xs text-amber-300/80 mb-2">
            <span className="text-gray-500">Trigger:</span>{' '}
            <span className="font-medium">{getTriggerDisplay(uniquePower.trigger)}</span>
            {uniquePower.cooldown && (
              <span className="ml-2 text-gray-500">
                ({uniquePower.cooldown} turn cooldown)
              </span>
            )}
          </div>

          {/* Description */}
          <div className="text-sm text-gray-300 leading-relaxed bg-gray-800/50 rounded px-2 py-1.5 border border-gray-700/50">
            {uniquePower.description}
          </div>
        </div>
      )}

      {/* Class restrictions */}
      {uniqueData.classes && (
        <div className="mt-3 pt-2 border-t border-gray-700/50">
          <div className="text-xs text-gray-500">
            <span className="text-amber-600/70">Classes:</span>{' '}
            {uniqueData.classes.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(', ')}
          </div>
        </div>
      )}

      {/* Drop source */}
      {dropSourceName && (
        <div className="mt-2 pt-2 border-t border-gray-700/50">
          <div className="text-xs text-gray-500">
            <span className="text-amber-600/70">Drops from:</span>{' '}
            <span className="text-gray-400">{dropSourceName}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default UniqueItemTooltip;
