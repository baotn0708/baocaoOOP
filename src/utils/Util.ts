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
}