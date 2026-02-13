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

// === TIER 5 MONSTERS - VOLCANIC ===

MONSTER_SPRITE_DATA.magma_elemental = [
  // Body - molten rock
  [4, 4, 8, 9, '#dc2626'],
  [5, 3, 6, 1, '#ef4444'],
  // Lava cracks
  [6, 5, 1, 3, '#fbbf24'],
  [9, 6, 1, 4, '#fbbf24'],
  [5, 9, 3, 1, '#f97316'],
  // Eyes
  [5, 5, 2, 2, '#fbbf24'],
  [9, 5, 2, 2, '#fbbf24'],
  // Rock chunks
  [3, 6, 1, 3, '#78716c'],
  [12, 6, 1, 3, '#78716c'],
  // Arms
  [2, 7, 2, 4, '#b91c1c'],
  [12, 7, 2, 4, '#b91c1c'],
  // Legs
  [5, 13, 2, 2, '#991b1b'],
  [9, 13, 2, 2, '#991b1b'],
];

MONSTER_SPRITE_DATA.fire_imp = [
  // Body
  [5, 6, 6, 6, '#dc2626'],
  // Head
  [5, 2, 6, 5, '#ef4444'],
  // Horns
  [4, 1, 2, 2, '#fbbf24'],
  [10, 1, 2, 2, '#fbbf24'],
  // Eyes - mischievous
  [6, 4, 2, 2, '#fbbf24'],
  [9, 4, 2, 2, '#fbbf24'],
  [7, 5, 1, 1, '#1f2937'],
  [10, 5, 1, 1, '#1f2937'],
  // Grin
  [7, 6, 3, 1, '#1f2937'],
  // Wings - small
  [2, 6, 3, 3, '#f97316'],
  [11, 6, 3, 3, '#f97316'],
  // Tail with flame
  [3, 10, 2, 1, '#dc2626'],
  [2, 9, 2, 1, '#fbbf24'],
  // Legs
  [6, 12, 2, 2, '#b91c1c'],
  [9, 12, 2, 2, '#b91c1c'],
];

MONSTER_SPRITE_DATA.lava_serpent = [
  // Body coils
  [3, 8, 10, 4, '#dc2626'],
  [5, 6, 6, 2, '#ef4444'],
  [2, 10, 3, 3, '#b91c1c'],
  // Lava pattern
  [5, 9, 2, 1, '#fbbf24'],
  [9, 10, 2, 1, '#fbbf24'],
  // Head
  [9, 3, 5, 4, '#ef4444'],
  // Eyes
  [11, 4, 2, 2, '#fbbf24'],
  [12, 5, 1, 1, '#1f2937'],
  // Fangs
  [13, 6, 1, 2, '#fef3c7'],
  // Forked tongue
  [14, 5, 1, 1, '#f97316'],
  // Tail flame
  [1, 12, 2, 2, '#fbbf24'],
];

MONSTER_SPRITE_DATA.obsidian_golem = [
  // Body - dark rock
  [3, 4, 10, 9, '#1f2937'],
  // Head
  [4, 1, 8, 4, '#374151'],
  // Lava veins
  [6, 2, 1, 2, '#f97316'],
  [9, 2, 1, 2, '#f97316'],
  [5, 7, 1, 4, '#dc2626'],
  [10, 6, 1, 5, '#dc2626'],
  // Eyes - glowing
  [5, 2, 2, 2, '#fbbf24'],
  [9, 2, 2, 2, '#fbbf24'],
  // Arms - massive
  [1, 5, 2, 6, '#374151'],
  [13, 5, 2, 6, '#374151'],
  // Legs
  [4, 13, 3, 2, '#1f2937'],
  [9, 13, 3, 2, '#1f2937'],
];

MONSTER_SPRITE_DATA.ember_wraith = [
  // Body - fiery ethereal
  [4, 3, 8, 10, '#f97316'],
  [5, 2, 6, 1, '#fbbf24'],
  // Fade effect
  [4, 12, 2, 2, '#dc2626'],
  [7, 13, 2, 2, '#f97316'],
  [10, 12, 2, 2, '#dc2626'],
  // Hood
  [4, 2, 8, 4, '#b91c1c'],
  // Eyes
  [6, 4, 1, 2, '#fef3c7'],
  [9, 4, 1, 2, '#fef3c7'],
  // Claws
  [2, 7, 2, 3, '#fbbf24'],
  [12, 7, 2, 3, '#fbbf24'],
];

MONSTER_SPRITE_DATA.inferno_titan = [
  // Massive body
  [2, 4, 12, 10, '#b91c1c'],
  // Head
  [4, 0, 8, 5, '#dc2626'],
  // Horns - large
  [2, 0, 2, 3, '#78716c'],
  [12, 0, 2, 3, '#78716c'],
  // Eyes
  [5, 2, 2, 2, '#fbbf24'],
  [9, 2, 2, 2, '#fbbf24'],
  // Molten core
  [6, 6, 4, 4, '#fbbf24'],
  [7, 7, 2, 2, '#fef3c7'],
  // Lava veins
  [4, 8, 2, 1, '#f97316'],
  [10, 8, 2, 1, '#f97316'],
  // Arms
  [0, 5, 2, 7, '#dc2626'],
  [14, 5, 2, 7, '#dc2626'],
  // Legs
  [3, 14, 4, 2, '#991b1b'],
  [9, 14, 4, 2, '#991b1b'],
];

