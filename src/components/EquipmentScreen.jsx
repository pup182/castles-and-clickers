import { useState, useMemo } from 'react';
import { useGameStore, calculateHeroStats, calculateSellValue, STAT_PRIORITIES } from '../store/gameStore';
import { CLASSES } from '../data/classes';
import { canClassUseEquipment } from '../data/equipment';
import { ITEM_AFFIXES } from '../data/itemAffixes';
import { scaleUniqueStats } from '../data/uniqueItems';
import HeroIcon from './icons/HeroIcon';
import ItemIcon, { WeaponSlotIcon, ArmorSlotIcon, AccessorySlotIcon } from './icons/ItemIcon';
import { GoldIcon, PartyIcon, StarIcon } from './icons/ui';

// Helper to get affix descriptions for an item
const getAffixDescriptions = (item) => {
  if (!item?.affixes) return [];
  return item.affixes
    .map(affixId => ITEM_AFFIXES[affixId])
    .filter(Boolean)
    .map(affix => ({ name: affix.name, description: affix.description }));
};

// Helper to format class restrictions for unique items
const formatClassRestrictions = (item) => {
  if (!item?.isUnique) return null;
  const classes = item.classes;
  if (!classes || classes.length === 0) return 'All Classes';
  return classes.map(c => CLASSES[c]?.name || c).join(', ');
};

// Slot icon mapping
const SLOT_ICONS = {
  weapon: WeaponSlotIcon,
  armor: ArmorSlotIcon,
  accessory: AccessorySlotIcon,
};

// Get display stats for an item, scaling unique items based on highest party level
const getItemDisplayStats = (item, highestPartyLevel) => {
  if (item?.isUnique && item?.baseStats) {
    return scaleUniqueStats(item.baseStats, highestPartyLevel);
  }
  return item?.stats || {};
};

// Build tooltip text for item
const buildItemTooltip = (item, affixes) => {
  const lines = [];
  if (affixes.length > 0) {
    lines.push(...affixes.map(a => `${a.name}: ${a.description}`));
  }
  if (item?.isUnique && item?.uniquePower) {
    if (lines.length > 0) lines.push('');
    lines.push(`★ ${item.uniquePower.name}`);
    lines.push(item.uniquePower.description);
    const classRestriction = formatClassRestrictions(item);
    if (classRestriction) {
      lines.push(`Classes: ${classRestriction}`);
    }
  }
  return lines.length > 0 ? lines.join('\n') : undefined;
};

