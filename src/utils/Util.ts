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
export class Util {
  public static timestamp(): number {
    return new Date().getTime();
  }
  public static toInt(obj: any, def: number): number {
    if (obj !== null && !isNaN(obj)) return parseInt(obj, 10);
    return def || 0;
  }
  public static toFloat(obj: any, def: number): number {
    if (obj !== null && !isNaN(obj)) return parseFloat(obj);
    return def || 0.0;
  }
  public static limit(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(value, max));
  }
  public static randomInt(min: number, max: number): number {
    return Math.round(this.interpolate(min, max, Math.random()));
  }
  public static randomChoice<T>(options: T[]): T {
    return options[this.randomInt(0, options.length - 1)];
  }
  public static percentRemaining(n: number, total: number): number {
    return (n % total) / total;
  }
  public static accelerate(v: number, accel: number, dt: number): number {
    return v + accel * dt;
  }
  public static interpolate(a: number, b: number, percent: number): number {
    return a + (b - a) * percent;
  }
  public static easeIn(a: number, b: number, percent: number): number {
    return a + (b - a) * Math.pow(percent, 2);
  }
  public static easeOut(a: number, b: number, percent: number): number {
    return a + (b - a) * (1 - Math.pow(1 - percent, 2));
  }
  public static easeInOut(a: number, b: number, percent: number): number {
    return a + (b - a) * ((-Math.cos(percent * Math.PI) / 2) + 0.5);
  }
  public static exponentialFog(distance: number, density: number): number {
    return 1 / (Math.pow(Math.E, distance * distance * density));
  }
  public static increase(start: number, increment: number, max: number): number {
    let result = start + increment;
    while (result >= max) result -= max;
    while (result < 0) result += max;
    return result;
  }
  public static project(p: Point, cameraX: number, cameraY: number, cameraZ: number, 
    cameraDepth: number, width: number, height: number, roadWidth: number): void {
    p.camera.x = (p.world.x || 0) - cameraX;
    p.camera.y = (p.world.y || 0) - cameraY;
    p.camera.z = (p.world.z || 0) - cameraZ;
    p.screen.scale = cameraDepth/p.camera.z;
    p.screen.x = Math.round((width/2) + (p.screen.scale * p.camera.x * width/2));
    p.screen.y = Math.round((height/2) - (p.screen.scale * p.camera.y * height/2));
    p.screen.w = Math.round((p.screen.scale * roadWidth * width/2));
    }
    public static overlap(x1: number, w1: number, x2: number, w2: number, percent: number = 1): boolean {
      const half = percent/2;
      const min1 = x1 - (w1 * half);
      const max1 = x1 + (w1 * half);
      const min2 = x2 - (w2 * half);
      const max2 = x2 + (w2 * half);
      return !(max1 < min2 || min1 > max2);
    }
}