// === TIER 6 MONSTERS - VOID ===

MONSTER_SPRITE_DATA.void_stalker = [
  // Body - shadowy
  [5, 5, 6, 7, '#1f2937'],
  // Head
  [5, 2, 6, 4, '#374151'],
  // Void eyes
  [6, 3, 2, 2, '#a855f7'],
  [9, 3, 2, 2, '#a855f7'],
  [7, 4, 1, 1, '#e9d5ff'],
  [10, 4, 1, 1, '#e9d5ff'],
  // Void tendrils
  [3, 6, 2, 1, '#7c3aed'],
  [2, 7, 2, 1, '#6d28d9'],
  [11, 6, 2, 1, '#7c3aed'],
  [12, 7, 2, 1, '#6d28d9'],
  // Claws
  [3, 8, 2, 3, '#374151'],
  [11, 8, 2, 3, '#374151'],
  // Legs
  [5, 12, 2, 3, '#1f2937'],
  [9, 12, 2, 3, '#1f2937'],
];

MONSTER_SPRITE_DATA.eldritch_horror = [
  // Main body - bulbous
  [3, 4, 10, 8, '#581c87'],
  [4, 3, 8, 1, '#6b21a8'],
  // Eyes - many
  [4, 5, 2, 2, '#fbbf24'],
  [7, 4, 2, 2, '#22c55e'],
  [10, 5, 2, 2, '#ef4444'],
  [6, 7, 1, 1, '#a855f7'],
  [9, 7, 1, 1, '#3b82f6'],
  // Tentacles
  [1, 8, 2, 4, '#7c3aed'],
  [0, 10, 2, 3, '#6d28d9'],
  [13, 8, 2, 4, '#7c3aed'],
  [14, 10, 2, 3, '#6d28d9'],
  // Lower tentacles
  [4, 12, 2, 3, '#581c87'],
  [7, 13, 2, 2, '#6b21a8'],
  [10, 12, 2, 3, '#581c87'],
];

MONSTER_SPRITE_DATA.null_shade = [
  // Body - pure void
  [4, 3, 8, 11, '#0f0f0f'],
  [5, 2, 6, 1, '#1f1f1f'],
  // Hood outline
  [3, 2, 1, 4, '#374151'],
  [12, 2, 1, 4, '#374151'],
  [4, 1, 8, 1, '#374151'],
  // Eyes - hollow voids
  [6, 4, 2, 2, '#7c3aed'],
  [9, 4, 2, 2, '#7c3aed'],
  // Void wisps
  [3, 10, 2, 3, '#1f1f1f'],
  [6, 13, 2, 2, '#0f0f0f'],
  [11, 10, 2, 3, '#1f1f1f'],
  // Hands
  [2, 7, 2, 3, '#1f1f1f'],
  [12, 7, 2, 3, '#1f1f1f'],
];

MONSTER_SPRITE_DATA.reality_ripper = [
  // Body - distorted
  [4, 4, 8, 8, '#4c1d95'],
  // Rift pattern
  [6, 5, 4, 6, '#7c3aed'],
  [7, 6, 2, 4, '#a855f7'],
  // Head
  [5, 1, 6, 4, '#581c87'],
  // Eyes - reality-warping
  [6, 2, 2, 2, '#f472b6'],
  [9, 2, 2, 2, '#22d3d1'],
  // Distortion claws
  [2, 5, 2, 5, '#7c3aed'],
  [1, 6, 1, 3, '#a855f7'],
  [12, 5, 2, 5, '#7c3aed'],
  [14, 6, 1, 3, '#a855f7'],
  // Legs
  [5, 12, 2, 3, '#4c1d95'],
  [9, 12, 2, 3, '#4c1d95'],
];

MONSTER_SPRITE_DATA.void_spawn = [
  // Body - small void creature
  [5, 6, 6, 6, '#1f1f1f'],
  [6, 5, 4, 1, '#0f0f0f'],
  // Head
  [5, 3, 6, 3, '#374151'],
  // Single large eye
  [6, 4, 4, 2, '#7c3aed'],
  [7, 4, 2, 2, '#a855f7'],
  [8, 5, 1, 1, '#e9d5ff'],
  // Tendrils
  [3, 7, 2, 2, '#374151'],
  [11, 7, 2, 2, '#374151'],
  // Legs
  [5, 12, 2, 2, '#1f1f1f'],
  [9, 12, 2, 2, '#1f1f1f'],
];

MONSTER_SPRITE_DATA.the_nameless_one = [
  // Massive void form
  [2, 3, 12, 11, '#0f0f0f'],
  [3, 2, 10, 1, '#1f1f1f'],
  // Central eye
  [5, 5, 6, 4, '#4c1d95'],
  [6, 6, 4, 2, '#7c3aed'],
  [7, 6, 2, 2, '#a855f7'],
  [8, 7, 1, 1, '#fef3c7'],
  // Smaller eyes
  [3, 6, 2, 2, '#ef4444'],
  [11, 6, 2, 2, '#22d3d1'],
  // Void tendrils
  [0, 6, 2, 6, '#1f1f1f'],
  [14, 6, 2, 6, '#1f1f1f'],
  // Crown of void
  [4, 0, 2, 2, '#7c3aed'],
  [7, 0, 2, 2, '#a855f7'],
  [10, 0, 2, 2, '#7c3aed'],
  // Lower mass
  [3, 13, 3, 2, '#1f1f1f'],
  [7, 14, 2, 1, '#0f0f0f'],
  [10, 13, 3, 2, '#1f1f1f'],
];

