import { useState } from 'react';
import { useGameStore, calculateHeroStats } from '../store/gameStore';
import { CLASSES, PARTY_SLOTS, ROLE_INFO, getClassesByRole } from '../data/classes';
import ClassIcon, { RoleIcon } from './icons/ClassIcon';
import HeroIcon from './icons/HeroIcon';
import { LockIcon } from './icons/ui';

// Base costs for re-recruitment (when first-recruit discount is used)
const BASE_RECRUIT_COSTS = { tank: 100, healer: 150, dps: 200 };

const HeroManagement = () => {
  const heroes = useGameStore(state => state.heroes);
  const gold = useGameStore(state => state.gold);
  const dungeon = useGameStore(state => state.dungeon);
  const retireHero = useGameStore(state => state.retireHero);
  const highestDungeonCleared = useGameStore(state => state.highestDungeonCleared);
  const usedSlotDiscounts = useGameStore(state => state.usedSlotDiscounts);
  const addHero = useGameStore(state => state.addHero);
  const spendGold = useGameStore(state => state.spendGold);
  const pendingRecruits = useGameStore(state => state.pendingRecruits);
  const pendingPartyChanges = useGameStore(state => state.pendingPartyChanges);
  const queueClassChange = useGameStore(state => state.queueClassChange);

  const [expandedSlot, setExpandedSlot] = useState(null);
  const [confirmRetire, setConfirmRetire] = useState(null);

  const handleRetire = (heroId) => {
    const goldGained = retireHero(heroId);
    if (goldGained) {
      setConfirmRetire(null);
    }
  };

  const getRetireValue = (hero) => 25 + (hero.level * 25);

  // Check if a hero has a pending retirement (not class change)
  const hasPendingRetire = (heroId) => {
    return pendingPartyChanges.some(p => p.heroId === heroId && p.type === 'retire');
  };

  // Check if a slot has a pending class change
  const hasPendingSlotChange = (slotIndex) => {
    return pendingPartyChanges.some(p => p.slotIndex === slotIndex && p.type === 'classChange');
  };

  const getTotalHeroCount = () => {
    return heroes.filter(Boolean).length;
  };

  // Check if a slot is unlocked based on dungeon progress
  const isSlotUnlocked = (slotIndex) => {
    const slot = PARTY_SLOTS[slotIndex];
    return highestDungeonCleared >= slot.dungeonRequired;
  };

  // Check if the slot's first-recruit discount has been used
  const isFirstRecruitAvailable = (slotIndex) => {
    return !usedSlotDiscounts.includes(slotIndex);
  };

  // Get available classes for direct recruitment (basic heroes)
  const getClassesForSlot = (slotIndex) => {
    const slot = PARTY_SLOTS[slotIndex];
    return getClassesByRole(slot.role);
  };

  // Handle direct recruitment of a basic hero (first-recruit or paid)
  const handleDirectRecruit = (classId, slotIndex) => {
    const slot = PARTY_SLOTS[slotIndex];
    const isFirstRecruit = isFirstRecruitAvailable(slotIndex);

    if (!isFirstRecruit) {
      // Need to pay for re-recruitment
      const cost = BASE_RECRUIT_COSTS[slot.role] || 150;
      if (gold < cost) return false;
      if (!spendGold(cost)) return false;
    }

    addHero(classId, null, slotIndex);
    setExpandedSlot(null);
    return true;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h3 className="pixel-subtitle mb-4">Party Management</h3>

      {/* Active dungeon notice */}
      {dungeon && (
        <div className="pixel-panel p-2 text-yellow-400 text-xs mb-4" style={{ borderColor: 'var(--color-gold)' }}>
          Dungeon in progress - changes will take effect after completion.
        </div>
      )}

      {/* Party Slots Grid */}
      <div className="grid grid-cols-2 gap-3">
        {PARTY_SLOTS.map((slot, index) => {
          const hero = heroes[index];
          const pendingHero = pendingRecruits.find(p => p.slotIndex === index);
          const roleInfo = ROLE_INFO[slot.role];
          const isExpanded = expandedSlot === index;
          const slotUnlocked = isSlotUnlocked(index);
          const firstRecruitAvailable = isFirstRecruitAvailable(index);
          const availableClasses = getClassesForSlot(index);
          const recruitCost = BASE_RECRUIT_COSTS[slot.role] || 150;

          return (
            <div key={index} className={`pixel-panel overflow-hidden ${!slotUnlocked ? 'opacity-60' : ''}`}>
              {/* Slot Header */}
              <div className="flex items-center justify-between px-3 py-2 border-b-2 border-[var(--color-border)]" style={{ background: 'linear-gradient(180deg, #3a3a5a 0%, #2a2a4a 100%)' }}>
                <div className="flex items-center gap-2">
                  <RoleIcon role={slot.role} size={18} />
                  <span className="text-white text-sm font-medium">{roleInfo.name}</span>
                </div>
                {!slotUnlocked && (
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <LockIcon size={12} /> D{slot.dungeonRequired}
                  </span>
                )}
              </div>

              {/* Slot Content */}
              <div className="p-3">
                {/* Locked slot */}
                {!slotUnlocked ? (
                  <div className="text-center py-6">
                    <div className="flex justify-center mb-2">
                      <LockIcon size={40} />
                    </div>
                    <div className="text-gray-500 text-sm">
                      Clear Dungeon {slot.dungeonRequired} to unlock
                    </div>
                  </div>
                ) : pendingHero ? (
                  // Pending hero (recruited during dungeon)
                  <div className="text-center py-3">
                    <div className="flex items-center justify-center gap-3 mb-2 opacity-60">
                      <HeroIcon classId={pendingHero.hero.classId} equipment={pendingHero.hero.equipment} size={36} />
                      <div className="text-left">
                        <div className="text-white font-medium">{pendingHero.hero.name}</div>
                        <div className="text-gray-400 text-sm">
                          Lv.{pendingHero.hero.level} {CLASSES[pendingHero.hero.classId]?.name}
                        </div>
                      </div>
                    </div>
                    <div className="text-yellow-400 text-sm animate-pulse">
                      Joins after dungeon
                    </div>
                  </div>
                ) : hero ? (
                  // Hero in slot
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <HeroIcon classId={hero.classId} equipment={hero.equipment} size={36} />
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium">{hero.name}</div>
                        <div className="text-gray-400 text-sm">
                          Lv.{hero.level} {CLASSES[hero.classId]?.name}
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    {(() => {
                      const stats = calculateHeroStats(hero);
                      return (
                        <div className="grid grid-cols-4 gap-1 text-xs mb-3 bg-gray-900 rounded p-2">
                          <div className="text-center">
                            <div className="text-gray-500 text-[10px]">HP</div>
                            <span className="text-red-400 font-medium">{stats.maxHp}</span>
                          </div>
                          <div className="text-center">
                            <div className="text-gray-500 text-[10px]">ATK</div>
                            <span className="text-orange-400 font-medium">{stats.attack}</span>
                          </div>
                          <div className="text-center">
                            <div className="text-gray-500 text-[10px]">DEF</div>
                            <span className="text-blue-400 font-medium">{stats.defense}</span>
                          </div>
                          <div className="text-center">
                            <div className="text-gray-500 text-[10px]">SPD</div>
                            <span className="text-green-400 font-medium">{stats.speed}</span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Pending change indicator */}
                    {hasPendingRetire(hero.id) && (
                      <div className="text-xs text-yellow-400 bg-yellow-900/30 rounded px-2 py-1 mb-2 text-center">
                        Pending retirement after dungeon
                      </div>
                    )}
                    {hasPendingSlotChange(index) && (
                      <div className="text-xs text-blue-400 bg-blue-900/30 rounded px-2 py-1 mb-2 text-center">
                        Class change pending after dungeon
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setExpandedSlot(isExpanded ? null : index)}
                        disabled={hasPendingRetire(hero.id) || hasPendingSlotChange(index)}
                        className={`flex-1 px-2 py-1.5 text-sm rounded transition-all ${
                          hasPendingRetire(hero.id) || hasPendingSlotChange(index)
                            ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                            : isExpanded
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        Change Class
                      </button>
                      <button
                        onClick={() => getTotalHeroCount() > 1 && setConfirmRetire(hero.id)}
                        disabled={getTotalHeroCount() <= 1 || hasPendingRetire(hero.id)}
                        className={`px-3 py-1.5 text-sm rounded ${
                          hasPendingRetire(hero.id)
                            ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                            : 'bg-gray-700 text-red-400 hover:bg-red-900 disabled:opacity-50'
                        }`}
                      >
                        Retire
                      </button>
                    </div>

                    {/* Class Change Panel - Compact horizontal layout */}
                    {isExpanded && (
                      <div className="mt-2 pt-2 border-t border-gray-700">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-gray-500">{recruitCost}g</span>
                          <span className="text-xs text-red-400">Resets to Lv.1</span>
                          {dungeon && <span className="text-xs text-yellow-400">(after dungeon)</span>}
                          <div className="flex gap-1 ml-auto">
                            {availableClasses.filter(c => c.id !== hero.classId).map(classData => (
                              <button
                                key={classData.id}
                                onClick={() => {
                                  if (gold >= recruitCost) {
                                    if (dungeon) {
                                      queueClassChange(hero.id, index, classData.id, recruitCost);
                                    } else {
                                      spendGold(recruitCost);
                                      retireHero(hero.id);
                                      addHero(classData.id, null, index);
                                    }
                                    setExpandedSlot(null);
                                  }
                                }}
                                disabled={gold < recruitCost}
                                className="p-1.5 bg-gray-900 rounded hover:bg-gray-700 disabled:opacity-50"
                                title={`${classData.name}: ${classData.description}`}
                              >
                                <ClassIcon classId={classData.id} size={20} />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // Empty slot - unlocked
                  <div className="text-center py-3">
                    <button
                      onClick={() => setExpandedSlot(isExpanded ? null : index)}
                      className="w-full py-4 border border-dashed border-gray-600 rounded text-gray-500 hover:border-blue-500 hover:text-blue-400 transition-all"
                    >
                      <div className="text-2xl mb-1">+</div>
                      <div className="text-sm">
                        Recruit {roleInfo.name}
                        {firstRecruitAvailable && <span className="text-green-400 ml-1">(FREE)</span>}
                        {dungeon && <span className="text-yellow-400 block text-xs mt-1">Joins after dungeon</span>}
                      </div>
                    </button>

                    {/* Recruitment options */}
                    {isExpanded && (
                      <div className="mt-3 text-left">
                        <div className="text-sm text-gray-400 mb-2">
                          {firstRecruitAvailable ? 'Choose a class (FREE):' : `Choose a class (${recruitCost}g):`}
                          {dungeon && <span className="text-yellow-400 ml-1">(after dungeon)</span>}
                        </div>
                        <div className={`grid gap-2 ${availableClasses.length > 3 ? 'grid-cols-4' : 'grid-cols-3'}`}>
                          {availableClasses.map(classData => (
                            <button
                              key={classData.id}
                              onClick={() => handleDirectRecruit(classData.id, index)}
                              disabled={!firstRecruitAvailable && gold < recruitCost}
                              className={`flex flex-col items-center gap-1 p-2 rounded ${
                                firstRecruitAvailable
                                  ? 'bg-green-900/50 hover:bg-green-800 border border-green-600'
                                  : 'bg-gray-900 hover:bg-gray-700 disabled:opacity-50'
                              }`}
                              title={classData.description}
                            >
                              <ClassIcon classId={classData.id} size={28} />
                              <div className="text-white text-xs text-center">{classData.name}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Retire Confirmation Modal */}
      {confirmRetire && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="pixel-panel-gold p-4 max-w-xs mx-4">
            {(() => {
              const hero = heroes.find(h => h?.id === confirmRetire);
              if (!hero) return null;
              const goldValue = getRetireValue(hero);
              return (
                <>
                  <h3 className="pixel-title text-lg mb-2">Retire {hero.name}?</h3>
                  <p className="text-[var(--color-text-dim)] text-sm mb-3">
                    This hero will be permanently dismissed. You'll receive{' '}
                    <span className="text-[var(--color-gold)]">{goldValue} gold</span>.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirmRetire(null)}
                      className="flex-1 pixel-btn"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleRetire(confirmRetire)}
                      className="flex-1 pixel-btn pixel-btn-danger"
                    >
                      Retire
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroManagement;
