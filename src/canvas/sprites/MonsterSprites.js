// Monster sprite data for canvas rendering
// Each sprite is a 16x16 grid, stored as [x, y, width, height, color] arrays

export const MONSTER_SPRITE_DATA = {
  goblin: [
    // Body
    [5, 6, 6, 6, '#22c55e'],
    [6, 5, 4, 1, '#22c55e'],
    // Eyes
    [6, 7, 2, 2, '#fef3c7'],
    [9, 7, 2, 2, '#fef3c7'],
    [7, 8, 1, 1, '#1f2937'],
    [10, 8, 1, 1, '#1f2937'],
    // Ears
    [3, 6, 2, 3, '#22c55e'],
    [11, 6, 2, 3, '#22c55e'],
    // Mouth
    [7, 10, 3, 1, '#1f2937'],
    // Legs
    [6, 12, 2, 2, '#22c55e'],
    [9, 12, 2, 2, '#22c55e'],
  ],

  rat: [
    // Body
    [4, 8, 8, 4, '#78716c'],
    [5, 7, 6, 1, '#78716c'],
    // Head
    [9, 6, 4, 3, '#78716c'],
    // Eye
    [11, 7, 1, 1, '#1f2937'],
    // Ears
    [10, 5, 2, 1, '#a8a29e'],
    // Nose
    [13, 7, 1, 1, '#f472b6'],
    // Tail
    [2, 9, 2, 1, '#a8a29e'],
    [1, 10, 2, 1, '#a8a29e'],
    // Legs
    [5, 12, 2, 2, '#78716c'],
    [9, 12, 2, 2, '#78716c'],
  ],

  skeleton: [
    // Skull
    [5, 2, 6, 5, '#e5e7eb'],
    [6, 3, 1, 2, '#1f2937'],
    [9, 3, 1, 2, '#1f2937'],
    [7, 5, 2, 1, '#1f2937'],
    // Spine
    [7, 7, 2, 4, '#d1d5db'],
    // Ribs
    [5, 8, 6, 1, '#e5e7eb'],
    [5, 10, 6, 1, '#e5e7eb'],
    // Arms
    [3, 8, 2, 1, '#d1d5db'],
    [11, 8, 2, 1, '#d1d5db'],
    [2, 9, 1, 2, '#d1d5db'],
    [13, 9, 1, 2, '#d1d5db'],
    // Legs
    [6, 11, 1, 3, '#d1d5db'],
    [9, 11, 1, 3, '#d1d5db'],
  ],

  slime: [
    // Body
    [3, 8, 10, 5, '#22c55e'],
    [4, 6, 8, 2, '#22c55e'],
    [5, 5, 6, 1, '#22c55e'],
    // Highlight
    [5, 7, 3, 2, '#4ade80'],
    // Eyes
    [5, 9, 2, 2, '#1f2937'],
    [9, 9, 2, 2, '#1f2937'],
    [6, 9, 1, 1, '#ffffff'],
    [10, 9, 1, 1, '#ffffff'],
  ],

  giant_bat: [
    // Wings
    [1, 6, 4, 4, '#1f2937'],
    [11, 6, 4, 4, '#1f2937'],
    [2, 5, 2, 1, '#1f2937'],
    [12, 5, 2, 1, '#1f2937'],
    // Body
    [5, 6, 6, 5, '#374151'],
    // Head
    [6, 4, 4, 3, '#374151'],
    // Ears
    [6, 2, 1, 2, '#374151'],
    [9, 2, 1, 2, '#374151'],
    // Eyes
    [6, 5, 1, 1, '#ef4444'],
    [9, 5, 1, 1, '#ef4444'],
  ],

  orc: [
    // Body
    [4, 6, 8, 6, '#166534'],
    // Head
    [5, 2, 6, 5, '#15803d'],
    // Eyes
    [6, 4, 2, 2, '#fef3c7'],
    [9, 4, 2, 2, '#fef3c7'],
    [7, 5, 1, 1, '#1f2937'],
    [10, 5, 1, 1, '#1f2937'],
    // Tusks
    [5, 6, 1, 2, '#fef3c7'],
    [10, 6, 1, 2, '#fef3c7'],
    // Arms
    [2, 7, 2, 4, '#15803d'],
    [12, 7, 2, 4, '#15803d'],
    // Legs
    [5, 12, 2, 2, '#166534'],
    [9, 12, 2, 2, '#166534'],
  ],

  wolf: [
    // Body
    [3, 8, 10, 4, '#4b5563'],
    // Head
    [10, 5, 4, 4, '#6b7280'],
    // Snout
    [13, 7, 2, 2, '#4b5563'],
    // Ears
    [11, 3, 2, 2, '#4b5563'],
    // Eye
    [11, 6, 1, 1, '#fbbf24'],
    // Tail
    [1, 7, 2, 2, '#6b7280'],
    // Legs
    [4, 12, 2, 2, '#4b5563'],
    [10, 12, 2, 2, '#4b5563'],
  ],

  zombie: [
    // Body
    [5, 6, 6, 6, '#65a30d'],
    // Head
    [5, 2, 6, 5, '#84cc16'],
    // Eyes
    [6, 4, 2, 1, '#1f2937'],
    [9, 4, 2, 1, '#1f2937'],
    // Wounds
    [8, 3, 2, 1, '#7f1d1d'],
    [6, 8, 1, 2, '#7f1d1d'],
    // Arms
    [2, 7, 3, 2, '#84cc16'],
    [11, 7, 3, 2, '#84cc16'],
    // Legs
    [5, 12, 2, 2, '#65a30d'],
    [9, 12, 2, 2, '#65a30d'],
  ],

  giant_spider: [
    // Body
    [5, 7, 6, 5, '#1f2937'],
    // Head
    [6, 5, 4, 3, '#374151'],
    // Eyes
    [6, 6, 1, 1, '#ef4444'],
    [7, 5, 1, 1, '#ef4444'],
    [8, 5, 1, 1, '#ef4444'],
    [9, 6, 1, 1, '#ef4444'],
    // Legs
    [2, 7, 3, 1, '#1f2937'],
    [1, 8, 4, 1, '#1f2937'],
    [2, 9, 3, 1, '#1f2937'],
    [3, 10, 2, 1, '#1f2937'],
    [11, 7, 3, 1, '#1f2937'],
    [11, 8, 4, 1, '#1f2937'],
    [11, 9, 3, 1, '#1f2937'],
    [11, 10, 2, 1, '#1f2937'],
  ],

  troll: [
    // Body
    [3, 5, 10, 8, '#166534'],
    // Head
    [5, 1, 6, 5, '#15803d'],
    // Eyes
    [6, 3, 2, 2, '#fbbf24'],
    [9, 3, 2, 2, '#fbbf24'],
    [7, 4, 1, 1, '#1f2937'],
    [10, 4, 1, 1, '#1f2937'],
    // Nose
    [7, 4, 2, 2, '#14532d'],
    // Arms
    [1, 6, 2, 6, '#15803d'],
    [13, 6, 2, 6, '#15803d'],
    // Legs
    [4, 13, 3, 2, '#166534'],
    [9, 13, 3, 2, '#166534'],
  ],

  ghost: [
    // Body
    [4, 3, 8, 10, '#a5b4fc'],
    [5, 2, 6, 1, '#a5b4fc'],
    // Wavy bottom
    [4, 13, 2, 1, '#a5b4fc'],
    [7, 14, 2, 1, '#a5b4fc'],
    [10, 13, 2, 1, '#a5b4fc'],
    // Eyes
    [5, 6, 2, 3, '#1f2937'],
    [9, 6, 2, 3, '#1f2937'],
    // Mouth
    [7, 10, 2, 2, '#1f2937'],
  ],

  vampire: [
    // Cape
    [2, 4, 12, 10, '#7f1d1d'],
    // Body
    [5, 5, 6, 8, '#1f2937'],
    // Head
    [5, 1, 6, 5, '#e5e7eb'],
    // Hair
    [4, 1, 8, 2, '#1f2937'],
    // Eyes
    [6, 3, 1, 1, '#ef4444'],
    [9, 3, 1, 1, '#ef4444'],
    // Fangs
    [6, 5, 1, 1, '#ffffff'],
    [9, 5, 1, 1, '#ffffff'],
  ],

  demon: [
    // Wings
    [1, 4, 3, 6, '#7f1d1d'],
    [12, 4, 3, 6, '#7f1d1d'],
    // Body
    [4, 5, 8, 8, '#dc2626'],
    // Head
    [5, 2, 6, 4, '#ef4444'],
    // Horns
    [4, 0, 2, 3, '#1f2937'],
    [10, 0, 2, 3, '#1f2937'],
    // Eyes
    [6, 3, 2, 1, '#fbbf24'],
    [9, 3, 2, 1, '#fbbf24'],
    // Mouth
    [7, 5, 2, 1, '#1f2937'],
    // Legs
    [5, 13, 2, 2, '#dc2626'],
    [9, 13, 2, 2, '#dc2626'],
  ],

  golem: [
    // Body
    [3, 5, 10, 8, '#78716c'],
    // Head
    [4, 1, 8, 5, '#a8a29e'],
    // Eyes
    [5, 3, 2, 2, '#3b82f6'],
    [9, 3, 2, 2, '#3b82f6'],
    // Cracks
    [7, 2, 1, 3, '#57534e'],
    [6, 7, 4, 1, '#57534e'],
    // Arms
    [1, 6, 2, 5, '#a8a29e'],
    [13, 6, 2, 5, '#a8a29e'],
    // Legs
    [4, 13, 3, 2, '#78716c'],
    [9, 13, 3, 2, '#78716c'],
  ],

  wraith: [
    // Body
    [4, 3, 8, 11, '#1f2937'],
    [5, 2, 6, 1, '#1f2937'],
    // Hood
    [4, 2, 8, 4, '#111827'],
    // Eyes
    [6, 4, 1, 2, '#a855f7'],
    [9, 4, 1, 2, '#a855f7'],
    // Wispy bottom
    [3, 12, 2, 2, '#374151'],
    [6, 14, 2, 1, '#374151'],
    [11, 12, 2, 2, '#374151'],
    // Claws
    [2, 8, 2, 3, '#374151'],
    [12, 8, 2, 3, '#374151'],
  ],

  lich: [
    // Robe
    [4, 6, 8, 8, '#581c87'],
    [5, 5, 6, 1, '#581c87'],
    // Skull head
    [5, 1, 6, 5, '#e5e7eb'],
    // Eye sockets
    [6, 2, 2, 2, '#1f2937'],
    [9, 2, 2, 2, '#1f2937'],
    [6, 3, 1, 1, '#a855f7'],
    [10, 3, 1, 1, '#a855f7'],
    // Crown
    [5, 0, 6, 1, '#fbbf24'],
    // Staff
    [12, 3, 1, 10, '#78350f'],
    [11, 2, 3, 2, '#a855f7'],
  ],

  dragon: [
    // Massive wings with membrane detail
    [0, 3, 4, 8, '#dc2626'],
    [12, 3, 4, 8, '#dc2626'],
    [1, 4, 1, 5, '#b91c1c'],
    [14, 4, 1, 5, '#b91c1c'],
    [0, 2, 2, 1, '#991b1b'],
    [14, 2, 2, 1, '#991b1b'],
    // Body with scales
    [4, 4, 8, 9, '#b91c1c'],
    [5, 6, 6, 1, '#991b1b'],
    [5, 9, 6, 1, '#991b1b'],
    // Chest plate (golden)
    [6, 7, 4, 4, '#fbbf24'],
    // Head
    [5, 0, 6, 5, '#ef4444'],
    // Horns
    [3, 0, 2, 2, '#fbbf24'],
    [11, 0, 2, 2, '#fbbf24'],
    // Eyes (fierce, glowing)
    [6, 2, 2, 2, '#fbbf24'],
    [9, 2, 2, 2, '#fbbf24'],
    [7, 3, 1, 1, '#1f2937'],
    [10, 3, 1, 1, '#1f2937'],
    // Snout
    [6, 4, 4, 2, '#dc2626'],
    // Fire breath from nostrils
    [6, 5, 1, 2, '#f97316'],
    [9, 5, 1, 2, '#f97316'],
    [7, 6, 2, 1, '#fbbf24'],
    // Tail with spikes
    [3, 11, 2, 3, '#b91c1c'],
    [1, 13, 2, 2, '#b91c1c'],
    [2, 12, 1, 1, '#fbbf24'],
    // Legs with claws
    [5, 13, 2, 2, '#b91c1c'],
    [9, 13, 2, 2, '#b91c1c'],
  ],

  goblin_king: [
    // Royal cape
    [2, 5, 12, 9, '#7f1d1d'],
    [3, 4, 10, 1, '#7f1d1d'],
    // Cape trim (gold)
    [2, 13, 12, 1, '#fbbf24'],
    // Body
    [4, 5, 8, 8, '#15803d'],
    // Head
    [5, 1, 6, 5, '#22c55e'],
    // Eyes (menacing)
    [6, 3, 2, 2, '#fef3c7'],
    [9, 3, 2, 2, '#fef3c7'],
    [7, 4, 1, 1, '#7f1d1d'],
    [10, 4, 1, 1, '#7f1d1d'],
    // Ears (larger, more regal)
    [3, 3, 2, 3, '#22c55e'],
    [11, 3, 2, 3, '#22c55e'],
    [3, 4, 1, 1, '#15803d'],
    [12, 4, 1, 1, '#15803d'],
    // Royal Scepter
    [14, 3, 1, 9, '#fbbf24'],
    [13, 1, 3, 3, '#ef4444'],
    [14, 2, 1, 1, '#fbbf24'],
    // Legs
    [5, 13, 2, 2, '#15803d'],
    [9, 13, 2, 2, '#15803d'],
  ],

  demon_lord: [
    // Massive tattered wings
    [0, 2, 4, 11, '#7f1d1d'],
    [12, 2, 4, 11, '#7f1d1d'],
    [1, 3, 1, 7, '#991b1b'],
    [14, 3, 1, 7, '#991b1b'],
    // Wing claws
    [0, 1, 1, 2, '#1f2937'],
    [15, 1, 1, 2, '#1f2937'],
    // Body with armor
    [4, 3, 8, 11, '#991b1b'],
    [5, 5, 6, 6, '#7f1d1d'],
    // Chest sigil
    [7, 7, 2, 2, '#f97316'],
    // Head
    [5, 0, 6, 4, '#dc2626'],
    // Horns
    [3, 0, 2, 3, '#1f2937'],
    [11, 0, 2, 3, '#1f2937'],
    [2, 1, 1, 1, '#1f2937'],
    [13, 1, 1, 1, '#1f2937'],
    // Eyes (hellfire)
    [6, 1, 2, 2, '#fbbf24'],
    [9, 1, 2, 2, '#fbbf24'],
    [7, 2, 1, 1, '#ef4444'],
    [10, 2, 1, 1, '#ef4444'],
    // Fanged mouth
    [7, 3, 2, 1, '#1f2937'],
    [6, 3, 1, 1, '#e5e7eb'],
    [9, 3, 1, 1, '#e5e7eb'],
    // Clawed hands
    [3, 7, 2, 3, '#dc2626'],
    [11, 7, 2, 3, '#dc2626'],
    [2, 9, 1, 1, '#1f2937'],
    [13, 9, 1, 1, '#1f2937'],
    // Legs with hooves
    [5, 14, 2, 2, '#991b1b'],
    [9, 14, 2, 2, '#991b1b'],
  ],
};

