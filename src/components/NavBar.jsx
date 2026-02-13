import { useMemo } from 'react';
import { useGameStore, calculateSkillPoints, calculateUsedSkillPoints } from '../store/gameStore';
import { PartyIcon, TreeIcon, BagIcon, HomeIcon, ChestIcon, CrownIcon, SkullIcon, ChartIcon, StarIcon } from './icons/ui';
import { PARTY_SLOTS } from '../data/classes';
import { getAllRaids } from '../data/raids';

const NavButton = ({ id, Icon, label, badge, isActive, isLocked, unlockAt, onClick }) => {
  return (
    <button
      onClick={() => !isLocked && onClick(id)}
      disabled={isLocked}
      className={`pixel-btn relative flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 ${
        isActive ? 'pixel-btn-primary' : ''
      } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={isLocked ? `Unlocks at Dungeon ${unlockAt}` : undefined}
    >
      <Icon size={16} />
      <span className="text-xs sm:text-sm">{label}</span>
      {badge && (
        <span className={`pixel-badge absolute -top-1.5 -right-1.5 text-[10px] ${
          badge === 'NEW' ? 'animate-pixel-blink' : ''
        }`}>
          {badge}
        </span>
      )}
    </button>
  );
};

const NavBar = ({ activeModal, onOpenModal }) => {
  const heroes = useGameStore(state => state.heroes);
  const gold = useGameStore(state => state.gold);
  const highestDungeonCleared = useGameStore(state => state.highestDungeonCleared);
  const featureUnlocks = useGameStore(state => state.featureUnlocks);
  const unreadUniques = useGameStore(state => state.unreadUniques || []);
  const maxPartySize = useGameStore(state => state.maxPartySize);
  const usedSlotDiscounts = useGameStore(state => state.usedSlotDiscounts);
  const raidState = useGameStore(state => state.raidState);

  // Calculate skill points badge
  const totalAvailableSkillPoints = useMemo(() => {
    return heroes.filter(Boolean).reduce((sum, hero) => {
      const total = calculateSkillPoints(hero.level);
      const used = calculateUsedSkillPoints(hero);
      return sum + (total - used);
    }, 0);
  }, [heroes]);

  // Check if a hero slot is available for recruitment
  const canRecruitHero = useMemo(() => {
    const BASE_RECRUIT_COSTS = { tank: 100, healer: 150, dps: 200 };

    let emptySlotIndex = -1;
    for (let i = 0; i < PARTY_SLOTS.length; i++) {
      if (!heroes[i]) {
        emptySlotIndex = i;
        break;
      }
    }
    if (emptySlotIndex === -1 || emptySlotIndex >= maxPartySize) return false;
    const slot = PARTY_SLOTS[emptySlotIndex];
    if (!slot) return false;
    if (highestDungeonCleared < slot.dungeonRequired) return false;

    const discountUsed = usedSlotDiscounts.includes(emptySlotIndex);
    const recruitCost = discountUsed
      ? BASE_RECRUIT_COSTS[slot.role] || 150
      : slot.cost;

    return gold >= recruitCost;
  }, [heroes, maxPartySize, highestDungeonCleared, gold, usedSlotDiscounts]);

  // Check if homestead is newly available
  const homesteadNewlyAvailable = highestDungeonCleared >= 3 && !featureUnlocks?.homesteadSeen;

  // Check if there's a newly unlocked raid the player hasn't seen yet
  const lastSeenRaidsAt = featureUnlocks?.lastSeenRaidsAt || 0;
  const hasNewRaidUnlocked = useMemo(() => {
    const allRaids = getAllRaids();
    // A raid is "new" if its required level is between lastSeenRaidsAt and current highest
    return allRaids.some(raid =>
      raid.requiredLevel > lastSeenRaidsAt && raid.requiredLevel <= highestDungeonCleared
    );
  }, [lastSeenRaidsAt, highestDungeonCleared]);
  const raidInProgress = raidState?.active;

  const navButtons = [
    {
      id: 'heroes',
      Icon: PartyIcon,
      label: 'Heroes',
      badge: canRecruitHero ? '!' : null,
    },
    {
      id: 'skills',
      Icon: TreeIcon,
      label: 'Skills',
      badge: totalAvailableSkillPoints > 0 ? totalAvailableSkillPoints : null,
    },
    {
      id: 'equipment',
      Icon: BagIcon,
      label: 'Gear',
      badge: unreadUniques.length > 0 ? 'NEW' : null,
    },
    {
      id: 'shop',
      Icon: ChestIcon,
      label: 'Shop',
      badge: null,
      unlockAt: 5,
    },
    // Homestead hidden for now
    // {
    //   id: 'homestead',
    //   Icon: HomeIcon,
    //   label: 'Home',
    //   badge: homesteadNewlyAvailable ? 'NEW' : null,
    //   unlockAt: 3,
    // },
    {
      id: 'raids',
      Icon: CrownIcon,
      label: 'Raids',
      badge: hasNewRaidUnlocked ? 'NEW' : null,
      unlockAt: 12,
    },
    {
      id: 'collection',
      Icon: StarIcon,
      label: 'Uniques',
      badge: null,
      unlockAt: 12,
    },
    {
      id: 'bestiary',
      Icon: SkullIcon,
      label: 'Bestiary',
      badge: null,
    },
    {
      id: 'stats',
      Icon: ChartIcon,
      label: 'Stats',
      badge: null,
    },
  ];

  return (
    <nav className="flex items-center gap-1.5 flex-wrap">
      {navButtons.map(btn => {
        const isLocked = btn.unlockAt && highestDungeonCleared < btn.unlockAt;
        return (
          <NavButton
            key={btn.id}
            id={btn.id}
            Icon={btn.Icon}
            label={btn.label}
            badge={btn.badge}
            isActive={activeModal === btn.id}
            isLocked={isLocked}
            unlockAt={btn.unlockAt}
            onClick={onOpenModal}
          />
        );
      })}
    </nav>
  );
};

export default NavBar;