// Fallback aliases for different monster IDs
MONSTER_SPRITE_DATA.bat = MONSTER_SPRITE_DATA.giant_bat;
MONSTER_SPRITE_DATA.spider = MONSTER_SPRITE_DATA.giant_spider;

// ========================================
// WORLD BOSS SPRITES (32x32 scaled to 16x16)
// ========================================

// Crystal Guardian - Level 5
MONSTER_SPRITE_DATA.crystal_guardian = [
  // Crystal body core
  [5, 4, 6, 8, '#06b6d4'],
  [6, 3, 4, 1, '#22d3ee'],
  [7, 2, 2, 1, '#67e8f9'],
  // Crystal facets - left
  [3, 5, 2, 6, '#0891b2'],
  [2, 6, 1, 4, '#0e7490'],
  // Crystal facets - right
  [11, 5, 2, 6, '#0891b2'],
  [13, 6, 1, 4, '#0e7490'],
  // Eyes - glowing
  [6, 5, 2, 2, '#fef3c7'],
  [8, 5, 2, 2, '#fef3c7'],
  [7, 6, 1, 1, '#06b6d4'],
  [9, 6, 1, 1, '#06b6d4'],
  // Inner glow
  [7, 7, 2, 3, '#a5f3fc'],
  // Crystal arms
  [1, 7, 2, 3, '#0891b2'],
  [13, 7, 2, 3, '#0891b2'],
  // Base/legs
  [5, 12, 2, 3, '#0e7490'],
  [9, 12, 2, 3, '#0e7490'],
];

// Crypt Lord - Level 10
MONSTER_SPRITE_DATA.crypt_lord = [
  // Robes
  [4, 6, 8, 9, '#1e1b4b'],
  [3, 8, 2, 6, '#1e1b4b'],
  [11, 8, 2, 6, '#1e1b4b'],
  // Skull
  [5, 2, 6, 5, '#e5e7eb'],
  [6, 3, 4, 3, '#d1d5db'],
  // Eye sockets
  [6, 3, 2, 2, '#1f2937'],
  [8, 3, 2, 2, '#1f2937'],
  // Eye glow
  [6, 4, 1, 1, '#22d3ee'],
  [9, 4, 1, 1, '#22d3ee'],
  // Crown
  [5, 0, 6, 2, '#fbbf24'],
  [6, 0, 1, 1, '#f59e0b'],
  [8, 0, 1, 1, '#f59e0b'],
  // Staff
  [2, 4, 1, 10, '#78350f'],
  [1, 3, 3, 2, '#a855f7'],
];

// Forest Ancient - Level 15
MONSTER_SPRITE_DATA.forest_ancient = [
  // Tree trunk body
  [5, 4, 6, 10, '#78350f'],
  [4, 6, 2, 6, '#92400e'],
  [10, 6, 2, 6, '#92400e'],
  // Bark texture
  [6, 5, 1, 8, '#451a03'],
  [9, 5, 1, 8, '#451a03'],
  // Canopy/head
  [3, 0, 10, 5, '#15803d'],
  [2, 1, 2, 3, '#166534'],
  [12, 1, 2, 3, '#166534'],
  [5, 0, 6, 2, '#22c55e'],
  // Eyes
  [5, 5, 2, 2, '#84cc16'],
  [9, 5, 2, 2, '#84cc16'],
  [6, 6, 1, 1, '#fef3c7'],
  [10, 6, 1, 1, '#fef3c7'],
  // Roots
  [3, 13, 3, 2, '#78350f'],
  [10, 13, 3, 2, '#78350f'],
];

// Fallen King - Level 20
MONSTER_SPRITE_DATA.fallen_king = [
  // Armor body
  [4, 5, 8, 8, '#374151'],
  [3, 7, 2, 5, '#4b5563'],
  [11, 7, 2, 5, '#4b5563'],
  // Cape
  [3, 6, 2, 8, '#991b1b'],
  [11, 6, 2, 8, '#991b1b'],
  // Helmet
  [5, 2, 6, 4, '#6b7280'],
  [6, 1, 4, 1, '#9ca3af'],
  // Visor
  [6, 3, 4, 2, '#1f2937'],
  // Crown
  [5, 0, 6, 2, '#fbbf24'],
  // Eye glow
  [7, 4, 1, 1, '#ef4444'],
  [8, 4, 1, 1, '#ef4444'],
  // Sword
  [13, 3, 2, 10, '#9ca3af'],
  [13, 2, 2, 2, '#fbbf24'],
  // Legs
  [5, 13, 2, 2, '#374151'],
  [9, 13, 2, 2, '#374151'],
];

