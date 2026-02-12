// Animation manager - handles combat effects with object pooling
// Max 8 concurrent effects to maintain performance

import { drawSkillIcon } from './sprites/SkillSprites';

export class AnimationManager {
  constructor(tileSize) {
    this.tileSize = tileSize;

    // Active effects
    this.effects = [];

    // Effect callback
    this.onEffectComplete = null;

    // Max concurrent effects
    this.maxEffects = 8;
  }

  // Set effect completion callback
  setCallback(callback) {
    this.onEffectComplete = callback;
  }

  // Add a new effect
  addEffect(effect) {
    // Enforce max limit
    if (this.effects.length >= this.maxEffects) {
      // Remove oldest effect
      const oldest = this.effects.shift();
      if (this.onEffectComplete) {
        this.onEffectComplete(oldest.id);
      }
    }

    // Create effect instance with start time
    const effectInstance = {
      ...effect,
      startTime: performance.now(),
      elapsed: 0,
    };

    this.effects.push(effectInstance);
  }

  // Update all effects - optimized to avoid O(n²) removal
  update(deltaTime) {
    const now = performance.now();
    let writeIndex = 0;

    for (let i = 0; i < this.effects.length; i++) {
      const effect = this.effects[i];
      effect.elapsed = now - effect.startTime;

      const duration = this.getEffectDuration(effect.type);
      if (effect.elapsed >= duration) {
        // Effect complete - notify and skip
        if (this.onEffectComplete) {
          this.onEffectComplete(effect.id);
        }
      } else {
        // Keep effect - compact in place
        this.effects[writeIndex++] = effect;
      }
    }

    // Truncate array to remove completed effects
    this.effects.length = writeIndex;
  }

  // Get effect duration in milliseconds
  getEffectDuration(type) {
    const durations = {
      damage: 1000,
      crit: 1200,
      healBurst: 800,
      beam: 500,
      impact: 350,
      death: 900,
      dart: 800,
      buffAura: 1600,
      aoeGround: 1300,
      status: 1600,
      skillActivation: 1500,
      lootDrop: 1500,
      goldDrop: 1200,
      legendaryDrop: 2500, // Longer duration for legendary celebration
    };
    return durations[type] || 1000;
  }

  // Render all active effects
  render(ctx, cameraPos) {
    for (const effect of this.effects) {
      this.renderEffect(ctx, cameraPos, effect);
    }
  }

  // Render a single effect
  renderEffect(ctx, cameraPos, effect) {
    const duration = this.getEffectDuration(effect.type);
    const progress = Math.min(1, effect.elapsed / duration);

    switch (effect.type) {
      case 'damage':
        this.renderDamageNumber(ctx, cameraPos, effect, progress);
        break;
      case 'crit':
        this.renderCritNumber(ctx, cameraPos, effect, progress);
        break;
      case 'healBurst':
        this.renderHealBurst(ctx, cameraPos, effect, progress);
        break;
      case 'beam':
        this.renderBeam(ctx, cameraPos, effect, progress);
        break;
      case 'impact':
        this.renderImpact(ctx, cameraPos, effect, progress);
        break;
      case 'death':
        this.renderDeath(ctx, cameraPos, effect, progress);
        break;
      case 'dart':
        this.renderDart(ctx, cameraPos, effect, progress);
        break;
      case 'buffAura':
        this.renderBuffAura(ctx, cameraPos, effect, progress);
        break;
      case 'aoeGround':
        this.renderAOEGround(ctx, cameraPos, effect, progress);
        break;
      case 'status':
        this.renderStatusFloat(ctx, cameraPos, effect, progress);
        break;
      case 'skillActivation':
        this.renderSkillActivation(ctx, cameraPos, effect, progress);
        break;
      case 'lootDrop':
        this.renderLootDrop(ctx, cameraPos, effect, progress);
        break;
      case 'goldDrop':
        this.renderGoldDrop(ctx, cameraPos, effect, progress);
        break;
      case 'legendaryDrop':
        this.renderLegendaryDrop(ctx, cameraPos, effect, progress);
        break;
    }
  }

