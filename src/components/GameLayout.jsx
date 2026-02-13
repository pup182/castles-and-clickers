import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { PHASES } from '../game/constants';
import { PARTY_SLOTS } from '../data/classes';

// Hooks
import { useCombatEffects } from '../hooks/useCombatEffects';
import { useDungeon } from '../hooks/useDungeon';
import { useCombat } from '../hooks/useCombat';
import { useGameLoop } from '../hooks/useGameLoop';
import { useThrottledDisplay } from '../hooks/useThrottledDisplay';

// Components
import CanvasDungeonView from '../canvas/CanvasDungeonView';
import CombatLog from './CombatLog';
import Sidebar from './Sidebar';
import ModalOverlay from './ModalOverlay';
import HeroManagement from './HeroManagement';
import EquipmentScreen from './EquipmentScreen';
import SkillTreeScreen from './SkillTreeScreen';
import HomesteadScreen from './HomesteadScreen';
import ShopScreen from './ShopScreen';
import DungeonMap from './DungeonMap';
import CurrentZoneIndicator from './CurrentZoneIndicator';
import WelcomeBackModal from './WelcomeBackModal';
import GameHUD from './GameHUD';
import { DUNGEON_TIERS } from '../data/milestones';
import { getWorldBossForLevel, getZoneWorldBoss } from '../data/worldBosses';
import { RAIDS } from '../data/raids';
import LootNotifications from './LootNotifications';
import { CheckIcon } from './icons/ui';
import UniqueDropCelebration from './UniqueDropCelebration';
import RaidRecapScreen from './RaidRecapScreen';
import { PartyIcon, TreeIcon, BagIcon, HomeIcon, CastleIcon, GoldIcon, TrophyIcon, SkullIcon, ChestIcon, ChartIcon, GemIcon, FireIcon, GhostIcon, CrownIcon, HeartIcon, SwordIcon, ShieldIcon, LockIcon, MenuIcon } from './icons/ui';
import { WorldBossIcon } from './icons/worldBosses';

// Theme visuals for zone header - pixel art icons
const TIER_THEME_ICONS = {
  cave: GemIcon,
  crypt: SkullIcon,
  forest: TreeIcon,
  castle: CastleIcon,
  volcano: FireIcon,
  void: GhostIcon,
};

const TIER_THEME_COLORS = {
  cave: '#06b6d4',
  crypt: '#84cc16',
  forest: '#22c55e',
  castle: '#f59e0b',
  volcano: '#ef4444',
  void: '#a855f7',
};
import StatsScreen from './StatsScreen';
import BestiaryScreen from './BestiaryScreen';
import RaidSelectorModal from './RaidSelectorModal';
import UniqueCollectionScreen from './UniqueCollectionScreen';

// OPTIMIZATION: Stable default values to prevent re-renders
const EMPTY_OBJECT = {};

// Throttled enemy count hook - polls for monster counts to update enemy progress bar
function useEnemyCount() {
  const [counts, setCounts] = useState({ alive: 0, total: 0 });
  const lastRef = useRef({ alive: 0, total: 0 });

  useEffect(() => {
    const update = () => {
      const roomCombat = useGameStore.getState().roomCombat;
      const monsters = roomCombat?.monsters || [];
      const alive = monsters.filter(m => m?.stats?.hp > 0 && !m.isBoss).length;
      const total = monsters.filter(m => !m.isBoss).length;

      if (alive !== lastRef.current.alive || total !== lastRef.current.total) {
        lastRef.current = { alive, total };
        setCounts({ alive, total });
      }
    };
    // Poll at ~500ms, offset from other intervals
    const id = setInterval(update, 487);
    update(); // Initial update
    return () => clearInterval(id);
  }, []);

  return counts;
}

