// Shared raid boss sprite mapping - maps boss templateIds to sprite IDs
// Used by UnitLayer.js, CanvasDungeonView.jsx, and RaidRecapScreen.jsx

export const RAID_BOSS_SPRITE_MAP = {
  // Sunken Temple
  corrupted_priest: 'boss_corrupted_priest',
  naga_queen: 'boss_naga_queen',
  sea_serpent: 'boss_sea_serpent',
  // Cursed Manor
  phantom_butler: 'boss_phantom_butler',
  banshee_queen: 'boss_banshee',
  flesh_golem: 'boss_flesh_golem',
  vampire_lord: 'boss_vampire_lord',
  // Sky Fortress
  wind_elemental_lord: 'boss_wind_elemental',
  lightning_golem: 'boss_lightning_golem',
  storm_hawk: 'boss_storm_hawk',
  storm_lord: 'boss_storm_lord',
  // The Abyss
  abyssal_horror: 'boss_abyssal_horror',
  kraken: 'boss_kraken',
  deep_one_prophet: 'boss_deep_one_prophet',
  leviathan: 'boss_leviathan',
  // Void Throne
  void_stalker_prime: 'boss_void_stalker_prime',
  reality_ripper_alpha: 'boss_reality_ripper',
  null_shade_omega: 'boss_null_shade',
  entropy_avatar: 'boss_entropy_avatar',
  void_god: 'boss_void_god',
};

export const getRaidBossSpriteId = (bossId) => RAID_BOSS_SPRITE_MAP[bossId] || 'boss_void_god';
