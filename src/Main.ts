import { Dom } from './Dom';
import { Stats } from './Stats';
import { Game } from './Game';
import { Util } from './Util';
import { RoadManager, Segment } from './RoadManager';
import { Renderer } from './Renderer';
import { Hud } from './Hud';

interface Car {
  x: number;        // -1..1 (road-relative X)
  z: number;        // absolute Z position
  speed: number;    // tốc độ xe AI
  spriteW: number;  // chiều rộng sprite
  percent: number;  // (z % segmentLength)/segmentLength
  spriteKey: string;// tham chiếu 'sprites'
}

// Các hằng số, giống main.js
const fps = 60;
const step = 1 / fps;
const width = 1024;
const height = 768;
const segmentLength = 200;
const centrifugal = 0.3;
const offRoadLimit = segmentLength / 4;

// Canvas, images
let ctx: CanvasRenderingContext2D;
let background: HTMLImageElement;
let sprites: HTMLImageElement;

// Road + HUD
const roadManager = new RoadManager();
roadManager.buildDefaultRoad();
const hud = new Hud();
hud.addDebugSlider();

// Game state
let position = 0;           // camera Z
let trackLength = 0;        // tổng chiều dài đường
let playerX = 0;            // -1..1
let playerZ = 200;          // camera offset
let speed = 0;
let maxSpeed = segmentLength / step;
let accel = maxSpeed / 5;
let decel = -maxSpeed / 5;
let breaking = -maxSpeed;
let offRoadDecel = -maxSpeed / 2;
let keyLeft = false, keyRight = false;
let keyFaster = false, keySlower = false;

// Đếm thời gian vòng, quản lý xe
let currentLapTime = 0;
const cars: Car[] = []; // có thể khởi tạo AI cars.push(...)

// Khởi tạo canvas + trackLength
function ready(images: HTMLImageElement[]): void {
  background = images[0];
  sprites = images[1];
  ctx = (Dom.get('canvas') as HTMLCanvasElement).getContext('2d')!;
  const speedEl = hud.getSpeedElemContainer();
  if (!document.body.contains(speedEl)) {
    document.body.appendChild(speedEl);
  }
}

/**
 * Cập nhật offset xe AI (tránh nhau, v.v.)
 *  - Mô phỏng logic ở main.js tùy biến AI.
 */
function updateCarOffset(car: Car, oldSeg: Segment, newSeg: Segment): number {
  // 1) Xe trôi nhẹ nhàng trái/phải
  const drift = (Math.random() * 0.01) - 0.005; 
  let newX = car.x + drift;

  // 2) Giới hạn vị trí trong [-1..1]
  if (newX < -1) newX = -1;
  if (newX >  1) newX =  1;

  // 3) (Tuỳ chọn) Kiểm tra đụng xe khác trong segment
  //    Lấy danh sách car trong newSeg, xem nếu overlap -> đẩy ra
  //    if (newSeg.cars && newSeg.cars.length > 0) {
  //       for (const otherCar of newSeg.cars) {
  //         if (otherCar !== car) {
  //           if (Util.overlap(newX, car.spriteW, otherCar.x, otherCar.spriteW, 0.8)) {
  //             // ví dụ đẩy xe AI tạt ra trái
  //             newX -= 0.01;
  //           }
  //         }
  //       }
  //    }

  // 4) (Tuỳ chọn) Kiểm tra va chạm với người chơi
  //    so sánh playerX/playerZ ~ car.x/car.z

  return newX;
}

/**
 * Cập nhật vị trí và va chạm của xe AI
 *  - Tham khảo main.js: updateCars(dt, playerSegment, playerW)
 */
function updateCars(dt: number, playerSegment: Segment, playerW: number): void {
  for (const car of cars) {
    // Đoạn cũ
    const oldSeg = roadManager.findSegment(car.z, segmentLength);

    // Tăng z xe
    car.z = Util.increase(car.z, dt * car.speed, trackLength);
    car.percent = Util.percentRemaining(car.z, segmentLength);

    // Đoạn mới
    const newSeg = roadManager.findSegment(car.z, segmentLength);

    // Cập nhật offset
    car.x = updateCarOffset(car, oldSeg, newSeg);

    // (Nếu cần lưu hoặc xóa car khỏi oldSeg, thêm vào newSeg)

    // Va chạm với người chơi (đơn giản):
    // Giả sử nếu car ở gần cùng Z, ta kiểm tra overlap
    const playerZAbs = position + playerZ; 
    if (Math.abs(car.z - playerZAbs) < segmentLength) {
      if (Util.overlap(car.x, car.spriteW, playerX, playerW, 0.8)) {
        // Ví dụ giảm tốc người chơi
        speed *= 0.9;
        // Hoặc đẩy xe AI, vv...
      }
    }
  }
}

