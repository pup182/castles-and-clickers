// State validation middleware - catches bugs early by checking state integrity
export const validateState = (state) => {
  const errors = [];

  // Check heroes array - no undefined gaps in middle
  if (state.heroes) {
    const maxPartySize = state.maxPartySize || 4;

    // Check heroes don't exceed max party size
    if (state.heroes.length > maxPartySize) {
      errors.push(`Heroes array length (${state.heroes.length}) exceeds maxPartySize (${maxPartySize})`);
    }

    // Check for actual heroes beyond max party size
    const heroCount = state.heroes.filter(Boolean).length;
    if (heroCount > maxPartySize) {
      errors.push(`Too many heroes (${heroCount}) for maxPartySize (${maxPartySize})`);
    }

    const lastValidIndex = state.heroes.reduce((last, h, i) => h ? i : last, -1);
    state.heroes.forEach((h, i) => {
      if (!h && i < lastValidIndex) {
        errors.push(`Hero slot ${i} is undefined but slot ${lastValidIndex} has a hero`);
      }
    });

    // Check for duplicate hero IDs
    const heroIds = state.heroes.filter(Boolean).map(h => h.id);
    const uniqueIds = new Set(heroIds);
    if (heroIds.length !== uniqueIds.size) {
      errors.push(`Duplicate hero IDs detected: ${heroIds.filter((id, i) => heroIds.indexOf(id) !== i)}`);
    }

    // Check heroes have required fields
    state.heroes.filter(Boolean).forEach((h, i) => {
      if (!h.id) errors.push(`Hero at slot ${i} missing id`);
      if (!h.classId) errors.push(`Hero ${h.id || i} missing classId`);
      if (!h.name) errors.push(`Hero ${h.id || i} missing name`);
    });
  }

  // Check heroHp doesn't have orphaned summon IDs
  if (state.heroHp) {
    Object.keys(state.heroHp).forEach(id => {
      if (id.startsWith('pet_') || id.startsWith('clone_') || id.startsWith('undead_')) {
        errors.push(`heroHp contains summon ID: ${id}`);
      }
    });
  }

  // Check stats.heroStats doesn't have summon IDs
  if (state.stats?.heroStats) {
    Object.keys(state.stats.heroStats).forEach(id => {
      if (id.startsWith('pet_') || id.startsWith('clone_') || id.startsWith('undead_')) {
        errors.push(`stats.heroStats contains summon ID: ${id}`);
      }
    });
  }

  // Log errors to console (dev only)
  if (errors.length > 0 && typeof window !== 'undefined') {
    console.warn('[GameState Validation]', errors.length, 'issues found:', errors);
  }

  return errors;
};

// Validation middleware for Zustand
export const validationMiddleware = (config) => (set, get, api) =>
  config(
    (...args) => {
      set(...args);
      // Validate after state change (throttled to avoid spam)
      if (!validationMiddleware._timeout) {
        validationMiddleware._timeout = setTimeout(() => {
          validationMiddleware._timeout = null;
          validateState(get());
        }, 1000);
      }
    },
    get,
    api
  );
validationMiddleware._timeout = null;
