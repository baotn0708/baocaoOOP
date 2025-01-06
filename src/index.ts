import { Game } from './Game';
import { Render } from './Render';
import { RoadBuilder } from './RoadBuilder';
import { COLORS, SPRITES, SPRITE_SCALE, KEY, BACKGROUND, BILLBOARD_SPRITES } from './constants';
import { Dom } from './utils/Dom';
import { Util } from './utils/Util';
import { Hud } from './Hud';
import { Polyfill } from './Polyfill';

Polyfill.applyRequestAnimationFrame();

interface GameOptions {
  width?: number;
  height?: number;
  lanes?: number;
  roadWidth?: number;
  cameraHeight?: number;
  drawDistance?: number;
  fogDensity?: number;
  fieldOfView?: number;
  segmentLength?: number;
  rumbleLength?: number;
}
export class RacingGame {
  // Basic game settings
  private fps = 60;
  private step = 1/this.fps;
  private width = 1024;
  private height = 768;

  // Game physics
  private centrifugal = 0.3;
  private skySpeed = 0.001;
  private hillSpeed = 0.002;
  private treeSpeed = 0.003;

  // Background positions
  private skyOffset = 0;
  private hillOffset = 0;
  private treeOffset = 0;

  // Canvas elements
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private background: HTMLImageElement | null = null;
  private sprites: HTMLImageElement | null = null;

  // Road properties
  private roadWidth = 2000;
  private lanes = 3;
  private fieldOfView = 100;
  private cameraHeight = 1000;
  private cameraDepth: number | null = null;
  private drawDistance = 300;
  private fogDensity = 5;
  private resolution!: number;
  private segmentLength = 200;
  private rumbleLength = 3;
  private trackLength!: number;
  private cars: any[] = [];
  private segments: any[] = [];
  private totalCars = 200;

  // Player properties
  private playerX = 0;
  private playerZ: number | null = null;
  private position = 0;
  private speed = 0;
  private maxSpeed: number;
  private accel: number;
  private breaking: number;
  private decel: number;
  private offRoadDecel: number;
  private offRoadLimit: number;

  // Timing
  private currentLapTime = 0;
  private lastLapTime: number | null = null;

  // Input state
  private keyLeft = false;
  private keyRight = false;
  private keyFaster = false;
  private keySlower = false;

  // UI
  private hud: Record<string, any> = {
    speed: { value: null, dom: null },
    current_lap_time: { value: null, dom: null },
    last_lap_time: { value: null, dom: null },
    fast_lap_time: { value: null, dom: null }
  };
  private storage: Storage = window.localStorage || new Storage();