// Inferno Lord - Level 25
MONSTER_SPRITE_DATA.inferno_lord = [
  // Lava body
  [4, 4, 8, 9, '#dc2626'],
  [3, 6, 2, 6, '#f97316'],
  [11, 6, 2, 6, '#f97316'],
  // Core glow
  [6, 6, 4, 4, '#fbbf24'],
  [7, 7, 2, 2, '#fef3c7'],
  // Head
  [5, 1, 6, 4, '#dc2626'],
  // Horns
  [4, 0, 2, 3, '#1f2937'],
  [10, 0, 2, 3, '#1f2937'],
  // Eyes
  [6, 2, 2, 2, '#fef3c7'],
  [8, 2, 2, 2, '#fef3c7'],
  // Flames
  [2, 3, 2, 4, '#f97316'],
  [12, 3, 2, 4, '#f97316'],
  [1, 5, 1, 2, '#fbbf24'],
  [14, 5, 1, 2, '#fbbf24'],
  // Legs
  [5, 12, 2, 3, '#991b1b'],
  [9, 12, 2, 3, '#991b1b'],
];

// Void Emperor - Level 30
MONSTER_SPRITE_DATA.void_emperor = [
  // Ethereal body
  [4, 4, 8, 10, '#3b0764'],
  [3, 6, 2, 6, '#581c87'],
  [11, 6, 2, 6, '#581c87'],
  // Cosmic cloak
  [2, 5, 2, 8, '#1e1b4b'],
  [12, 5, 2, 8, '#1e1b4b'],
  // Head
  [5, 1, 6, 4, '#581c87'],
  // Crown of void
  [4, 0, 2, 2, '#a855f7'],
  [7, 0, 2, 1, '#c084fc'],
  [10, 0, 2, 2, '#a855f7'],
  // Eyes
  [6, 2, 2, 2, '#c084fc'],
  [8, 2, 2, 2, '#c084fc'],
  [7, 3, 1, 1, '#fef3c7'],
  [9, 3, 1, 1, '#fef3c7'],
  // Void energy
  [7, 6, 2, 3, '#c084fc'],
  [8, 7, 1, 1, '#e9d5ff'],
  // Floating particles
  [1, 2, 1, 1, '#a855f7'],
  [14, 3, 1, 1, '#a855f7'],
  [2, 12, 1, 1, '#c084fc'],
  [13, 11, 1, 1, '#c084fc'],
];

// ========================================
// RAID BOSS SPRITES (16x16 versions)
// ========================================

// Sunken Temple Bosses
MONSTER_SPRITE_DATA.boss_corrupted_priest = [
  // Robes - dark waterlogged
  [5, 4, 6, 9, '#1e3a5f'],
  [4, 6, 8, 7, '#1e3a5f'],
  // Hood
  [5, 1, 6, 4, '#0c2538'],
  // Face - corrupted green
  [6, 3, 4, 3, '#4a7c59'],
  // Glowing eyes
  [6, 4, 2, 1, '#22d3ee'],
  [8, 4, 2, 1, '#22d3ee'],
  // Staff
  [2, 3, 1, 11, '#78350f'],
  [1, 2, 3, 2, '#7c3aed'],
  // Water drips
  [3, 7, 1, 2, '#06b6d4'],
  [12, 8, 1, 2, '#06b6d4'],
  // Seaweed
  [4, 11, 1, 2, '#166534'],
  [11, 10, 1, 2, '#166534'],
];

MONSTER_SPRITE_DATA.boss_naga_queen = [
  // Serpent tail
  [2, 10, 12, 3, '#15803d'],
  [1, 11, 3, 3, '#166534'],
  [12, 12, 3, 2, '#166534'],
  // Humanoid torso
  [5, 5, 6, 5, '#4ade80'],
  [4, 6, 8, 3, '#22c55e'],
  // Head
  [5, 1, 5, 4, '#86efac'],
  // Crown
  [5, 0, 6, 2, '#fbbf24'],
  [6, 0, 1, 1, '#f59e0b'],
  [9, 0, 1, 1, '#f59e0b'],
  // Eyes
  [6, 2, 1, 1, '#fef08a'],
  [8, 2, 1, 1, '#fef08a'],
  // Trident
  [13, 2, 1, 8, '#fbbf24'],
  [12, 1, 1, 2, '#f59e0b'],
  [14, 1, 1, 2, '#f59e0b'],
];

MONSTER_SPRITE_DATA.boss_sea_serpent = [
  // Coiled body
  [2, 7, 4, 5, '#0891b2'],
  [5, 9, 6, 4, '#06b6d4'],
  [10, 7, 4, 5, '#0891b2'],
  // Head
  [5, 1, 6, 7, '#0e7490'],
  [4, 3, 8, 4, '#0891b2'],
  // Crest fins
  [4, 0, 2, 3, '#164e63'],
  [10, 0, 2, 3, '#164e63'],
  // Glowing eyes
  [5, 3, 2, 2, '#fef08a'],
  [9, 3, 2, 2, '#fef08a'],
  [6, 4, 1, 1, '#dc2626'],
  [10, 4, 1, 1, '#dc2626'],
  // Fangs
  [5, 6, 1, 2, '#f8fafc'],
  [9, 6, 1, 2, '#f8fafc'],
];

