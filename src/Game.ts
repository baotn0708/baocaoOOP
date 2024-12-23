// src/Game.ts
import { Dom } from './Dom';
import { Util } from './Util';
import { Stats } from './Stats';

export class Game {
  public static run(options: {
    canvas: HTMLCanvasElement;
    images: string[];
    ready: (images: HTMLImageElement[]) => void;
    keys: Array<{ key: number; keys?: number[]; mode?: string; action: () => void }>;
    update: (dt: number) => void;
    render: () => void;
    step: number;
    stats: Stats;
  }): void {
    Game.loadImages(options.images, (images) => {
      options.ready(images);
      Game.setKeyListener(options.keys);
      let now: number, last = Util.timestamp(), dt = 0, gdt = 0;

      function frame() {
        now = Util.timestamp();
        dt  = Math.min(1, (now - last) / 1000);
        gdt = gdt + dt;
        while (gdt > options.step) {
          gdt -= options.step;
          options.update(options.step);
        }
        options.render();
        options.stats.update();
        last = now;
        requestAnimationFrame(frame);
      }
      frame();
      Game.playMusic();
    });
  }

  private static loadImages(names: string[], callback: (images: HTMLImageElement[]) => void): void {
    const result: HTMLImageElement[] = [];
    let count = names.length;
    const onload = () => (--count === 0) && callback(result);
    for (let i = 0; i < names.length; i++) {
      result[i] = new Image();
      Dom.on(result[i], 'load', onload);
      result[i].src = `images/${names[i]}.png`;
    }
  }

  private static setKeyListener(keys: Array<{ key: number; keys?: number[]; mode?: string; action: () => void }>): void {
    const onkey = (keyCode: number, mode: string) => {
      for (const k of keys) {
        const useMode = k.mode || 'up';
        if ((k.key === keyCode) || (k.keys && k.keys.indexOf(keyCode) >= 0)) {
          if (useMode === mode) {
            k.action();
          }
        }
      }
    };
    Dom.on(document, 'keydown', (ev) => {
      const kev = ev as KeyboardEvent;
      onkey(kev.keyCode, 'down');
    });
    Dom.on(document, 'keyup', (ev) => {
      const kev = ev as KeyboardEvent;
      onkey(kev.keyCode, 'up');
    });
    //Dom.on(document, 'keyup',   (ev: KeyboardEvent) => onkey(ev.keyCode, 'up'));
  }

  private static playMusic(): void {
    const music = Dom.get('music') as HTMLMediaElement;
    music.loop = true;
    music.volume = 0.05;
    music.muted = (Dom.storage.muted === 'true');
    music.play();
    Dom.toggleClassName('mute', 'on', music.muted);
    Dom.on('mute', 'click', () => {
      Dom.storage.muted = music.muted = !music.muted;
      Dom.toggleClassName('mute', 'on', music.muted);
    });
  }
}