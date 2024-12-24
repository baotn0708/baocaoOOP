// src/Main.ts
import { Dom } from './Dom';
import { Stats } from './Stats';
import { Game } from './Game';
import { Util } from './Util';
import { RoadManager } from './RoadManager';
import { Renderer } from './Renderer';

const fps = 60;
const step = 1 / fps;
const width = 1024;
const height = 768;

let ctx: CanvasRenderingContext2D;
let background: HTMLImageElement;
let sprites: HTMLImageElement;

const roadManager = new RoadManager();
roadManager.buildDefaultRoad();

function ready(images: HTMLImageElement[]): void {
  background = images[0];
  sprites = images[1];
  ctx = (Dom.get('canvas') as HTMLCanvasElement).getContext('2d')!;
}

function update(dt: number): void {
  // Cập nhật game logic, camera, xe...
}

function render(): void {
  ctx.clearRect(0, 0, width, height);
  // Ví dụ:
  // const renderer = new Renderer(ctx, width, height);
  // renderer.drawBackground(background, 0, { x: 0, y: 0, w: 320, h: 240 }, 0);
  // ...
}

const stats = new Stats();

const keys = [
  {
    key: 37, // Left arrow
    mode: 'down',
    action: () => {
      // Xử lý bẻ lái trái...
    }
  },
  {
    key: 39, // Right arrow
    mode: 'down',
    action: () => {
      // Xử lý bẻ lái phải...
    }
  }
];

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