const GameLayout = () => {
  // OPTIMIZATION: Use individual selectors to avoid re-renders on unrelated state changes
  const heroes = useGameStore(state => state.heroes);
  const dungeon = useGameStore(state => state.dungeon);
  const startDungeon = useGameStore(state => state.startDungeon);
  const abandonDungeon = useGameStore(state => state.abandonDungeon);
  const calculateOfflineProgress = useGameStore(state => state.calculateOfflineProgress);
  const gameSpeed = useGameStore(state => state.gameSpeed);
  const setGameSpeed = useGameStore(state => state.setGameSpeed);
  const isRunning = useGameStore(state => state.isRunning);
  const toggleRunning = useGameStore(state => state.toggleRunning);
  const resetGame = useGameStore(state => state.resetGame);
  const featureUnlocks = useGameStore(state => state.featureUnlocks);
  const markFeatureSeen = useGameStore(state => state.markFeatureSeen);
  const markAllUniquesRead = useGameStore(state => state.markAllUniquesRead);
  const dungeonSettings = useGameStore(state => state.dungeonSettings);
  const setDungeonSettings = useGameStore(state => state.setDungeonSettings);
  const highestDungeonCleared = useGameStore(state => state.highestDungeonCleared);
  const maxDungeonLevel = useGameStore(state => state.maxDungeonLevel);
  const lastDungeonSuccess = useGameStore(state => state.lastDungeonSuccess);
  const unreadUniques = useGameStore(state => state.unreadUniques || []);
  const raidState = useGameStore(state => state.raidState);

  // OPTIMIZATION: Throttled display state - renders at ~15 FPS instead of every tick
  const displayRoomCombat = useThrottledDisplay();

  // OPTIMIZATION: Separate polling for enemy counts (updates more frequently for progress bar)
  const enemyCount = useEnemyCount();

  const [activeModal, setActiveModal] = useState(null); // 'heroes' | 'skills' | 'equipment' | 'homestead' | 'dungeonSelect'
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [offlineProgress, setOfflineProgress] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [dungeonTransition, setDungeonTransition] = useState(null); // { level, type, isRetry }
  const prevDungeonRef = useRef(dungeon); // Initialize with current dungeon to avoid transition on mount
  const lastDungeonLevelRef = useRef(dungeon?.level); // Track last level for retry detection
  const isInitialMountRef = useRef(true);

  // Combat visual effects
  const { combatEffects, addEffect, removeEffect, clearEffects } = useCombatEffects();

  // Dungeon setup and exploration
  const { setupDungeon, handleExplorationTick } = useDungeon({ addEffect });

  // Combat logic
  const { handleCombatTick, resetLastProcessedTurn } = useCombat({ addEffect });

  // Game loop orchestration
  useGameLoop({
    setupDungeon,
    handleExplorationTick,
    handleCombatTick,
    clearEffects,
    resetLastProcessedTurn,
  });

  // Offline progress check
  useEffect(() => {
    const progress = calculateOfflineProgress();
    if (progress) setOfflineProgress(progress);
  }, []);

  // Show transition screen when dungeon changes (but not on initial mount)
  useEffect(() => {
    // Skip transition on initial mount
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      prevDungeonRef.current = dungeon;
      if (dungeon) lastDungeonLevelRef.current = dungeon.level;
      return;
    }

    const prevDungeon = prevDungeonRef.current;

    // Dungeon just ended (had value, now null) - show "continuing" transition
    if (prevDungeon && !dungeon) {
      setDungeonTransition({
        level: prevDungeon.level,
        type: prevDungeon.type || 'normal',
        isComplete: true,
      });
      // This will be replaced by the next dungeon's transition, or cleared after timeout
      const timer = setTimeout(() => setDungeonTransition(null), 2000);
      prevDungeonRef.current = dungeon;
      return () => clearTimeout(timer);
    }

    // Dungeon just started (was null, now has value)
    if (!prevDungeon && dungeon) {
      const isRetry = lastDungeonLevelRef.current === dungeon.level;
      setDungeonTransition({
        level: dungeon.level,
        type: dungeon.type || 'normal',
        isRetry,
      });
      // Clear transition after brief display
      const timer = setTimeout(() => setDungeonTransition(null), 1200);
      prevDungeonRef.current = dungeon;
      lastDungeonLevelRef.current = dungeon.level;
      return () => clearTimeout(timer);
    }

    // Dungeon changed (different level or new run)
    if (prevDungeon && dungeon && prevDungeon.level !== dungeon.level) {
      setDungeonTransition({
        level: dungeon.level,
        type: dungeon.type || 'normal',
        isRetry: false,
      });
      const timer = setTimeout(() => setDungeonTransition(null), 1200);
      prevDungeonRef.current = dungeon;
      lastDungeonLevelRef.current = dungeon.level;
      return () => clearTimeout(timer);
    }

    prevDungeonRef.current = dungeon;
  }, [dungeon]);

  // OPTIMIZATION: Only extract what's needed for conditionals
  // Canvas renderer reads detailed state imperatively, so we only need phase/dungeon existence
  const phase = displayRoomCombat?.phase || PHASES.IDLE;
  const mazeDungeonState = displayRoomCombat?.dungeon || null;


  const handleStartDungeon = useCallback((level, options = {}) => {
    setActiveModal(null);
    startDungeon(level, options);
  }, [startDungeon]);

  // Check if there's an unlocked but empty hero slot available
  const hasNewHeroSlotAvailable = useMemo(() => {
    for (let i = 0; i < PARTY_SLOTS.length; i++) {
      const slot = PARTY_SLOTS[i];
      const isUnlocked = highestDungeonCleared >= slot.dungeonRequired;
      const isEmpty = !heroes[i];
      if (isUnlocked && isEmpty) {
        return true;
      }
    }
    return false;
  }, [heroes, highestDungeonCleared]);

  // Find all upcoming unlocks at the next milestone dungeon level
  const upcomingUnlocks = useMemo(() => {
    // Define all unlockable features
    const allUnlocks = [
      // Hero slots
      ...(() => {
        const dpsCount = { current: 0 };
        return PARTY_SLOTS.slice(1).map((slot) => {
          let name;
          if (slot.role === 'dps') {
            dpsCount.current++;
            name = `DPS Slot ${dpsCount.current}`;
          } else {
            name = `${slot.role.charAt(0).toUpperCase() + slot.role.slice(1)} Slot`;
          }
          return { type: 'hero', name, dungeonRequired: slot.dungeonRequired };
        });
      })(),
      // Features (Homestead hidden for now)
      { type: 'feature', name: 'Shop', dungeonRequired: 5 },
      { type: 'feature', name: 'Auto-Run', dungeonRequired: 5 },
      // Raids
      { type: 'raid', name: 'Sunken Temple', dungeonRequired: 12 },
      { type: 'raid', name: 'Cursed Manor', dungeonRequired: 18 },
      { type: 'raid', name: 'Sky Fortress', dungeonRequired: 24 },
      { type: 'raid', name: 'The Abyss', dungeonRequired: 30 },
      { type: 'raid', name: 'Void Throne', dungeonRequired: 35 },
    ];

    // Filter to only unlocks the player hasn't reached yet
    const lockedUnlocks = allUnlocks.filter(u => highestDungeonCleared < u.dungeonRequired);

    if (lockedUnlocks.length === 0) return null;

    // Find the lowest dungeon requirement among locked unlocks
    const nextMilestone = Math.min(...lockedUnlocks.map(u => u.dungeonRequired));

    // Return all unlocks at that milestone level
    const unlocksAtMilestone = lockedUnlocks.filter(u => u.dungeonRequired === nextMilestone);

    return {
      dungeonRequired: nextMilestone,
      unlocks: unlocksAtMilestone,
    };
  }, [highestDungeonCleared]);

  const closeModal = () => setActiveModal(null);

  // Handle opening modals with side effects
  const openModal = (modalId) => {
    setActiveModal(modalId);
    // Mark homestead as seen when first opened
    if (modalId === 'homestead' && !featureUnlocks?.homesteadSeen) {
      markFeatureSeen('homesteadSeen');
    }
    // Update raids seen level when opening raids (tracks for new raid unlock notifications)
    if (modalId === 'raids') {
      markFeatureSeen('lastSeenRaidsAt');
    }
    // Clear unread uniques when opening equipment
    if (modalId === 'equipment' && unreadUniques.length > 0) {
      markAllUniquesRead();
    }
  };

  // OPTIMIZATION: Memoize callback to prevent re-renders
  const memoizedRemoveEffect = useCallback((id) => removeEffect(id), [removeEffect]);

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <GameHUD
        activeModal={activeModal}
        onOpenModal={openModal}
        gameSpeed={gameSpeed}
        setGameSpeed={setGameSpeed}
        isRunning={isRunning}
        toggleRunning={toggleRunning}
        hasDungeon={!!dungeon}
        dungeonSettings={dungeonSettings}
        setDungeonSettings={setDungeonSettings}
        featureUnlocks={featureUnlocks}
        markFeatureSeen={markFeatureSeen}
        onReset={() => setShowResetConfirm(true)}
        onToggleSidebar={() => setSidebarOpen(prev => !prev)}
      />

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - hidden on mobile, shown as drawer */}
        <div className="hidden md:block">
          <Sidebar
            heroes={heroes}
            dungeon={dungeon}
            onOpenSelector={() => setActiveModal('dungeonSelect')}
            onAbandon={abandonDungeon}
          />
        </div>

        {/* Mobile sidebar drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-72 animate-slide-in">
              <Sidebar
                heroes={heroes}
                dungeon={dungeon}
                onOpenSelector={() => { setActiveModal('dungeonSelect'); setSidebarOpen(false); }}
                onAbandon={() => { abandonDungeon(); setSidebarOpen(false); }}
              />
            </div>
          </div>
        )}

        {/* Dungeon View - Always visible */}
        <main className="flex-1 p-4 overflow-hidden flex flex-col">
          {dungeon && mazeDungeonState ? (
            (() => {
              // Find current tier for zone header
              const currentTier = DUNGEON_TIERS.find(
                t => dungeon.level >= t.minLevel && dungeon.level <= t.maxLevel
              ) || DUNGEON_TIERS[0];
              const TierIcon = TIER_THEME_ICONS[currentTier.theme];
              const tierColor = TIER_THEME_COLORS[currentTier.theme];
              const tierSize = currentTier.maxLevel - currentTier.minLevel + 1;

              // Get monster counts from dedicated polling hook (updates in real-time)
              const totalMonsters = enemyCount.total;
              const killedMonsters = totalMonsters - enemyCount.alive;

              // Boss info - calculate bossUnlocked from live counts (all non-boss monsters dead)
              const monsters = displayRoomCombat?.monsters || [];
              const boss = monsters.find(m => m.isBoss);
              const bossAlive = boss && boss.stats.hp > 0;
              // Boss is ready when all non-boss monsters are killed
              const bossUnlocked = enemyCount.alive === 0 && totalMonsters > 0;

              // Phase display
              const getPhaseDisplay = () => {
                switch (phase) {
                  case PHASES.EXPLORING: return { text: 'Exploring', color: 'text-blue-400' };
                  case PHASES.COMBAT: return { text: 'In Combat', color: 'text-red-400' };
                  case PHASES.COMPLETE: return { text: 'Complete!', color: 'text-green-400' };
                  case PHASES.DEFEAT: return { text: 'Defeated', color: 'text-red-500' };
                  default: return { text: 'Idle', color: 'text-gray-400' };
                }
              };
              const phaseInfo = getPhaseDisplay();

              // Check if this is a raid dungeon
              const isRaidDungeon = dungeon.isRaid && dungeon.raidId;
              const raidData = isRaidDungeon ? RAIDS[dungeon.raidId] : null;

              // Get zone's world boss for mascot display (only for non-raids)
              const zoneBoss = !isRaidDungeon ? getZoneWorldBoss(dungeon.level) : null;
              const zoneBossDefeated = zoneBoss && highestDungeonCleared >= zoneBoss.level;

              // Get raid wing boss status
              const defeatedWingBosses = raidState?.defeatedWingBosses || [];

              return (
                <>
                  {/* Zone/Raid Header - Pixel Art Style */}
                  <div className="pixel-panel mb-3" style={isRaidDungeon ? { borderColor: '#f59e0b' } : {}}>
                    <div className="flex items-center gap-4 px-3 py-2">
                      {/* Zone World Boss Mascot (not shown for raids - sidebar handles it) */}
                      {!isRaidDungeon && zoneBoss && (
                        <div className={`flex items-center gap-2 px-2 py-1 rounded border ${
                          zoneBossDefeated
                            ? 'border-green-500/40 bg-green-900/20'
                            : 'border-amber-500/40 bg-amber-900/20'
                        }`}>
                          <WorldBossIcon bossId={zoneBoss.id} size={28} />
                          <div className="text-[10px] leading-tight">
                            <div className="text-gray-500">World Boss:</div>
                            <div className={zoneBossDefeated ? 'text-green-400' : 'text-amber-400'}>
                              {zoneBoss.name}
                            </div>
                            <div className="text-gray-500">
                              {zoneBossDefeated ? 'Defeated' : `Lv ${zoneBoss.level}`}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Raid name OR Zone icon and name */}
                      {isRaidDungeon && raidData ? (
                        <div className="flex items-center gap-2">
                          <CrownIcon size={24} className="text-amber-400" />
                          <div>
                            <div className="pixel-text font-bold text-amber-400">
                              {raidData.name}
                            </div>
                            <div className="pixel-label">
                              Raid
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div style={{ color: tierColor }}>
                            <TierIcon size={24} />
                          </div>
                          <div>
                            <div className="pixel-text font-bold" style={{ color: tierColor }}>
                              {currentTier.name}
                            </div>
                            <div className="pixel-label">
                              Level {dungeon.level}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Tier progress mini-bar (only for non-raids) */}
                      {!isRaidDungeon && (
                        <div className="flex gap-1">
                          {Array.from({ length: tierSize }, (_, i) => {
                            const level = currentTier.minLevel + i;
                            const isCurrent = level === dungeon.level;
                            const isCleared = level < dungeon.level || (level === dungeon.level && phase === PHASES.COMPLETE);
                            return (
                              <div
                                key={level}
                                className="w-4 h-2 border border-[var(--color-border)]"
                                style={{
                                  background: isCleared ? tierColor : isCurrent ? `${tierColor}60` : 'var(--color-panel-dark)',
                                }}
                                title={`Level ${level}${isCleared ? ' (Cleared)' : isCurrent ? ' (Current)' : ''}`}
                              />
                            );
                          })}
                        </div>
                      )}

                      {/* Next unlock indicator (hidden in raids) */}
                      {!isRaidDungeon && upcomingUnlocks && (() => {
                        const isCurrentLevel = dungeon.level === upcomingUnlocks.dungeonRequired;
                        return (
                          <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs ${
                            isCurrentLevel
                              ? 'bg-green-900/30 border border-green-500/50 animate-pulse'
                              : 'bg-blue-900/30 border border-blue-500/30'
                          }`}>
                            <LockIcon size={12} className={isCurrentLevel ? 'text-green-400' : 'text-blue-400'} />
                            <span className={isCurrentLevel ? 'text-green-300' : 'text-blue-300'}>
                              {isCurrentLevel ? 'Unlocking Now!' : `Next Unlock at Lv ${upcomingUnlocks.dungeonRequired}`}:{' '}
                              {upcomingUnlocks.unlocks.map((u, i) => (
                                <span key={i}>
                                  {i > 0 && ', '}
                                  {u.type === 'raid' ? (
                                    <><span className="text-amber-400">(Raid)</span> {u.name}</>
                                  ) : u.name}
                                </span>
                              ))}
                            </span>
                          </div>
                        );
                      })()}

                      {/* Phase indicator */}
                      <div className={`pixel-label ${phaseInfo.color}`}>
                        {phaseInfo.text}
                      </div>

                      {/* Enemy progress - fills up as you kill enemies */}
                      <div className="flex items-center gap-2 ml-auto">
                        <span className="pixel-label">
                          Enemies: {killedMonsters}/{totalMonsters}
                        </span>
                        <div className="pixel-bar w-20 h-2">
                          <div
                            className="pixel-bar-fill pixel-bar-red"
                            style={{ width: `${totalMonsters > 0 ? (killedMonsters / totalMonsters) * 100 : 0}%` }}
                          />
                        </div>
                      </div>

                      {/* Boss indicator - show world boss info if applicable (non-raid) */}
                      {!isRaidDungeon && boss && (() => {
                        const worldBoss = getWorldBossForLevel(dungeon.level);
                        const isWorldBoss = boss.isWorldBoss || worldBoss;

                        return (
                          <div className={`flex items-center gap-1.5 ${
                            bossUnlocked
                              ? isWorldBoss ? 'text-amber-400' : 'text-red-400'
                              : 'text-gray-500'
                          }`}>
                            {isWorldBoss ? (
                              <CrownIcon size={16} />
                            ) : (
                              <SkullIcon size={16} />
                            )}
                            <span className="pixel-label">
                              {bossAlive
                                ? (bossUnlocked
                                    ? (isWorldBoss ? worldBoss?.name || 'World Boss' : 'Boss Ready')
                                    : 'Locked')
                                : (isWorldBoss ? `${worldBoss?.name || 'World Boss'} Slain!` : 'Slain!')
                              }
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="flex-1 min-h-0">
                    <CanvasDungeonView
                      effects={combatEffects}
                      onEffectComplete={memoizedRemoveEffect}
                    />
                  </div>
                  <div className="mt-4 max-h-32">
                    <CombatLog />
                  </div>
                </>
              );
            })()
          ) : dungeonTransition ? (
            // Show empty space during transition (transition overlay handles the display)
            <div className="flex-1" />
          ) : raidState?.active && !displayRoomCombat ? (
            // Raid dungeon is loading/setting up
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center pixel-panel p-8">
                <h2 className="pixel-title text-2xl mb-2">Entering Raid...</h2>
                <p className="text-[var(--color-text-dim)]">Preparing the dungeon...</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center pixel-panel p-8">
                <div className="text-6xl mb-4" style={{ imageRendering: 'pixelated' }}>
                  <svg width="96" height="96" viewBox="0 0 16 16" style={{ imageRendering: 'pixelated' }}>
                    <rect x="3" y="8" width="10" height="8" fill="#4a4a6a"/>
                    <rect x="4" y="6" width="8" height="2" fill="#5a5a7a"/>
                    <rect x="5" y="4" width="6" height="2" fill="#6a6a8a"/>
                    <rect x="7" y="2" width="2" height="2" fill="#ffd700"/>
                    <rect x="6" y="10" width="4" height="6" fill="#2a2a4a"/>
                    <rect x="7" y="11" width="2" height="3" fill="#8b4513"/>
                  </svg>
                </div>
                <h2 className="pixel-title text-2xl mb-2">No Active Dungeon</h2>
                <p className="text-[var(--color-text-dim)] mb-4">
                  {heroes.length === 0
                    ? 'Recruit some heroes to begin your adventure!'
                    : lastDungeonSuccess == null
                    ? 'Your heroes are ready for their first adventure!'
                    : lastDungeonSuccess === false
                    ? 'Your heroes need to regroup and try again!'
                    : 'Victory! Ready for the next challenge?'}
                </p>
                {hasNewHeroSlotAvailable && heroes.length > 0 && (
                  <button
                    onClick={() => setActiveModal('heroes')}
                    className="mb-4 px-4 py-2 bg-green-600/20 border border-green-500/50 rounded text-green-400 text-sm animate-pulse hover:bg-green-600/30 transition-colors"
                  >
                    New Hero Slot Available!
                  </button>
                )}
                {!hasNewHeroSlotAvailable && upcomingUnlocks && heroes.length > 0 && (
                  <div className="mb-4 px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded text-blue-300 text-sm">
                    <div className="font-bold mb-1">Clear Dungeon {upcomingUnlocks.dungeonRequired} to unlock:</div>
                    <ul className="list-disc list-inside">
                      {upcomingUnlocks.unlocks.map((unlock, idx) => (
                        <li key={idx}>{unlock.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {/* World Boss Preview */}
                {heroes.length > 0 && (() => {
                  const nextLevel = lastDungeonSuccess == null ? 1 : highestDungeonCleared + 1;
                  const worldBoss = getWorldBossForLevel(nextLevel);
                  if (!worldBoss) return null;

                  return (
                    <div className="mb-4 pixel-panel p-4 border-amber-500/50 bg-amber-900/20 max-w-md mx-auto">
                      <div className="flex items-center gap-2 mb-2 justify-center">
                        <CrownIcon size={18} className="text-amber-400" />
                        <span className="text-amber-400 font-bold text-sm">WORLD BOSS AWAITS</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <WorldBossIcon bossId={worldBoss.id} size={64} />
                        <div className="flex-1 text-left">
                          <div className="text-[10px] text-gray-500 uppercase">World Boss:</div>
                          <div className="text-amber-300 font-bold">{worldBoss.name}</div>
                          <div className="text-xs text-amber-400/70 italic mb-2">"{worldBoss.title}"</div>
                          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                            <div className="flex items-center gap-1 text-red-400">
                              <SwordIcon size={12} /> {worldBoss.baseStats.attack}
                            </div>
                            <div className="flex items-center gap-1 text-blue-400">
                              <ShieldIcon size={12} /> {worldBoss.baseStats.defense}
                            </div>
                            <div className="flex items-center gap-1 text-green-400">
                              <HeartIcon size={12} /> {worldBoss.baseStats.maxHp}
                            </div>
                            <div className="flex items-center gap-1 text-amber-400">
                              <GoldIcon size={12} /> {worldBoss.goldReward.min}-{worldBoss.goldReward.max}
                            </div>
                          </div>
                        </div>
                      </div>
                      {worldBoss.guaranteedRarity && (
                        <div className="mt-2 text-xs text-center text-purple-400">
                          Guaranteed {worldBoss.guaranteedRarity}+ gear drop
                        </div>
                      )}
                    </div>
                  );
                })()}
                {heroes.length === 0 ? (
                  <button
                    onClick={() => setActiveModal('heroes')}
                    className="pixel-btn pixel-btn-primary"
                  >
                    Recruit Heroes
                  </button>
                ) : lastDungeonSuccess == null ? (
                  <button
                    onClick={() => handleStartDungeon(1)}
                    className="pixel-btn pixel-btn-primary animate-pulse"
                  >
                    Start Your First Adventure!
                  </button>
                ) : (
                  <div className="flex flex-col gap-3">
                    {highestDungeonCleared < maxDungeonLevel && (
                      <button
                        onClick={() => handleStartDungeon(highestDungeonCleared + 1)}
                        className="pixel-btn pixel-btn-primary"
                      >
                        {lastDungeonSuccess === false ? 'Retry' : 'Continue to'} Level {highestDungeonCleared + 1}
                      </button>
                    )}
                    <button
                      onClick={() => setActiveModal('dungeonSelect')}
                      className="pixel-btn pixel-btn-secondary"
                    >
                      Select Dungeon
                    </button>
                    {highestDungeonCleared >= 12 && (
                      <button
                        onClick={() => openModal('raids')}
                        className="pixel-btn pixel-btn-secondary flex items-center justify-center gap-2"
                      >
                        <CrownIcon size={16} className="text-amber-400" />
                        <span>Raids</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal Overlays */}
      <ModalOverlay isOpen={activeModal === 'heroes'} onClose={closeModal} title="Heroes">
        <HeroManagement />
      </ModalOverlay>

      <ModalOverlay isOpen={activeModal === 'skills'} onClose={closeModal} title="Skill Trees" size="xl">
        <SkillTreeScreen />
      </ModalOverlay>

      <ModalOverlay isOpen={activeModal === 'equipment'} onClose={closeModal} title="Equipment" size="xl">
        <EquipmentScreen />
      </ModalOverlay>

      <ModalOverlay isOpen={activeModal === 'homestead'} onClose={closeModal} title="Homestead">
        <HomesteadScreen />
      </ModalOverlay>

      <ModalOverlay isOpen={activeModal === 'shop'} onClose={closeModal} title="Shop">
        <ShopScreen />
      </ModalOverlay>

      <ModalOverlay isOpen={activeModal === 'bestiary'} onClose={closeModal} title="Bestiary" size="lg">
        <BestiaryScreen />
      </ModalOverlay>

      <ModalOverlay isOpen={activeModal === 'stats'} onClose={closeModal} title="Statistics" size="lg">
        <StatsScreen />
      </ModalOverlay>

      <ModalOverlay isOpen={activeModal === 'dungeonSelect'} onClose={closeModal} title="Dungeon Map" size="lg">
        <DungeonMap onStart={handleStartDungeon} onClose={closeModal} />
      </ModalOverlay>

      <ModalOverlay isOpen={activeModal === 'raids'} onClose={closeModal} title="Raids" size="lg">
        <RaidSelectorModal onClose={closeModal} />
      </ModalOverlay>

      <ModalOverlay isOpen={activeModal === 'collection'} onClose={closeModal} title="Unique Collection" size="xl">
        <UniqueCollectionScreen />
      </ModalOverlay>

      {/* Dungeon Transition Screen */}
      {dungeonTransition && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60]">
          <div className="text-center">
            <div className="relative mb-6">
              {/* Animated portal/dungeon icon */}
              <div className="w-24 h-24 mx-auto relative">
                <div
                  className="absolute inset-0 rounded-full animate-ping opacity-30"
                  style={{ background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)' }}
                />
                <div
                  className="absolute inset-2 rounded-full animate-pulse"
                  style={{ background: 'radial-gradient(circle, #6b21a8 0%, #1e1b4b 100%)' }}
                />
                <svg
                  className="absolute inset-0 w-full h-full"
                  viewBox="0 0 16 16"
                  style={{ imageRendering: 'pixelated' }}
                >
                  <rect x="3" y="8" width="10" height="8" fill="#4a4a6a" />
                  <rect x="4" y="6" width="8" height="2" fill="#5a5a7a" />
                  <rect x="5" y="4" width="6" height="2" fill="#6a6a8a" />
                  <rect x="7" y="2" width="2" height="2" fill="#ffd700" />
                  <rect x="6" y="10" width="4" height="6" fill="#2a2a4a" />
                  <rect x="7" y="11" width="2" height="3" fill="#1a1a2e" />
                </svg>
              </div>
            </div>
            <h2 className="pixel-title text-2xl mb-2 text-white">
              {dungeonTransition.isComplete
                ? (lastDungeonSuccess ? 'Victory!' : 'Defeat')
                : raidState?.active
                ? 'Entering'
                : dungeonTransition.isRetry
                ? 'Retrying'
                : 'Travelling to'}
            </h2>
            <p className="text-3xl font-bold text-[var(--color-gold)] mb-4">
              {dungeonTransition.isComplete
                ? (lastDungeonSuccess ? 'Preparing next adventure...' : 'The party has fallen...')
                : raidState?.active && RAIDS[raidState.raidId]
                ? RAIDS[raidState.raidId].name
                : `Dungeon Level ${dungeonTransition.level}`}
            </p>
            <div className="flex justify-center gap-1">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full bg-purple-500 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Other modals */}
      <WelcomeBackModal progress={offlineProgress} onClose={() => setOfflineProgress(null)} />
      <LootNotifications />
      <UniqueDropCelebration />
      <RaidRecapScreen />

      {/* Reset Confirmation */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="pixel-panel-gold p-6 max-w-sm mx-4">
            <h3 className="pixel-title text-xl mb-2">Reset Game?</h3>
            <p className="text-[var(--color-text-dim)] mb-4">
              This will delete all progress: heroes, gold, inventory, and stats. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 pixel-btn"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetGame();
                  setShowResetConfirm(false);
                }}
                className="flex-1 pixel-btn pixel-btn-danger"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameLayout;
