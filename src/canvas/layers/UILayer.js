// UI Layer - renders health bars, status effects, and boss indicators

import { STATUS_EFFECTS } from '../../data/statusEffects';

export class UILayer {
  constructor(tileSize) {
    this.tileSize = tileSize;
  }

  // Render all UI elements - uses unitPositions from UnitLayer for sync
  render(ctx, cameraPos, heroes, monsters, currentActorId, bossUnlocked, statusEffects, unitPositions = null) {
    // Render monster UI
    for (const monster of monsters) {
      if (monster.stats.hp <= 0) continue;

      // Use interpolated position if available, otherwise use raw position
      const pos = unitPositions?.get(monster.id) || monster.position;

      // Boss size adjustment for UI positioning
      const isBoss = monster.isBoss;
      const baseSize = this.tileSize - 8;
      const spriteSize = isBoss ? Math.floor(baseSize * 1.4) : baseSize;
      const offsetX = isBoss ? 4 - (spriteSize - baseSize) / 2 : 0;
      const offsetY = isBoss ? 2 - (spriteSize - baseSize) / 2 : 0;

      const screenX = (pos.x - cameraPos.x) * this.tileSize + offsetX;
      const screenY = (pos.y - cameraPos.y) * this.tileSize + offsetY;

      // Skip if off screen
      if (screenX < -this.tileSize * 1.5 || screenX > ctx.canvas.width + this.tileSize ||
          screenY < -this.tileSize * 1.5 || screenY > ctx.canvas.height + this.tileSize) {
        continue;
      }

      // Health bar (adjust size for bosses)
      const healthBarSize = isBoss ? spriteSize + 8 : this.tileSize;
      this.renderHealthBar(ctx, screenX, screenY, healthBarSize, monster.stats.hp, monster.stats.maxHp);

      // Boss nameplate (name + title above the boss)
      if (isBoss) {
        this.renderBossNameplate(ctx, screenX, screenY, spriteSize, monster);
      }

      // Status effects
      const unitStatusEffects = statusEffects[monster.id];
      if (unitStatusEffects && unitStatusEffects.length > 0) {
        this.renderStatusEffects(ctx, screenX, screenY, unitStatusEffects);
      }

    }

    // Render hero UI
    for (const hero of heroes) {
      // Use interpolated position if available, otherwise use raw position
      const pos = unitPositions?.get(hero.id) || hero.position;
      const screenX = (pos.x - cameraPos.x) * this.tileSize;
      const screenY = (pos.y - cameraPos.y) * this.tileSize;

      // Skip if off screen
      if (screenX < -this.tileSize || screenX > ctx.canvas.width + this.tileSize ||
          screenY < -this.tileSize || screenY > ctx.canvas.height + this.tileSize) {
        continue;
      }

      // Health bar (even for dead heroes to show they're at 0)
      this.renderHealthBar(ctx, screenX, screenY, this.tileSize, hero.stats.hp, hero.stats.maxHp);

      // Dead skull indicator
      if (hero.stats.hp <= 0) {
        this.renderDeathIndicator(ctx, screenX, screenY);
      } else {
        // Status effects (only for living heroes)
        const unitStatusEffects = statusEffects[hero.id];
        if (unitStatusEffects && unitStatusEffects.length > 0) {
          this.renderStatusEffects(ctx, screenX, screenY, unitStatusEffects);
        }
      }

    }
  }

  // Render health bar below unit
  renderHealthBar(ctx, x, y, size, hp, maxHp) {
    const barHeight = 4;
    const barY = y + size - 2;
    const barX = x + 2;
    const barWidth = size - 4;

    const hpPercent = Math.max(0, hp / maxHp);
    const fillWidth = barWidth * hpPercent;

    // Background
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // HP fill (color based on percentage)
    if (hpPercent > 0.5) {
      ctx.fillStyle = '#22c55e';
    } else if (hpPercent > 0.25) {
      ctx.fillStyle = '#eab308';
    } else {
      ctx.fillStyle = '#ef4444';
    }
    ctx.fillRect(barX, barY, fillWidth, barHeight);

    // Border
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
  }

