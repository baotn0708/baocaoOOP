import { Game } from './Game';
import { Render } from './Render';
import { RoadBuilder, ROAD } from './RoadBuilder'; 
import { BACKGROUND, KEY, SPRITES, SPRITE_SCALE } from './constants';
import { Dom } from './utils/Dom';
import { Util } from './utils/Util';
import { Hud } from './Hud';

class RacingGame {
  private fps = 60;
  private step = 1/this.fps;
  private width = 1024;
  private height = 768;
  private centrifugal = 0.3;
  private skySpeed = 0.001;
  private hillSpeed = 0.002;
  private treeSpeed = 0.003;
  private skyOffset = 0;
  private hillOffset = 0;
  private treeOffset = 0;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private background: HTMLImageElement | null = null;
  private sprites: HTMLImageElement | null = null;
  private resolution: number | null = null;
  private roadWidth = 2000;
  private segmentLength = 200;
  private rumbleLength = 3;
  private lanes = 3;
  private fieldOfView = 100;
  private cameraHeight = 1000;
  private cameraDepth: number | null = null;
  private drawDistance = 300;
  private playerX = 0;
  private playerZ: number | null = null;
  private fogDensity = 5;
  private position = 0;
  private speed = 0;
  private maxSpeed: number;
  private accel = 0;
  private breaking = 0;
  private decel = 0;
  private offRoadDecel = 0;
  private offRoadLimit = 0;
  private currentLapTime = 0;
  private lastLapTime: number | null = null;
  private keyLeft = false;
  private keyRight = false;
  private keyFaster = false;
  private keySlower = false;
  private hud: Hud;

