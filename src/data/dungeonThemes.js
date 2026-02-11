// Dungeon themes - visual styles based on dungeon level

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
export const getThemeForLevel = (level) => {
  for (const theme of Object.values(DUNGEON_THEMES)) {
    if (level >= theme.levelRange[0] && level <= theme.levelRange[1]) {
      return theme;
    }
  }
  // Default to void for anything beyond 30
  return DUNGEON_THEMES.void;
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