  // Render boss nameplate (name + title) above the boss
  renderBossNameplate(ctx, x, y, spriteSize, monster) {
    const centerX = x + spriteSize / 2;
    const nameplateY = y - 8;

    // Determine colors based on boss type
    let nameColor;
    if (monster.isWorldBoss) {
      nameColor = '#fbbf24'; // Amber for world bosses
    } else if (monster.isFinalBoss) {
      nameColor = '#c084fc'; // Purple for final raid bosses
    } else if (monster.isRaidBoss || monster.isWingBoss) {
      nameColor = '#f472b6'; // Pink for raid wing bosses
    } else {
      nameColor = '#facc15'; // Yellow for regular bosses
    }

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';

    // Boss name
    ctx.font = 'bold 10px sans-serif';
    const nameWidth = ctx.measureText(monster.name).width;

    // Background pill for name
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.roundRect(centerX - nameWidth / 2 - 4, nameplateY - 12, nameWidth + 8, 14, 3);
    ctx.fill();

    // Name text
    ctx.fillStyle = nameColor;
    ctx.fillText(monster.name, centerX, nameplateY);

    // Title (if exists)
    if (monster.title) {
      ctx.font = '8px sans-serif';
      const titleText = `"${monster.title}"`;
      const titleWidth = ctx.measureText(titleText).width;

      // Background pill for title
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.beginPath();
      ctx.roundRect(centerX - titleWidth / 2 - 3, nameplateY - 24, titleWidth + 6, 11, 2);
      ctx.fill();

      // Title text
      ctx.fillStyle = '#9ca3af';
      ctx.fillText(titleText, centerX, nameplateY - 13);
    }

    ctx.restore();
  }

  // Render death indicator (pixel art skull)
  renderDeathIndicator(ctx, x, y) {
    const skullX = x;
    const skullY = y - 8;
    const s = 1; // scale

    // Skull (white/gray)
    ctx.fillStyle = '#e5e7eb';
    ctx.fillRect(skullX + 2*s, skullY, 8*s, 8*s);
    ctx.fillRect(skullX + 3*s, skullY - 1*s, 6*s, 1*s);

    // Eye sockets (dark)
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(skullX + 3*s, skullY + 2*s, 2*s, 2*s);
    ctx.fillRect(skullX + 7*s, skullY + 2*s, 2*s, 2*s);

    // Nose
    ctx.fillRect(skullX + 5*s, skullY + 4*s, 2*s, 1*s);

    // Teeth
    ctx.fillRect(skullX + 4*s, skullY + 6*s, 4*s, 2*s);
    ctx.fillStyle = '#e5e7eb';
    ctx.fillRect(skullX + 5*s, skullY + 6*s, 1*s, 2*s);
    ctx.fillRect(skullX + 7*s, skullY + 6*s, 1*s, 2*s);
  }

  // Render status effect icons
  renderStatusEffects(ctx, x, y, effects) {
    const iconSize = 10;
    const maxIcons = 4;
    const startX = x + this.tileSize - 4;
    const startY = y - 8;

    for (let i = 0; i < Math.min(effects.length, maxIcons); i++) {
      const effect = effects[i];
      const template = STATUS_EFFECTS[effect.id];
      if (!template) continue;

      const iconX = startX - (i * (iconSize + 2));
      const iconY = startY;

      // Use color from template, fallback to type-based color
      const color = template.color || this.getStatusColor(template.type || effect.id);

      // Draw icon background
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(iconX, iconY, iconSize / 2, 0, Math.PI * 2);
      ctx.fill();

      // Draw icon symbol (use emoji or first letter)
      ctx.fillStyle = '#ffffff';
      ctx.font = '7px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const symbol = template.emoji ? template.emoji.charAt(0) : this.getStatusSymbol(effect.id);
      ctx.fillText(symbol, iconX, iconY);

      // Stack count
      if (effect.stacks > 1) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 6px sans-serif';
        ctx.fillText(effect.stacks.toString(), iconX + 4, iconY + 4);
      }
    }
  }

  // Get color for status effect type
  getStatusColor(type) {
    const colors = {
      // Type-based colors
      dot: '#22c55e',      // Damage over time (green/poison-like)
      control: '#fbbf24',  // Control effects (yellow/stun-like)
      debuff: '#ef4444',   // Debuffs (red)
      buff: '#22c55e',     // Buffs (green)
      // Specific effect fallbacks
      poison: '#22c55e',
      bleed: '#dc2626',
      burn: '#f97316',
      stun: '#fbbf24',
      slow: '#3b82f6',
      curse: '#7c3aed',
      heal: '#22c55e',
      shield: '#3b82f6',
      strength: '#ef4444',
      defense: '#6b7280',
    };
    return colors[type] || '#6b7280';
  }

  // Get symbol for status effect
  getStatusSymbol(effectId) {
    const symbols = {
      poison: 'P',
      bleed: 'B',
      burn: 'F',
      stun: '!',
      slow: 'S',
      curse: 'C',
      regen: '+',
      shield: 'O',
      strength: '^',
      weakness: 'v',
    };
    return symbols[effectId] || '?';
  }
}
