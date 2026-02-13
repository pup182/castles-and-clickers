import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useGameStore } from '../store/gameStore';
import { getUniqueItem, scaleUniqueStats } from '../data/uniqueItems';
import { CLASSES } from '../data/classes';
import { StarIcon } from './icons/ui';
import ItemIcon from './icons/ItemIcon';

// Helper to format class restrictions
const formatClassRestrictions = (classes) => {
  // Handle null, undefined, or empty array - these all mean "all classes"
  if (!classes || !Array.isArray(classes) || classes.length === 0) {
    return 'All Classes';
  }
  return classes.map(c => CLASSES[c]?.name || c).join(', ');
};

const UniqueDropCelebration = () => {
  const pendingCelebration = useGameStore(state => state.pendingUniqueCelebration);
  const clearCelebration = useGameStore(state => state.clearUniqueCelebration);
  const heroes = useGameStore(state => state.heroes);
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Show celebration when a new unique is pending
  useEffect(() => {
    if (pendingCelebration) {
      setIsVisible(true);
      setIsClosing(false);
    }
  }, [pendingCelebration]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
      clearCelebration();
    }, 300);
  }, [clearCelebration]);

  // Allow clicking anywhere or pressing any key to close
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = () => handleClose();
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, handleClose]);

  if (!isVisible || !pendingCelebration) return null;

  const template = getUniqueItem(pendingCelebration.templateId || pendingCelebration.id);
  const item = pendingCelebration;

  if (!template && !item) return null;

  const itemData = template || item;
  const highestPartyLevel = heroes.length > 0 ? Math.max(...heroes.map(h => h.level)) : 1;
  const stats = itemData.baseStats
    ? scaleUniqueStats(itemData.baseStats, highestPartyLevel)
    : (item.stats || {});

  return createPortal(
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center cursor-pointer transition-opacity duration-300 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={handleClose}
    >
      {/* Cyan flash overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(6, 182, 212, 0.3) 0%, rgba(0, 0, 0, 0.9) 70%)',
          animation: isClosing ? 'none' : 'cyanFlash 0.5s ease-out',
        }}
      />

      {/* Particle effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-cyan-400"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              transform: 'rotate(45deg)',
              opacity: 0,
              animation: `sparkle 1.5s ease-out ${Math.random() * 0.5}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Main celebration card */}
      <div
        className={`relative pixel-panel p-8 max-w-md mx-4 text-center transform transition-transform duration-300 ${
          isClosing ? 'scale-90 opacity-0' : 'scale-100'
        }`}
        style={{
          animation: isClosing ? 'none' : 'celebrationPop 0.5s ease-out',
          boxShadow: '0 0 60px rgba(6, 182, 212, 0.5), inset 0 0 20px rgba(6, 182, 212, 0.1)',
          borderColor: '#06b6d4',
        }}
      >
        {/* Stars decoration */}
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          <StarIcon size={24} className="text-cyan-400 animate-pulse" />
          <StarIcon size={32} className="text-cyan-300" />
          <StarIcon size={24} className="text-cyan-400 animate-pulse" />
        </div>

        {/* Header */}
        <h2 className="pixel-title text-2xl text-cyan-400 mb-6 uppercase tracking-wider">
          Unique Item!
        </h2>

        {/* Item display */}
        <div className="relative mb-6">
          {/* Glow behind item */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(6, 182, 212, 0.4) 0%, transparent 70%)',
              transform: 'scale(1.5)',
            }}
          />

          {/* Item icon */}
          <div className="relative mx-auto w-24 h-24 flex items-center justify-center rounded-lg bg-cyan-900/50 border-2 border-cyan-500"
            style={{
              boxShadow: '0 0 20px rgba(6, 182, 212, 0.5)',
            }}
          >
            <ItemIcon item={item} size={64} />
          </div>
        </div>

        {/* Item name */}
        <h3 className="pixel-title text-xl text-cyan-300 mb-1">
          {itemData.name}
        </h3>
        <div className="text-cyan-500/70 text-sm capitalize mb-4">
          Unique {itemData.slot}
        </div>

        {/* Flavor text */}
        {itemData.flavor && (
          <div className="text-sm italic text-gray-400 mb-4">
            "{itemData.flavor}"
          </div>
        )}

        {/* Stats preview */}
        <div className="flex justify-center gap-4 mb-4 text-sm">
          {Object.entries(stats).slice(0, 3).map(([stat, value]) => (
            <div key={stat} className="text-center">
              <div className="text-gray-400 uppercase text-xs">{stat.replace('maxHp', 'HP').replace('attack', 'ATK').replace('defense', 'DEF').replace('speed', 'SPD')}</div>
              <div className={`font-bold ${value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {value >= 0 ? '+' : ''}{value}
              </div>
            </div>
          ))}
        </div>

        {/* Unique power */}
        {itemData.uniquePower && (
          <div className="bg-cyan-900/30 border border-cyan-600/50 rounded px-3 py-2 mb-4">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-2 h-2 bg-cyan-500 transform rotate-45" />
              <span className="text-cyan-400 font-bold uppercase text-sm">
                {itemData.uniquePower.name}
              </span>
              <div className="w-2 h-2 bg-cyan-500 transform rotate-45" />
            </div>
            <div className="text-cyan-300/80 text-xs">
              {itemData.uniquePower.description}
            </div>
          </div>
        )}

        {/* Class restrictions */}
        <div className="text-gray-400 text-sm mb-4">
          <span className="text-gray-500">Usable by: </span>
          {formatClassRestrictions(itemData.classes)}
        </div>

        {/* Click to continue */}
        <div className="text-gray-500 text-sm animate-pulse">
          Click anywhere to continue
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes cyanFlash {
          0% { opacity: 0; }
          30% { opacity: 1; }
          100% { opacity: 1; }
        }

        @keyframes celebrationPop {
          0% { transform: scale(0.5); opacity: 0; }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes sparkle {
          0% { opacity: 0; transform: rotate(45deg) scale(0) translateY(0); }
          20% { opacity: 1; transform: rotate(45deg) scale(1) translateY(-20px); }
          100% { opacity: 0; transform: rotate(45deg) scale(0) translateY(-100px); }
        }
      `}</style>
    </div>,
    document.body
  );
};

export default UniqueDropCelebration;
