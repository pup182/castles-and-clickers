import { useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useGameStore } from '../store/gameStore';
import { RAIDS } from '../data/raids';
import { RaidBossIcon } from './icons/raidBosses';
import { StarIcon, CheckIcon, CrownIcon } from './icons/ui';

// Map boss IDs to sprite IDs
const RAID_BOSS_SPRITE_MAP = {
  corrupted_priest: 'boss_corrupted_priest',
  naga_queen: 'boss_naga_queen',
  sea_serpent: 'boss_sea_serpent',
  phantom_butler: 'boss_phantom_butler',
  banshee_queen: 'boss_banshee',
  flesh_golem: 'boss_flesh_golem',
  vampire_lord: 'boss_vampire_lord',
  wind_elemental_lord: 'boss_wind_elemental',
  lightning_golem: 'boss_lightning_golem',
  storm_hawk: 'boss_storm_hawk',
  storm_lord: 'boss_storm_lord',
  shadow_assassin: 'boss_shadow_assassin',
  abyssal_beast: 'boss_abyssal_beast',
  mind_flayer: 'boss_mind_flayer',
  abyss_lord: 'boss_abyss_lord',
  null_shade_omega: 'boss_null_shade',
  entropy_avatar: 'boss_entropy_avatar',
  void_god: 'boss_void_god',
};

const getRaidBossSpriteId = (bossId) => RAID_BOSS_SPRITE_MAP[bossId] || 'boss_void_god';

const RaidRecapScreen = () => {
  const pendingRaidRecap = useGameStore(state => state.pendingRaidRecap);
  const pendingUniqueCelebration = useGameStore(state => state.pendingUniqueCelebration);
  const clearRaidRecap = useGameStore(state => state.clearRaidRecap);

  const handleClose = useCallback(() => {
    clearRaidRecap();
  }, [clearRaidRecap]);

  // Wait for unique celebration to be dismissed first
  if (!pendingRaidRecap || pendingUniqueCelebration) return null;

  const raid = RAIDS[pendingRaidRecap.raidId];
  if (!raid) return null;

  const allBosses = [...raid.wingBosses, { ...raid.finalBoss, isFinalBoss: true }];

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center cursor-pointer"
      onClick={handleClose}
    >
      {/* Dark overlay with radial glow */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.2) 0%, rgba(0, 0, 0, 0.95) 70%)',
        }}
      />

      {/* Main recap card */}
      <div
        className="relative pixel-panel p-8 max-w-lg mx-4 text-center border-2 border-purple-500"
        onClick={e => e.stopPropagation()}
        style={{
          boxShadow: '0 0 60px rgba(139, 92, 246, 0.4), inset 0 0 20px rgba(139, 92, 246, 0.1)',
        }}
      >
        {/* Victory header */}
        <div className="mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <StarIcon size={24} className="text-amber-400" />
            <h2 className="pixel-title text-3xl text-amber-400 uppercase tracking-wider">
              Raid Complete!
            </h2>
            <StarIcon size={24} className="text-amber-400" />
          </div>
          <div className="text-xl text-purple-300 font-bold">
            {raid.name}
          </div>
        </div>

        {/* Bosses defeated */}
        <div className="mb-6">
          <div className="text-sm text-gray-400 mb-3 uppercase tracking-wider">
            Bosses Defeated
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {allBosses.map(boss => {
              const isDefeated = pendingRaidRecap.defeatedBosses.includes(boss.id);
              return (
                <div
                  key={boss.id}
                  className={`flex flex-col items-center p-2 rounded border ${
                    isDefeated
                      ? 'border-green-500/50 bg-green-900/20'
                      : 'border-gray-700 bg-gray-900/50 opacity-50'
                  }`}
                >
                  <div className="relative">
                    <RaidBossIcon spriteId={getRaidBossSpriteId(boss.id)} size={40} />
                    {boss.isFinalBoss && (
                      <CrownIcon size={12} className="absolute -top-1 -right-1 text-amber-400" />
                    )}
                    {isDefeated && (
                      <div className="absolute -bottom-1 -right-1 bg-green-600 rounded-full p-0.5">
                        <CheckIcon size={10} className="text-white" />
                      </div>
                    )}
                  </div>
                  <div className={`text-xs mt-1 ${isDefeated ? 'text-green-400' : 'text-gray-500'}`}>
                    {boss.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="pixel-btn-primary px-6 py-2"
        >
          Continue
        </button>

        <div className="text-gray-500 text-xs mt-3">
          Click anywhere to close
        </div>
      </div>
    </div>,
    document.body
  );
};

export default RaidRecapScreen;
