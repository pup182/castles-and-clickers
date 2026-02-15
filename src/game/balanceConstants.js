/**
 * Centralized combat balance constants.
 * All core combat numbers a designer would tune live here.
 * Skill-specific data and unique item effects stay in their respective files.
 */

// --- Speed / Dodge ---
export const SPEED_THRESHOLD = 4;           // Min speed before dodge kicks in
export const BASE_DODGE_PER_SPEED = 0.06;   // Dodge % per speed point above threshold
export const SPEED_BONUS_PER_DIFF = 0.05;   // Bonus dodge % per speed advantage
export const MAX_DODGE_CHANCE = 0.70;        // Hard cap on dodge

// --- Double Attack ---
export const DOUBLE_ATTACK_PER_SPEED = 0.03; // 3% per speed advantage
export const MAX_DOUBLE_ATTACK = 0.30;        // Hard cap on double-attack chance
export const DOUBLE_ATTACK_DAMAGE = 0.60;     // 60% of base damage on double hit

// --- Damage Formula ---
export const DEFENSE_REDUCTION_MULTIPLIER = 0.5;  // defense * 0.5 subtracted from attack
export const DAMAGE_VARIANCE_MIN = 0.85;           // Low end of damage roll
export const DAMAGE_VARIANCE_RANGE = 0.30;         // Width of damage roll (0.85–1.15)
export const BASE_CRIT_MULTIPLIER = 1.5;           // Base crit damage multiplier

// --- Crit Chances ---
export const BASE_CRIT_CHANCE_DPS = 0.10;   // DPS classes base crit
export const BASE_CRIT_CHANCE_OTHER = 0.05;  // Non-DPS base crit
export const DPS_CLASSES = ['mage', 'ranger', 'rogue', 'necromancer', 'bard'];

// --- HP Thresholds (used by skill AI) ---
export const HP_CRITICAL = 0.25;  // Emergency heal threshold
export const HP_LOW = 0.50;       // Standard heal threshold
export const HP_HURT = 0.75;      // Defensive buff threshold

// --- Loot Drop Chances ---
export const BOSS_LOOT_DROP_CHANCE = 0.90;    // 90% for dungeon bosses
export const NORMAL_LOOT_DROP_CHANCE = 0.25;  // 25% for normal mobs

// --- Chain Attack (Serpent's Fang unique) ---
export const CHAIN_ATTACK_MAX = 10;             // Max chain hits
export const CHAIN_ATTACK_CONTINUE_CHANCE = 0.50; // Chance to continue chaining
export const CHAIN_ATTACK_DECAY = 0.50;          // Damage multiplier per chain

// --- Movement ---
export const MOVE_DISTANCE_PER_SPEED = 8;  // +1 tile per N speed
export const MAX_MOVE_DISTANCE = 3;         // Max tiles per move

// --- AOE / Cleave ---
export const AOE_BUFF_DAMAGE = 0.80;       // 80% dmg for Ascendance AoE attacks
export const COUNTER_ATTACK_DAMAGE = 0.50;  // 50% of attack stat for counter

// --- Summon Stat Multipliers ---
export const PET_DODGE_BONUS = 0.25;               // Pets get 25% extra dodge
export const SHADOW_CLONE_HP_PERCENT = 0.30;        // Clone HP = 30% of hero HP
export const SHADOW_CLONE_DEFENSE_PERCENT = 0.50;   // Clone defense = 50% of hero
export const RAISED_UNDEAD_HP_PERCENT = 0.50;       // Undead HP = 50% of monster HP
export const RAISED_UNDEAD_ATTACK_PERCENT = 0.70;   // Undead attack = 70% of monster
export const RAISED_UNDEAD_DEFENSE_PERCENT = 0.50;  // Undead defense = 50% of monster

// --- Soul Reap (unique on-kill) ---
export const SOUL_REAP_BONUS_PER_STACK = 0.05;  // 5% damage per soul stack