// Compact equipped item slot
const EquippedSlot = ({ label, slot, item, onClick, isSelected, highestPartyLevel }) => {
  const affixes = getAffixDescriptions(item);
  const SlotIcon = SLOT_ICONS[slot];
  const isUnique = item?.isUnique;
  const displayStats = getItemDisplayStats(item, highestPartyLevel);

  return (
    <button
      onClick={onClick}
      className={`p-2 rounded border flex items-center gap-2 transition-all text-left w-full
        ${isSelected ? 'border-yellow-400 bg-yellow-400/10' : isUnique ? 'border-cyan-500 bg-cyan-900/10 hover:border-cyan-400' : 'border-gray-700 bg-gray-900 hover:border-gray-500'}`}
      title={buildItemTooltip(item, affixes)}
    >
      <div
        className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 relative ${
          item ? '' : 'border border-dashed border-gray-600'
        }`}
        style={item ? { backgroundColor: item.rarityColor + '20', border: `1px solid ${item.rarityColor}` } : {}}
      >
        {item ? <ItemIcon item={item} size={20} /> : <SlotIcon size={20} />}
        {isUnique && (
          <div className="absolute -top-1 -right-1">
            <StarIcon size={10} className="text-cyan-400 unique-sparkle" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        {item ? (
          <>
            <div className={`text-xs font-medium truncate flex items-center gap-1 ${isUnique ? 'unique-text-shimmer' : ''}`} style={isUnique ? {} : { color: item.rarityColor }}>
              {item.name}
              {isUnique && <StarIcon size={10} className="text-cyan-400 flex-shrink-0 unique-sparkle" />}
            </div>
            <div className="text-[10px] text-gray-500">
              {Object.entries(displayStats).map(([s, v]) => `+${v} ${s.replace('maxHp', 'HP')}`).join(' ')}
            </div>
            {isUnique && item.uniquePower ? (
              <div className="text-[9px] truncate unique-text-shimmer">
                {item.uniquePower.name}
              </div>
            ) : affixes.length > 0 && (
              <div className="text-[9px] text-purple-400 truncate">
                {affixes.map(a => a.name).join(' • ')}
              </div>
            )}
          </>
        ) : (
          <div className="text-gray-500 text-xs">{label}</div>
        )}
      </div>
    </button>
  );
};

// Compact inventory row
const InventoryRow = ({ item, canEquip, onEquip, onSell, comparison, highestPartyLevel }) => {
  const affixes = getAffixDescriptions(item);
  const isUnique = item?.isUnique;
  const displayStats = getItemDisplayStats(item, highestPartyLevel);

  return (
    <div
      className={`p-1.5 rounded border flex items-center gap-2
        ${comparison?.isBetter ? 'border-green-500/50 bg-green-500/5' : isUnique ? 'border-cyan-500/50 bg-cyan-900/10' : 'border-gray-700 bg-gray-900/50'}
        ${!canEquip ? 'opacity-50' : ''}`}
      title={buildItemTooltip(item, affixes)}
    >
      <div
        className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0 relative"
        style={{ backgroundColor: item.rarityColor + '20', border: `1px solid ${item.rarityColor}` }}
      >
        <ItemIcon item={item} size={18} />
        {isUnique && (
          <div className="absolute -top-1 -right-1">
            <StarIcon size={8} className="text-cyan-400 unique-sparkle" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className={`text-xs font-medium truncate ${isUnique ? 'unique-text-shimmer' : ''}`} style={isUnique ? {} : { color: item.rarityColor }}>{item.name}</span>
          {comparison?.isBetter && <span className="text-green-400 text-[10px] font-bold">▲</span>}
          {isUnique && <StarIcon size={10} className="text-cyan-400 flex-shrink-0 unique-sparkle" />}
          {!isUnique && affixes.length > 0 && <span className="text-purple-400 text-[10px]">✦</span>}
        </div>
        <div className="text-[10px] text-gray-500">
          {Object.entries(displayStats).map(([s, v]) => `+${v} ${s.replace('maxHp', 'HP')}`).join(' ')}
        </div>
        {isUnique && item.uniquePower ? (
          <>
            <div className="text-xs mt-1">
              <span className="font-medium unique-text-shimmer">{item.uniquePower.name}:</span> <span className="text-cyan-300">{item.uniquePower.description}</span>
            </div>
            <div className="text-[9px] text-gray-500">
              {formatClassRestrictions(item)}
            </div>
          </>
        ) : affixes.length > 0 && (
          <div className="text-[10px] text-purple-400 truncate">
            {affixes.map(a => a.description).join(' | ')}
          </div>
        )}
      </div>
      <div className="flex gap-1">
        {canEquip && (
          <button
            onClick={() => onEquip(item)}
            className={`px-2 py-1 text-white text-[10px] rounded font-medium ${
              comparison?.isBetter ? 'bg-green-600' : 'bg-blue-600'
            }`}
          >
            Equip
          </button>
        )}
        <button
          onClick={() => !isUnique && onSell(item.id)}
          className={`px-1.5 py-1 text-[10px] rounded flex items-center gap-0.5 ${
            isUnique
              ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
              : 'bg-gray-700 hover:bg-orange-600 text-gray-300'
          }`}
          title={isUnique ? 'Unique items cannot be sold' : undefined}
        >
          <GoldIcon size={10} />{isUnique ? '—' : calculateSellValue(item)}
        </button>
      </div>
    </div>
  );
};

const EquipmentScreen = () => {
  const {
    heroes,
    inventory,
    equipItem,
    unequipItem,
    sellItem,
    sellAllJunk,
    equipmentSettings,
    updateEquipmentSettings,
    setClassPriority,
    compareToEquipped,
  } = useGameStore();

  const [selectedHeroId, setSelectedHeroId] = useState(heroes[0]?.id || null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [sortBy, setSortBy] = useState('rarity');

  const selectedHero = heroes.find(h => h.id === selectedHeroId);
  const stats = selectedHero ? calculateHeroStats(selectedHero, heroes) : null;
  const highestPartyLevel = heroes.length > 0 ? Math.max(...heroes.map(h => h.level)) : 1;

  const processedInventory = useMemo(() => {
    let items = [...inventory];
    if (selectedSlot) items = items.filter(item => item.slot === selectedSlot);

    const getUpgradeStatus = (item) => {
      if (!selectedHero) return false;
      return compareToEquipped(item, selectedHero.id)?.isBetter || false;
    };

    items.sort((a, b) => {
      const aUp = getUpgradeStatus(a), bUp = getUpgradeStatus(b);
      if (aUp !== bUp) return aUp ? -1 : 1;
      if (sortBy === 'rarity') {
        const order = { legendary: 0, epic: 1, rare: 2, uncommon: 3, common: 4 };
        return (order[a.rarity] || 5) - (order[b.rarity] || 5);
      }
      return 0;
    });
    return items;
  }, [inventory, selectedSlot, sortBy, selectedHero, compareToEquipped]);

  const handleEquip = (item) => {
    if (!selectedHero || !canClassUseEquipment(selectedHero.classId, item)) return;
    equipItem(selectedHero.id, item);
  };

  const slotConfig = [
    { slot: 'weapon', label: 'Weapon' },
    { slot: 'armor', label: 'Armor' },
    { slot: 'accessory', label: 'Accessory' },
  ];

  if (heroes.length === 0) {
    return (
      <div className="text-gray-500 text-center py-8 flex items-center justify-center gap-2">
        <PartyIcon size={24} /> Recruit heroes first!
      </div>
    );
  }

  return (
    <div className="flex gap-3 h-[60vh]">
      {/* Left: Hero & Equipment */}
      <div className="w-64 flex-shrink-0 flex flex-col gap-2">
        {/* Hero Tabs */}
        <div className="flex gap-1">
          {heroes.filter(Boolean).map(hero => (
            <button
              key={hero.id}
              onClick={() => { setSelectedHeroId(hero.id); setSelectedSlot(null); }}
              className={`flex-1 p-1.5 rounded border text-center ${
                hero.id === selectedHeroId ? 'border-yellow-400 bg-yellow-400/10' : 'border-gray-700 bg-gray-900'
              }`}
            >
              <div className="flex justify-center"><HeroIcon classId={hero.classId} equipment={hero.equipment} size={24} /></div>
              <div className="text-[10px] text-gray-400 truncate">{hero.name}</div>
            </button>
          ))}
        </div>

        {/* Stats */}
        {stats && (
          <div className="bg-gray-900 rounded p-2 grid grid-cols-4 gap-1 text-center text-xs">
            <div><span className="text-green-400 font-bold">{stats.maxHp}</span><div className="text-[9px] text-gray-500">HP</div></div>
            <div><span className="text-red-400 font-bold">{stats.attack}</span><div className="text-[9px] text-gray-500">ATK</div></div>
            <div><span className="text-blue-400 font-bold">{stats.defense}</span><div className="text-[9px] text-gray-500">DEF</div></div>
            <div><span className="text-yellow-400 font-bold">{stats.speed}</span><div className="text-[9px] text-gray-500">SPD</div></div>
          </div>
        )}

        {/* Equipment Slots */}
        {selectedHero && (
          <div className="space-y-1">
            {slotConfig.map(({ slot, label }) => (
              <EquippedSlot
                key={slot}
                label={label}
                slot={slot}
                item={selectedHero.equipment[slot]}
                onClick={() => setSelectedSlot(selectedSlot === slot ? null : slot)}
                isSelected={selectedSlot === slot}
                highestPartyLevel={highestPartyLevel}
              />
            ))}
          </div>
        )}

        {/* Unequip */}
        {selectedSlot && selectedHero?.equipment[selectedSlot] && (
          <button
            onClick={() => { unequipItem(selectedHero.id, selectedSlot); setSelectedSlot(null); }}
            className="w-full bg-red-600/80 text-white py-1.5 rounded text-xs font-medium"
          >
            Unequip
          </button>
        )}

        {/* Settings - Compact */}
        <div className="bg-gray-900 rounded p-2 space-y-2 text-xs mt-auto">
          <div className="text-gray-400 font-medium">Settings</div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={equipmentSettings.autoEquipUpgrades}
              onChange={(e) => updateEquipmentSettings({ autoEquipUpgrades: e.target.checked })}
              className="rounded bg-gray-700 border-gray-600 w-3 h-3"
            />
            <span className="text-gray-300">Auto-equip upgrades</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={equipmentSettings.autoSellJunk}
              onChange={(e) => updateEquipmentSettings({ autoSellJunk: e.target.checked })}
              className="rounded bg-gray-700 border-gray-600 w-3 h-3"
            />
            <span className="text-gray-300">Auto-sell junk</span>
          </label>
          <div className="pt-1 border-t border-gray-700">
            <div className="text-[10px] text-gray-500 mb-1">Stat Priority</div>
            {heroes.filter(Boolean).map(hero => (
              <div key={hero.id} className="flex items-center gap-1 mb-0.5">
                <HeroIcon classId={hero.classId} equipment={hero.equipment} size={16} />
                <select
                  value={equipmentSettings.classPriority?.[hero.classId] || 'balanced'}
                  onChange={(e) => setClassPriority(hero.classId, e.target.value)}
                  className="flex-1 bg-gray-700 text-white text-[10px] rounded px-1 py-0.5 border-none"
                >
                  <option value="tank">Tank</option>
                  <option value="damage">Damage</option>
                  <option value="speed">Speed</option>
                  <option value="balanced">Balanced</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Inventory */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <h4 className="text-white font-medium text-sm">Inventory ({inventory.length})</h4>
          <button
            onClick={sellAllJunk}
            className="px-2 py-0.5 bg-orange-600/80 hover:bg-orange-600 text-white text-[10px] rounded"
          >
            Sell Junk
          </button>
          <div className="flex-1" />
          <div className="flex gap-1">
            <button
              onClick={() => setSelectedSlot(null)}
              className={`px-1.5 py-0.5 text-[10px] rounded ${!selectedSlot ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'}`}
            >
              All
            </button>
            {slotConfig.map(({ slot }) => {
              const SlotIcon = SLOT_ICONS[slot];
              return (
                <button
                  key={slot}
                  onClick={() => setSelectedSlot(selectedSlot === slot ? null : slot)}
                  className={`px-1.5 py-0.5 rounded flex items-center justify-center ${selectedSlot === slot ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'}`}
                >
                  <SlotIcon size={14} />
                </button>
              );
            })}
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-700 text-white text-[10px] rounded px-1 py-0.5 border-none"
          >
            <option value="rarity">Rarity</option>
            <option value="slot">Slot</option>
          </select>
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {processedInventory.length === 0 ? (
            <div className="text-gray-500 text-center py-4 text-sm">
              {selectedSlot ? `No ${selectedSlot}s` : 'Empty'}
            </div>
          ) : (
            processedInventory.map(item => (
              <InventoryRow
                key={item.id}
                item={item}
                canEquip={selectedHero && canClassUseEquipment(selectedHero.classId, item)}
                onEquip={handleEquip}
                onSell={sellItem}
                comparison={selectedHero ? compareToEquipped(item, selectedHero.id) : null}
                highestPartyLevel={highestPartyLevel}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default EquipmentScreen;
