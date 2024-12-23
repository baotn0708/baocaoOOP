// src/Renderer.ts
export interface ColorSet {
  road: string;
  rumble: string;
  lane?: string;
  grass: string;
}

// Example sprite data structure, adapt as needed
export interface SpriteSource {
  x: number;
  y: number;
  w: number;
  h: number;
}

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
  }

  /**
   * Draw solid background layers (sky, hills, trees).
   *
   * @param image - The preloaded background image (like background.png).
   * @param destY - The vertical offset at which sub-rectangle is drawn.
   * @param srcRect - Source sprite rectangle for each layer from the background image.
   * @param offsetX - Horizontal offset for parallax scrolling.
   */
  public drawBackground(
    image: HTMLImageElement,
    destY: number,
    srcRect: { x: number; y: number; w: number; h: number },
    offsetX: number
  ): void {
    // Typically you'll do multiple calls for SKY, HILLS, and TREES
    // offsetX can be used for parallax movement
    const sourceX = srcRect.x + offsetX;
    const sx = sourceX % srcRect.w; // simple wrap-around offset
    // Draw in multiple segments if needed so it tiles horizontally
    // We'll do a simple approach here:
    this.ctx.drawImage(
      image,
      sx,
      srcRect.y,
      Math.min(srcRect.w, srcRect.w - sx),
      srcRect.h,
      0,
      destY,
      Math.min(this.width, this.width),
      srcRect.h
    );
    // If needed, you can draw a second partial strip to tile beyond edges
  }

  /**
   * Draw a filled polygon for roads, rumbles, etc.
   *
   * @param x1,y1,x2,y2,x3,y3,x4,y4 - 4 corners of the polygon.
   * @param color - Fill color.
   */
  public drawPolygon(
    x1: number, y1: number,
    x2: number, y2: number,
    x3: number, y3: number,
    x4: number, y4: number,
    color: string
  ): void {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.lineTo(x3, y3);
    this.ctx.lineTo(x4, y4);
    this.ctx.closePath();
    this.ctx.fill();
  }

  /**
   * Draw a road segment, including grass background, rumble strips, lanes.
   * This mirrors Render.segment(...) in common.js
   *
   * @param lanes - Number of lanes on the road.
   * @param x1,y1,w1 - The screen position and projected road width for segment start.
   * @param x2,y2,w2 - The screen position and projected road width for segment end.
   * @param color - An object holding 'grass', 'road', 'rumble', and optional 'lane'.
   * @param fog - A fog factor 0..1 for distance fade-out.
   */
  public drawSegment(
    lanes: number,
    x1: number, y1: number, w1: number,
    x2: number, y2: number, w2: number,
    color: ColorSet,
    fog: number
  ): void {
    // Grass background
    this.ctx.fillStyle = color.grass;
    this.ctx.fillRect(0, y2, this.width, (y1 - y2));

    // Rumble strips
    const r1 = this.rumbleWidth(w1, lanes);
    const r2 = this.rumbleWidth(w2, lanes);
    // Road polygons
    this.drawPolygon(
      x1 - w1 - r1, y1,
      x1 - w1,      y1,
      x2 - w2,      y2,
      x2 - w2 - r2, y2,
      color.rumble
    );
    this.drawPolygon(
      x1 + w1 + r1, y1,
      x1 + w1,      y1,
      x2 + w2,      y2,
      x2 + w2 + r2, y2,
      color.rumble
    );
    this.drawPolygon(
      x1 - w1, y1,
      x1 + w1, y1,
      x2 + w2, y2,
      x2 - w2, y2,
      color.road
    );

    // Lane markers (if any)
    if (color.lane) {
      let lanew1 = (w1 * 2) / lanes;
      let lanew2 = (w2 * 2) / lanes;
      let lanex1 = x1 - w1 + lanew1;
      let lanex2 = x2 - w2 + lanew2;
      for (let lane = 1; lane < lanes; lane++) {
        this.drawPolygon(
          lanex1 - this.laneMarkerWidth(w1, lanes) / 2, y1,
          lanex1 + this.laneMarkerWidth(w1, lanes) / 2, y1,
          lanex2 + this.laneMarkerWidth(w2, lanes) / 2, y2,
          lanex2 - this.laneMarkerWidth(w2, lanes) / 2, y2,
          color.lane
        );
        lanex1 += lanew1;
        lanex2 += lanew2;
      }
    }

    // Fog overlay
    this.drawFog(0, y2, this.width, (y1 - y2), fog);
  }

  /**
   * Classic sprite drawing with (x,y) anchored relative to sprite size.
   *
   * @param sprite - The sprite image to draw from.
   * @param spr - Coordinates/size in the sprite sheet.
   * @param scale - Scaling factor for the sprite (distance-based).
   * @param destX,destY - Where to place it on screen.
   * @param offsetX,offsetY - Offsets for horizontal/vertical anchor (-0.5 for center, -1 for bottom, etc.).
   * @param clipY - If the lower portion of the sprite is clipped by a hill, pass a y-value to cut off.
   */
  public drawSprite(
    sprite: HTMLImageElement,
    spr: SpriteSource,
    scale: number,
    destX: number,
    destY: number,
    offsetX: number,
    offsetY: number,
    clipY?: number
  ): void {
    const scaledW = spr.w * scale;
    const scaledH = spr.h * scale;
    const drawX = destX + (scaledW * offsetX);
    const drawY = destY + (scaledH * offsetY);

    // If clipY is given, we might need to skip drawing lower portion
    if (clipY !== undefined && (drawY + scaledH) >= clipY) {
      const clipH = (drawY + scaledH) - clipY;
      if (clipH < scaledH) {
        this.ctx.drawImage(
          sprite,
          spr.x, spr.y, spr.w, (spr.h - (spr.h * (clipH / scaledH))),
          drawX, drawY, scaledW, (scaledH - clipH)
        );
      }
    } else {
      this.ctx.drawImage(
        sprite,
        spr.x, spr.y, spr.w, spr.h,
        drawX, drawY, scaledW, scaledH
      );
    }
  }

  /**
   * Draw the player’s car from a sprite, accounting for tilt or up/down slope.
   *
   * @param sprite - The main spritesheet image.
   * @param spr - Which sprite coordinates to draw.
   * @param scale - Distance scaling factor for the car.
   * @param destX,destY - On-screen position for the car.
   * @param steer - Steering factor to handle left/right frames if you have multiple player sprite angles.
   * @param updown - Slope factor to switch between uphill/downhill frames, if needed.
   */
  public drawPlayer(
    sprite: HTMLImageElement,
    spr: SpriteSource,
    scale: number,
    destX: number,
    destY: number,
    steer: number,
    updown: number
  ): void {
    // If you have separate frames for left, right, straight, you can choose them here
    // For simplicity, just draw the requested sprite
    this.drawSprite(sprite, spr, scale, destX, destY, -0.5, -1);
  }

  /**
   * Overlay a fog rectangle that darkens distant road segments.
   *
   * @param x,y - Top-left corner of the rectangle to darken.
   * @param width,height - Rectangle dimensions.
   * @param fog - A factor 0..1 (1 = fully covered, 0 = no fog).
   */
  public drawFog(x: number, y: number, width: number, height: number, fog: number): void {
    if (fog <= 0) return;
    const alpha = Math.max(0, Math.min(1, fog));
    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    this.ctx.fillStyle = '#808080'; // or any suitable fog color
    this.ctx.fillRect(x, y, width, height);
    this.ctx.restore();
  }

  /**
   * Utility to compute rumble strip width from the projected road width.
   */
  public rumbleWidth(projectedRoadWidth: number, lanes: number): number {
    // Matches the logic in common.js
    return projectedRoadWidth / Math.max(6, 2 * lanes);
  }

  /**
   * Utility to compute lane marker width from the projected road width.
   */
  public laneMarkerWidth(projectedRoadWidth: number, lanes: number): number {
    return projectedRoadWidth / Math.max(32, 8 * lanes);
  }
}