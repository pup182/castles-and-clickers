import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { RARITY } from '../data/equipment';
import { CLASSES } from '../data/classes';
import { getMaxShopRarity } from '../data/milestones';
import {
  SHOP_CONSUMABLES,
  CONSUMABLE_CATEGORIES,
  getConsumableCost,
  getAvailableConsumables,
} from '../data/consumables';
import ItemIcon from './icons/ItemIcon';
import HeroIcon from './icons/HeroIcon';
import { GoldIcon, LockIcon, ChestIcon, StarIcon, PotionIcon, ScrollIcon, SwordIcon } from './icons/ui';
import { calculateHeroStats } from '../store/helpers/statCalculator';

const RARITY_LABEL = {
  uncommon: 'Common & Uncommon',
  rare: 'Common to Rare',
  epic: 'Common to Epic',
  legendary: 'All rarities',
};

const ShopScreen = () => {
  const [tab, setTab] = useState('equipment');
  const [heroPickFor, setHeroPickFor] = useState(null); // consumableId being targeted

  const gold = useGameStore(state => state.gold);
  const shop = useGameStore(state => state.shop);
  const highestDungeonCleared = useGameStore(state => state.highestDungeonCleared);
  const inventory = useGameStore(state => state.inventory);
  const maxInventory = useGameStore(state => state.maxInventory);
  const heroes = useGameStore(state => state.heroes);
  const heroHp = useGameStore(state => state.heroHp);
  const shopConsumables = useGameStore(state => state.shopConsumables);
  const pendingDungeonBuffs = useGameStore(state => state.pendingDungeonBuffs);
  const refreshShop = useGameStore(state => state.refreshShop);
  const checkShopRefresh = useGameStore(state => state.checkShopRefresh);
  const buyFromShop = useGameStore(state => state.buyFromShop);
  const buyConsumable = useGameStore(state => state.buyConsumable);
  const applyShopConsumable = useGameStore(state => state.useShopConsumable);
  const getShopConsumableCount = useGameStore(state => state.getShopConsumableCount);
  const isUpgradeForAnyHero = useGameStore(state => state.isUpgradeForAnyHero);
  const sellAllJunk = useGameStore(state => state.sellAllJunk);
  const getShopRefreshCost = useGameStore(state => state.getShopRefreshCost);
  const getHomesteadBonuses = useGameStore(state => state.getHomesteadBonuses);

  const [refreshTimer, setRefreshTimer] = useState('');

  useEffect(() => {
    checkShopRefresh();
  }, [checkShopRefresh]);

  // Update refresh timer every 30s
  useEffect(() => {
    const update = () => {
      const twoHours = 2 * 60 * 60 * 1000;
      const elapsed = Date.now() - shop.lastRefresh;
      const remaining = Math.max(0, twoHours - elapsed);
      const hours = Math.floor(remaining / (60 * 60 * 1000));
      const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
      setRefreshTimer(`${hours}h ${minutes}m`);
    };
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, [shop.lastRefresh]);

  const isUnlocked = highestDungeonCleared >= 5;
  const inventoryFull = inventory.length >= maxInventory;
  const refreshCost = getShopRefreshCost();
  const maxRarity = getMaxShopRarity(highestDungeonCleared);

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

  const availableConsumables = getAvailableConsumables(highestDungeonCleared);

  const getCategoryIcon = (category) => {
    if (category === 'healing') return <PotionIcon size={16} />;
    if (category === 'xp') return <ScrollIcon size={16} />;
    return <PotionIcon size={16} />;
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ChestIcon size={24} /> Item Shop
        </h2>
        <div className="text-yellow-400 font-bold flex items-center gap-1">
          <GoldIcon size={18} /> {gold.toLocaleString()}
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-4">
        <button
          onClick={() => setTab('equipment')}
          className={`pixel-btn text-sm flex items-center gap-1 ${tab === 'equipment' ? 'pixel-btn-primary' : ''}`}
        >
          <SwordIcon size={14} /> Equipment
        </button>
        <button
          onClick={() => setTab('consumables')}
          className={`pixel-btn text-sm flex items-center gap-1 ${tab === 'consumables' ? 'pixel-btn-primary' : ''}`}
        >
          <PotionIcon size={14} /> Consumables
        </button>
      </div>

      {/* Equipment Tab */}
      {tab === 'equipment' && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm">
              {RARITY_LABEL[maxRarity] || 'Common & Uncommon'} items available
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const result = sellAllJunk();
                  if (result?.count > 0) {
                    // Sold items notification handled by store
                  }
                }}
                className="pixel-btn text-xs"
              >
                Sell Non-Upgrades
              </button>
              <button
                onClick={() => refreshShop(true)}
                disabled={gold < refreshCost}
                className="pixel-btn text-sm disabled:opacity-50"
              >
                Refresh ({refreshCost}g)
              </button>
            </div>
          </div>
          <p className="text-gray-500 text-xs mb-4">
            Next free refresh in: {refreshTimer}
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
                        <div className="font-medium truncate" style={{ color: rarityData?.color }}>
                          {item.name}
                        </div>
                        <div className="text-gray-400 text-xs capitalize mb-1">
                          {item.rarity} {item.slot}
                        </div>
                        <div className="text-xs text-gray-300">
                          {Object.entries(item.stats).map(([stat, val]) => (
                            <span key={stat} className="mr-2">+{val} {stat}</span>
                          ))}
                        </div>
                        {item.classes && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            Classes: {item.classes.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>

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
                        onClick={() => buyFromShop(item.id)}
                        disabled={!canBuy}
                        className={`pixel-btn text-sm ${
                          canBuy
                            ? upgradeInfo?.isUpgrade
                              ? 'pixel-btn-success animate-pulse'
                              : 'pixel-btn-success'
                            : 'opacity-50 cursor-not-allowed'
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
      )}

      {/* Consumables Tab */}
      {tab === 'consumables' && (
        <div>
          {/* Pending buffs indicator */}
          {pendingDungeonBuffs.length > 0 && (
            <div className="pixel-panel p-2 mb-4 text-blue-300 text-sm" style={{ borderColor: '#3b82f6' }}>
              Active buffs (next dungeon): {pendingDungeonBuffs.map(b => b.name).join(', ')}
            </div>
          )}

          {availableConsumables.length === 0 ? (
            <div className="pixel-panel p-8 text-center">
              <p className="text-gray-400">No consumables available yet. Clear more dungeons to unlock!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {availableConsumables.map(template => {
                const unitCost = getConsumableCost(template.id, highestDungeonCleared);
                const owned = getShopConsumableCount(template.id);
                const atMax = owned >= template.maxStack;
                const canAfford = gold >= unitCost;
                const categoryData = CONSUMABLE_CATEGORIES[template.category];

                return (
                  <div key={template.id} className="pixel-panel p-3">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${categoryData?.color}20`, border: `2px solid ${categoryData?.color}` }}
                      >
                        {getCategoryIcon(template.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-white">{template.name}</div>
                          <div className="text-xs text-gray-400">
                            Owned: <span className={atMax ? 'text-yellow-400' : 'text-white'}>{owned}/{template.maxStack}</span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">{template.description}</div>

                        <div className="flex items-center justify-between mt-2">
                          <div className={`text-sm font-bold ${canAfford && !atMax ? 'text-yellow-400' : 'text-gray-500'}`}>
                            <GoldIcon size={14} className="inline mr-1" />
                            {unitCost}
                          </div>
                          <div className="flex items-center gap-1">
                            {/* Buy buttons */}
                            {[1, 5].map(qty => {
                              const maxBuyable = template.maxStack - owned;
                              const actualQty = Math.min(qty, maxBuyable);
                              const totalCost = unitCost * actualQty;
                              const canBuyQty = actualQty > 0 && gold >= totalCost;

                              return (
                                <button
                                  key={qty}
                                  onClick={() => buyConsumable(template.id, qty)}
                                  disabled={!canBuyQty}
                                  className="pixel-btn text-xs disabled:opacity-50"
                                >
                                  x{qty}
                                </button>
                              );
                            })}
                            <button
                              onClick={() => {
                                const maxBuyable = template.maxStack - owned;
                                const maxAffordable = Math.floor(gold / unitCost);
                                buyConsumable(template.id, Math.min(maxBuyable, maxAffordable));
                              }}
                              disabled={atMax || !canAfford}
                              className="pixel-btn text-xs disabled:opacity-50"
                            >
                              Max
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Owned consumables section */}
              {shopConsumables.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-bold text-gray-300 mb-2">Owned Consumables</h3>
                  <div className="space-y-1">
                    {/* Group by templateId */}
                    {Object.entries(
                      shopConsumables.reduce((acc, c) => {
                        acc[c.templateId] = acc[c.templateId] || [];
                        acc[c.templateId].push(c);
                        return acc;
                      }, {})
                    ).map(([templateId, items]) => {
                      const template = SHOP_CONSUMABLES[templateId];
                      if (!template) return null;
                      const categoryData = CONSUMABLE_CATEGORIES[template.category];
                      const isHealing = template.effect.type === 'heal';
                      const isAlreadyPending = pendingDungeonBuffs.some(b => b.templateId === templateId);

                      return (
                        <div key={templateId} className="pixel-panel-dark p-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded flex items-center justify-center"
                              style={{ backgroundColor: `${categoryData?.color}30` }}
                            >
                              {getCategoryIcon(template.category)}
                            </div>
                            <span className="text-sm text-white">{template.name}</span>
                            <span className="text-xs text-gray-400">x{items.length}</span>
                          </div>
                          <div>
                            {isHealing ? (
                              // Healing potions: show hero picker
                              heroPickFor === items[0].id ? (
                                <div className="flex items-center gap-1">
                                  {heroes.filter(Boolean).map(hero => {
                                    const stats = calculateHeroStats(hero, heroes, getHomesteadBonuses());
                                    const maxHp = stats.maxHp;
                                    const currentHp = heroHp[hero.id] ?? maxHp;
                                    const needsHeal = currentHp < maxHp;
                                    return (
                                      <button
                                        key={hero.id}
                                        onClick={() => {
                                          applyShopConsumable(items[0].id, hero.id);
                                          setHeroPickFor(null);
                                        }}
                                        disabled={!needsHeal}
                                        className="pixel-btn text-xs disabled:opacity-50"
                                        title={`${hero.name}: ${currentHp}/${maxHp} HP`}
                                      >
                                        <HeroIcon classId={hero.classId} equipment={hero.equipment} size={16} />
                                      </button>
                                    );
                                  })}
                                  <button
                                    onClick={() => setHeroPickFor(null)}
                                    className="pixel-btn text-xs text-red-400"
                                  >
                                    X
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setHeroPickFor(items[0].id)}
                                  className="pixel-btn text-xs pixel-btn-success"
                                >
                                  Use
                                </button>
                              )
                            ) : (
                              // Buffs: activate for next dungeon
                              <button
                                onClick={() => applyShopConsumable(items[0].id)}
                                disabled={isAlreadyPending}
                                className="pixel-btn text-xs pixel-btn-primary disabled:opacity-50"
                              >
                                {isAlreadyPending ? 'Queued' : 'Activate'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ShopScreen;
