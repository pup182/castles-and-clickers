import { useEffect, useState, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import ItemIcon from './icons/ItemIcon';
import { CheckIcon, WarningIcon, StarIcon, TrophyIcon } from './icons/ui';

const LootNotifications = () => {
  // OPTIMIZATION: Use individual selectors to avoid re-renders on unrelated state changes
  const lootNotifications = useGameStore(state => state.lootNotifications);
  const removeLootNotification = useCallback((id) => useGameStore.getState().removeLootNotification(id), []);
  const clearOldNotifications = useCallback(() => useGameStore.getState().clearOldNotifications(), []);

  // OPTIMIZATION: Only run cleanup interval when there are notifications
  useEffect(() => {
    if (lootNotifications.length === 0) return;

    const interval = setInterval(clearOldNotifications, 1000);
    return () => clearInterval(interval);
  }, [clearOldNotifications, lootNotifications.length]);

  if (lootNotifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-2 pointer-events-none">
      {lootNotifications.map((notif) => (
        <Notification
          key={notif.id}
          notification={notif}
          onDismiss={() => removeLootNotification(notif.id)}
        />
      ))}
    </div>
  );
};

const Notification = ({ notification, onDismiss }) => {
  const { type, item } = notification;
  // OPTIMIZATION: Access inventory imperatively on click to avoid re-renders
  const equipItem = useCallback((heroId, item) => useGameStore.getState().equipItem(heroId, item), []);
  const [equipped, setEquipped] = useState(false);

  // Auto-dismiss after animation
  useEffect(() => {
    const timer = setTimeout(onDismiss, equipped ? 2000 : 4500);
    return () => clearTimeout(timer);
  }, [onDismiss, equipped]);

  const handleClick = () => {
    // If it's an upgrade notification and item is still in inventory, equip it
    if (type === 'looted' && notification.upgradeFor && !equipped) {
      // OPTIMIZATION: Access inventory imperatively to avoid subscription
      const inventory = useGameStore.getState().inventory;
      const itemInInventory = inventory.find(i => i.id === item.id);
      if (itemInInventory) {
        equipItem(notification.upgradeFor.id, item);
        setEquipped(true);
        return;
      }
    }
    // Otherwise just dismiss
    onDismiss();
  };

  const getContent = () => {
    // Show equipped confirmation
    if (equipped) {
      return (
        <>
          <div className="flex items-center gap-2">
            <CheckIcon size={20} />
            <span className="font-medium text-green-400">Equipped!</span>
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {item.name} on {notification.upgradeFor.name}
          </div>
        </>
      );
    }

    switch (type) {
      case 'auto-sold':
        return (
          <>
            <div className="flex items-center gap-2">
              <ItemIcon item={item} size={20} />
              <span className="text-gray-400">{item.name}</span>
            </div>
            <div className="text-xs text-yellow-400 mt-1">
              Auto-sold for {notification.gold} gold
            </div>
          </>
        );

      case 'looted':
        return (
          <>
            <div className="flex items-center gap-2">
              <ItemIcon item={item} size={20} />
              <span className="font-medium" style={{ color: item.rarityColor }}>
                {item.name}
              </span>
            </div>
            <div className="text-xs mt-1">
              {notification.upgradeFor ? (
                <span className="text-green-400">
                  Upgrade for {notification.upgradeFor.name}! <span className="text-blue-400">(click to equip)</span>
                </span>
              ) : (
                <span className="text-gray-400">Added to inventory</span>
              )}
            </div>
          </>
        );

      case 'inventory-full':
        return (
          <>
            <div className="flex items-center gap-2">
              <WarningIcon size={20} />
              <span className="text-red-400 font-medium">Inventory Full!</span>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Lost: <span style={{ color: item.rarityColor }}>{item.name}</span>
            </div>
          </>
        );

      case 'auto-equipped':
        return (
          <>
            <div className="flex items-center gap-2">
              <ItemIcon item={item} size={20} />
              <span className="font-medium" style={{ color: item.rarityColor }}>
                {item.name}
              </span>
            </div>
            <div className="text-xs text-green-400 mt-1">
              Auto-equipped on {notification.hero?.name}
              {notification.oldItem && notification.goldGain > 0 && (
                <span className="text-yellow-400 ml-1">(+{notification.goldGain}g)</span>
              )}
            </div>
          </>
        );

      case 'unique-drop':
        return (
          <>
            <div className="flex items-center gap-2">
              <div className="unique-sparkle">
                <ItemIcon item={item} size={20} />
              </div>
              <span className="font-medium unique-text-shimmer">{item.name}</span>
            </div>
            <div className="text-xs text-cyan-300 mt-1">
              New unique added to collection!
            </div>
          </>
        );

      case 'unique-duplicate':
        return (
          <>
            <div className="flex items-center gap-2">
              <div className="unique-sparkle">
                <ItemIcon item={item} size={20} />
              </div>
              <span className="font-medium unique-text-shimmer">{item.name}</span>
            </div>
            <div className="text-xs text-yellow-400 mt-1">
              Duplicate unique - converted to {notification.gold}g
            </div>
          </>
        );

      case 'collection-milestone': {
        const { collectionName, owned, total, isComplete } = notification;
        if (isComplete) {
          return (
            <div className="flex items-center gap-2">
              <TrophyIcon size={18} className="unique-sparkle" />
              <span className="font-bold unique-text-shimmer">{collectionName.toUpperCase()} COMPLETE!</span>
            </div>
          );
        }
        return (
          <div className="flex items-center gap-2">
            <StarIcon size={16} className="unique-sparkle" />
            <span className="unique-text-shimmer">{owned}/{total} {collectionName} uniques</span>
          </div>
        );
      }

      default:
        return null;
    }
  };

  const getBorderColor = () => {
    if (equipped) return '#22c55e';
    switch (type) {
      case 'auto-sold': return '#eab308';
      case 'looted': return notification.upgradeFor ? '#22c55e' : item.rarityColor;
      case 'inventory-full': return '#ef4444';
      case 'auto-equipped': return '#22c55e';
      case 'unique-drop': return '#06b6d4'; // unique cyan
      case 'unique-duplicate': return '#06b6d4'; // unique cyan
      case 'collection-milestone': return notification.isComplete ? '#eab308' : '#06b6d4';
      default: return '#6b7280';
    }
  };

  const isClickable = type === 'looted' && notification.upgradeFor && !equipped;

  return (
    <div
      className={`bg-gray-900/95 backdrop-blur-sm rounded-lg p-3 min-w-64 max-w-80
                 border-l-4 shadow-lg animate-slide-in pointer-events-auto cursor-pointer
                 transition-all ${isClickable ? 'hover:bg-gray-800/95 hover:scale-105' : 'hover:bg-gray-800/95'}
                 ${equipped ? 'scale-95' : ''}`}
      style={{ borderLeftColor: getBorderColor() }}
      onClick={handleClick}
    >
      {getContent()}
    </div>
  );
};

export default LootNotifications;
