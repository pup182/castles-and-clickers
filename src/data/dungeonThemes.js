// Dungeon themes - visual styles based on dungeon level

// Raid-specific themes
export const RAID_THEMES = {
  water: {
    id: 'water',
    name: 'Sunken Temple',
    colors: {
      wall: '#134e4a',
      wallHighlight: '#115e59',
      floor: '#042f2e',
      floorAlt: '#022c22',
      accent: '#22d3ee', // cyan water
    },
    props: ['coral', 'seaweed', 'shell', 'puddle'],
  },
  undead: {
    id: 'undead',
    name: 'Cursed Manor',
    colors: {
      wall: '#1f1f2e',
      wallHighlight: '#2d2d44',
      floor: '#0f0f1a',
      floorAlt: '#080810',
      accent: '#9333ea', // purple ghostly
    },
    props: ['coffin', 'candle', 'cobweb', 'bones'],
  },
  sky: {
    id: 'sky',
    name: 'Sky Fortress',
    colors: {
      wall: '#1e3a5f',
      wallHighlight: '#2563eb',
      floor: '#0c1929',
      floorAlt: '#030712',
      accent: '#60a5fa', // sky blue
    },
    props: ['cloud', 'lightning', 'windChime', 'feather'],
  },
  abyss: {
    id: 'abyss',
    name: 'The Abyss',
    colors: {
      wall: '#0a1628',
      wallHighlight: '#1e293b',
      floor: '#020617',
      floorAlt: '#000000',
      accent: '#0ea5e9', // deep blue
    },
    props: ['tentacle', 'bubbles', 'bioluminescent', 'coral'],
  },
  void_raid: {
    id: 'void_raid',
    name: 'Void Throne',
    colors: {
      wall: '#2e1065',
      wallHighlight: '#4c1d95',
      floor: '#1a0533',
      floorAlt: '#0d0019',
      accent: '#c084fc', // bright purple
    },
    props: ['portal', 'voidCrack', 'rune', 'floatingRock'],
  },
};

export const DUNGEON_THEMES = {
  cave: {
    id: 'cave',
    name: 'Crystal Caves',
    levelRange: [1, 5],
    colors: {
      wall: '#374151',
      wallHighlight: '#4b5563',
      floor: '#1f2937',
      floorAlt: '#111827',
      accent: '#06b6d4', // cyan crystals
    },
    props: ['crystal', 'stalactite', 'puddle', 'rocks'],
  },
  crypt: {
    id: 'crypt',
    name: 'Ancient Crypt',
    levelRange: [6, 10],
    colors: {
      wall: '#292524',
      wallHighlight: '#44403c',
      floor: '#1c1917',
      floorAlt: '#0c0a09',
      accent: '#84cc16', // sickly green
    },
    props: ['bones', 'coffin', 'candle', 'cobweb'],
  },
  forest: {
    id: 'forest',
    name: 'Dark Forest',
    levelRange: [11, 15],
    colors: {
      wall: '#14532d',
      wallHighlight: '#166534',
      floor: '#052e16',
      floorAlt: '#022c22',
      accent: '#22c55e', // green glow
    },
    props: ['tree', 'mushroom', 'vine', 'flowers'],
  },
  castle: {
    id: 'castle',
    name: 'Ruined Castle',
    levelRange: [16, 20],
    colors: {
      wall: '#44403c',
      wallHighlight: '#57534e',
      floor: '#292524',
      floorAlt: '#1c1917',
      accent: '#f59e0b', // torch orange
    },
    props: ['torch', 'banner', 'armor', 'chains'],
  },
  volcano: {
    id: 'volcano',
    name: 'Volcanic Depths',
    levelRange: [21, 25],
    colors: {
      wall: '#1c1917',
      wallHighlight: '#292524',
      floor: '#0c0a09',
      floorAlt: '#000000',
      accent: '#ef4444', // lava red
    },
    props: ['lava', 'obsidian', 'ember', 'crack'],
  },
  void: {
    id: 'void',
    name: 'The Void',
    levelRange: [26, 30],
    colors: {
      wall: '#1e1b4b',
      wallHighlight: '#312e81',
      floor: '#0f0d24',
      floorAlt: '#020617',
      accent: '#a855f7', // purple void
    },
    props: ['portal', 'floatingRock', 'rune', 'voidCrack'],
  },
};

// Get theme for a dungeon level
export const getThemeForLevel = (level, raidTheme = null) => {
  // If a raid theme is specified, use the raid theme
  if (raidTheme && RAID_THEMES[raidTheme]) {
    return RAID_THEMES[raidTheme];
  }

  for (const theme of Object.values(DUNGEON_THEMES)) {
    if (level >= theme.levelRange[0] && level <= theme.levelRange[1]) {
      return theme;
    }
  }
  // Default to void for anything beyond 30
  return DUNGEON_THEMES.void;
};

// Get theme for a raid by raid ID
export const getThemeForRaid = (raidId) => {
  const raidThemeMap = {
    sunken_temple: 'water',
    cursed_manor: 'undead',
    sky_fortress: 'sky',
    the_abyss: 'abyss',
    void_throne: 'void_raid',
  };
  const themeId = raidThemeMap[raidId];
  return RAID_THEMES[themeId] || RAID_THEMES.water;
};

// Get random props for a room based on theme
export const getRandomProps = (theme, count = 3) => {
  const props = [];
  for (let i = 0; i < count; i++) {
    const propType = theme.props[Math.floor(Math.random() * theme.props.length)];
    props.push(propType);
  }
  return props;
};