  constructor() {
    this.canvas = Dom.get('canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
  
    // Initialize core game properties
    this.maxSpeed = RoadBuilder.segmentLength/this.step;
    this.accel = this.maxSpeed/5;
    this.breaking = -this.maxSpeed;
    this.decel = -this.maxSpeed/5;
    this.offRoadDecel = -this.maxSpeed/2;
    this.offRoadLimit = this.maxSpeed/4;

    this.segments = RoadBuilder.segments;
    this.trackLength = RoadBuilder.trackLength;
    this.cars = RoadBuilder.cars; 
    
    // Initialize HUD
    this.hud = new Hud();
  
    // Initialize game
    this.reset();
    this.initializeEventListeners();
  }

  private reset(options: Partial<GameOptions> = {}): void {
    // Canvas dimensions
    this.canvas.width = this.width = Util.toInt(options.width, this.width);
    this.canvas.height = this.height = Util.toInt(options.height, this.height);
  
    // Road properties
    this.lanes = Util.toInt(options.lanes, this.lanes);
    this.roadWidth = Util.toInt(options.roadWidth, this.roadWidth);
    this.cameraHeight = Util.toInt(options.cameraHeight, this.cameraHeight);
    this.drawDistance = Util.toInt(options.drawDistance, this.drawDistance);
    this.fogDensity = Util.toInt(options.fogDensity, this.fogDensity);
    this.fieldOfView = Util.toInt(options.fieldOfView, this.fieldOfView);
  
    // Camera calculations
    this.cameraDepth = 1 / Math.tan((this.fieldOfView/2) * Math.PI/180);
    this.playerZ = (this.cameraHeight * this.cameraDepth!);
    this.resolution = this.height/480;
  
    // Reset road if necessary
    if (RoadBuilder.getSegments().length === 0 || 
        options.segmentLength || 
        options.rumbleLength) {
      RoadBuilder.resetRoad();
    }
  
    // Update UI
    this.refreshTweakUI();
  }
  private refreshTweakUI(): void {
    const lanesElement = Dom.get('lanes') as HTMLSelectElement;
    lanesElement.selectedIndex = this.lanes - 1;
  
    Dom.set('currentRoadWidth', this.roadWidth.toString());
    (Dom.get('roadWidth') as HTMLInputElement).value = this.roadWidth.toString();
  
    Dom.set('currentCameraHeight', this.cameraHeight.toString());
    (Dom.get('cameraHeight') as HTMLInputElement).value = this.cameraHeight.toString();
  
    Dom.set('currentDrawDistance', this.drawDistance.toString());
    (Dom.get('drawDistance') as HTMLInputElement).value = this.drawDistance.toString();
  
    Dom.set('currentFieldOfView', this.fieldOfView.toString());
    (Dom.get('fieldOfView') as HTMLInputElement).value = this.fieldOfView.toString();
  
    Dom.set('currentFogDensity', this.fogDensity.toString());
    (Dom.get('fogDensity') as HTMLInputElement).value = this.fogDensity.toString();
  }

  private update(dt: number): void {
    const playerSegment = RoadBuilder.findSegment(this.position + this.playerZ!);
    const playerW = SPRITES.PLAYER_STRAIGHT.w * SPRITE_SCALE;
    const speedPercent = this.speed/this.maxSpeed;
    const dx = dt * 2 * speedPercent;
    const startPosition = this.position;
  
    // Update cars positions and behavior
    this.updateCars(dt, playerSegment, playerW);
  
    // Update player position
    this.position = Util.increase(this.position, dt * this.speed, RoadBuilder.trackLength);
  
    // Handle player steering
    if (this.keyLeft) {
      this.playerX = this.playerX - dx;
    } else if (this.keyRight) {
      this.playerX = this.playerX + dx;
    }
  
    // Apply centrifugal force
    this.playerX = this.playerX - (dx * speedPercent * playerSegment.curve * this.centrifugal);
  
    // Handle player speed
    if (this.keyFaster) {
      this.speed = Util.accelerate(this.speed, this.accel, dt);
    } else if (this.keySlower) {
      this.speed = Util.accelerate(this.speed, this.breaking, dt);
    } else {
      this.speed = Util.accelerate(this.speed, this.decel, dt);
    }
  
    // Handle off-road deceleration and collisions
    // In update method, modify collision check:
if ((this.playerX < -1) || (this.playerX > 1)) {
  if (this.speed > this.offRoadLimit) {
    this.speed = Util.accelerate(this.speed, this.offRoadDecel, dt);
  }

  // Only check collisions with nearby sprites
  for(let n = 0; n < playerSegment.sprites.length; n++) {
    const sprite = playerSegment.sprites[n];
    const spriteW = sprite.source.w * SPRITE_SCALE;
    
    // Adjust collision box based on sprite type
    const collisionWidth = (sprite.source === SPRITES.COLUMN || 
                           BILLBOARD_SPRITES.some(b => b === sprite.source)) ? 
                           spriteW * 0.8 : spriteW * 0.5;

    if (Math.abs(sprite.offset) <= 2) {  // Only check sprites close to road
      if (Util.overlap(this.playerX, playerW, 
          sprite.offset + collisionWidth/2 * (sprite.offset > 0 ? 1 : -1), 
          collisionWidth)) {
        this.speed = this.maxSpeed/5;
        this.position = Util.increase(
          playerSegment.p1.world.z, 
          -this.playerZ!, 
          RoadBuilder.trackLength
        );
        break;
      }
    }
  }
}
  
    // Handle collisions with other cars
    for(let n = 0; n < playerSegment.cars.length; n++) {
      const car = playerSegment.cars[n];
      const carW = car.sprite.w * SPRITE_SCALE;
      if (this.speed > car.speed!) {
        if (Util.overlap(this.playerX, playerW, car.offset, carW, 0.8)) {
          this.speed = car.speed! * (car.speed!/this.speed);
          this.position = Util.increase(car.z, -this.playerZ!, RoadBuilder.trackLength);
          break;
        }
      }
    }
  
    // Keep player on road and within speed limits
    this.playerX = Util.limit(this.playerX, -3, 3);
    this.speed = Util.limit(this.speed, 0, this.maxSpeed);
  
    // Update background position based on curves
    this.skyOffset = Util.increase(this.skyOffset, 
      this.skySpeed * playerSegment.curve * (this.position-startPosition)/this.segmentLength, 1);
    this.hillOffset = Util.increase(this.hillOffset, 
      this.hillSpeed * playerSegment.curve * (this.position-startPosition)/this.segmentLength, 1);
    this.treeOffset = Util.increase(this.treeOffset, 
      this.treeSpeed * playerSegment.curve * (this.position-startPosition)/this.segmentLength, 1);
  
    // Update lap times
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
  
    // Update HUD
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
  
    // Clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);
  
    // Render background layers
    Render.background(this.ctx, this.background!, this.width, this.height, BACKGROUND.SKY, 
      this.skyOffset, this.resolution! * this.skySpeed * playerY);
    Render.background(this.ctx, this.background!, this.width, this.height, BACKGROUND.HILLS, 
      this.hillOffset, this.resolution! * this.hillSpeed * playerY);
    Render.background(this.ctx, this.background!, this.width, this.height, BACKGROUND.TREES, 
      this.treeOffset, this.resolution! * this.treeSpeed * playerY);
  
    // Render road segments
    for(let n = 0; n < this.drawDistance; n++) {
      const segment = RoadBuilder.segments[(baseSegment.index + n) % RoadBuilder.segments.length];
      segment.looped = segment.index < baseSegment.index;
      segment.fog = Util.exponentialFog(n/this.drawDistance, this.fogDensity);
      segment.clip = maxy;
  
      Util.project(segment.p1, 
        (this.playerX * this.roadWidth) - x,
        playerY + this.cameraHeight!,
        this.position - (segment.looped ? RoadBuilder.trackLength : 0),
        this.cameraDepth!,
        this.width,
        this.height,
        this.roadWidth
      );
  
      Util.project(segment.p2,
        (this.playerX * this.roadWidth) - x - dx,
        playerY + this.cameraHeight!,
        this.position - (segment.looped ? RoadBuilder.trackLength : 0),
        this.cameraDepth!,
        this.width,
        this.height,
        this.roadWidth
      );
  
      x = x + dx;
      dx = dx + segment.curve;
  
      // Skip if segment is behind us or outside view
      if ((segment.p1.camera.z <= this.cameraDepth!) || 
          (segment.p2.screen.y >= segment.p1.screen.y) || 
          (segment.p2.screen.y >= maxy)) {
        continue;
      }
  
      // Render segment
      Render.segment(this.ctx, this.width, this.lanes,
        segment.p1.screen.x!,
        segment.p1.screen.y!,
        segment.p1.screen.w!,
        segment.p2.screen.x!,
        segment.p2.screen.y!,
        segment.p2.screen.w!,
        segment.fog,
        segment.color);
  
      maxy = segment.p1.screen.y!;
    }
  
    // Render sprites and cars
    for(let n = (this.drawDistance-1); n > 0; n--) {
      const segment = RoadBuilder.segments[(baseSegment.index + n) % RoadBuilder.segments.length];
  
      // Render cars
      for(let i = 0; i < segment.cars.length; i++) {
        const car = segment.cars[i];
        const sprite = car.sprite;
        const scale = Util.interpolate(segment.p1.screen.scale!, segment.p2.screen.scale!, car.percent);
        const spriteX = Util.interpolate(segment.p1.screen.x!, segment.p2.screen.x!, car.percent) + (scale * car.offset * this.roadWidth * this.width/2);
        const spriteY = Util.interpolate(segment.p1.screen.y!, segment.p2.screen.y!, car.percent);
        Render.sprite(this.ctx, this.width, this.height, this.resolution!, this.roadWidth, [this.sprites!], sprite, scale, spriteX, spriteY, -0.5, -1);
      }
  
      // Render roadside sprites
      for(let i = 0; i < segment.sprites.length; i++) {
        const sprite = segment.sprites[i];
        const scale = segment.p1.screen.scale!;
        const spriteX = segment.p1.screen.x! + (scale * sprite.offset * this.roadWidth * this.width/2);
        const spriteY = segment.p1.screen.y!;
        Render.sprite(this.ctx, this.width, this.height, this.resolution!, this.roadWidth, [this.sprites!], sprite.source, scale, spriteX, spriteY, -0.5, -1);
      }
  
      // Render player
      if (segment === playerSegment) {
        Render.player(this.ctx, this.width, this.height, this.resolution!, this.roadWidth, [this.sprites!],
          this.speed/this.maxSpeed,
          this.cameraDepth!/this.playerZ!,
          this.width/2,
          this.height/2 - (this.cameraDepth!/this.playerZ! * Util.interpolate(playerSegment.p1.camera.y!, playerSegment.p2.camera.y!, playerPercent) * this.height/2),
          this.playerX * (this.keyLeft ? -1 : this.keyRight ? 1 : 0),
          playerSegment.p2.world.y - playerSegment.p1.world.y
        );
      }
    }
  }

  private updateCars(dt: number, playerSegment: any, playerW: number): void {
    for(let n = 0; n < this.cars.length; n++) {
      const car = this.cars[n];
      const oldSegment = RoadBuilder.findSegment(car.z);
      
      car.offset = car.offset + this.updateCarOffset(car, oldSegment, playerSegment, playerW);
      car.z = Util.increase(car.z, dt * car.speed!, RoadBuilder.trackLength);
      car.percent = Util.percentRemaining(car.z, this.segmentLength);
      
      const newSegment = RoadBuilder.findSegment(car.z);
      
      if (oldSegment !== newSegment) {
        const index = oldSegment.cars.indexOf(car);
        oldSegment.cars.splice(index, 1);
        newSegment.cars.push(car);
      }
    }
  }
  private updateCarOffset(car: any, carSegment: any, playerSegment: any, playerW: number): number {
    const lookahead = 20;
    const carW = car.sprite.w * SPRITE_SCALE;
  
    // optimization, dont bother steering around other cars when 'out of sight' of the player
    if ((carSegment.index - playerSegment.index) > this.drawDistance)
      return 0;
  
    for(let i = 1; i < lookahead; i++) {
      const segment = this.segments[(carSegment.index+i)%this.segments.length];
  
      if ((segment === playerSegment) && (car.speed! > this.speed) && 
          (Util.overlap(this.playerX, playerW, car.offset, carW, 1.2))) {
        if (this.playerX > 0.5)
          return -1/i * (car.speed!-this.speed)/this.maxSpeed;
        else if (this.playerX < -0.5)
          return 1/i * (car.speed!-this.speed)/this.maxSpeed;
        else
          return (car.offset > this.playerX) ? 
            -1/i * (car.speed!-this.speed)/this.maxSpeed : 
            1/i * (car.speed!-this.speed)/this.maxSpeed;
      }
  
      for(let j = 0; j < segment.cars.length; j++) {
        const otherCar = segment.cars[j];
        const otherCarW = otherCar.sprite.w * SPRITE_SCALE;
        if ((car.speed! > otherCar.speed!) && 
            Util.overlap(car.offset, carW, otherCar.offset, otherCarW, 1.2)) {
          if (otherCar.offset > 0.5)
            return -1/i * (car.speed!-otherCar.speed!)/this.maxSpeed;
          else if (otherCar.offset < -0.5)
            return 1/i * (car.speed!-otherCar.speed!)/this.maxSpeed;
          else
            return (car.offset > otherCar.offset) ? 
              1/i * (car.speed!-otherCar.speed!)/this.maxSpeed : 
              -1/i * (car.speed!-otherCar.speed!)/this.maxSpeed;
        }
      }
    }
  
    // if no cars ahead, but I have somehow ended up off road, then steer back on
    if (car.offset < -0.9)
      return 0.1;
    else if (car.offset > 0.9)
      return -0.1;
    else
      return 0;
  }

  private formatTime(dt: number): string {
    const minutes = Math.floor(dt/60);
    const seconds = Math.floor(dt - (minutes * 60));
    const tenths = Math.floor(10 * (dt - Math.floor(dt)));
    
    if (minutes > 0) {
      return `${minutes}.${seconds < 10 ? "0" : ""}${seconds}.${tenths}`;
    } else {
      return `${seconds}.${tenths}`;
    }
  }

  private initializeEventListeners(): void {
    // Resolution change handler
    Dom.on('resolution', 'change', (ev: Event) => {
      const target = ev.target as HTMLSelectElement;
      let w: number, h: number;
      
      switch(target.options[target.selectedIndex].value) {
        case 'fine':   w = 1280; h = 960; break;
        case 'high':   w = 1024; h = 768; break;
        case 'medium': w = 640;  h = 480; break;
        case 'low':    w = 480;  h = 360; break;
        default:       w = 1024; h = 768; break;
      }
      
      this.reset({ width: w, height: h });
      Dom.blur(ev);
    });
  
    // Other UI controls
    Dom.on('lanes', 'change', (ev: Event) => {
      const target = ev.target as HTMLSelectElement;
      Dom.blur(ev);
      this.reset({ lanes: Number(target.options[target.selectedIndex].value) });
    });
  
    Dom.on('roadWidth', 'change', (ev: Event) => {
      const target = ev.target as HTMLInputElement;
      Dom.blur(ev);
      this.reset({ 
        roadWidth: Util.limit(
          Util.toInt(target.value, this.roadWidth),
          Util.toInt(target.getAttribute('min')!, 500),
          Util.toInt(target.getAttribute('max')!, 3000)
        )
      });
    });
    Dom.on('cameraHeight', 'change', (ev: Event) => {
      const target = ev.target as HTMLInputElement;
      Dom.blur(ev);
      this.reset({ 
        cameraHeight: Util.limit(
          Util.toInt(target.value, this.cameraHeight),
          Util.toInt(target.getAttribute('min')!, 100),
          Util.toInt(target.getAttribute('max')!, 2000)
        )
      });
    });
    Dom.on('drawDistance', 'change', (ev: Event) => {
      const target = ev.target as HTMLInputElement;
      Dom.blur(ev);
      this.reset({ 
        drawDistance: Util.limit(
          Util.toInt(target.value, this.drawDistance),
          Util.toInt(target.getAttribute('min')!, 100),
          Util.toInt(target.getAttribute('max')!, 1000)
        )
      });
    });
    Dom.on('fieldOfView', 'change', (ev: Event) => {
      const target = ev.target as HTMLInputElement;
      Dom.blur(ev);
      this.reset({ 
        fieldOfView: Util.limit(
          Util.toInt(target.value, this.fieldOfView),
          Util.toInt(target.getAttribute('min')!, 60),
          Util.toInt(target.getAttribute('max')!, 140)
        )
      });
    });
    Dom.on('fogDensity', 'change', (ev: Event) => {
      const target = ev.target as HTMLInputElement;
      Dom.blur(ev);
      this.reset({ 
        fogDensity: Util.limit(
          Util.toInt(target.value, this.fogDensity),
          Util.toInt(target.getAttribute('min')!, 1),
          Util.toInt(target.getAttribute('max')!, 10)
        )
      });
    });
    // Add similar handlers for cameraHeight, drawDistance, fieldOfView, fogDensity
    // ... (similar pattern as roadWidth handler)
  }

  public start(): void {
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
        
        // Initialize fast lap time if not set
        Dom.storage.fast_lap_time = Dom.storage.fast_lap_time || '180';
        this.hud.updateHud('fast_lap_time', 
          this.formatTime(Util.toFloat(Dom.storage.fast_lap_time, 180)));
      }
    });
  }
}

new RacingGame().start();