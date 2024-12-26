// src/RoadManager.ts
import { Util } from './Util';

/**
 * Mô tả một đoạn đường (segment).
 * Tuỳ vào nhu cầu, bạn có thể bổ sung thuộc tính y, sprite, obstacles, v.v.
 */
export interface Segment {
  index: number;
  curve: number;
  hill: number;
  // tuỳ ý bổ sung thuộc tính
}

/**
 * Hằng số để dễ cấu hình chiều dài, độ dốc, độ cong...
 */
const ROAD = {
  LENGTH: { NONE: 0, SHORT:  25, MEDIUM:  50, LONG:  100 },
  HILL:   { NONE: 0, LOW:    20, MEDIUM:  40, HIGH:   60 },
  CURVE:  { NONE: 0, EASY:    2, MEDIUM:   4, HARD:    6 }
};

/**
 * RoadManager chịu trách nhiệm quản lý các khúc đường,
 * tách biệt logic xây dựng khỏi phần vẽ, thống kê...
 */
export class RoadManager {
  private segments: Segment[] = [];

  /**
   * Khởi tạo danh sách segment rỗng
   */
  constructor() {}

  /**
   * Tạo "mặc định" (tương tự resetRoad bên main.js)
   */
  public buildDefaultRoad(): void {
    this.segments = [];
    // Tham khảo logic resetRoad:
    this.addStraight(ROAD.LENGTH.SHORT);
    this.addLowRollingHills();
    this.addSCurves();
    this.addCurve(ROAD.LENGTH.MEDIUM, ROAD.CURVE.MEDIUM, ROAD.HILL.LOW);
    this.addDownhillToEnd();
  }

  /**
   * Thêm đoạn đường thẳng
   */
  public addStraight(num?: number): void {
    const length = num || ROAD.LENGTH.MEDIUM;
    for (let i = 0; i < length; i++) {
      this.addSegment(0, 0);
    }
  }

  /**
   * Thêm đoạn đường đồi: lên hoặc xuống
   */
  public addHill(num?: number, height?: number): void {
    const length = num || ROAD.LENGTH.MEDIUM;
    const h      = height || ROAD.HILL.LOW;
    for (let i = 0; i < length; i++) {
      this.addSegment(0, h);
    }
  }

  /**
   * Thêm đoạn cong
   */
  public addCurve(num?: number, curve?: number, height?: number): void {
    const length = num || ROAD.LENGTH.SHORT;
    const c      = curve || ROAD.CURVE.EASY;
    const h      = height || ROAD.HILL.NONE;
    for (let i = 0; i < length; i++) {
      this.addSegment(c, h);
    }
  }

  /**
   * Tạo những đồi lăn thấp (low rolling hills)
   */
  public addLowRollingHills(): void {
    // ví dụ đơn giản
    this.addHill(ROAD.LENGTH.SHORT, ROAD.HILL.LOW);
    this.addStraight(ROAD.LENGTH.SHORT);
    this.addHill(ROAD.LENGTH.SHORT, -ROAD.HILL.LOW);
  }

  /**
   * Tạo khúc đường S
   */
  public addSCurves(): void {
    this.addCurve(ROAD.LENGTH.SHORT,  ROAD.CURVE.MEDIUM, ROAD.HILL.NONE);
    this.addCurve(ROAD.LENGTH.SHORT, -ROAD.CURVE.MEDIUM, ROAD.HILL.NONE);
  }

  /**
   * Thêm những đoạn "bumps" đơn giản
   */
  public addBumps(): void {
    const length = 10;
    const pattern = [5, -2, -5, 8, 5, -7, 5, -2];
    for (let h of pattern) {
      for (let i = 0; i < length; i++) {
        this.addSegment(0, h);
      }
    }
  }

  /**
   * Ví dụ đoạn dốc xuống đến cuối
   */
  public addDownhillToEnd(num?: number): void {
    const length = num || ROAD.LENGTH.LONG;
    const h      = -ROAD.HILL.MEDIUM;
    for (let i = 0; i < length; i++) {
      this.addSegment(0, h);
    }
  }

  /**
   * Lấy danh sách segments nếu cần cho các module khác
   */
  public getSegments(): Segment[] {
    return this.segments;
  }

  /**
   * Hàm lõi thêm 1 segment
   */
  private addSegment(curve: number, hill: number): void {
    const index = this.segments.length;
    this.segments.push({ index, curve, hill });
  }

  // ---------------------------------------------------------------------
  // Nếu muốn mô phỏng logic "enter-hold-leave" có thể dùng hàm dưới:
  // ---------------------------------------------------------------------

  /**
   * Ví dụ mô phỏng logic addRoad(enter, hold, leave, curve, hill) 
   * như trong main.js, nếu cần chi tiết uốn, v.v.
   */
  private addRoad(enter: number, hold: number, leave: number, curve: number, hill: number): void {
    const startY = this.lastY();
    const endY   = startY + (hill * 200); // 200 chỉ là ví dụ chiều dài mỗi segment
    const total  = enter + hold + leave;

    // Tăng dần
    for (let n = 0; n < enter; n++) {
      const pct = n / enter;
      this.addSegment(Util.interpolate(curve, 0, pct), Util.interpolate(endY, startY, pct));
    }
    // Giữ nguyên
    for (let n = 0; n < hold; n++) {
      this.addSegment(curve, endY);
    }
    // Giảm dần
    for (let n = 0; n < leave; n++) {
      const pct = n / leave;
      this.addSegment(Util.interpolate(0, curve, pct), Util.interpolate(startY, endY, pct));
    }
  }

  private lastY(): number {
    return this.segments.length === 0 ? 0 : this.segments[this.segments.length - 1].hill;
  }
  public findSegment(z: number, segmentLength: number): Segment {
    const index = Math.floor(z / segmentLength) % this.segments.length;
    return this.segments[index];
  }
}