  // Render floating damage number
  renderDamageNumber(ctx, cameraPos, effect, progress) {
    const pos = effect.position;
    const screenX = (pos.x - cameraPos.x) * this.tileSize + this.tileSize / 2;
    const screenY = (pos.y - cameraPos.y) * this.tileSize + this.tileSize / 2;

    // Float upward and fade
    const offsetY = -30 * progress;
    const alpha = 1 - progress;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillText(`${effect.isHeal ? '+' : '-'}${effect.damage}`, screenX + 2, screenY + offsetY + 2);

    // Main text
    ctx.fillStyle = effect.isHeal ? '#22c55e' : '#ef4444';
    ctx.fillText(`${effect.isHeal ? '+' : '-'}${effect.damage}`, screenX, screenY + offsetY);

    ctx.restore();
  }

  // Render critical hit number
  renderCritNumber(ctx, cameraPos, effect, progress) {
    const pos = effect.position;
    const screenX = (pos.x - cameraPos.x) * this.tileSize + this.tileSize / 2;
    const screenY = (pos.y - cameraPos.y) * this.tileSize + this.tileSize / 2;

    const offsetY = -40 * progress;
    const scale = 1 + Math.sin(progress * Math.PI) * 0.3;
    const alpha = 1 - progress;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = `bold ${Math.floor(22 * scale)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Glow
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 10;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillText(`CRIT! -${effect.damage}`, screenX + 2, screenY + offsetY + 2);

    // Main text
    ctx.fillStyle = '#fbbf24';
    ctx.fillText(`CRIT! -${effect.damage}`, screenX, screenY + offsetY);

    ctx.restore();
  }

  // Render healing burst
  renderHealBurst(ctx, cameraPos, effect, progress) {
    const pos = effect.position;
    const screenX = (pos.x - cameraPos.x) * this.tileSize + this.tileSize / 2;
    const screenY = (pos.y - cameraPos.y) * this.tileSize + this.tileSize / 2;

    const radius = 20 + 20 * progress;
    const alpha = 0.6 * (1 - progress);

    ctx.save();
    ctx.globalAlpha = alpha;

    const gradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, radius);
    gradient.addColorStop(0, 'rgba(34, 197, 94, 0.8)');
    gradient.addColorStop(1, 'rgba(34, 197, 94, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Render attack beam
  renderBeam(ctx, cameraPos, effect, progress) {
    const from = effect.from;
    const to = effect.to;

    const fromX = (from.x - cameraPos.x) * this.tileSize + this.tileSize / 2;
    const fromY = (from.y - cameraPos.y) * this.tileSize + this.tileSize / 2;
    const toX = (to.x - cameraPos.x) * this.tileSize + this.tileSize / 2;
    const toY = (to.y - cameraPos.y) * this.tileSize + this.tileSize / 2;

    const beamProgress = Math.min(1, progress / 0.6);
    const fadeProgress = Math.max(0, (progress - 0.6) / 0.4);
    const alpha = 1 - fadeProgress;

    const currentX = fromX + (toX - fromX) * beamProgress;
    const currentY = fromY + (toY - fromY) * beamProgress;

    const color = this.getClassColor(effect.attackerClass);

    ctx.save();
    ctx.globalAlpha = alpha;

    // Beam line
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(currentX, currentY);
    ctx.stroke();

    // Glow
    ctx.shadowColor = color;
    ctx.shadowBlur = 15;

    // Projectile tip
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(currentX, currentY, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Render impact burst
  renderImpact(ctx, cameraPos, effect, progress) {
    const pos = effect.position;
    const screenX = (pos.x - cameraPos.x) * this.tileSize + this.tileSize / 2;
    const screenY = (pos.y - cameraPos.y) * this.tileSize + this.tileSize / 2;

    const radius = 10 + 30 * progress;
    const alpha = 1 - progress;
    const color = effect.color || '#ef4444';

    ctx.save();
    ctx.globalAlpha = alpha;

    // Ring
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Particles
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const particleX = screenX + Math.cos(angle) * radius * 0.8;
      const particleY = screenY + Math.sin(angle) * radius * 0.8;

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(particleX, particleY, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // Render death effect - pixel art skull that rises and fades
  renderDeath(ctx, cameraPos, effect, progress) {
    const pos = effect.position;
    const screenX = (pos.x - cameraPos.x) * this.tileSize + this.tileSize / 2;
    const screenY = (pos.y - cameraPos.y) * this.tileSize + this.tileSize / 2;

    // Rise up as it fades
    const riseAmount = progress * 20;
    const alpha = 1 - progress;
    const scale = 1 + progress * 0.3;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(screenX, screenY - riseAmount);
    ctx.scale(scale, scale);
    ctx.translate(-screenX, -(screenY - riseAmount));

    // Pixel art skull (16x16 scaled)
    const s = 2; // pixel scale
    const ox = screenX - 8 * s; // offset to center
    const oy = screenY - riseAmount - 8 * s;

    const P = (x, y, color, w = 1, h = 1) => {
      ctx.fillStyle = color;
      ctx.fillRect(ox + x * s, oy + y * s, w * s, h * s);
    };

    // Skull outline and fill
    const bone = '#e8e4d9';
    const boneDark = '#c9c4b8';
    const boneLight = '#f5f2ea';
    const shadow = '#8b8680';
    const dark = '#2a2a2a';

    // Top of skull
    P(5, 1, bone, 6, 1);
    P(4, 2, bone, 8, 1);
    P(3, 3, bone, 10, 1);
    P(2, 4, bone, 12, 1);
    P(2, 5, bone, 12, 1);
    P(2, 6, bone, 12, 1);
    P(2, 7, bone, 12, 1);
    P(3, 8, bone, 10, 1);
    P(4, 9, bone, 8, 1);

    // Jaw
    P(5, 10, bone, 6, 1);
    P(4, 11, bone, 8, 1);
    P(5, 12, bone, 6, 1);

    // Eye sockets (dark)
    P(4, 5, dark, 3, 3);
    P(9, 5, dark, 3, 3);

    // Eye socket highlights (red glow)
    P(5, 6, '#dc2626', 1, 1);
    P(10, 6, '#dc2626', 1, 1);

    // Nose hole
    P(7, 8, dark, 2, 2);

    // Teeth
    P(5, 11, dark, 1, 1);
    P(7, 11, dark, 1, 1);
    P(9, 11, dark, 1, 1);

    // Skull shading
    P(2, 4, boneDark, 1, 4);
    P(13, 4, shadow, 1, 4);
    P(3, 3, boneLight, 2, 1);
    P(4, 2, boneLight, 2, 1);

    ctx.restore();
  }

  // Render dart attack (rogue dash)
  renderDart(ctx, cameraPos, effect, progress) {
    const from = effect.from;
    const to = effect.to;

    const fromX = (from.x - cameraPos.x) * this.tileSize + this.tileSize / 2;
    const fromY = (from.y - cameraPos.y) * this.tileSize + this.tileSize / 2;
    const toX = (to.x - cameraPos.x) * this.tileSize + this.tileSize / 2;
    const toY = (to.y - cameraPos.y) * this.tileSize + this.tileSize / 2;

    // Three phases: dash forward, strike, return
    let pos, phase;
    if (progress < 0.35) {
      phase = 'forward';
      pos = progress / 0.35;
    } else if (progress < 0.55) {
      phase = 'strike';
      pos = 1;
    } else {
      phase = 'back';
      pos = 1 - ((progress - 0.55) / 0.45);
    }

    const targetX = fromX + (toX - fromX) * 0.75;
    const targetY = fromY + (toY - fromY) * 0.75;
    const currentX = fromX + (targetX - fromX) * pos;
    const currentY = fromY + (targetY - fromY) * pos;

    ctx.save();

    // Trail
    if (phase !== 'strike') {
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(fromX + (currentX - fromX) * 0.3, fromY + (currentY - fromY) * 0.3, 16, 0, Math.PI * 2);
      ctx.fill();
    }

    // Character
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#047857';
    ctx.beginPath();
    ctx.arc(currentX, currentY, 18, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Strike flash
    if (phase === 'strike') {
      ctx.fillStyle = 'rgba(16, 185, 129, 0.5)';
      ctx.beginPath();
      ctx.arc(targetX, targetY, 30, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // Render buff aura
  renderBuffAura(ctx, cameraPos, effect, progress) {
    const pos = effect.position;
    const screenX = (pos.x - cameraPos.x) * this.tileSize + this.tileSize / 2;
    const screenY = (pos.y - cameraPos.y) * this.tileSize + this.tileSize / 2;

    const pulse = Math.sin(progress * Math.PI * 4) * 0.2 + 0.8;
    const radius = 25 * pulse;
    const alpha = 0.5 * (1 - progress * 0.5);
    const color = effect.color || '#3b82f6';

    ctx.save();
    ctx.globalAlpha = alpha;

    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Inner glow
    const gradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, radius);
    gradient.addColorStop(0, `${color}40`);
    gradient.addColorStop(1, `${color}00`);
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.restore();
  }

  // Render AOE ground effect
  renderAOEGround(ctx, cameraPos, effect, progress) {
    const pos = effect.position;
    const screenX = (pos.x - cameraPos.x) * this.tileSize + this.tileSize / 2;
    const screenY = (pos.y - cameraPos.y) * this.tileSize + this.tileSize / 2;

    const color = effect.color || '#ef4444';

    ctx.save();

    // Multiple expanding rings
    for (let i = 0; i < 3; i++) {
      const ringProgress = Math.max(0, Math.min(1, (progress * 1.5 - i * 0.1)));
      const radius = 40 * ringProgress;
      const alpha = 0.6 * (1 - ringProgress);

      ctx.globalAlpha = alpha;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  // Render floating status icon
  renderStatusFloat(ctx, cameraPos, effect, progress) {
    const pos = effect.position;
    const screenX = (pos.x - cameraPos.x) * this.tileSize + this.tileSize / 2;
    const screenY = (pos.y - cameraPos.y) * this.tileSize;

    const offsetY = -20 + Math.sin(progress * Math.PI * 3) * 5;
    const alpha = progress < 0.8 ? 1 : (1 - progress) / 0.2;

    const color = this.getStatusColor(effect.status);

    ctx.save();
    ctx.globalAlpha = alpha;

    // Icon background
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(screenX, screenY + offsetY, 10, 0, Math.PI * 2);
    ctx.fill();

    // Icon text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.getStatusSymbol(effect.status), screenX, screenY + offsetY);

    ctx.restore();
  }

  // Render skill activation
  renderSkillActivation(ctx, cameraPos, effect, progress) {
    const pos = effect.position;
    const screenX = (pos.x - cameraPos.x) * this.tileSize + this.tileSize / 2;
    const screenY = (pos.y - cameraPos.y) * this.tileSize - 30;

    let scale, alpha, textAlpha;
    if (progress < 0.15) {
      scale = 0.5 + (progress / 0.15) * 1;
      alpha = progress / 0.15;
      textAlpha = 0;
    } else if (progress < 0.7) {
      scale = 1.5;
      alpha = 1;
      textAlpha = Math.min(1, (progress - 0.15) / 0.1);
    } else {
      scale = 1.5 - ((progress - 0.7) / 0.3) * 0.5;
      alpha = 1 - (progress - 0.7) / 0.3;
      textAlpha = alpha;
    }

    ctx.save();

    // Skill icon circle with scaling
    ctx.globalAlpha = alpha;
    ctx.translate(screenX, screenY);
    ctx.scale(scale, scale);
    ctx.translate(-screenX, -screenY);

    // Glow effect
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 15;

    // Background circle
    ctx.fillStyle = '#6366f1';
    ctx.beginPath();
    ctx.arc(screenX, screenY, 16, 0, Math.PI * 2);
    ctx.fill();

    // Border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Disable shadow for skill icon
    ctx.shadowBlur = 0;

    // Draw skill icon (pixel art) - import from SkillSprites
    if (effect.skill?.id) {
      drawSkillIcon(ctx, effect.skill.id, screenX - 12, screenY - 12, 24);
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // Skill name below
    if (effect.skill?.name && textAlpha > 0) {
      ctx.globalAlpha = textAlpha;
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      // Background for text
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      const textWidth = ctx.measureText(effect.skill.name).width;
      ctx.fillRect(screenX - textWidth / 2 - 4, screenY + 20, textWidth + 8, 14);
      // Text
      ctx.fillStyle = '#ffffff';
      ctx.fillText(effect.skill.name, screenX, screenY + 22);
    }

    ctx.restore();
  }

  // Get color based on class
  getClassColor(classId) {
    const colors = {
      mage: '#a855f7',
      cleric: '#eab308',
      rogue: '#10b981',
      warrior: '#3b82f6',
      monster: '#ef4444',
    };
    return colors[classId] || '#ffffff';
  }

  // Get status effect color
  getStatusColor(status) {
    const colors = {
      poison: '#22c55e',
      stun: '#fbbf24',
      slow: '#3b82f6',
      burn: '#ef4444',
      bleed: '#dc2626',
      buff: '#22c55e',
      debuff: '#ef4444',
    };
    return colors[status] || '#6b7280';
  }

  // Get status symbol
  getStatusSymbol(status) {
    const symbols = {
      poison: 'P',
      stun: '!',
      slow: 'S',
      burn: 'F',
      bleed: 'B',
    };
    return symbols[status] || '?';
  }

  // Render loot drop effect - item pops up then floats away
  renderLootDrop(ctx, cameraPos, effect, progress) {
    const pos = effect.position;
    const screenX = (pos.x - cameraPos.x) * this.tileSize + this.tileSize / 2;
    const screenY = (pos.y - cameraPos.y) * this.tileSize + this.tileSize / 2;

    // Pop up then float up and fade
    let offsetY, scale, alpha;
    if (progress < 0.2) {
      // Pop up phase
      const popProgress = progress / 0.2;
      offsetY = -20 * popProgress;
      scale = 0.5 + popProgress * 0.8;
      alpha = popProgress;
    } else {
      // Float and fade phase
      const floatProgress = (progress - 0.2) / 0.8;
      offsetY = -20 - 30 * floatProgress;
      scale = 1.3 - floatProgress * 0.3;
      alpha = 1 - floatProgress;
    }

    const rarityColor = effect.rarityColor || '#9ca3af';

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(screenX, screenY + offsetY);
    ctx.scale(scale, scale);

    // Glow behind item
    ctx.shadowColor = rarityColor;
    ctx.shadowBlur = 12;

    // Item background (chest/bag icon)
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(-10, -10, 20, 20);
    ctx.strokeStyle = rarityColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(-10, -10, 20, 20);

    // Item slot icon based on type
    ctx.fillStyle = rarityColor;
    const slot = effect.slot || 'weapon';
    if (slot === 'weapon') {
      // Sword shape
      ctx.fillRect(-2, -8, 4, 12);
      ctx.fillRect(-4, 2, 8, 4);
    } else if (slot === 'armor') {
      // Armor shape
      ctx.fillRect(-6, -6, 12, 10);
      ctx.fillRect(-4, 4, 8, 4);
    } else {
      // Ring shape (accessory)
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  // Render gold drop effect - coins scatter
  renderGoldDrop(ctx, cameraPos, effect, progress) {
    const pos = effect.position;
    const screenX = (pos.x - cameraPos.x) * this.tileSize + this.tileSize / 2;
    const screenY = (pos.y - cameraPos.y) * this.tileSize + this.tileSize / 2;

    const alpha = 1 - progress;
    const amount = effect.amount || 0;

    ctx.save();
    ctx.globalAlpha = alpha;

    // Multiple coins spreading out
    const coinCount = Math.min(5, Math.ceil(amount / 20));
    for (let i = 0; i < coinCount; i++) {
      const angle = (i / coinCount) * Math.PI * 2 + progress * 2;
      const distance = 15 + progress * 25;
      const coinX = screenX + Math.cos(angle) * distance;
      const coinY = screenY + Math.sin(angle) * distance - progress * 20;

      // Coin
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(coinX, coinY, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Gold amount text
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fbbf24';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 4;
    ctx.fillText(`+${amount}g`, screenX, screenY - 30 - progress * 20);

    ctx.restore();
  }

  // Render legendary drop effect - big celebration with sparkles and glow
  renderLegendaryDrop(ctx, cameraPos, effect, progress) {
    const pos = effect.position;
    const screenX = (pos.x - cameraPos.x) * this.tileSize + this.tileSize / 2;
    const screenY = (pos.y - cameraPos.y) * this.tileSize + this.tileSize / 2;

    const legendaryColor = '#f59e0b'; // Gold/orange
    const glowColor = '#fbbf24';

    // Phase 1: Flash (0-0.15) - Screen flash effect
    if (progress < 0.15) {
      const flashProgress = progress / 0.15;
      const flashAlpha = 0.4 * (1 - flashProgress);
      ctx.save();
      ctx.fillStyle = glowColor;
      ctx.globalAlpha = flashAlpha;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.restore();
    }

    // Phase 2: Item reveal (0.1-1.0)
    if (progress > 0.1) {
      const revealProgress = (progress - 0.1) / 0.9;

      // Pop up animation
      let offsetY, scale, alpha;
      if (revealProgress < 0.2) {
        const popProgress = revealProgress / 0.2;
        offsetY = -30 * popProgress;
        scale = 0.3 + popProgress * 1.0;
        alpha = popProgress;
      } else {
        const floatProgress = (revealProgress - 0.2) / 0.8;
        offsetY = -30 - 40 * floatProgress;
        scale = 1.3 - floatProgress * 0.3;
        alpha = 1 - floatProgress * 0.8;
      }

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(screenX, screenY + offsetY);
      ctx.scale(scale, scale);

      // Radial glow
      const glowRadius = 40 + Math.sin(progress * 10) * 8;
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, glowRadius);
      gradient.addColorStop(0, 'rgba(251, 191, 36, 0.6)');
      gradient.addColorStop(0.5, 'rgba(245, 158, 11, 0.3)');
      gradient.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      // Sparkle particles
      const sparkleCount = 8;
      for (let i = 0; i < sparkleCount; i++) {
        const angle = (i / sparkleCount) * Math.PI * 2 + progress * 5;
        const distance = 20 + Math.sin(progress * 8 + i) * 10;
        const sparkleX = Math.cos(angle) * distance;
        const sparkleY = Math.sin(angle) * distance;
        const sparkleSize = 2 + Math.sin(progress * 12 + i * 2) * 1.5;

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(sparkleX, sparkleY, sparkleSize, 0, Math.PI * 2);
        ctx.fill();
      }

      // Inner sparkles
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2 + progress * 8;
        const distance = 8 + Math.sin(progress * 10 + i) * 4;
        const sparkleX = Math.cos(angle) * distance;
        const sparkleY = Math.sin(angle) * distance;

        ctx.fillStyle = glowColor;
        ctx.beginPath();
        ctx.arc(sparkleX, sparkleY, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Item box with legendary border
      ctx.shadowColor = legendaryColor;
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(-15, -15, 30, 30);
      ctx.strokeStyle = legendaryColor;
      ctx.lineWidth = 3;
      ctx.strokeRect(-15, -15, 30, 30);

      // Star/gem icon inside
      ctx.fillStyle = legendaryColor;
      ctx.beginPath();
      // 5-point star
      for (let i = 0; i < 5; i++) {
        const outerAngle = (i / 5) * Math.PI * 2 - Math.PI / 2;
        const innerAngle = ((i + 0.5) / 5) * Math.PI * 2 - Math.PI / 2;
        const outerX = Math.cos(outerAngle) * 8;
        const outerY = Math.sin(outerAngle) * 8;
        const innerX = Math.cos(innerAngle) * 4;
        const innerY = Math.sin(innerAngle) * 4;
        if (i === 0) {
          ctx.moveTo(outerX, outerY);
        } else {
          ctx.lineTo(outerX, outerY);
        }
        ctx.lineTo(innerX, innerY);
      }
      ctx.closePath();
      ctx.fill();

      ctx.restore();

      // Text: "LEGENDARY!" floating above
      if (revealProgress > 0.1) {
        const textProgress = (revealProgress - 0.1) / 0.9;
        const textAlpha = Math.min(1, textProgress * 2) * (1 - Math.max(0, textProgress - 0.7) / 0.3);
        const textY = screenY + offsetY - 35 - textProgress * 15;

        ctx.save();
        ctx.globalAlpha = textAlpha;
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 4;
        ctx.fillStyle = legendaryColor;
        ctx.fillText('LEGENDARY!', screenX, textY);

        // Item name below
        if (effect.itemName) {
          ctx.font = 'bold 12px sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.fillText(effect.itemName, screenX, textY + 18);
        }

        ctx.restore();
      }
    }
  }

  // Clear all effects
  clear() {
    this.effects = [];
  }

  // Get effect count
  getCount() {
    return this.effects.length;
  }
}
