// Camera system for viewport management and smooth scrolling

export class Camera {
  constructor(viewportWidth, viewportHeight, tileSize) {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
    this.tileSize = tileSize;

    // Current position (in tiles)
    this.x = 0;
    this.y = 0;

    // Target position for smooth scrolling
    this.targetX = 0;
    this.targetY = 0;

    // Lerp factor (higher = faster, 1 = instant)
    this.smoothing = 0.15;
  }

  // Set the target viewport position
  setTarget(x, y) {
    this.targetX = x;
    this.targetY = y;
  }

  // Update camera position with smooth interpolation
  update(deltaTime) {
    // Lerp towards target (frame-rate independent)
    // Use a base smoothing factor, adjusted for ~60fps baseline
    const lerpFactor = 1 - Math.pow(1 - this.smoothing, deltaTime / 16.67);

    this.x += (this.targetX - this.x) * lerpFactor;
    this.y += (this.targetY - this.y) * lerpFactor;

    // Snap to target if very close (avoid floating point drift)
    if (Math.abs(this.x - this.targetX) < 0.01) this.x = this.targetX;
    if (Math.abs(this.y - this.targetY) < 0.01) this.y = this.targetY;
  }

  // Get current camera position
  getPosition() {
    return { x: this.x, y: this.y };
  }

  // Convert world coordinates (tiles) to screen coordinates (pixels)
  worldToScreen(worldX, worldY) {
    return {
      x: (worldX - this.x) * this.tileSize,
      y: (worldY - this.y) * this.tileSize,
    };
  }

  // Convert screen coordinates (pixels) to world coordinates (tiles)
  screenToWorld(screenX, screenY) {
    return {
      x: screenX / this.tileSize + this.x,
      y: screenY / this.tileSize + this.y,
    };
  }

  // Check if a world position is within the visible viewport (with buffer)
  isVisible(worldX, worldY, buffer = 1) {
    const left = this.x - buffer;
    const right = this.x + this.viewportWidth + buffer;
    const top = this.y - buffer;
    const bottom = this.y + this.viewportHeight + buffer;

    return worldX >= left && worldX < right && worldY >= top && worldY < bottom;
  }

  // Get the visible tile range
  getVisibleRange(buffer = 0) {
    return {
      startX: Math.floor(this.x) - buffer,
      startY: Math.floor(this.y) - buffer,
      endX: Math.ceil(this.x + this.viewportWidth) + buffer,
      endY: Math.ceil(this.y + this.viewportHeight) + buffer,
    };
  }

  // Jump immediately to position (no smoothing)
  jumpTo(x, y) {
    this.x = x;
    this.y = y;
    this.targetX = x;
    this.targetY = y;
  }

  // Set smoothing factor
  setSmoothness(factor) {
    this.smoothing = Math.max(0.01, Math.min(1, factor));
  }
}