// Harpy sprite
MONSTER_SPRITE_DATA.harpy = [
  // Wings
  [1, 4, 4, 6, '#78716c'],
  [11, 4, 4, 6, '#78716c'],
  // Body
  [5, 5, 6, 7, '#fde68a'],
  // Head
  [6, 2, 4, 4, '#fde68a'],
  // Hair
  [5, 1, 6, 2, '#78350f'],
  // Eyes
  [7, 4, 1, 1, '#1f2937'],
  [9, 4, 1, 1, '#1f2937'],
  // Talons
  [5, 12, 2, 2, '#78716c'],
  [9, 12, 2, 2, '#78716c'],
];

// Dark Knight sprite
MONSTER_SPRITE_DATA.dark_knight = [
  // Helmet
  [5, 1, 6, 5, '#1f2937'],
  [6, 2, 4, 1, '#374151'],
  // Visor (red eyes)
  [6, 4, 4, 1, '#ef4444'],
  // Armor body
  [4, 6, 8, 6, '#1f2937'],
  [5, 7, 6, 4, '#374151'],
  // Arms
  [2, 6, 2, 5, '#1f2937'],
  [12, 6, 2, 5, '#1f2937'],
  // Sword
  [13, 4, 1, 6, '#9ca3af'],
  [12, 3, 3, 1, '#9ca3af'],
  // Legs
  [5, 12, 2, 3, '#1f2937'],
  [9, 12, 2, 3, '#1f2937'],
];

