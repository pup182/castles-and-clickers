import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { PARTY_SLOTS, getClassesByRole, ROLE_INFO } from '../data/classes';
import ClassIcon from './icons/ClassIcon';
import { SwordIcon, GoldIcon, LockIcon, ShieldIcon, HeartIcon, StarIcon } from './icons/ui';

// Role icon mapping
const ROLE_ICONS = {
  tank: ShieldIcon,
  healer: HeartIcon,
  dps: SwordIcon,
};

// Base recruitment costs (used when slot discount is already used)
const BASE_RECRUIT_COSTS = {
  tank: 100,
  healer: 150,
  dps: 200,
};

const HeroRecruitment = ({ targetSlotIndex = null, compact = false }) => {
  const gold = useGameStore(state => state.gold);
  const heroes = useGameStore(state => state.heroes);
  const maxPartySize = useGameStore(state => state.maxPartySize);
  const addHero = useGameStore(state => state.addHero);
  const spendGold = useGameStore(state => state.spendGold);
  const highestDungeonCleared = useGameStore(state => state.highestDungeonCleared);
  const usedSlotDiscounts = useGameStore(state => state.usedSlotDiscounts);

  const [selectedClass, setSelectedClass] = useState(null);
  const [heroName, setHeroName] = useState('');

  // Find the first empty slot if no target specified
  const findFirstEmptySlot = () => {
    for (let i = 0; i < PARTY_SLOTS.length; i++) {
      if (!heroes[i]) return i;
    }
    return -1;
  };

  const slotIndex = targetSlotIndex ?? findFirstEmptySlot();

  // No empty slots available
  if (slotIndex === -1 || slotIndex >= maxPartySize) {
    if (compact) return null;
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-white font-bold mb-2 flex items-center gap-2">
          <SwordIcon size={20} />
          Recruit Hero
        </h3>
        <div className="text-gray-400 text-center py-4">
          Party is full ({maxPartySize}/{maxPartySize})
          <div className="text-gray-500 text-xs mt-1">
            Bench or retire a hero to recruit new ones
          </div>
        </div>
      </div>
    );
  }

  const currentSlot = PARTY_SLOTS[slotIndex];
  const dungeonRequired = currentSlot?.dungeonRequired || 0;
  const requiredRole = currentSlot?.role || null;
  const slotUnlocked = highestDungeonCleared >= dungeonRequired;

  // Check if this slot's first-recruit discount has been used
  const discountUsed = usedSlotDiscounts.includes(slotIndex);
  // If discount used, charge base cost for role; otherwise use slot's discounted cost
  const recruitCost = discountUsed
    ? BASE_RECRUIT_COSTS[requiredRole] || 150
    : (currentSlot?.cost || 0);

  // Get available classes for the current role
  const availableClasses = requiredRole ? getClassesByRole(requiredRole) : [];
  const roleInfo = requiredRole ? ROLE_INFO[requiredRole] : null;

  const canAfford = gold >= recruitCost;
  const canRecruit = slotUnlocked && canAfford;

  const handleRecruit = () => {
    if (!selectedClass || !canRecruit) return;

    if (recruitCost === 0 || spendGold(recruitCost)) {
      addHero(selectedClass.id, heroName || selectedClass.name, slotIndex);
      setSelectedClass(null);
      setHeroName('');
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
        <SwordIcon size={20} />
        Recruit Hero
        <span className="text-gray-500 text-sm font-normal">Slot {slotIndex + 1}</span>
        {slotUnlocked && (
          <span className="text-yellow-400 text-sm font-normal ml-auto flex items-center gap-1">
            {recruitCost === 0 ? (
              <><StarIcon size={14} /> Free!</>
            ) : (
              <><GoldIcon size={14} /> {recruitCost.toLocaleString()} gold</>
            )}
          </span>
        )}
      </h3>

      {!slotUnlocked ? (
        <div className="text-center py-4">
          <div className="text-gray-400 mb-2 flex items-center justify-center gap-2"><LockIcon size={20} /> Slot Locked</div>
          <div className="text-yellow-400 text-sm">
            Clear Dungeon {dungeonRequired} to unlock
          </div>
          <div className="text-gray-500 text-xs mt-1">
            (Highest cleared: {highestDungeonCleared})
          </div>
          {roleInfo && (() => {
            const RoleIcon = ROLE_ICONS[requiredRole];
            return (
              <div className="mt-3 text-gray-500 text-sm flex items-center justify-center gap-2">
                This slot requires: {RoleIcon && <RoleIcon size={16} />} {roleInfo.name}
              </div>
            );
          })()}
        </div>
      ) : (
        <>
          {/* Role indicator */}
          {roleInfo && (() => {
            const RoleIcon = ROLE_ICONS[requiredRole];
            return (
              <div className="mb-4 p-3 bg-gray-900 rounded-lg border border-gray-700">
                <div className="flex items-center gap-2 mb-1">
                  {RoleIcon && <RoleIcon size={28} />}
                  <span className="text-white font-medium">Recruiting: {roleInfo.name}</span>
                </div>
                <p className="text-gray-400 text-sm">{roleInfo.description}</p>
              </div>
            );
          })()}

          {/* Class selection - filtered by role */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {availableClasses.map(cls => (
              <button
                key={cls.id}
                onClick={() => setSelectedClass(cls)}
                className={`
                  p-3 rounded-lg transition-all text-left
                  ${selectedClass?.id === cls.id
                    ? 'bg-blue-900 border-blue-500'
                    : 'bg-gray-900 border-gray-700 hover:border-gray-500'}
                  border-2
                `}
              >
                <div className="flex items-center gap-2 mb-1">
                  <ClassIcon classId={cls.id} size={28} />
                  <span className="text-white font-medium">{cls.name}</span>
                </div>
                <p className="text-gray-400 text-xs">{cls.description}</p>
              </button>
            ))}
          </div>

          {/* Name input */}
          {selectedClass && (
            <div className="mb-4">
              <input
                type="text"
                placeholder={`Name your ${selectedClass.name}...`}
                value={heroName}
                onChange={(e) => setHeroName(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          {/* Recruit button */}
          <button
            onClick={handleRecruit}
            disabled={!selectedClass || !canRecruit}
            className={`
              w-full py-2 rounded-lg font-medium transition-all
              ${selectedClass && canRecruit
                ? 'bg-green-600 hover:bg-green-500 text-white'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'}
            `}
          >
            {!selectedClass
              ? 'Select a Class'
              : !canAfford
              ? `Need ${recruitCost.toLocaleString()} gold`
              : recruitCost === 0
              ? `Recruit ${heroName || selectedClass.name} (Free!)`
              : `Recruit ${heroName || selectedClass.name}`}
          </button>
        </>
      )}
    </div>
  );
};

export default HeroRecruitment;