// Cursed Manor Bosses
MONSTER_SPRITE_DATA.boss_phantom_butler = [
  // Ghostly body
  [5, 4, 6, 8, '#a78bfa'],
  [4, 6, 8, 5, '#8b5cf6'],
  // Wispy bottom
  [4, 11, 2, 2, '#7c3aed'],
  [7, 12, 2, 2, '#7c3aed'],
  [10, 11, 2, 2, '#7c3aed'],
  // Head with top hat
  [5, 1, 5, 4, '#c4b5fd'],
  [5, 0, 6, 2, '#1c1917'],
  [4, 1, 8, 1, '#292524'],
  // Hollow eyes
  [6, 2, 1, 2, '#1e1b4b'],
  [8, 2, 1, 2, '#1e1b4b'],
  // Bow tie
  [7, 5, 2, 1, '#1c1917'],
  // Tray
  [1, 7, 5, 1, '#9ca3af'],
];

MONSTER_SPRITE_DATA.boss_banshee = [
  // Flowing dress
  [4, 5, 8, 7, '#c4b5fd'],
  [3, 7, 10, 5, '#a78bfa'],
  [2, 10, 3, 4, '#8b5cf6'],
  [11, 10, 3, 4, '#8b5cf6'],
  // Floating hair
  [3, 1, 10, 5, '#e9d5ff'],
  [2, 2, 3, 4, '#d8b4fe'],
  [11, 2, 3, 4, '#d8b4fe'],
  // Face
  [5, 3, 5, 4, '#f5f5f4'],
  // Dark hollow eyes
  [6, 4, 1, 2, '#0c0a09'],
  [8, 4, 1, 2, '#0c0a09'],
  // Screaming mouth
  [7, 6, 2, 1, '#0c0a09'],
];

// Also add an alias for the Queen variant
MONSTER_SPRITE_DATA.boss_banshee_queen = MONSTER_SPRITE_DATA.boss_banshee;

MONSTER_SPRITE_DATA.boss_vampire_lord = [
  // Cape spread
  [1, 4, 14, 10, '#7f1d1d'],
  [2, 5, 12, 8, '#991b1b'],
  // Inner cape red lining
  [4, 6, 8, 7, '#dc2626'],
  // Body - aristocratic suit
  [5, 5, 6, 8, '#1c1917'],
  [7, 6, 2, 2, '#f8fafc'], // Shirt
  // Head
  [5, 1, 5, 5, '#fafaf9'],
  // Slicked hair
  [5, 0, 6, 2, '#0c0a09'],
  [4, 1, 2, 2, '#1c1917'],
  [10, 1, 2, 2, '#1c1917'],
  // Red eyes
  [6, 2, 1, 1, '#ef4444'],
  [9, 2, 1, 1, '#ef4444'],
  // Fangs
  [6, 4, 1, 1, '#f8fafc'],
  [8, 4, 1, 1, '#f8fafc'],
  // Blood
  [7, 5, 1, 1, '#dc2626'],
];

MONSTER_SPRITE_DATA.boss_flesh_golem = [
  // Massive body
  [3, 4, 10, 9, '#6b7280'],
  [2, 6, 12, 6, '#4b5563'],
  // Head
  [5, 1, 6, 4, '#78716c'],
  // Stitches
  [7, 2, 2, 2, '#374151'],
  [5, 7, 6, 1, '#374151'],
  // Eyes - different sizes (misshapen)
  [5, 2, 2, 2, '#dc2626'],
  [9, 3, 2, 1, '#dc2626'],
  // Arms - thick
  [0, 5, 3, 6, '#6b7280'],
  [13, 5, 3, 6, '#6b7280'],
  // Legs
  [4, 13, 3, 2, '#4b5563'],
  [9, 13, 3, 2, '#4b5563'],
];

// Sky Fortress Bosses
MONSTER_SPRITE_DATA.boss_storm_wizard = [
  // Robes billowing
  [4, 5, 8, 9, '#3b82f6'],
  [3, 7, 10, 6, '#2563eb'],
  // Wizard hat
  [5, 0, 6, 2, '#1e40af'],
  [6, 1, 4, 2, '#1d4ed8'],
  [7, 2, 2, 2, '#2563eb'],
  [4, 3, 8, 1, '#1e40af'],
  // Face
  [5, 3, 5, 3, '#fde68a'],
  // Lightning eyes
  [6, 4, 1, 1, '#fef08a'],
  [9, 4, 1, 1, '#fef08a'],
  // Beard
  [6, 6, 4, 3, '#e5e7eb'],
  // Staff
  [13, 2, 1, 12, '#78350f'],
  [12, 0, 3, 3, '#fbbf24'],
  // Lightning
  [11, 1, 1, 1, '#fde047'],
];

MONSTER_SPRITE_DATA.boss_wind_elemental = [
  // Swirling wind form
  [4, 3, 8, 8, '#d1d5db'],
  [3, 5, 10, 4, '#e5e7eb'],
  [5, 2, 6, 2, '#f3f4f6'],
  // Core
  [6, 5, 4, 4, '#ffffff'],
  // Wind swirls
  [1, 4, 3, 1, '#9ca3af'],
  [12, 5, 3, 1, '#9ca3af'],
  [2, 8, 2, 1, '#9ca3af'],
  // Eyes
  [5, 5, 2, 2, '#0891b2'],
  [9, 5, 2, 2, '#0891b2'],
  // Trailing wisps
  [3, 11, 3, 2, '#d1d5db'],
  [10, 11, 3, 2, '#d1d5db'],
];

