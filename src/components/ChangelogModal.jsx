import { useState } from 'react';
import ModalOverlay from './ModalOverlay';
import { CURRENT_VERSION, getChangesSince, CHANGELOG } from '../data/changelog';

const TYPE_BADGES = {
  feature: { label: 'NEW', color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
  fix:     { label: 'FIX', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  balance: { label: 'BAL', color: '#06b6d4', bg: 'rgba(6,182,212,0.15)' },
};

const ChangelogModal = ({ isOpen, onClose, lastSeenVersion }) => {
  if (!isOpen) return null;

  const [showAll, setShowAll] = useState(false);

  // Show new entries if any, otherwise show the latest entries (manual open via version click)
  const newEntries = getChangesSince(lastSeenVersion);
  const baseEntries = newEntries.length > 0 ? newEntries : CHANGELOG.slice(0, 5);
  const entries = showAll ? CHANGELOG : baseEntries;
  const hasMore = CHANGELOG.length > baseEntries.length;

  if (entries.length === 0) return null;

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose} title="What's New" size="md">
      <div className="space-y-5">
        {entries.map((entry) => (
          <div key={entry.version} className="pixel-panel p-3">
            {/* Version header */}
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-700/50">
              <div className="flex items-center gap-2">
                <span
                  className="text-sm font-bold px-2 py-0.5 rounded"
                  style={{ background: 'rgba(168,85,247,0.2)', color: '#c084fc' }}
                >
                  v{entry.version}
                </span>
                <span className="pixel-title text-sm">{entry.title}</span>
              </div>
              <span className="text-xs text-[var(--color-text-dim)]">{entry.date}</span>
            </div>

            {/* Changes list */}
            <ul className="space-y-1.5">
              {entry.changes.map((change, i) => {
                const badge = TYPE_BADGES[change.type] || TYPE_BADGES.feature;
                return (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span
                      className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5"
                      style={{ color: badge.color, background: badge.bg }}
                    >
                      {badge.label}
                    </span>
                    <span className="text-[var(--color-text)]">{change.text}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 flex flex-col items-center gap-2">
        {hasMore && (
          <button
            onClick={() => setShowAll(prev => !prev)}
            className="pixel-btn text-xs"
          >
            {showAll ? 'See Less' : `See More (${CHANGELOG.length - baseEntries.length} older)`}
          </button>
        )}
        <button onClick={onClose} className="pixel-btn pixel-btn-success px-6 py-2">
          Got it!
        </button>
      </div>
    </ModalOverlay>
  );
};

export default ChangelogModal;