// Minotaur sprite
MONSTER_SPRITE_DATA.minotaur = [
  // Body
  [4, 6, 8, 7, '#78350f'],
  // Head
  [5, 2, 6, 5, '#92400e'],
  // Horns
  [3, 1, 2, 3, '#fef3c7'],
  [11, 1, 2, 3, '#fef3c7'],
  // Snout
  [6, 5, 4, 2, '#d97706'],
  // Nose ring
  [7, 6, 2, 1, '#fbbf24'],
  // Eyes (red)
  [6, 3, 1, 1, '#ef4444'],
  [9, 3, 1, 1, '#ef4444'],
  // Arms
  [2, 7, 2, 4, '#92400e'],
  [12, 7, 2, 4, '#92400e'],
  // Legs
  [5, 13, 2, 2, '#78350f'],
  [9, 13, 2, 2, '#78350f'],
];

// Titan sprite
MONSTER_SPRITE_DATA.titan = [
  // Body (massive)
  [2, 4, 12, 10, '#6b7280'],
  // Head
  [4, 0, 8, 5, '#9ca3af'],
  // Eyes
  [5, 2, 2, 2, '#fbbf24'],
  [9, 2, 2, 2, '#fbbf24'],
  // Markings
  [7, 1, 2, 1, '#3b82f6'],
  [6, 7, 4, 1, '#3b82f6'],
  // Arms
  [0, 5, 2, 7, '#9ca3af'],
  [14, 5, 2, 7, '#9ca3af'],
  // Legs
  [3, 14, 4, 2, '#6b7280'],
  [9, 14, 4, 2, '#6b7280'],
];