MONSTER_SPRITE_DATA.boss_lightning_golem = [
  // Body - crackling with energy
  [4, 4, 8, 8, '#fde047'],
  [3, 6, 10, 4, '#facc15'],
  // Core glow
  [6, 6, 4, 4, '#ffffff'],
  // Head
  [5, 1, 6, 4, '#fbbf24'],
  // Eyes
  [6, 2, 2, 2, '#0ea5e9'],
  [8, 2, 2, 2, '#0ea5e9'],
  // Lightning bolts
  [2, 5, 2, 1, '#38bdf8'],
  [12, 5, 2, 1, '#38bdf8'],
  [1, 7, 2, 1, '#67e8f9'],
  [13, 7, 2, 1, '#67e8f9'],
  // Arms
  [1, 5, 3, 5, '#f59e0b'],
  [12, 5, 3, 5, '#f59e0b'],
  // Legs
  [5, 12, 2, 3, '#eab308'],
  [9, 12, 2, 3, '#eab308'],
];

MONSTER_SPRITE_DATA.boss_storm_hawk = [
  // Body - sleek raptor
  [6, 4, 4, 5, '#3f3f46'],
  [7, 3, 2, 2, '#52525b'],
  // Wings spread wide with gradient
  [0, 5, 6, 3, '#52525b'],
  [10, 5, 6, 3, '#52525b'],
  [1, 4, 4, 2, '#71717a'],
  [11, 4, 4, 2, '#71717a'],
  [2, 3, 2, 2, '#a1a1aa'],
  [12, 3, 2, 2, '#a1a1aa'],
  // Head - fierce hawk, lighter gray
  [6, 1, 4, 3, '#71717a'],
  [5, 2, 6, 1, '#a1a1aa'],
  // Sharp beak - prominent
  [7, 3, 2, 2, '#f59e0b'],
  [8, 4, 1, 1, '#fbbf24'],
  // Electric eyes
  [6, 2, 1, 1, '#38bdf8'],
  [9, 2, 1, 1, '#38bdf8'],
  // Tail feathers - sharp
  [6, 9, 4, 3, '#3f3f46'],
  [7, 11, 2, 2, '#27272a'],
  [5, 10, 2, 2, '#52525b'],
  [9, 10, 2, 2, '#52525b'],
  // Talons
  [5, 8, 2, 1, '#f59e0b'],
  [10, 8, 2, 1, '#f59e0b'],
  // Lightning crackling on wings
  [2, 6, 1, 1, '#fde047'],
  [3, 5, 1, 1, '#fbbf24'],
  [14, 6, 1, 1, '#fde047'],
  [12, 5, 1, 1, '#fbbf24'],
  // Electric trail
  [0, 7, 1, 1, '#fde047'],
  [15, 7, 1, 1, '#fde047'],
];

MONSTER_SPRITE_DATA.boss_thunderbird = MONSTER_SPRITE_DATA.boss_storm_hawk;

MONSTER_SPRITE_DATA.boss_storm_lord = [
  // Humanoid storm torso
  [4, 5, 8, 8, '#d1d5db'],
  [3, 7, 10, 5, '#e5e7eb'],
  // Head
  [5, 1, 6, 5, '#f3f4f6'],
  [4, 2, 8, 3, '#e5e7eb'],
  // Lightning crown
  [4, 0, 2, 2, '#fde047'],
  [7, 0, 2, 1, '#fbbf24'],
  [10, 0, 2, 2, '#fde047'],
  [6, 0, 1, 1, '#fef08a'],
  [9, 0, 1, 1, '#fef08a'],
  // Lightning eyes
  [5, 2, 2, 2, '#0ea5e9'],
  [9, 2, 2, 2, '#0ea5e9'],
  [6, 3, 1, 1, '#fef08a'],
  [10, 3, 1, 1, '#fef08a'],
  // Storm mouth
  [6, 4, 4, 1, '#6b7280'],
  // Cloud arms
  [0, 6, 4, 4, '#d1d5db'],
  [12, 6, 4, 4, '#d1d5db'],
  [0, 9, 3, 2, '#9ca3af'],
  [13, 9, 3, 2, '#9ca3af'],
  // Lightning scepter in right hand
  [14, 3, 1, 8, '#fbbf24'],
  [13, 2, 2, 2, '#fde047'],
  [14, 1, 1, 1, '#fef08a'],
  // Storm base - swirling
  [3, 12, 10, 3, '#9ca3af'],
  [2, 13, 12, 2, '#6b7280'],
  // Rain below
  [4, 14, 1, 1, '#38bdf8'],
  [7, 15, 1, 1, '#38bdf8'],
  [10, 14, 1, 1, '#38bdf8'],
  // Lightning in body
  [5, 7, 1, 2, '#fde047'],
  [10, 8, 1, 2, '#fbbf24'],
];

MONSTER_SPRITE_DATA.boss_sky_titan = MONSTER_SPRITE_DATA.boss_storm_lord;