/**
 * Kết hợp logic input, tính playerX, tốc độ, offroad, v.v.
 *  - Dài dòng hơn main.js; xem keyLeft/keyRight, v.v.
 */
function update(dt: number): void {
  // Tính tỷ lệ tốc độ so với tốc độ tối đa
  const speedPercent = speed / maxSpeed;
  // Mức bẻ lái = tốc độ * dt * hằng số nào đó (ở đây là 2)
  const dx = dt * 2 * speedPercent;

  // Xác định segment người chơi đang đứng (dựa vào position+playerZ)
  const playerSegment = roadManager.findSegment(position + playerZ, segmentLength);
  // Giả định bề ngang sprite của người chơi
  const playerW = 64;

  // 1) Bẻ lái trái/phải
  if (keyLeft)  playerX -= dx;
  if (keyRight) playerX += dx;

  // 2) Ảnh hưởng cong của đoạn đường
  playerX -= dx * speedPercent * playerSegment.curve * centrifugal;

  // 3) Tăng/giảm tốc độ
  if (keyFaster)      speed = Util.accelerate(speed, accel, dt);
  else if (keySlower) speed = Util.accelerate(speed, breaking, dt);
  else                speed = Util.accelerate(speed, decel, dt);

  // Giới hạn lại tốc độ
  speed = Util.limit(speed, 0, maxSpeed);

  // 4) Cập nhật xe AI (va chạm, vị trí)
  updateCars(dt, playerSegment, playerW);

  // 5) Cập nhật vị trí camera (Z)
  position = Util.increase(position, speed * dt, trackLength);

  // 6) Xử lý offroad: nếu playerX ngoài [-1..1], giảm tốc
  if ((playerX < -1) || (playerX > 1)) {
    speed *= 0.98;
    if (speed < offRoadLimit) speed = offRoadLimit;
  }

  // 7) Cập nhật thời gian vòng
  currentLapTime += dt;

  // 8) Gửi thông tin lên HUD
  hud.updateSpeed(speed);
  hud.updateLapTime(currentLapTime);
}

/**
 * Vẽ cảnh (background, đường, xe, v.v.)
 *  - Tham khảo main.js: renderer.drawBackground..., renderer.drawSegment...
 */
// ...existing code...
function render(): void {
  ctx.clearRect(0, 0, width, height);
  const renderer = new Renderer(ctx, width, height);
  renderer.drawBackground(background, 0, { x: 0, y: 0, w: 320, h: 240 }, 0);
  const baseSegment = roadManager.findSegment(position, segmentLength);
  const basePercent = Util.percentRemaining(position, segmentLength);
  const drawDistance = 300;
  const cameraZ = position;
  const lanes = 3;
  for (let n = 0; n < drawDistance; n++) {
    const index = (baseSegment.index + n) % roadManager.getSegments().length;
    const seg = roadManager.getSegments()[index];
    const fog = Util.exponentialFog(n / drawDistance, 5);
    const projected = { world: { x: 0, y: 0, z: 0 }, camera: {}, screen: {} };
    projected.world.z = (index * segmentLength) - cameraZ;
    Util.project(projected, 0, 0, 0, 1, width, height, 2000);
    const x1 = 0, y1 = 0, w1 = 0, x2 = 0, y2 = 0, w2 = 0;
    renderer.drawSegment(lanes, x1, y1, w1, x2, y2, w2, { road: '#999', rumble: '#fff', grass: '#070' }, fog);
  }
  for (const car of cars) {
    const scale = 1;
    const x2d = 0;
    const y2d = 0;
    renderer.drawSprite(
      sprites,
      { x: 0, y: 0, w: car.spriteW, h: car.spriteW },
      scale,
      x2d,
      y2d,
      -0.5,
      -1
    );
  }
  const scale = 1;
  const playerX2d = 0;
  const playerY2d = 0;
  renderer.drawSprite(
    sprites,
    { x: 0, y: 0, w: 64, h: 64 },
    scale,
    playerX2d,
    playerY2d,
    -0.5,
    -1
  );
}
// ...existing code...

// Khởi tạo stats
const stats = new Stats();

// Key bindings
const keys = [
  { key: 37, mode: 'down', action: () => (keyLeft = true) },
  { key: 37, mode: 'up',   action: () => (keyLeft = false) },
  { key: 39, mode: 'down', action: () => (keyRight = true) },
  { key: 39, mode: 'up',   action: () => (keyRight = false) },
  { key: 38, mode: 'down', action: () => (keyFaster = true) },
  { key: 38, mode: 'up',   action: () => (keyFaster = false) },
  { key: 40, mode: 'down', action: () => (keySlower = true) },
  { key: 40, mode: 'up',   action: () => (keySlower = false) }
];

// Chạy game
Game.run({
  canvas: Dom.get('canvas') as HTMLCanvasElement,
  images: ['background', 'sprites'],
  ready,
  keys,
  update,
  render,
  step,
  stats
});