// Orc Warlord - war paint, larger tusks, shoulder armor, battle axe
MONSTER_SPRITE_DATA.orc_warlord = [
  // Body (larger/bulkier than regular orc)
  [3, 5, 10, 8, '#166534'],
  // Head
  [4, 1, 8, 5, '#15803d'],
  // War paint stripes on face (red)
  [5, 2, 1, 3, '#dc2626'],
  [10, 2, 1, 3, '#dc2626'],
  // Eyes (fierce)
  [5, 3, 2, 2, '#fef3c7'],
  [9, 3, 2, 2, '#fef3c7'],
  [6, 4, 1, 1, '#7f1d1d'],
  [10, 4, 1, 1, '#7f1d1d'],
  // Larger tusks
  [4, 5, 2, 3, '#fef3c7'],
  [10, 5, 2, 3, '#fef3c7'],
  // Shoulder armor (metal)
  [1, 5, 3, 3, '#4b5563'],
  [12, 5, 3, 3, '#4b5563'],
  [2, 6, 1, 1, '#9ca3af'], // armor highlight
  [13, 6, 1, 1, '#9ca3af'],
  // Arms
  [1, 8, 2, 4, '#15803d'],
  [13, 8, 2, 4, '#15803d'],
  // Battle axe (right side)
  [14, 2, 1, 8, '#78350f'], // handle
  [13, 1, 3, 3, '#6b7280'], // axe head
  [13, 3, 3, 2, '#9ca3af'], // axe blade
  // Legs
  [4, 13, 3, 2, '#166534'],
  [9, 13, 3, 2, '#166534'],
];

