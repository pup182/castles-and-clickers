import { useState, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { UNIQUE_ITEMS, getUniqueItem, scaleUniqueStats } from '../data/uniqueItems';
import { RAIDS, getRaidUniqueIds } from '../data/raids';
import { WORLD_BOSSES } from '../data/worldBosses';
import { CLASSES } from '../data/classes';
import ItemIcon from './icons/ItemIcon';
import { CheckIcon, StarIcon, CrownIcon, SkullIcon, LockIcon } from './icons/ui';

// Helper to format class restrictions
const formatClassRestrictions = (classes) => {
  if (!classes || !Array.isArray(classes) || classes.length === 0) {
    return 'All Classes';
  }
  return classes.map(c => CLASSES[c]?.name || c).join(', ');
};

// Group definitions for organizing uniques
const COLLECTION_GROUPS = [
  {
    id: 'world_bosses',
    name: 'World Bosses',
    description: 'Dropped by World Bosses in dungeons',
    items: ['ancient_bark', 'crown_of_the_fallen', 'magma_core', 'void_heart'],
    color: '#f59e0b',
  },
  {
    id: 'sunken_temple',
    name: 'Sunken Temple',
    description: 'Level 12 Raid',
    items: getRaidUniqueIds('sunken_temple'),
    color: '#0ea5e9',
  },
  {
    id: 'cursed_manor',
    name: 'Cursed Manor',
    description: 'Level 18 Raid',
    items: getRaidUniqueIds('cursed_manor'),
    color: '#a855f7',
  },
  {
    id: 'sky_fortress',
    name: 'Sky Fortress',
    description: 'Level 24 Raid',
    items: getRaidUniqueIds('sky_fortress'),
    color: '#3b82f6',
  },
  {
    id: 'the_abyss',
    name: 'The Abyss',
    description: 'Level 30 Raid',
    items: getRaidUniqueIds('the_abyss'),
    color: '#1e3a8a',
  },
  {
    id: 'void_throne',
    name: 'Void Throne',
    description: 'Level 35 Raid',
    items: getRaidUniqueIds('void_throne'),
    color: '#6d28d9',
  },
];

// Single unique item card
const UniqueItemCard = ({ itemId, isOwned, isSelected, onSelect }) => {
  const item = getUniqueItem(itemId);
  if (!item) return null;

  return (
    <button
      onClick={() => onSelect(itemId)}
      className={`
        relative p-2 rounded border-2 transition-all
        ${isSelected
          ? 'border-cyan-400 bg-cyan-900/30 unique-glow'
          : isOwned
            ? 'border-cyan-500/50 bg-gray-800/50 hover:border-cyan-400 unique-shimmer-subtle'
            : 'border-gray-700 bg-gray-900/50 hover:border-gray-500'
        }
      `}
    >
      {/* Item icon */}
      <div className={`relative ${!isOwned ? 'opacity-40 grayscale' : ''}`}>
        <ItemIcon
          item={{ templateId: itemId, slot: item.slot, rarity: 'unique' }}
          size={40}
        />
        {isOwned && (
          <div className="absolute -top-1 -right-1 bg-green-600 rounded-full p-0.5">
            <CheckIcon size={10} className="text-white" />
          </div>
        )}
      </div>
      {/* Item name */}
      <div className={`text-xs mt-1 truncate max-w-[64px] ${isOwned ? 'unique-text-shimmer' : 'text-gray-500'}`}>
        {isOwned ? item.name : '???'}
      </div>
    </button>
  );
};

// Detail panel for selected item
const UniqueDetailPanel = ({ itemId, isOwned, highestPartyLevel }) => {
  const item = getUniqueItem(itemId);
  if (!item) return null;

  const slotLabel = {
    weapon: 'Weapon',
    armor: 'Armor',
    accessory: 'Accessory',
  }[item.slot] || 'Unknown';

  const scaledStats = scaleUniqueStats(item.baseStats, highestPartyLevel);

  return (
    <div className={`pixel-panel p-4 ${isOwned ? 'unique-glow' : 'border-cyan-500/50'}`}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className={`${!isOwned ? 'opacity-40 grayscale' : ''}`}>
          <ItemIcon
            item={{ templateId: itemId, slot: item.slot, rarity: 'unique' }}
            size={48}
          />
        </div>
        <div className="flex-1">
          <h3 className={`text-lg font-bold ${isOwned ? 'unique-text-shimmer' : 'text-cyan-400'}`}>
            {isOwned ? item.name : '???'}
          </h3>
          <div className="text-sm text-gray-400">
            Unique {slotLabel}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            {formatClassRestrictions(item.classes)}
          </div>
        </div>
        {isOwned && (
          <div className="bg-green-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <CheckIcon size={12} />
            Owned
          </div>
        )}
      </div>

      {/* Stats */}
      {isOwned ? (
        <>
          <div className="mb-3">
            <div className="text-xs text-gray-400 mb-1">Stats (Lv {highestPartyLevel})</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(scaledStats).map(([stat, value]) => (
                <span key={stat} className="text-sm px-2 py-0.5 bg-gray-800 rounded">
                  <span className="text-gray-400 capitalize">{stat}: </span>
                  <span className={value >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {value >= 0 ? '+' : ''}{value}
                  </span>
                </span>
              ))}
            </div>
          </div>

          {/* Unique Power */}
          <div className="pixel-panel-dark p-3 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <StarIcon size={14} className="text-cyan-400 unique-sparkle" />
              <span className="font-bold unique-text-shimmer">{item.uniquePower.name}</span>
            </div>
            <p className="text-sm text-gray-300">{item.uniquePower.description}</p>
          </div>

          {/* Flavor text */}
          <div className="text-sm text-gray-500 italic">"{item.flavor}"</div>

          {/* Drop source for world boss items */}
          {item.dropSource?.worldBoss && (
            <div className="mt-3 text-xs text-gray-500 flex items-center gap-1">
              <SkullIcon size={12} className="text-amber-500" />
              <span>Drops from: World Boss: {WORLD_BOSSES[item.dropSource.worldBoss]?.name || item.dropSource.worldBoss}</span>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8">
          <LockIcon size={32} className="mx-auto text-gray-600 mb-2" />
          <p className="text-gray-500">Defeat the boss to unlock this item's details</p>
          {item.dropSource?.worldBoss && (
            <div className="flex items-center justify-center gap-1.5 mt-3 text-amber-500">
              <SkullIcon size={14} />
              <span className="text-sm">World Boss: {WORLD_BOSSES[item.dropSource.worldBoss]?.name || 'Unknown'}</span>
            </div>
          )}
          {item.dropSource?.raid && (
            <div className="flex items-center justify-center gap-1.5 mt-3 text-purple-400">
              <CrownIcon size={14} />
              <span className="text-sm">{RAIDS[item.dropSource.raid]?.name || 'Unknown Raid'}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Collection group section
const CollectionGroup = ({ group, ownedUniques, selectedItem, onSelectItem }) => {
  const ownedCount = group.items.filter(id => ownedUniques.includes(id)).length;
  const totalCount = group.items.length;
  const isComplete = ownedCount === totalCount;

  return (
    <div className="mb-6">
      {/* Group header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <CrownIcon size={16} style={{ color: group.color }} />
          <span className="font-bold" style={{ color: group.color }}>{group.name}</span>
          {isComplete && (
            <span className="text-xs bg-green-600 text-white px-1.5 py-0.5 rounded">COMPLETE</span>
          )}
        </div>
        <span className="text-sm" style={{ color: group.color }}>
          {ownedCount}/{totalCount}
        </span>
      </div>

      {/* Progress bar */}
      <div className="pixel-bar h-1.5 mb-2">
        <div
          className="pixel-bar-fill h-full transition-all"
          style={{
            width: `${(ownedCount / totalCount) * 100}%`,
            backgroundColor: group.color,
          }}
        />
      </div>

      {/* Item grid */}
      <div className="flex flex-wrap gap-2">
        {group.items.map(itemId => (
          <UniqueItemCard
            key={itemId}
            itemId={itemId}
            isOwned={ownedUniques.includes(itemId)}
            isSelected={selectedItem === itemId}
            onSelect={onSelectItem}
          />
        ))}
      </div>
    </div>
  );
};

// Main component
const UniqueCollectionScreen = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const ownedUniques = useGameStore(state => state.ownedUniques || []);
  const heroes = useGameStore(state => state.heroes);
  const highestPartyLevel = heroes.length > 0 ? Math.max(...heroes.map(h => h.level)) : 1;

  // Calculate overall progress
  const stats = useMemo(() => {
    let total = 0;
    let owned = 0;
    for (const group of COLLECTION_GROUPS) {
      total += group.items.length;
      owned += group.items.filter(id => ownedUniques.includes(id)).length;
    }
    return { total, owned, percent: total > 0 ? Math.round((owned / total) * 100) : 0 };
  }, [ownedUniques]);

  return (
    <div className="flex flex-col h-full max-h-[75vh]">
      {/* Header with overall progress */}
      <div className="pixel-panel-dark p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <StarIcon size={20} className="text-cyan-400 unique-sparkle" />
            <span className="pixel-title unique-text-shimmer">Unique Collection</span>
          </div>
          <span className="text-lg font-bold unique-text-shimmer">
            {stats.owned}/{stats.total} ({stats.percent}%)
          </span>
        </div>
        <div className="pixel-bar h-3">
          <div
            className="pixel-bar-fill h-full transition-all"
            style={{
              width: `${stats.percent}%`,
              backgroundColor: '#06b6d4',
            }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Unique items with special powers. Collect them all from Raids and World Bosses!
        </p>
      </div>

      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Left: Collection grid */}
        <div className="flex-1 overflow-y-auto pr-2">
          {COLLECTION_GROUPS.map(group => (
            <CollectionGroup
              key={group.id}
              group={group}
              ownedUniques={ownedUniques}
              selectedItem={selectedItem}
              onSelectItem={setSelectedItem}
            />
          ))}
        </div>

        {/* Right: Detail panel */}
        <div className="w-80 flex-shrink-0">
          {selectedItem ? (
            <UniqueDetailPanel
              itemId={selectedItem}
              isOwned={ownedUniques.includes(selectedItem)}
              highestPartyLevel={highestPartyLevel}
            />
          ) : (
            <div className="pixel-panel p-4 text-center text-gray-500 border-gray-700">
              <SkullIcon size={48} className="mx-auto mb-3 opacity-30" />
              <p>Select an item to view details</p>
              <p className="text-xs mt-2">
                Click on any item above to see its stats and unique power
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UniqueCollectionScreen;
