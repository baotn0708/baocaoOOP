import { COLORS, SPRITES, BILLBOARD_SPRITES, PLANT_SPRITES, CAR_SPRITES, Sprite } from "./constants";
import { Util } from "./utils/Util";
import { RacingGame } from "./index";

interface Point {
  world: {
    y: number;
    z: number;
    x?: number;
  };
  camera: {
    x?: number;
    y?: number;
    z?: number;
    scale?: number;
  };
  screen: {
    x?: number;
    y?: number;
    w?: number;
    scale?: number;
  };
}
interface Segment {
  index: number;
  p1: Point;
  p2: Point;
  curve: number;
  sprites: SpriteInstance[];
  cars: Car[];
  color: typeof COLORS.LIGHT | typeof COLORS.DARK | typeof COLORS.START | typeof COLORS.FINISH;
  looped?: boolean;
  fog?: number;
  clip?: number;
}

interface SpriteInstance {
  source: Sprite;
  offset: number;
}
interface Car {
  offset: number;
  z: number;
  sprite: Sprite;
  speed?: number;
  percent?: number;
}
export const ROAD = {
  LENGTH: {
    NONE: 0,
    SHORT: 25,
    MEDIUM: 50,
    LONG: 100
  },
  HILL: {
    NONE: 0,
    LOW: 20,
    MEDIUM: 40,
    HIGH: 60
  },
  CURVE: {
    NONE: 0,
    EASY: 2,
    MEDIUM: 4,
    HARD: 6
  }
};
export class RoadBuilder {
  public static segments: Segment[] = [];
  public static segmentLength = 200;
  private static rumbleLength = 3;
  private static playerZ = 0;
  public static trackLength = 0;
  public static cars: Car[] = [];
  private static totalCars = 200;
  public static maxSpeed = RoadBuilder.segmentLength*60;
  public static getSegments(): Segment[] {
    return this.segments;
  }
  private static lastY(): number {
    return this.segments.length === 0 ? 0 : this.segments[this.segments.length - 1].p2.world.y;
  }

  private static addSegment(curve: number, y: number): void {
    const n = this.segments.length;
    this.segments.push({
      index: n,
      p1: { 
        world: { y: this.lastY(), z: n * this.segmentLength }, 
        camera: {}, 
        screen: {} 
      },
      p2: { 
        world: { y: y, z: (n + 1) * this.segmentLength }, 
        camera: {}, 
        screen: {} 
      },
      curve: curve,
      sprites: [],
      cars: [],
      color: Math.floor(n / this.rumbleLength) % 2 ? COLORS.DARK : COLORS.LIGHT
    });
  }

  public static addRoad(enter: number, hold: number, leave: number, curve: number, y: number): void {
    const startY = this.lastY();
    const endY = startY + Util.toInt(y, 0) * this.segmentLength;
    const total = enter + hold + leave;
    
    for(let n = 0; n < enter; n++)
      this.addSegment(Util.easeIn(0, curve, n/enter), Util.easeInOut(startY, endY, n/total));
    
    for(let n = 0; n < hold; n++)
      this.addSegment(curve, Util.easeInOut(startY, endY, (enter+n)/total));
    
    for(let n = 0; n < leave; n++)
      this.addSegment(Util.easeInOut(curve, 0, n/leave), Util.easeInOut(startY, endY, (enter+hold+n)/total));
  }

  public static addStraight(num: number): void {
    num = num || this.rumbleLength;
    this.addRoad(num, num, num, 0, 0);
  }

  public static addHill(num: number, height: number): void {
    num = num || this.rumbleLength;
    height = height || 0;
    this.addRoad(num, num, num, 0, height);
  }

  public static addCurve(num: number, curve: number, height: number): void {
    num = num || this.rumbleLength;
    curve = curve || 0;
    height = height || 0;
    this.addRoad(num, num, num, curve, height);
  }

  public static addLowRollingHills(num: number, height: number): void {
    num = num || this.rumbleLength;
    height = height || 0;
    this.addRoad(num, num, num, 0, height/2);
    this.addRoad(num, num, num, 0, -height);
    this.addRoad(num, num, num, 0, height);
    this.addRoad(num, num, num, 0, 0);
    this.addRoad(num, num, num, 0, height/2);
    this.addRoad(num, num, num, 0, 0);
  }

  public static addSCurves(): void {
    this.addRoad(this.rumbleLength, this.rumbleLength, this.rumbleLength, -2, 0);
    this.addRoad(this.rumbleLength, this.rumbleLength, this.rumbleLength, 2, 0);
    this.addRoad(this.rumbleLength, this.rumbleLength, this.rumbleLength, -2, 0);
    this.addRoad(this.rumbleLength, this.rumbleLength, this.rumbleLength, 2, 0);
  }

  public static addDownhillToEnd(num: number): void {
    num = num || 200;
    this.addRoad(num, num, num, 0, -this.lastY()/this.segmentLength);
  }

  public static addSprite(n: number, sprite: Sprite, offset: number): void {
    this.segments[n].sprites.push({ source: sprite, offset: offset });
  }