// Spider Queen - larger body, elaborate legs, purple accents
MONSTER_SPRITE_DATA.spider_queen = [
  // Large abdomen (back)
  [4, 7, 8, 6, '#1f2937'],
  [5, 6, 6, 1, '#1f2937'],
  // Abdomen pattern (purple)
  [6, 8, 4, 3, '#7c3aed'],
  [7, 11, 2, 1, '#7c3aed'],
  // Thorax/head
  [5, 2, 6, 5, '#374151'],
  // Eyes (8 eyes, more prominent)
  [5, 4, 2, 1, '#a855f7'],
  [6, 3, 1, 1, '#a855f7'],
  [7, 3, 2, 2, '#ef4444'], // center eyes larger
  [9, 3, 1, 1, '#a855f7'],
  [9, 4, 2, 1, '#a855f7'],
  // Fangs
  [6, 6, 1, 1, '#fef3c7'],
  [9, 6, 1, 1, '#fef3c7'],
  // Legs (more elaborate, 8 legs)
  [1, 4, 4, 1, '#1f2937'],
  [0, 5, 5, 1, '#374151'],
  [1, 6, 4, 1, '#1f2937'],
  [2, 7, 3, 1, '#374151'],
  [11, 4, 4, 1, '#1f2937'],
  [11, 5, 5, 1, '#374151'],
  [11, 6, 4, 1, '#1f2937'],
  [11, 7, 3, 1, '#374151'],
  // Leg tips (purple accents)
  [0, 5, 1, 1, '#7c3aed'],
  [0, 6, 1, 1, '#7c3aed'],
  [15, 5, 1, 1, '#7c3aed'],
  [15, 6, 1, 1, '#7c3aed'],
];