  constructor() {
    this.canvas = Dom.get('canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.maxSpeed = this.segmentLength/this.step;
    this.accel = this.maxSpeed/5;
    this.breaking = -this.maxSpeed;
    this.decel = -this.maxSpeed/5;
    this.offRoadDecel = -this.maxSpeed/2;
    this.offRoadLimit = this.maxSpeed/4;
    this.hud = new Hud();

    this.reset();
    this.initGame();
  }

  private initGame(): void {
    Game.run({
      canvas: this.canvas,
      render: () => this.render(),
      update: (dt: number) => this.update(dt),
      stats: Game.stats('fps'),
      step: this.step,
      images: ["background", "sprites"],
      keys: [
        { keys: [KEY.LEFT,  KEY.A], mode: 'down', action: () => { this.keyLeft   = true;  } },
        { keys: [KEY.RIGHT, KEY.D], mode: 'down', action: () => { this.keyRight  = true;  } },
        { keys: [KEY.UP,    KEY.W], mode: 'down', action: () => { this.keyFaster = true;  } },
        { keys: [KEY.DOWN,  KEY.S], mode: 'down', action: () => { this.keySlower = true;  } },
        { keys: [KEY.LEFT,  KEY.A], mode: 'up',   action: () => { this.keyLeft   = false; } },
        { keys: [KEY.RIGHT, KEY.D], mode: 'up',   action: () => { this.keyRight  = false; } },
        { keys: [KEY.UP,    KEY.W], mode: 'up',   action: () => { this.keyFaster = false; } },
        { keys: [KEY.DOWN,  KEY.S], mode: 'up',   action: () => { this.keySlower = false; } }
      ],
      ready: (images: HTMLImageElement[]) => {
        this.background = images[0];
        this.sprites = images[1];
        this.reset();
        Dom.storage.fast_lap_time = Dom.storage.fast_lap_time || '180';
        this.hud.updateHud('fast_lap_time', this.formatTime(Util.toFloat(Dom.storage.fast_lap_time, 180)));
      }
    });
  }

  private update(dt: number): void {
    const playerSegment = RoadBuilder.findSegment(this.position + this.playerZ!);
    const playerW = SPRITES.PLAYER_STRAIGHT.w * SPRITES.SCALE;
    const speedPercent = this.speed/this.maxSpeed;
    const dx = dt * 2 * speedPercent;
    const startPosition = this.position;

    this.position = Util.increase(this.position, dt * this.speed, RoadBuilder.trackLength);

    this.skyOffset  = Util.increase(this.skyOffset,  this.skySpeed  * playerSegment.curve * (this.position-startPosition)/this.segmentLength, 1);
    this.hillOffset = Util.increase(this.hillOffset, this.hillSpeed * playerSegment.curve * (this.position-startPosition)/this.segmentLength, 1);
    this.treeOffset = Util.increase(this.treeOffset, this.treeSpeed * playerSegment.curve * (this.position-startPosition)/this.segmentLength, 1);

    if (this.keyLeft)
      this.playerX = this.playerX - dx;
    else if (this.keyRight)
      this.playerX = this.playerX + dx;
    
    this.playerX = this.playerX - (dx * speedPercent * playerSegment.curve * this.centrifugal);

    if (this.keyFaster)
      this.speed = Util.accelerate(this.speed, this.accel, dt);
    else if (this.keySlower)
      this.speed = Util.accelerate(this.speed, this.breaking, dt);
    else
      this.speed = Util.accelerate(this.speed, this.decel, dt);

    if ((this.playerX < -1) || (this.playerX > 1)) {
      if (this.speed > this.offRoadLimit)
        this.speed = Util.accelerate(this.speed, this.offRoadDecel, dt);
    }

    this.playerX = Util.limit(this.playerX, -2, 2);
    this.speed = Util.limit(this.speed, 0, this.maxSpeed);

    if (this.position > this.playerZ!) {
      if (this.currentLapTime && (startPosition < this.playerZ!)) {
        this.lastLapTime = this.currentLapTime;
        this.currentLapTime = 0;
        if (this.lastLapTime <= Util.toFloat(Dom.storage.fast_lap_time, 180)) {
          Dom.storage.fast_lap_time = this.lastLapTime.toString();
          this.hud.updateHud('fast_lap_time', this.formatTime(this.lastLapTime));
          Dom.addClassName('fast_lap_time', 'fastest');
          Dom.addClassName('last_lap_time', 'fastest');
        } else {
          Dom.removeClassName('fast_lap_time', 'fastest');
          Dom.removeClassName('last_lap_time', 'fastest');
        }
        this.hud.updateHud('last_lap_time', this.formatTime(this.lastLapTime));
        Dom.show('last_lap_time');
      } else {
        this.currentLapTime += dt;
      }
    }

    this.hud.updateHud('speed', 5 * Math.round(this.speed/500));
    this.hud.updateHud('current_lap_time', this.formatTime(this.currentLapTime));
  }

  private render(): void {
    const baseSegment = RoadBuilder.findSegment(this.position);
    const basePercent = Util.percentRemaining(this.position, this.segmentLength);
    const playerSegment = RoadBuilder.findSegment(this.position + this.playerZ!);
    const playerPercent = Util.percentRemaining(this.position + this.playerZ!, this.segmentLength);
    const playerY = Util.interpolate(playerSegment.p1.world.y, playerSegment.p2.world.y, playerPercent);
    let maxy = this.height;

    let x = 0;
    let dx = -(baseSegment.curve * basePercent);

    this.ctx.clearRect(0, 0, this.width, this.height);

    Render.background(this.ctx, this.background!, this.width, this.height, BACKGROUND.SKY,   this.skyOffset,  this.resolution! * this.skySpeed  * playerY);
    Render.background(this.ctx, this.background!, this.width, this.height, BACKGROUND.HILLS, this.hillOffset, this.resolution! * this.hillSpeed * playerY);
    Render.background(this.ctx, this.background!, this.width, this.height, BACKGROUND.TREES, this.treeOffset, this.resolution! * this.treeSpeed * playerY);

    let segment: typeof baseSegment;
    let sprite: any;
    let spriteScale: number;
    let spriteX: number;
    let spriteY: number;

    for(let n = 0; n < this.drawDistance; n++) {
      segment = RoadBuilder.segments[(baseSegment.index + n) % RoadBuilder.segments.length];
      segment.looped = segment.index < baseSegment.index;
      segment.fog = Util.exponentialFog(n/this.drawDistance, this.fogDensity);
      segment.clip = maxy;

      Util.project(segment.p1, 
        (this.playerX * this.roadWidth) - x, 
        playerY + this.cameraHeight, 
        this.position - (segment.looped ? RoadBuilder.trackLength : 0), 
        this.cameraDepth!, 
        this.width, 
        this.height, 
        this.roadWidth
      );

      Util.project(segment.p2, 
        (this.playerX * this.roadWidth) - x - dx, 
        playerY + this.cameraHeight, 
        this.position - (segment.looped ? RoadBuilder.trackLength : 0), 
        this.cameraDepth!, 
        this.width, 
        this.height, 
        this.roadWidth
      );

      x = x + dx;
      dx = dx + segment.curve;

      if ((segment.p1.camera.z <= this.cameraDepth!) || 
          (segment.p2.screen.y >= segment.p1.screen.y!) || 
          (segment.p2.screen.y! >= maxy)) continue;

      Render.segment(this.ctx, this.width, this.lanes,
        segment.p1.screen.x!, segment.p1.screen.y!, segment.p1.screen.w!,
        segment.p2.screen.x!, segment.p2.screen.y!, segment.p2.screen.w!,
        segment.fog, segment.color);

      maxy = segment.p1.screen.y!;
    }

    for(let n = (this.drawDistance-1); n > 0; n--) {
      segment = RoadBuilder.segments[(baseSegment.index + n) % RoadBuilder.segments.length];

      for(const car of segment.cars) {
        sprite = car.sprite;
        spriteScale = Util.interpolate(segment.p1.screen.scale!, segment.p2.screen.scale!, car.percent!);
        spriteX = Util.interpolate(segment.p1.screen.x!, segment.p2.screen.x!, car.percent!) + (spriteScale * car.offset * this.roadWidth * this.width/2);
        spriteY = Util.interpolate(segment.p1.screen.y!, segment.p2.screen.y!, car.percent!);
        Render.sprite(this.ctx, this.width, this.height, this.resolution!, this.roadWidth, [this.sprites!], car.sprite, spriteScale!, spriteX, spriteY, -0.5, -1, segment.clip);
      }

      for(const roadSprite of segment.sprites) {
        sprite = roadSprite.source;
        spriteScale = segment.p1.screen.scale!;
        spriteX = segment.p1.screen.x! + (spriteScale * roadSprite.offset * this.roadWidth * this.width/2);
        spriteY = segment.p1.screen.y!;
        Render.sprite(this.ctx, this.width, this.height, this.resolution!, this.roadWidth, [this.sprites!], sprite, spriteScale, spriteX, spriteY, (roadSprite.offset < 0 ? -1 : 0), -1, segment.clip);
      }

      if (segment === playerSegment) {
        Render.player(this.ctx, this.width, this.height, this.resolution!, this.roadWidth, [this.sprites!],
          this.speed/this.maxSpeed,
          this.cameraDepth!/this.playerZ!,
          this.width/2,
          (this.height/2) - (this.cameraDepth!/this.playerZ! * Util.interpolate(playerSegment.p1.camera.y!, playerSegment.p2.camera.y!, playerPercent) * this.height/2),
          this.speed * (this.keyLeft ? -1 : this.keyRight ? 1 : 0),
          playerSegment.p2.world.y - playerSegment.p1.world.y);
      }
    }
  }

  private reset(options: Partial<RacingGame> = {}): void {
    Object.assign(this, options);
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.resolution = this.height/480;
    this.cameraDepth = 1 / Math.tan((this.fieldOfView/2) * Math.PI/180);
    this.playerZ = this.cameraHeight * this.cameraDepth;
    
    if (RoadBuilder.segments.length === 0) {
      RoadBuilder.resetRoad();
    }
  }

  private formatTime(dt: number): string {
    const minutes = Math.floor(dt/60);
    const seconds = Math.floor(dt - (minutes * 60));
    const tenths = Math.floor(10 * (dt - Math.floor(dt)));
    if (minutes > 0)
      return `${minutes}.${(seconds < 10 ? "0" : "")}${seconds}.${tenths}`;
    return `${seconds}.${tenths}`;
  }
}

// Start the game
new RacingGame();