// The Abyss Bosses
MONSTER_SPRITE_DATA.boss_abyssal_horror = [
  // Massive dark body
  [2, 4, 12, 10, '#0f172a'],
  [1, 6, 14, 7, '#1e293b'],
  [3, 3, 10, 4, '#0f172a'],
  // Multiple eyes
  [3, 5, 2, 2, '#ef4444'],
  [6, 4, 2, 2, '#dc2626'],
  [10, 4, 2, 2, '#ef4444'],
  [4, 7, 1, 1, '#f87171'],
  [10, 6, 2, 2, '#f87171'],
  // Main eye
  [6, 6, 3, 3, '#fef08a'],
  [7, 7, 1, 1, '#0c0a09'],
  // Massive jaws
  [4, 10, 8, 4, '#0c0a09'],
  // Teeth
  [4, 10, 1, 2, '#f8fafc'],
  [6, 10, 1, 2, '#f8fafc'],
  [8, 10, 1, 2, '#f8fafc'],
  [10, 10, 1, 2, '#f8fafc'],
  // Tentacles
  [0, 7, 2, 5, '#1e293b'],
  [14, 7, 2, 5, '#1e293b'],
];

MONSTER_SPRITE_DATA.boss_kraken = [
  // Central head
  [5, 2, 6, 7, '#581c87'],
  [4, 4, 8, 4, '#7c3aed'],
  // Eyes
  [5, 4, 2, 2, '#fef08a'],
  [9, 4, 2, 2, '#fef08a'],
  [6, 4, 1, 1, '#0c0a09'],
  [9, 4, 1, 1, '#0c0a09'],
  // Beak
  [7, 7, 2, 2, '#1c1917'],
  // Tentacles spreading
  [0, 9, 4, 2, '#8b5cf6'],
  [12, 9, 4, 2, '#8b5cf6'],
  [1, 11, 3, 3, '#7c3aed'],
  [12, 11, 3, 3, '#7c3aed'],
  [3, 8, 2, 5, '#a78bfa'],
  [11, 8, 2, 5, '#a78bfa'],
  [5, 9, 2, 6, '#8b5cf6'],
  [9, 9, 2, 6, '#8b5cf6'],
  // Suckers
  [3, 10, 1, 1, '#c4b5fd'],
  [12, 10, 1, 1, '#c4b5fd'],
];

MONSTER_SPRITE_DATA.boss_deep_one_prophet = [
  // Robed body
  [4, 5, 8, 9, '#134e4a'],
  [3, 7, 10, 6, '#0f766e'],
  // Fishlike head
  [5, 1, 6, 5, '#0d9488'],
  // Fins
  [3, 1, 2, 3, '#115e59'],
  [11, 1, 2, 3, '#115e59'],
  // Large bulging eyes
  [5, 2, 2, 2, '#fef08a'],
  [9, 2, 2, 2, '#fef08a'],
  [6, 2, 1, 1, '#1e1b4b'],
  [9, 2, 1, 1, '#1e1b4b'],
  // Staff
  [13, 3, 1, 10, '#78350f'],
  [12, 1, 3, 3, '#7c3aed'],
  // Void glow
  [13, 2, 1, 1, '#c084fc'],
];

MONSTER_SPRITE_DATA.boss_leviathan = [
  // Massive serpentine body
  [0, 7, 16, 4, '#0c4a6e'],
  [2, 6, 12, 2, '#0369a1'],
  [4, 5, 8, 2, '#0284c7'],
  // Head rising
  [1, 1, 7, 7, '#0369a1'],
  [2, 2, 5, 5, '#0284c7'],
  // Crest fins
  [2, 0, 2, 2, '#075985'],
  [5, 0, 2, 2, '#075985'],
  // Eyes
  [2, 3, 2, 2, '#fef08a'],
  [5, 3, 2, 2, '#fef08a'],
  [3, 3, 1, 1, '#dc2626'],
  [6, 3, 1, 1, '#dc2626'],
  // Jaws with teeth
  [2, 6, 5, 2, '#0c4a6e'],
  [2, 6, 1, 1, '#f8fafc'],
  [4, 7, 1, 1, '#f8fafc'],
  // Body coils
  [9, 2, 5, 5, '#0369a1'],
  // Scale highlights
  [3, 7, 1, 1, '#38bdf8'],
  [7, 8, 1, 1, '#38bdf8'],
  [11, 7, 1, 1, '#38bdf8'],
];

// Void Throne Bosses
MONSTER_SPRITE_DATA.boss_void_sentinel = [
  // Armored void being
  [4, 3, 8, 10, '#1e1b4b'],
  [3, 5, 10, 7, '#312e81'],
  // Helmet
  [5, 1, 6, 4, '#3730a3'],
  [4, 2, 8, 2, '#4338ca'],
  // Visor glow
  [5, 2, 5, 1, '#c084fc'],
  // Shoulders
  [1, 5, 3, 3, '#4338ca'],
  [12, 5, 3, 3, '#4338ca'],
  // Void sword
  [14, 2, 2, 10, '#6366f1'],
  [14, 1, 1, 2, '#818cf8'],
  // Void energy core
  [7, 7, 2, 2, '#7c3aed'],
  [7, 8, 1, 1, '#a855f7'],
  // Legs
  [5, 12, 2, 3, '#312e81'],
  [9, 12, 2, 3, '#312e81'],
];

