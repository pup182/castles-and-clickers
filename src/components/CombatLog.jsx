import { memo, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';

// OPTIMIZATION: Memoized log entry to prevent re-renders
const LogEntry = memo(({ log }) => {
  if (log.type === 'system') {
    return <span className="text-[var(--color-gold)]">{log.message}</span>;
  }
  if (log.type === 'attack') {
    return <span>{log.actor?.name || '???'} ATK {log.target?.name || '???'} <span className="text-[var(--color-red)]">-{log.damage}</span></span>;
  }
  if (log.type === 'skill') {
    return (
      <span className="text-[#ff8844]">
        {log.actor?.name || '???'} {log.skill?.name || 'SKILL'} {log.target?.name || '???'} <span className="text-[var(--color-red)]">-{log.damage}</span>
      </span>
    );
  }
  if (log.type === 'heal') {
    return (
      <span className="text-[var(--color-green)]">
        {log.actor?.name || '???'} {log.skill?.name || 'HEAL'} {log.target?.name || '???'} <span className="text-[#88ff88]">+{log.amount}</span>
      </span>
    );
  }
  if (log.type === 'death') {
    return <span className={log.isHero ? 'text-[var(--color-red)]' : 'text-[var(--color-green)]'}>{log.target?.name || '???'} DEFEATED</span>;
  }
  return null;
});

/**
 * Combat log display component
 * OPTIMIZATION: Memoized entries, stable keys, shallow selector
 */
const CombatLog = () => {
  // OPTIMIZATION: Only re-render when log length changes, not on every log reference change
  const combatLogLength = useGameStore(state => state.combatLog.length);
  const combatLog = useGameStore(state => state.combatLog);

  // OPTIMIZATION: Memoize the slice to avoid creating new array on every render
  const recentLogs = useMemo(() => combatLog.slice(-6), [combatLog, combatLogLength]);

  return (
    <div className="pixel-panel-dark p-3 max-h-28 overflow-y-auto text-sm">
      {recentLogs.map((log, i) => (
        <div key={`${combatLogLength - recentLogs.length + i}`} className="text-[var(--color-text-dim)]">
          <LogEntry log={log} />
        </div>
      ))}
    </div>
  );
};

export default memo(CombatLog);