  public static addCar(n: number, sprite: Sprite, offset: number): void {
    const car: Car = { offset: offset, z: 0, sprite: sprite };
    this.segments[n].cars.push(car);
  }
  public static addBumps(): void {
    this.addRoad(10, 10, 10, 0, 5);
    this.addRoad(10, 10, 10, 0, -2);
    this.addRoad(10, 10, 10, 0, -5);
    this.addRoad(10, 10, 10, 0, 8);
    this.addRoad(10, 10, 10, 0, 5);
    this.addRoad(10, 10, 10, 0, -7);
    this.addRoad(10, 10, 10, 0, 5);
    this.addRoad(10, 10, 10, 0, -2);
  }
  public static resetRoad(): void {
    this.segments = [];

    this.addStraight(ROAD.LENGTH.SHORT);
    this.addLowRollingHills(ROAD.LENGTH.SHORT, ROAD.HILL.LOW);
    this.addSCurves();
    this.addCurve(ROAD.LENGTH.MEDIUM, ROAD.CURVE.MEDIUM, ROAD.HILL.LOW);
    this.addBumps();
    this.addLowRollingHills(ROAD.LENGTH.MEDIUM, ROAD.HILL.MEDIUM);
    this.addCurve(ROAD.LENGTH.LONG*2, ROAD.CURVE.MEDIUM, ROAD.HILL.MEDIUM);
    this.addStraight(ROAD.LENGTH.MEDIUM);
    this.addHill(ROAD.LENGTH.MEDIUM, ROAD.HILL.HIGH);
    this.addSCurves();
    this.addCurve(ROAD.LENGTH.LONG, -ROAD.CURVE.MEDIUM, ROAD.HILL.NONE);
    this.addHill(ROAD.LENGTH.LONG, ROAD.HILL.HIGH);
    this.addCurve(ROAD.LENGTH.LONG, ROAD.CURVE.MEDIUM, -ROAD.HILL.LOW);
    this.addBumps();
    this.addHill(ROAD.LENGTH.LONG, -ROAD.HILL.MEDIUM);
    this.addStraight(ROAD.LENGTH.MEDIUM);
    this.addSCurves();
    this.addDownhillToEnd(200);

    this.resetSprites();
    this.resetCars();

    this.segments[this.findSegment(this.playerZ).index + 2].color = COLORS.START;
    this.segments[this.findSegment(this.playerZ).index + 3].color = COLORS.START;
    for(let n = 0; n < this.rumbleLength; n++) {
      this.segments[this.segments.length-1-n].color = COLORS.FINISH;
    }

    this.trackLength = this.segments.length * this.segmentLength;
  }
  private static resetSprites(): void {
    // Fix billboard positions
    this.addSprite(20,  SPRITES.BILLBOARD07, -1);
    this.addSprite(40,  SPRITES.BILLBOARD06, -1);
    this.addSprite(60,  SPRITES.BILLBOARD08, -1);
    this.addSprite(80,  SPRITES.BILLBOARD09, -1);
    this.addSprite(100, SPRITES.BILLBOARD01, -1);
    this.addSprite(120, SPRITES.BILLBOARD02, -1);
    this.addSprite(140, SPRITES.BILLBOARD03, -1);
    this.addSprite(160, SPRITES.BILLBOARD04, -1);
    this.addSprite(180, SPRITES.BILLBOARD05, -1);

    // Adjust offset multipliers for better positioning
    this.addSprite(240, SPRITES.BILLBOARD07, -1.2);
    this.addSprite(240, SPRITES.BILLBOARD06,  1.2);
    this.addSprite(this.segments.length - 25, SPRITES.BILLBOARD07, -1.2);
    this.addSprite(this.segments.length - 25, SPRITES.BILLBOARD06,  1.2);

    // Adjust tree positioning
    for(let n = 10; n < 200; n += 4 + Math.floor(n/100)) {
      this.addSprite(n, SPRITES.PALM_TREE, 0.5 + Math.random()*0.5);
      this.addSprite(n, SPRITES.PALM_TREE, 1 + Math.random()*2);
    }

    // Adjust plant positioning
    for(let n = 250; n < 1000; n += 5) {
      this.addSprite(n, SPRITES.COLUMN, 1.1);
      this.addSprite(n + Util.randomInt(0,5), SPRITES.TREE1, -1 - Math.random()*2);
      this.addSprite(n + Util.randomInt(0,5), SPRITES.TREE2, -1 - Math.random()*2);
    }

    // Adjust random plant positioning
    for(let n = 200; n < this.segments.length; n += 3) {
      const offset = Util.randomChoice([1,-1]) * (2 + Math.random() * 5);
      this.addSprite(n, Util.randomChoice(PLANT_SPRITES), offset);
    }

    // Adjust roadside objects
    for(let n = 1000; n < (this.segments.length-50); n += 100) {
      const side = Util.randomChoice([1, -1]);
      this.addSprite(n + Util.randomInt(0,50), 
        Util.randomChoice(BILLBOARD_SPRITES), -side);
      
      for(let i = 0; i < 20; i++) {
        const sprite = Util.randomChoice(PLANT_SPRITES);
        const offset = side * (1.5 + Math.random());
        this.addSprite(n + Util.randomInt(0,50), sprite, offset);
      }
    }
  }
  public static resetCars(): void {
    this.cars = [];
    for(let n = 0; n < this.totalCars; n++) {
      const offset = Math.random() * Util.randomChoice([-0.8, 0.8]);
      const z = Math.floor(Math.random() * this.segments.length) * this.segmentLength;
      const sprite = Util.randomChoice(CAR_SPRITES);
      const speed = this.maxSpeed/4 + Math.random() * this.maxSpeed/(sprite === SPRITES.SEMI ? 4 : 2);
      const car: Car = { offset, z, sprite, speed, percent: 0 };
      const segment = this.findSegment(car.z);
      segment.cars.push(car);
      this.cars.push(car);
    }
  }

  public static findSegment(z: number): Segment {
    return this.segments[Math.floor(z/this.segmentLength) % this.segments.length];
  }
}