// Lich King - glowing eyes, flowing dark robes, staff
MONSTER_SPRITE_DATA.lich_king = [
  // Flowing robes (wider, more majestic)
  [2, 5, 12, 10, '#1e1b4b'],
  [3, 4, 10, 1, '#1e1b4b'],
  // Robe trim (gold)
  [2, 14, 12, 1, '#fbbf24'],
  [3, 13, 1, 1, '#fbbf24'],
  [12, 13, 1, 1, '#fbbf24'],
  // Skeletal head
  [5, 0, 6, 5, '#e5e7eb'],
  // Eye sockets with intense glow
  [6, 1, 2, 2, '#1f2937'],
  [9, 1, 2, 2, '#1f2937'],
  [6, 2, 2, 1, '#3b82f6'], // ice blue glow
  [9, 2, 2, 1, '#3b82f6'],
  // Nose hole
  [7, 3, 2, 1, '#1f2937'],
  // Staff (more elaborate)
  [13, 0, 1, 13, '#581c87'], // dark purple staff
  [12, 0, 3, 2, '#3b82f6'], // glowing orb top
  [13, 0, 1, 1, '#7dd3fc'], // orb highlight
  // Skeletal hands
  [4, 6, 2, 2, '#d1d5db'],
  [11, 6, 2, 2, '#d1d5db'],
  // Dark magic aura particles
  [1, 8, 1, 1, '#3b82f6'],
  [14, 10, 1, 1, '#3b82f6'],
  [2, 12, 1, 1, '#7c3aed'],
];

