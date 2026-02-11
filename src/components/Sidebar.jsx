import { memo, useEffect, useRef, useMemo, useState } from 'react';
import { useGameStore, xpForLevel } from '../store/gameStore';
import { PHASES } from '../game/constants';
import { getSkillById, SKILL_TYPE } from '../data/skillTrees';
import { STATUS_EFFECTS, STATUS_TYPE } from '../data/statusEffects';
import { CLASSES, ROLE_INFO } from '../data/classes';
import HeroIcon from './icons/HeroIcon';
import { RoleIcon } from './icons/ClassIcon';
import { GhostIcon, FireIcon, ShieldBuffIcon, TauntIcon, EvasionIcon, HasteIcon, RegenIcon, MightIcon, SpeedIcon } from './icons/ui';
import { SkillIcon } from './icons/skills';
import { StatusEffectIcon } from './icons/statusEffects';

// OPTIMIZATION: Stable defaults to prevent re-renders
const EMPTY_OBJECT = {};
const EMPTY_ARRAY = [];

// Memoized Hero Card - only re-renders when this hero's data changes
const HeroCard = memo(({ hero, combatHero, cooldowns, effects, buffs, usedPhoenix, inDungeon }) => {
  const currentHp = combatHero?.stats?.hp ?? hero.stats?.hp ?? 100;
  const maxHp = combatHero?.stats?.maxHp ?? hero.stats?.maxHp ?? 100;
  const hpPercent = Math.max(0, Math.min(100, (currentHp / maxHp) * 100));
  const isDead = currentHp <= 0 || buffs.ghost;

  const heroClass = CLASSES[hero.classId];
  const heroRole = heroClass?.role;
  const roleInfo = heroRole ? ROLE_INFO[heroRole] : null;

  // Check Phoenix status
  const phoenixStatus = useMemo(() => {
    if (isDead || !hero?.equipment) return null;
    for (const slot of ['weapon', 'armor', 'accessory']) {
      const item = hero.equipment[slot];
      if (item?.affixes?.includes('of_the_phoenix')) {
        return {
          Icon: FireIcon,
          used: !!usedPhoenix,
        };
      }
    }
    return null;
  }, [isDead, hero?.equipment, usedPhoenix]);

  // Process status effects
  const { statusBuffs, debuffs } = useMemo(() => {
    if (isDead || !effects.length) return { statusBuffs: [], debuffs: [] };
    const sb = [];
    const db = [];
    for (const e of effects) {
      const def = STATUS_EFFECTS[e.id];
      if (!def) continue;
      if (def.type === STATUS_TYPE.BUFF) sb.push(e);
      else db.push(e);
    }
    return { statusBuffs: sb, debuffs: db };
  }, [isDead, effects]);

  // Process skill buffs
  const skillBuffs = useMemo(() => {
    if (isDead || !buffs) return [];
    const result = [];
    if (buffs.damageReduction && buffs.damageReductionDuration > 0) {
      result.push({ Icon: ShieldBuffIcon, name: 'Protected', duration: buffs.damageReductionDuration });
    }
    if (buffs.isTaunting && buffs.tauntDuration > 0) {
      result.push({ Icon: TauntIcon, name: 'Taunting', duration: buffs.tauntDuration });
    }
    if (buffs.evasionBonus && buffs.evasionDuration > 0) {
      result.push({ Icon: EvasionIcon, name: 'Evasive', duration: buffs.evasionDuration });
    }
    if (buffs.hasteBonus && buffs.hasteDuration > 0) {
      result.push({ Icon: HasteIcon, name: 'Haste', duration: buffs.hasteDuration });
    }
    if (buffs.regenAmount && buffs.regenDuration > 0) {
      result.push({ Icon: RegenIcon, name: 'Regen', duration: buffs.regenDuration });
    }
    if (buffs.affixDamageBonus && buffs.affixDamageDuration > 0) {
      result.push({ Icon: MightIcon, name: 'Mighty', duration: buffs.affixDamageDuration });
    }
    if (buffs.affixSpeedBonus && buffs.affixSpeedDuration > 0) {
      result.push({ Icon: SpeedIcon, name: 'Swift', duration: buffs.affixSpeedDuration });
    }
    return result;
  }, [isDead, buffs]);

  // Skills
  const heroSkillIds = combatHero?.skills || hero.skills || [];

  return (
    <div className="pixel-panel-dark p-1.5" style={{ boxShadow: 'none' }}>
      <div className="flex items-center gap-2">
        <HeroIcon classId={hero.classId} equipment={hero.equipment} size={20} />
        <div className="flex-1 min-w-0">
          <div className="flex justify-between text-xs">
            <span className="text-white truncate flex items-center gap-1">
              {hero.name}
              <span className="text-yellow-400">Lv{hero.level || 1}</span>
              {roleInfo && (
                <span className="opacity-50" title={roleInfo.name}>
                  <RoleIcon role={heroRole} size={10} />
                </span>
              )}
            </span>
            <span className="text-gray-400">{Math.floor(currentHp)}/{Math.floor(maxHp)}</span>
          </div>
          <div className="pixel-bar h-[8px]">
            <div
              className={`pixel-bar-fill ${
                hpPercent > 50 ? 'pixel-bar-hp' :
                hpPercent > 25 ? 'pixel-bar-hp-mid' : 'pixel-bar-hp-low'
              }`}
              style={{ width: `${hpPercent}%` }}
            />
          </div>
          {/* XP Bar */}
          <div className="flex items-center gap-1 mt-0.5">
            <div className="pixel-bar h-[4px] flex-1">
              <div
                className="pixel-bar-fill"
                style={{
                  width: `${Math.min(100, ((hero.xp || 0) / xpForLevel(hero.level || 1)) * 100)}%`,
                  backgroundColor: '#a855f7',
                }}
              />
            </div>
            <span className="text-[9px] text-purple-400 min-w-[40px] text-right">
              {hero.xp || 0}/{xpForLevel(hero.level || 1)}
            </span>
          </div>
        </div>
      </div>

      {/* Status Effects & Skill Buffs */}
      {inDungeon && (
        <div className="mt-1 flex flex-wrap gap-1 min-h-[20px] items-center">
          {isDead && (
            <span className="cursor-help bg-gray-600/60 rounded px-1 flex items-center" title="Dead">
              <GhostIcon size={14} />
            </span>
          )}
          {phoenixStatus && (
            <span
              className={`cursor-help rounded px-1 flex items-center ${phoenixStatus.used ? 'bg-gray-600/40 opacity-50' : 'bg-yellow-600/40'}`}
              title={phoenixStatus.used ? 'Phoenix: Used' : 'Phoenix: Ready'}
            >
              <phoenixStatus.Icon size={14} />
            </span>
          )}
          {skillBuffs.map((buff, i) => (
            <span key={`sb-${i}`} className="cursor-help bg-green-600/40 rounded px-1 flex items-center" title={`${buff.name} (${buff.duration}t)`}>
              <buff.Icon size={14} />
            </span>
          ))}
          {statusBuffs.map((effect, i) => {
            const def = STATUS_EFFECTS[effect.id];
            return def ? (
              <span key={`b-${i}`} className="cursor-help bg-green-600/40 rounded px-1 flex items-center" title={`${def.name} (${effect.duration}t)`}>
                <StatusEffectIcon effectId={effect.id} size={14} />
              </span>
            ) : null;
          })}
          {debuffs.map((effect, i) => {
            const def = STATUS_EFFECTS[effect.id];
            return def ? (
              <span key={`d-${i}`} className="cursor-help bg-red-600/40 rounded px-1 flex items-center" title={`${def.name} (${effect.duration}t)`}>
                <StatusEffectIcon effectId={effect.id} size={14} />
              </span>
            ) : null;
          })}
        </div>
      )}

      {/* Skill Cooldowns */}
      {heroSkillIds.length > 0 && inDungeon && (
        <div className="flex gap-1 mt-1 flex-wrap">
          {heroSkillIds.map(skillId => {
            const skill = getSkillById(skillId);
            if (!skill || skill.type !== SKILL_TYPE.ACTIVE) return null;
            const cd = cooldowns[skillId] || 0;
            const isReady = cd <= 0;
            return (
              <div
                key={skillId}
                className={`w-5 h-5 rounded flex items-center justify-center relative ${isReady ? 'bg-blue-600' : 'bg-gray-700'}`}
                title={`${skill.name}${isReady ? ' (Ready)' : ` (${cd} turns)`}`}
              >
                <span className={isReady ? '' : 'opacity-50'}>
                  <SkillIcon skillId={skillId} size={16} />
                </span>
                {!isReady && (
                  <span className="absolute -bottom-0.5 -right-0.5 bg-gray-900 text-[8px] text-gray-400 w-3 h-3 rounded-full flex items-center justify-center">
                    {cd}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

// Hook for sidebar-specific throttled state (updates every 500ms)
function useSidebarState() {
  const [state, setState] = useState(() => {
    const rc = useGameStore.getState().roomCombat;
    return {
      displayHeroes: rc?.heroes || [],
      skillCooldowns: rc?.skillCooldowns || EMPTY_OBJECT,
      statusEffects: rc?.statusEffects || EMPTY_OBJECT,
      skillBuffs: rc?.buffs || EMPTY_OBJECT,
      usedPhoenixRevives: rc?.usedPhoenixRevives || EMPTY_OBJECT,
      monsters: rc?.monsters || [],
      bossUnlocked: rc?.bossUnlocked || false,
      round: rc?.round || 1,
      phase: rc?.phase || 'idle',
    };
  });

  const lastUpdateRef = useRef({ phase: null, heroHpSum: 0, monsterCount: 0, round: 0 });

  useEffect(() => {
    const update = () => {
      const rc = useGameStore.getState().roomCombat;

      // Only update if meaningful data changed
      const heroHpSum = rc?.heroes?.reduce((sum, h) => sum + Math.floor(h?.stats?.hp || 0), 0) || 0;
      const monsterCount = rc?.monsters?.filter(m => m?.stats?.hp > 0).length || 0;
      const round = rc?.round || 0;
      const last = lastUpdateRef.current;

      // Include round to ensure skill cooldown updates are shown
      if (rc?.phase !== last.phase || heroHpSum !== last.heroHpSum || monsterCount !== last.monsterCount || round !== last.round) {
        lastUpdateRef.current = { phase: rc?.phase, heroHpSum, monsterCount, round };
        setState({
          displayHeroes: rc?.heroes || [],
          skillCooldowns: rc?.skillCooldowns || EMPTY_OBJECT,
          statusEffects: rc?.statusEffects || EMPTY_OBJECT,
          skillBuffs: rc?.buffs || EMPTY_OBJECT,
          usedPhoenixRevives: rc?.usedPhoenixRevives || EMPTY_OBJECT,
          monsters: rc?.monsters || [],
          bossUnlocked: rc?.bossUnlocked || false,
          round: rc?.round || 1,
          phase: rc?.phase || 'idle',
        });
      }
    };
    // Offset from other intervals to prevent batching (503ms instead of 500ms)
    const id = setInterval(update, 503);
    return () => clearInterval(id);
  }, []);

  return state;
}

const Sidebar = memo(({
  heroes,
  dungeon,
  onOpenSelector,
  onAbandon,
}) => {
  // Use sidebar-specific throttled state (500ms updates)
  const {
    displayHeroes,
    skillCooldowns,
    statusEffects,
    skillBuffs,
    usedPhoenixRevives,
    monsters: displayMonsters,
    bossUnlocked,
    round,
    phase,
  } = useSidebarState();

  // OPTIMIZATION: Use individual selectors to avoid re-renders on unrelated state changes
  const highestDungeonCleared = useGameStore(state => state.highestDungeonCleared);
  const dungeonUnlocked = useGameStore(state => state.dungeonUnlocked);
  const maxDungeonLevel = useGameStore(state => state.maxDungeonLevel);

  // Monster counts for dungeon status display (displayMonsters comes from useSidebarState)
  const aliveMonsters = displayMonsters.filter(m => m.stats.hp > 0 && !m.isBoss);
  const totalMonsters = displayMonsters.filter(m => !m.isBoss).length;
  const killedMonsters = totalMonsters - aliveMonsters.length;
  const boss = displayMonsters.find(m => m.isBoss);
  const bossAlive = boss && boss.stats.hp > 0;

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

  return (
    <aside className="w-64 pixel-panel-dark flex flex-col h-full" style={{ borderRadius: 0 }}>
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto min-h-0">
      {/* Party Status */}
      <div className="p-3 border-b-3 border-[var(--color-border)]">
        <h3 className="pixel-subtitle mb-2">Party</h3>
        {heroes.length === 0 ? (
          <div className="text-gray-500 text-xs">No heroes recruited</div>
        ) : (
          <div className="space-y-2">
            {heroes.filter(Boolean).map(hero => {
              const combatHero = displayHeroes.find(h => h.id === hero.id);
              return (
                <HeroCard
                  key={hero.id}
                  hero={hero}
                  combatHero={combatHero}
                  cooldowns={skillCooldowns[hero.id] || EMPTY_OBJECT}
                  effects={statusEffects[hero.id] || EMPTY_ARRAY}
                  buffs={skillBuffs[hero.id] || EMPTY_OBJECT}
                  usedPhoenix={usedPhoenixRevives[hero.id]}
                  inDungeon={!!dungeon}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Dungeon Status */}
      <div className="p-3 border-b-3 border-[var(--color-border)]">
        <h3 className="pixel-subtitle mb-2">Dungeon</h3>
        {dungeon ? (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-white font-medium">Level {dungeon.level}</span>
              <span className={`text-xs ${phaseInfo.color}`}>{phaseInfo.text}</span>
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex justify-between text-xs text-[var(--color-text-dim)] mb-1">
                <span className="pixel-label">Enemies</span>
                <span>{killedMonsters}/{totalMonsters}</span>
              </div>
              <div className="pixel-bar h-[10px]">
                <div
                  className="pixel-bar-fill pixel-bar-blue"
                  style={{ width: `${totalMonsters > 0 ? (killedMonsters / totalMonsters) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Boss status */}
            {boss && (
              <div className={`text-xs ${bossUnlocked ? 'text-red-400' : 'text-gray-500'}`}>
                {bossAlive ? (
                  <div>
                    <div className="font-medium">{boss.name}</div>
                    {boss.title && <div className="text-[10px] text-gray-400">{boss.title}</div>}
                    {!bossUnlocked && <div className="text-[10px] text-gray-500">(Locked)</div>}
                  </div>
                ) : (
                  'Boss Defeated!'
                )}
              </div>
            )}

            {/* Round info */}
            <div className="text-xs text-gray-500">
              Round {round}
            </div>
          </div>
        ) : (
          <div className="text-gray-500 text-xs">
            No active dungeon
          </div>
        )}
      </div>

      {/* Progress Overview */}
      <div className="p-3 border-b-3 border-[var(--color-border)]">
        <h3 className="pixel-subtitle mb-2">Progress</h3>
        <div className="text-xs space-y-1">
          <div className="flex justify-between">
            <span className="pixel-label">Highest Cleared</span>
            <span className="text-[var(--color-gold)]">{highestDungeonCleared}/{maxDungeonLevel}</span>
          </div>
          <div className="flex justify-between">
            <span className="pixel-label">Unlocked</span>
            <span className="text-[var(--color-text)]">{Math.min(dungeonUnlocked, maxDungeonLevel)}</span>
          </div>
        </div>
      </div>

      </div>
      {/* Actions - Fixed at bottom, always visible */}
      <div className="p-3 border-t-3 border-[var(--color-border)] space-y-2 flex-shrink-0">
        <button
          onClick={onOpenSelector}
          className="w-full pixel-btn pixel-btn-primary text-sm"
        >
          {dungeon ? 'Change Dungeon' : 'Select Dungeon'}
        </button>

        {dungeon && (
          <button
            onClick={onAbandon}
            className="w-full pixel-btn pixel-btn-danger text-sm"
          >
            Abandon Run
          </button>
        )}
      </div>
    </aside>
  );
});

export default Sidebar;
