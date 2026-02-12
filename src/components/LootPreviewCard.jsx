import { useMemo } from 'react';
import { UNIQUE_TRIGGER, getUniqueItem } from '../data/uniqueItems';
import { StarIcon, CheckIcon } from './icons/ui';
import ItemIcon from './icons/ItemIcon';

// Get trigger display name (short version)
const getTriggerShort = (trigger) => {
  switch (trigger) {
    case UNIQUE_TRIGGER.PASSIVE: return 'Passive';
    case UNIQUE_TRIGGER.ON_HIT: return 'On Hit';
    case UNIQUE_TRIGGER.ON_CRIT: return 'On Crit';
    case UNIQUE_TRIGGER.ON_KILL: return 'On Kill';
    case UNIQUE_TRIGGER.ON_DAMAGE_TAKEN: return 'On Hit Taken';
    case UNIQUE_TRIGGER.ON_COMBAT_START: return 'Combat Start';
    case UNIQUE_TRIGGER.ON_ROOM_START: return 'Room Start';
    case UNIQUE_TRIGGER.ON_LOW_HP: return 'Low HP';
    case UNIQUE_TRIGGER.ON_DEATH: return 'Cheat Death';
    case UNIQUE_TRIGGER.ACTIVE: return 'Active';
    default: return '';
  }
};

const LootPreviewCard = ({ item, itemId, owned = false, showDetails = true, compact = false }) => {
  // Support both item objects and item IDs
  const itemData = useMemo(() => {
    if (item) return item;
    if (itemId) return getUniqueItem(itemId);
    return null;
  }, [item, itemId]);

  if (!itemData) return null;

  const isUnique = itemData.rarity === 'legendary' || itemData.isUnique;

  if (compact) {
    return (
      <div className={`flex items-center gap-2 px-2 py-1 rounded ${
        owned ? 'bg-gray-700/30' : isUnique ? 'bg-amber-900/20' : 'bg-gray-800/50'
      }`}>
        <div className="relative">
          <ItemIcon item={itemData} size={20} />
          {owned && (
            <CheckIcon size={12} className="absolute -bottom-1 -right-1 text-green-400" />
          )}
        </div>
        <span className={`text-sm ${
          owned ? 'text-gray-500 line-through' : isUnique ? 'text-amber-400' : 'text-gray-300'
        }`}>
          {itemData.name}
        </span>
        {isUnique && !owned && (
          <span className="text-xs bg-amber-600/30 text-amber-400 px-1 rounded">UNIQUE</span>
        )}
      </div>
    );
  }

  return (
    <div className={`pixel-panel-dark p-3 ${
      owned ? 'opacity-60' : ''
    }`} style={{
      borderColor: isUnique ? '#f59e0b' : undefined,
      borderWidth: isUnique ? '2px' : undefined,
    }}>
      <div className="flex items-start gap-3">
        {/* Item icon */}
        <div className={`relative p-2 rounded ${
          isUnique ? 'bg-amber-900/30 border border-amber-600/50' : 'bg-gray-800'
        }`}>
          <ItemIcon item={itemData} size={32} />
          {owned && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
              <CheckIcon size={12} className="text-white" />
            </div>
          )}
        </div>

        {/* Item info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`font-bold ${
              isUnique ? 'text-amber-400' : 'text-gray-300'
            }`}>
              {itemData.name}
            </span>
            {isUnique && (
              <StarIcon size={14} className="text-amber-400" />
            )}
          </div>

          <div className="text-xs text-gray-500 capitalize">
            {itemData.rarity} {itemData.slot}
          </div>

          {/* Unique power preview */}
          {showDetails && itemData.uniquePower && (
            <div className="mt-2 text-xs">
              <div className="flex items-center gap-1 text-amber-400/80">
                <span className="font-bold">{itemData.uniquePower.name}</span>
                <span className="text-amber-600">
                  ({getTriggerShort(itemData.uniquePower.trigger)})
                </span>
              </div>
              <div className="text-gray-500 mt-0.5 line-clamp-2">
                {itemData.uniquePower.description}
              </div>
            </div>
          )}

          {/* Owned indicator */}
          {owned && (
            <div className="mt-1 text-xs text-green-400 flex items-center gap-1">
              <CheckIcon size={12} />
              <span>Already owned</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats preview */}
      {showDetails && itemData.baseStats && (
        <div className="flex gap-3 mt-2 pt-2 border-t border-gray-700/50 text-xs">
          {Object.entries(itemData.baseStats).map(([stat, value]) => (
            <div key={stat} className="flex items-center gap-1">
              <span className="text-gray-500">
                {stat === 'maxHp' ? 'HP' : stat.toUpperCase()}:
              </span>
              <span className={value >= 0 ? 'text-green-400' : 'text-red-400'}>
                {value >= 0 ? '+' : ''}{value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LootPreviewCard;
