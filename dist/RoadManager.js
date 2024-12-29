// src/RoadManager.ts
import { Util } from './Util';
/**
 * Hằng số để dễ cấu hình chiều dài, độ dốc, độ cong...
 */
const ROAD = {
    LENGTH: { NONE: 0, SHORT: 25, MEDIUM: 50, LONG: 100 },
    HILL: { NONE: 0, LOW: 20, MEDIUM: 40, HIGH: 60 },
    CURVE: { NONE: 0, EASY: 2, MEDIUM: 4, HARD: 6 }
};
/**
 * RoadManager chịu trách nhiệm quản lý các khúc đường,
 * tách biệt logic xây dựng khỏi phần vẽ, thống kê...
 */
export class RoadManager {
    /**
     * Khởi tạo danh sách segment rỗng
     */
    constructor() {
        this.segments = [];
    }
    /**
     * Tạo "mặc định" (tương tự resetRoad bên main.js)
     */
    buildDefaultRoad() {
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
    addStraight(num) {
        const length = num || ROAD.LENGTH.MEDIUM;
        for (let i = 0; i < length; i++) {
            this.addSegment(0, 0);
        }
    }
    /**
     * Thêm đoạn đường đồi: lên hoặc xuống
     */
    addHill(num, height) {
        const length = num || ROAD.LENGTH.MEDIUM;
        const h = height || ROAD.HILL.LOW;
        for (let i = 0; i < length; i++) {
            this.addSegment(0, h);
        }
    }
    /**
     * Thêm đoạn cong
     */
    addCurve(num, curve, height) {
        const length = num || ROAD.LENGTH.SHORT;
        const c = curve || ROAD.CURVE.EASY;
        const h = height || ROAD.HILL.NONE;
        for (let i = 0; i < length; i++) {
            this.addSegment(c, h);
        }
    }
    /**
     * Tạo những đồi lăn thấp (low rolling hills)
     */
    addLowRollingHills() {
        // ví dụ đơn giản
        this.addHill(ROAD.LENGTH.SHORT, ROAD.HILL.LOW);
        this.addStraight(ROAD.LENGTH.SHORT);
        this.addHill(ROAD.LENGTH.SHORT, -ROAD.HILL.LOW);
    }
    /**
     * Tạo khúc đường S
     */
    addSCurves() {
        this.addCurve(ROAD.LENGTH.SHORT, ROAD.CURVE.MEDIUM, ROAD.HILL.NONE);
        this.addCurve(ROAD.LENGTH.SHORT, -ROAD.CURVE.MEDIUM, ROAD.HILL.NONE);
    }
    /**
     * Thêm những đoạn "bumps" đơn giản
     */
    addBumps() {
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
    addDownhillToEnd(num) {
        const length = num || ROAD.LENGTH.LONG;
        const h = -ROAD.HILL.MEDIUM;
        for (let i = 0; i < length; i++) {
            this.addSegment(0, h);
        }
    }
    /**
     * Lấy danh sách segments nếu cần cho các module khác
     */
    getSegments() {
        return this.segments;
    }
    /**
     * Hàm lõi thêm 1 segment
     */
    addSegment(curve, hill) {
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
    addRoad(enter, hold, leave, curve, hill) {
        const startY = this.lastY();
        const endY = startY + (hill * 200); // 200 chỉ là ví dụ chiều dài mỗi segment
        const total = enter + hold + leave;
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
    lastY() {
        return this.segments.length === 0 ? 0 : this.segments[this.segments.length - 1].hill;
    }
    findSegment(z, segmentLength) {
        const index = Math.floor(z / segmentLength) % this.segments.length;
        return this.segments[index];
    }
}