MONSTER_SPRITE_DATA.boss_void_stalker_prime = [
  // Sleek predator body - crouched
  [3, 4, 10, 7, '#1e1b4b'],
  [2, 6, 12, 4, '#312e81'],
  // Angular predatory head
  [4, 1, 8, 4, '#3730a3'],
  [3, 2, 10, 2, '#1e1b4b'],
  // Narrow visor - menacing
  [4, 2, 8, 1, '#c084fc'],
  [5, 2, 2, 1, '#e9d5ff'],
  [9, 2, 2, 1, '#e9d5ff'],
  // Bladed shoulders
  [0, 5, 3, 3, '#4338ca'],
  [13, 5, 3, 3, '#4338ca'],
  [0, 4, 2, 2, '#3730a3'],
  [14, 4, 2, 2, '#3730a3'],
  // Arm blades - void energy
  [0, 8, 3, 1, '#6366f1'],
  [13, 8, 3, 1, '#6366f1'],
  [0, 7, 1, 2, '#818cf8'],
  [15, 7, 1, 2, '#818cf8'],
  // Void energy core
  [7, 6, 2, 2, '#7c3aed'],
  [7, 7, 1, 1, '#a855f7'],
  // Legs - digitigrade stalker
  [4, 11, 2, 3, '#312e81'],
  [10, 11, 2, 3, '#312e81'],
  [3, 13, 2, 2, '#1e1b4b'],
  [11, 13, 2, 2, '#1e1b4b'],
  // Void trail
  [6, 12, 4, 1, '#3730a3'],
  [7, 13, 2, 1, '#4c1d95'],
  // Energy particles
  [1, 3, 1, 1, '#8b5cf6'],
  [14, 3, 1, 1, '#8b5cf6'],
];

MONSTER_SPRITE_DATA.boss_reality_ripper = [
  // Fragmented body
  [4, 3, 4, 5, '#7c3aed'],
  [8, 4, 4, 4, '#8b5cf6'],
  [3, 7, 5, 4, '#6d28d9'],
  [8, 8, 5, 4, '#5b21b6'],
  // Floating head
  [5, 0, 6, 4, '#a78bfa'],
  [6, 1, 4, 2, '#c4b5fd'],
  // Eyes - different sizes
  [6, 1, 1, 1, '#fef08a'],
  [8, 1, 2, 2, '#fef08a'],
  // Reality tears
  [2, 4, 1, 3, '#f0abfc'],
  [13, 5, 1, 4, '#e879f9'],
  [7, 2, 1, 2, '#f5d0fe'],
  // Floating fragments
  [0, 6, 2, 2, '#7c3aed'],
  [14, 7, 2, 2, '#8b5cf6'],
];

MONSTER_SPRITE_DATA.boss_reality_ripper_alpha = MONSTER_SPRITE_DATA.boss_reality_ripper;

MONSTER_SPRITE_DATA.boss_null_shade = [
  // Pure void form
  [4, 2, 8, 10, '#09090b'],
  [3, 4, 10, 6, '#0c0a09'],
  // Outline glow
  [3, 2, 1, 10, '#4c1d95'],
  [12, 2, 1, 10, '#4c1d95'],
  [4, 1, 8, 1, '#4c1d95'],
  [4, 12, 8, 1, '#4c1d95'],
  // Void eyes
  [5, 5, 2, 2, '#18181b'],
  [9, 5, 2, 2, '#18181b'],
  // Anti-light core
  [7, 7, 2, 2, '#18181b'],
  // Wispy edges
  [2, 6, 1, 3, '#3b0764'],
  [13, 5, 1, 4, '#3b0764'],
];

MONSTER_SPRITE_DATA.boss_null_shade_omega = MONSTER_SPRITE_DATA.boss_null_shade;

MONSTER_SPRITE_DATA.boss_entropy_avatar = [
  // Decaying form
  [4, 3, 8, 10, '#581c87'],
  [3, 5, 10, 6, '#6d28d9'],
  // Head - crumbling
  [5, 1, 6, 4, '#7c3aed'],
  // Eyes - time-warped
  [6, 2, 2, 2, '#c084fc'],
  [9, 2, 2, 2, '#c084fc'],
  // Decay particles
  [2, 4, 1, 1, '#a855f7'],
  [13, 5, 1, 1, '#a855f7'],
  [3, 9, 1, 1, '#8b5cf6'],
  [12, 10, 1, 1, '#8b5cf6'],
  // Fading edges
  [3, 11, 2, 2, '#4c1d95'],
  [11, 11, 2, 2, '#4c1d95'],
];

MONSTER_SPRITE_DATA.boss_void_god = [
  // Massive void entity
  [2, 3, 12, 11, '#0c0a09'],
  [1, 5, 14, 8, '#18181b'],
  // Crown of void energy
  [4, 0, 8, 3, '#4c1d95'],
  [5, 0, 2, 2, '#7c3aed'],
  [9, 0, 2, 2, '#7c3aed'],
  [7, 0, 2, 1, '#a855f7'],
  // Multiple void eyes
  [4, 5, 2, 2, '#c084fc'],
  [9, 5, 2, 2, '#c084fc'],
  [7, 6, 2, 2, '#a855f7'],
  // Void pupils
  [5, 5, 1, 1, '#0c0a09'],
  [10, 5, 1, 1, '#0c0a09'],
  [7, 6, 1, 1, '#0c0a09'],
  // Void tendrils
  [0, 7, 2, 5, '#1e1b4b'],
  [14, 7, 2, 5, '#1e1b4b'],
  // Reality dissolving
  [1, 4, 1, 1, '#6366f1'],
  [14, 5, 1, 1, '#6366f1'],
];

MONSTER_SPRITE_DATA.boss_void_emperor = MONSTER_SPRITE_DATA.boss_void_god;

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
