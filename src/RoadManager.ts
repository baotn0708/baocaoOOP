// src/RoadManager.ts
import { Util } from './Util';

/**
 * Cấu trúc mô tả một segment của đường.
 * Tuỳ nhu cầu, có thể bổ sung thuộc tính y, sprite, v.v.
 */
export interface Segment {
  index: number;
  curve: number;
  hill: number;
  // ...
}

export class RoadManager {
  private segments: Segment[] = [];

  /**
   * Khởi tạo danh sách segments rỗng
   */
  constructor() {}

  /**
   * Tạo road mặc định (tương tự resetRoad trong [main.js](main.js))
   */
  public buildDefaultRoad(): void {
    this.segments = [];
    // mô phỏng logic resetRoad:
    this.addStraight(25);
    this.addLowRollingHills();
    this.addSCurves();
    this.addCurve(50, 4, 20);
    // ... tiếp tục thêm các hàm khác ...
  }

  /**
   * Tạo một đoạn đường thẳng: logic di dời từ [main.js](main.js) - [`addStraight`](main.js)
   */
  public addStraight(num: number): void {
    for (let i = 0; i < (num || 25); i++) {
      this.addSegment(0, 0);
    }
  }

  /**
   * Thêm đoạn đường lên/xuống (hill): logic di dời từ [main.js](main.js) - [`addHill`](main.js)
   */
  public addHill(num?: number, height?: number): void {
    // ví dụ tối giản
    const total = num || 25;
    const h     = height || 20;
    for (let i = 0; i < total; i++) {
      this.addSegment(0, h);
    }
  }

  /**
   * Thêm đoạn đường cong: logic di dời từ [main.js](main.js) - [`addCurve`](main.js)
   */
  public addCurve(num?: number, curve?: number, height?: number): void {
    const total = num || 25;
    const c     = curve || 2;
    const h     = height || 0;
    for (let i = 0; i < total; i++) {
      this.addSegment(c, h);
    }
  }

  /**
   * Tạo một dãy đồi nhỏ: logic di dời từ [main.js](main.js) - [`addLowRollingHills`](main.js)
   */
  public addLowRollingHills(num?: number): void {
    // ví dụ đơn giản
    this.addHill(num, 20);
    this.addStraight(num || 25);
    this.addHill(num, -20);
  }

  /**
   * Tạo những khúc S: logic di dời từ [main.js](main.js) - [`addSCurves`](main.js)
   */
  public addSCurves(): void {
    this.addCurve(25, 4, 0);
    this.addCurve(25, -4, 0);
  }

  /**
   * Lấy danh sách segment (nếu cần dùng nơi khác)
   */
  public getSegments(): Segment[] {
    return this.segments;
  }

  /**
   * Hàm cốt lõi để thêm đoạn đường
   */
  private addSegment(curve: number, hill: number): void {
    const index = this.segments.length;
    this.segments.push({ index, curve, hill });
    // ... tuỳ ý mở rộng
  }
}