// Fallback aliases for different monster IDs
MONSTER_SPRITE_DATA.bat = MONSTER_SPRITE_DATA.giant_bat;
MONSTER_SPRITE_DATA.spider = MONSTER_SPRITE_DATA.giant_spider;

// Sprite cache for pre-rendered sprites
const spriteCache = new Map();

// Convert hex color to grayscale
function toGrayscale(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
  return `#${gray.toString(16).padStart(2, '0').repeat(3)}`;
}

// Apply color variation to a hex color
function applyColorVariation(hex, variation) {
  if (!variation) return hex;

  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  // Convert to HSL
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  // Apply variations
  let newH = (h + variation.hueShift / 360) % 1;
  if (newH < 0) newH += 1;
  let newS = Math.max(0, Math.min(1, s * variation.saturationMod));
  let newL = Math.max(0, Math.min(1, l * variation.brightnessMod));

  // Convert back to RGB
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  let newR, newG, newB;
  if (s === 0) {
    newR = newG = newB = newL;
  } else {
    const q = newL < 0.5 ? newL * (1 + newS) : newL + newS - newL * newS;
    const p = 2 * newL - q;
    newR = hue2rgb(p, q, newH + 1/3);
    newG = hue2rgb(p, q, newH);
    newB = hue2rgb(p, q, newH - 1/3);
  }

  const toHex = (v) => Math.round(v * 255).toString(16).padStart(2, '0');
  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
}

// Generate cache key including color variation
function getVariationKey(variation) {
  if (!variation) return 'default';
  return `h${variation.hueShift}_s${variation.saturationMod.toFixed(2)}_b${variation.brightnessMod.toFixed(2)}`;
}

// Get or create cached sprite canvas
function getCachedSprite(monsterId, size, isDead = false, colorVariation = null) {
  const variationKey = getVariationKey(colorVariation);
  const cacheKey = `${monsterId}-${size}-${isDead}-${variationKey}`;

  if (spriteCache.has(cacheKey)) {
    return spriteCache.get(cacheKey);
  }

  // Create offscreen canvas for this sprite
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  // Render sprite to cache
  const spriteData = MONSTER_SPRITE_DATA[monsterId] || MONSTER_SPRITE_DATA.demon;
  const scale = size / 16;

  for (const [px, py, pw, ph, color] of spriteData) {
    let finalColor = color;
    // Apply color variation for bosses
    if (colorVariation) {
      finalColor = applyColorVariation(color, colorVariation);
    }
    ctx.fillStyle = isDead ? toGrayscale(finalColor) : finalColor;
    ctx.fillRect(px * scale, py * scale, pw * scale, ph * scale);
  }

  spriteCache.set(cacheKey, canvas);
  return canvas;
}

// Draw a monster sprite to canvas (uses cached sprite)
// colorVariation: { hueShift, saturationMod, brightnessMod } for boss variants
export function drawMonsterSprite(ctx, monsterId, x, y, size, isDead = false, colorVariation = null) {
  const cachedSprite = getCachedSprite(monsterId, size, isDead, colorVariation);
  if (isDead) {
    ctx.save();
    ctx.globalAlpha = 0.3;
  }
  ctx.drawImage(cachedSprite, x, y);
  if (isDead) {
    ctx.restore();
  }
}

// Clear sprite cache (call when needed, e.g., on resize)
export function clearMonsterSpriteCache() {
  spriteCache.clear();
}
