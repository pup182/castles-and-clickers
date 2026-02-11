import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { RARITY } from '../data/equipment';
import { CLASSES } from '../data/classes';
import ItemIcon from './icons/ItemIcon';
import HeroIcon from './icons/HeroIcon';
import { GoldIcon, LockIcon, ChestIcon, StarIcon } from './icons/ui';

const ShopScreen = () => {
  const gold = useGameStore(state => state.gold);
  const shop = useGameStore(state => state.shop);
  const highestDungeonCleared = useGameStore(state => state.highestDungeonCleared);
  const inventory = useGameStore(state => state.inventory);
  const maxInventory = useGameStore(state => state.maxInventory);
  const refreshShop = useGameStore(state => state.refreshShop);
  const checkShopRefresh = useGameStore(state => state.checkShopRefresh);
  const buyFromShop = useGameStore(state => state.buyFromShop);
  const isUpgradeForAnyHero = useGameStore(state => state.isUpgradeForAnyHero);

  // Check for auto-refresh on mount
  useEffect(() => {
    checkShopRefresh();
  }, [checkShopRefresh]);

  const isUnlocked = highestDungeonCleared >= 5;
  const inventoryFull = inventory.length >= maxInventory;

  // Calculate time until next auto-refresh
  const getTimeUntilRefresh = () => {
    const fourHours = 4 * 60 * 60 * 1000;
    const elapsed = Date.now() - shop.lastRefresh;
    const remaining = Math.max(0, fourHours - elapsed);
    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    return `${hours}h ${minutes}m`;
  };

  const handleBuy = (itemId) => {
    if (buyFromShop(itemId)) {
      // Item purchased successfully
    }
  };

  if (!isUnlocked) {
    return (
      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
          <ChestIcon size={24} /> Item Shop
        </h2>
        <div className="pixel-panel p-8 text-center">
          <div className="flex justify-center mb-4">
            <LockIcon size={48} />
          </div>
          <h3 className="text-lg text-white mb-2">Shop Locked</h3>
          <p className="text-gray-400">
            Clear Dungeon 5 to unlock the Item Shop.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Current progress: Dungeon {highestDungeonCleared} / 5
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ChestIcon size={24} /> Item Shop
        </h2>
        <div className="flex items-center gap-4">
          <div className="text-yellow-400 font-bold flex items-center gap-1">
            <GoldIcon size={18} /> {gold.toLocaleString()}
          </div>
          <button
            onClick={() => refreshShop(true)}
            disabled={gold < shop.refreshCost}
            className="pixel-btn text-sm disabled:opacity-50"
          >
            Refresh ({shop.refreshCost}g)
          </button>
        </div>
      </div>

      <p className="text-gray-400 text-sm mb-2">
        Buy equipment for your heroes. Common and Uncommon items only.
      </p>
      <p className="text-gray-500 text-xs mb-4">
        Next free refresh in: {getTimeUntilRefresh()}
      </p>

      {inventoryFull && (
        <div className="pixel-panel p-2 mb-4 text-red-400 text-sm" style={{ borderColor: 'var(--color-red)' }}>
          Inventory full! Sell or equip items to make room.
        </div>
      )}

      {shop.items.length === 0 ? (
        <div className="pixel-panel p-8 text-center">
          <p className="text-gray-400">Shop is empty. Click Refresh to stock new items!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {shop.items.map(item => {
            const rarityData = RARITY[item.rarity];
            const canAfford = gold >= item.shopPrice;
            const canBuy = canAfford && !inventoryFull;
            const upgradeInfo = isUpgradeForAnyHero(item);

            return (
              <div
                key={item.id}
                className={`pixel-panel p-3 relative ${upgradeInfo?.isUpgrade ? 'ring-2 ring-green-500' : ''}`}
                style={{
                  borderColor: rarityData?.color || 'var(--color-border)',
                  borderWidth: '2px',
                }}
              >
                {/* Upgrade Badge */}
                {upgradeInfo?.isUpgrade && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5 shadow-lg">
                    <StarIcon size={10} /> UPGRADE
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div
                    className="w-12 h-12 rounded flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: `${rarityData?.color}20`,
                      border: `2px solid ${rarityData?.color}`,
                    }}
                  >
                    <ItemIcon item={item} size={32} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className="font-medium truncate"
                      style={{ color: rarityData?.color }}
                    >
                      {item.name}
                    </div>
                    <div className="text-gray-400 text-xs capitalize mb-1">
                      {item.rarity} {item.slot}
                    </div>
                    <div className="text-xs text-gray-300">
                      {Object.entries(item.stats).map(([stat, val]) => (
                        <span key={stat} className="mr-2">
                          +{val} {stat}
                        </span>
                      ))}
                    </div>
                    {item.classes && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        Classes: {item.classes.join(', ')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Upgrade For Hero Indicator */}
                {upgradeInfo?.isUpgrade && upgradeInfo.hero && (
                  <div className="mt-2 flex items-center gap-2 p-1.5 bg-green-900/30 rounded border border-green-600/30">
                    <HeroIcon classId={upgradeInfo.hero.classId} equipment={upgradeInfo.hero.equipment} size={20} />
                    <div className="text-xs">
                      <span className="text-green-400">Upgrade for </span>
                      <span className="text-white font-medium">{upgradeInfo.hero.name}</span>
                      <span className="text-green-300 ml-1">({CLASSES[upgradeInfo.hero.classId]?.name})</span>
                    </div>
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between">
                  <div className={`font-bold ${canAfford ? 'text-yellow-400' : 'text-red-400'}`}>
                    <GoldIcon size={14} className="inline mr-1" />
                    {item.shopPrice}
                  </div>
                  <button
                    onClick={() => handleBuy(item.id)}
                    disabled={!canBuy}
                    className={`px-3 py-1 text-sm rounded transition-all ${
                      canBuy
                        ? upgradeInfo?.isUpgrade
                          ? 'bg-green-600 hover:bg-green-500 text-white animate-pulse'
                          : 'bg-green-600 hover:bg-green-500 text-white'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {inventoryFull ? 'Inv Full' : canAfford ? 'Buy' : 'Need Gold'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ShopScreen;
