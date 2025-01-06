import { COLORS, SPRITES,SPRITE_SCALE, Background, ColorSet, Sprite } from './constants';
import { Util } from './utils/Util';

export interface RenderOptions {
  width: number;
  height: number;
  resolution: number;
  roadWidth: number;
  lanes: number;
  fogDensity: number;
}

export class Render {
  
  private static rumbleWidth(projectedRoadWidth: number, lanes: number): number { 
    return projectedRoadWidth/Math.max(6, 2*lanes); 
  }

  private static laneMarkerWidth(projectedRoadWidth: number, lanes: number): number { 
    return projectedRoadWidth/Math.max(32, 8*lanes); 
  }

  public static polygon(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number,
                       x3: number, y3: number, x4: number, y4: number, color: string): void {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.lineTo(x4, y4);
    ctx.closePath();
    ctx.fill();
  }

  public static segment(ctx: CanvasRenderingContext2D, width: number, lanes: number,
                       x1: number, y1: number, w1: number,
                       x2: number, y2: number, w2: number,
                       fog: number, color: ColorSet): void {
    const r1 = this.rumbleWidth(w1, lanes);
    const r2 = this.rumbleWidth(w2, lanes);
    const l1 = this.laneMarkerWidth(w1, lanes);
    const l2 = this.laneMarkerWidth(w2, lanes);
    
    ctx.fillStyle = color.grass;
    ctx.fillRect(0, y2, width, y1 - y2);
    
    this.polygon(ctx, x1-w1-r1, y1, x1-w1, y1, x2-w2, y2, x2-w2-r2, y2, color.rumble);
    this.polygon(ctx, x1+w1+r1, y1, x1+w1, y1, x2+w2, y2, x2+w2+r2, y2, color.rumble);
    this.polygon(ctx, x1-w1, y1, x1+w1, y1, x2+w2, y2, x2-w2, y2, color.road);
    
    if (color.lane) {
      const lanew1 = w1*2/lanes;
      const lanew2 = w2*2/lanes;
      let lanex1 = x1 - w1 + lanew1;
      let lanex2 = x2 - w2 + lanew2;
      for(let lane = 1; lane < lanes; lanex1 += lanew1, lanex2 += lanew2, lane++) {
        this.polygon(ctx, lanex1-l1/2, y1, lanex1+l1/2, y1, lanex2+l2/2, y2, lanex2-l2/2, y2, color.lane);
      }
    }
    
    this.fog(ctx, 0, y1, width, y2-y1, fog);
  }

  public static background(ctx: CanvasRenderingContext2D, background: HTMLImageElement, 
                          width: number, height: number, layer: Background, 
                          rotation: number = 0, offset: number = 0): void {
    const imageW = layer.w/2;
    const imageH = layer.h;

    const sourceX = layer.x + Math.floor(layer.w * rotation);
    const sourceY = layer.y;
    const sourceW = Math.min(imageW, layer.x+layer.w-sourceX);
    const sourceH = imageH;
    
    const destX = 0;
    const destY = offset;
    const destW = Math.floor(width * (sourceW/imageW));
    const destH = height;

    ctx.drawImage(background, sourceX, sourceY, sourceW, sourceH, destX, destY, destW, destH);
    if (sourceW < imageW) {
      ctx.drawImage(background, layer.x, sourceY, imageW-sourceW, sourceH, destW-1, destY, width-destW, destH);
    }
  }

    public static sprite(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    resolution: number,
    roadWidth: number,
    sprites: HTMLImageElement[],
    sprite: Sprite,
    scale: number,
    destX: number,
    destY: number,
    offsetX: number = 0,
    offsetY: number = 0,
    clipY?: number
  ): void {
    const destW = (sprite.w * scale * width/2) * (SPRITE_SCALE * roadWidth);
    const destH = (sprite.h * scale * width/2) * (SPRITE_SCALE * roadWidth);
  
    destX = destX + (destW * offsetX);
    destY = destY + (destH * offsetY);
  
    const clipH = clipY ? Math.max(0, destY + destH - clipY) : 0;
    
    if (clipH < destH) {
      ctx.drawImage(
        sprites[0],
        sprite.x,
        sprite.y,
        sprite.w,
        sprite.h - (sprite.h * clipH/destH),
        destX | 0,  // Force integer positions
        destY | 0,
        destW | 0,
        (destH - clipH) | 0
      );
    }
  }

  public static player(ctx: CanvasRenderingContext2D, width: number, height: number,
                      resolution: number, roadWidth: number, sprites: HTMLImageElement[],
                      speedPercent: number, scale: number, destX: number, destY: number,
                      steer: number, updown: number): void {
    const bounce = (1.5 * Math.random() * speedPercent * resolution) * Util.randomChoice([-1,1]);
    let sprite;

    if (steer < 0) {
      sprite = (updown > 0) ? SPRITES.PLAYER_UPHILL_LEFT : SPRITES.PLAYER_LEFT;
    } else if (steer > 0) {
      sprite = (updown > 0) ? SPRITES.PLAYER_UPHILL_RIGHT : SPRITES.PLAYER_RIGHT;
    } else {
      sprite = (updown > 0) ? SPRITES.PLAYER_UPHILL_STRAIGHT : SPRITES.PLAYER_STRAIGHT;
    }

    this.sprite(ctx, width, height, resolution, roadWidth, sprites, sprite,
                scale, destX, destY + bounce, -0.5, -1);
  }

  public static fog(ctx: CanvasRenderingContext2D, x: number, y: number,
                   width: number, height: number, fog: number): void {
    if (fog < 1) {
      ctx.globalAlpha = (1-fog);
      ctx.fillStyle = COLORS.FOG;
      ctx.fillRect(x, y, width, height);
      ctx.globalAlpha = 1;
    }
  }
}