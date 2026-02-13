import { useGameStore } from '../store/gameStore';
import { RARITY } from '../data/equipment';
import ItemIcon from './icons/ItemIcon';
import { BagIcon } from './icons/ui';

const ItemCard = ({ item, onEquip, onSell, showActions = true }) => {
  const isUnique = item?.isUnique;
  return (
    <div
      className={`bg-gray-900 rounded-lg p-3 border-2 transition-all hover:border-gray-600 ${isUnique ? 'unique-shimmer-subtle' : ''}`}
      style={{ borderColor: item.rarityColor }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className={isUnique ? 'unique-sparkle' : ''}>
          <ItemIcon item={item} size={28} />
        </div>
        <div className="flex-1 min-w-0">
          <h4
            className={`font-medium text-sm truncate ${isUnique ? 'unique-text-shimmer' : ''}`}
            style={isUnique ? {} : { color: item.rarityColor }}
          >
            {item.name}
          </h4>
          <span className="text-xs text-gray-500 capitalize">{item.slot}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="text-xs text-gray-400 space-y-1">
        {Object.entries(item.stats).map(([stat, value]) => (
          <div key={stat} className="flex justify-between">
            <span className="capitalize">{stat.replace('maxHp', 'HP')}</span>
            <span className="text-green-400">+{value}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex gap-2 mt-3">
          {onEquip && (
            <button
              onClick={() => onEquip(item)}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs py-1 rounded"
            >
              Equip
            </button>
          )}
          {onSell && (
            <button
              onClick={() => onSell(item.id)}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-xs py-1 rounded"
            >
              Sell
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const InventoryPanel = ({ selectedHeroId, onEquipItem }) => {
  const { inventory, maxInventory, sellItem } = useGameStore();

  const groupedItems = inventory.reduce((acc, item) => {
    if (!acc[item.slot]) acc[item.slot] = [];
    acc[item.slot].push(item);
    return acc;
  }, {});

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold flex items-center gap-2">
          <BagIcon size={20} />
          Inventory
        </h3>
        <span className="text-gray-400 text-sm">
          {inventory.length} / {maxInventory}
        </span>
      </div>

      {inventory.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          No items. Clear dungeons to find loot!
        </div>
      ) : (
        <div className="space-y-4">
          {['weapon', 'armor', 'accessory'].map(slot => {
            const items = groupedItems[slot] || [];
            if (items.length === 0) return null;

            return (
              <div key={slot}>
                <h4 className="text-gray-400 text-sm mb-2 capitalize">{slot}s</h4>
                <div className="grid grid-cols-2 gap-2">
                  {items.map(item => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      onEquip={selectedHeroId ? onEquipItem : null}
                      onSell={sellItem}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InventoryPanel;
