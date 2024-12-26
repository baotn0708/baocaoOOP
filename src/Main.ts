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
  trackLength = roadManager.getSegments().length * segmentLength;
  // Gắn DOM HUD
  document.body.appendChild(hud.getSpeedElemContainer());
}

/**
 * Cập nhật offset xe AI (tránh nhau, v.v.)
 *  - Mô phỏng logic ở main.js tùy biến AI.
 */
function updateCarOffset(car: Car, oldSeg: Segment, newSeg: Segment): number {
  // Ở đây hành vi AI tuỳ ý:
  // Ví dụ: car.x += (Math.random() * 0.01 - 0.005) để đảo trái phải
  // Hoặc tránh người chơi, v.v.
  // Tạm để trống hoặc tuỳ biến
  return car.x;
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
    const newSeg = roadManager.findSegment(car.z, segmentLength);

    // Chuyển offset AI xe
    car.x = updateCarOffset(car, oldSeg, newSeg);

    // (Nếu muốn track cars tại segment cũ/mới, cập nhật mảng cũ, mảng mới)
    // if (oldSeg !== newSeg) {
    //   oldSeg.cars.splice(oldSeg.cars.indexOf(car), 1);
    //   newSeg.cars.push(car);
    // }

    // Va chạm với người chơi (đơn giản):
    // Tính overlap nếu (car.z ~ playerZ + position) & (car.x ~ playerX)
    // Tính toạ độ sprite để xem
    // ...
  }
}

/**
 * Kết hợp logic input, tính playerX, tốc độ, offroad, v.v.
 *  - Dài dòng hơn main.js; xem keyLeft/keyRight, v.v.
 */
function update(dt: number): void {
  // Tinh dx & cong đường
  const speedPercent = speed / maxSpeed;
  const dx = dt * 2 * speedPercent;
  const playerSegment = roadManager.findSegment(position + playerZ, segmentLength);
  const playerW = 64; // Giả định chiều rộng sprite người chơi

  // Bẻ lái
  if (keyLeft)  playerX -= dx;
  if (keyRight) playerX += dx;
  // Ảnh hưởng cong
  playerX -= dx * speedPercent * playerSegment.curve * centrifugal;

  // Tăng/giảm tốc
  if (keyFaster)      speed = Util.accelerate(speed, accel, dt);
  else if (keySlower) speed = Util.accelerate(speed, breaking, dt);
  else                speed = Util.accelerate(speed, decel, dt);

  speed = Util.limit(speed, 0, maxSpeed);

  // Cập nhật các xe, va chạm...
  updateCars(dt, playerSegment, playerW);

  // Cập nhật camera Z
  position = Util.increase(position, speed * dt, trackLength);

  // Offroad
  if ((playerX < -1) || (playerX > 1)) {
    speed *= 0.98;
    if (speed < offRoadLimit) speed = offRoadLimit;
  }

  // Cập nhật thời gian vòng
  currentLapTime += dt;

  // Gửi thông tin lên HUD
  hud.updateSpeed(speed);
  hud.updateLapTime(currentLapTime);
}

/**
 * Vẽ cảnh (background, đường, xe, v.v.)
 *  - Tham khảo main.js: renderer.drawBackground..., renderer.drawSegment...
 */
function render(): void {
  ctx.clearRect(0, 0, width, height);
  const renderer = new Renderer(ctx, width, height);

  // Background
  renderer.drawBackground(background, 0, { x: 0, y: 0, w: 320, h: 240 }, 0);

  // Vẽ road
  // (Ví dụ lặp qua drawDistance segment, gán cameraZ = position)
  // Tìm segment near/far, project, draw...
  // Tweak logic tuỳ theo Render.segment() cũ.
  
  // Vẽ AI cars, người chơi
  // Tính toạ độ 2D, scale, chèn sprite
  // ...

  // (Nếu muốn hiển thị debug info...) 
  // ...
}

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