import { Dom } from "./utils/Dom";
import { Stats } from "./stats/Stats";
import { Util } from "./utils/Util";

interface GameOptions {
  canvas: HTMLCanvasElement;
  update: (dt: number) => void;
  render: () => void;
  stats: Stats;
  step: number;
  images: string[];
  keys: KeyConfig[];
  ready: (images: HTMLImageElement[]) => void;
}

interface KeyConfig {
  keys?: number[];
  key?: number;
  mode?: string;
  action: () => void;
}

interface DomStorage extends Storage {
  muted?: string;
}

export class Game {
  private static instance: Game | null = null;

  private constructor() {}

  public static run(options: GameOptions): void {
    this.loadImages(options.images, (images) => {
      options.ready(images);
      this.setKeyListener(options.keys);

      let last = Util.timestamp();
      let now: number;
      let dt = 0;
      let gdt = 0;

      const frame = () => {
        now = Util.timestamp();
        dt = Math.min(1, (now - last) / 1000);
        gdt = gdt + dt;

        while (gdt > options.step) {
          gdt = gdt - options.step;
          options.update(options.step);
        }

        options.render();
        options.stats.update();
        last = now;
        requestAnimationFrame(frame);
      };

      frame();
      this.playMusic();
    });
  }

  private static loadImages(names: string[], callback: (images: HTMLImageElement[]) => void): void {
    const result: HTMLImageElement[] = [];
    let count = names.length;
  
    const onload = () => {
      if (--count === 0) {
        callback(result);
      }
    };
  
    names.forEach((name, index) => {
      result[index] = new Image();
      Dom.on(result[index], 'load', onload as EventListener);
      // Update image path to use relative path
      result[index].src = `./images/${name}.png`;
    });
  }

  private static setKeyListener(keys: KeyConfig[]): void {
    const onkey = (keyCode: number, mode: string) => {
      keys.forEach(k => {
        k.mode = k.mode || 'up';
        if ((k.key === keyCode) || (k.keys && k.keys.includes(keyCode))) {
          if (k.mode === mode) {
            k.action();
          }
        }
      });
    };

    document.addEventListener('keydown', (ev: KeyboardEvent) => onkey(ev.keyCode, 'down'));
    document.addEventListener('keyup', (ev: KeyboardEvent) => onkey(ev.keyCode, 'up'));
  }

  public static stats(parentId: string, id?: string): Stats {
    const result = new Stats();
    result.domElement.id = id || 'stats';
    
    const parent = Dom.get(parentId);
    if (parent) {
      parent.appendChild(result.domElement);

      const msg = document.createElement('div');
      msg.style.cssText = "border: 2px solid gray; padding: 5px; margin-top: 5px; text-align: left; font-size: 1.15em; text-align: right;";
      msg.innerHTML = "Your canvas performance is ";
      parent.appendChild(msg);

      const value = document.createElement('span');
      value.innerHTML = "...";
      msg.appendChild(value);

      setInterval(() => {
        const fps = result.current();
        const ok = (fps > 50) ? 'good' : (fps < 30) ? 'bad' : 'ok';
        const color = (fps > 50) ? 'green' : (fps < 30) ? 'red' : 'gray';
        value.innerHTML = ok;
        value.style.color = color;
        msg.style.borderColor = color;
      }, 5000);
    }

    return result;
  }

    private static playMusic(): void {
    const storage = Dom.storage as DomStorage;
    const music = Dom.get('music') as HTMLAudioElement;
    if (music) {
      music.loop = true;
      music.volume = 0.05;
      music.muted = (storage.muted === "true");
  
      // Add user interaction check
      const startMusic = () => {
        music.play().catch(() => {
          // Ignore failed play attempt
          console.log("Music autoplay blocked - waiting for user interaction");
        });
      };
  
      // Try to play initially
      startMusic();
  
      // Add multiple event listeners for user interaction
      const userInteractionEvents = ['click', 'touchstart', 'keydown'];
      const startMusicOnce = () => {
        startMusic();
        userInteractionEvents.forEach(event => {
          document.removeEventListener(event, startMusicOnce);
        });
      };
  
      userInteractionEvents.forEach(event => {
        document.addEventListener(event, startMusicOnce);
      });
  
      // Mute button functionality
      Dom.toggleClassName('mute', 'on', music.muted);
      Dom.on('mute', 'click', () => {
        storage.muted = String(music.muted = !music.muted);
        Dom.toggleClassName('mute', 'on', music.muted);
      });
    }
  }
}