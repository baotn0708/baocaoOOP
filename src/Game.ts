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
  private static statsInstance: Stats | null = null;

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
    if (!this.statsInstance) {
      // Use singleton Stats instance
      this.statsInstance = Stats.getInstance();
      this.statsInstance.domElement.id = id || 'stats';
      
      const parent = Dom.get(parentId);
      if (parent) {
        // Remove any existing stats elements
        const existingStats = document.getElementById('stats');
        if (existingStats) {
          existingStats.remove();
        }
        
        // Remove any existing performance message
        const existingMsg = parent.querySelector('[data-performance-msg]');
        if (existingMsg) {
          existingMsg.remove();
        }

        // Add new elements
        parent.appendChild(this.statsInstance.domElement);

        const msg = document.createElement('div');
        msg.setAttribute('data-performance-msg', 'true');
        msg.style.cssText = "border: 2px solid gray; padding: 5px; margin-top: 5px; text-align: left; font-size: 1.15em; text-align: right;";
        msg.innerHTML = "Your canvas performance is ";
        parent.appendChild(msg);

        const value = document.createElement('span');
        value.innerHTML = "...";
        msg.appendChild(value);

        // Single interval for performance message
        setInterval(() => {
          const fps = this.statsInstance!.current();
          const ok = (fps > 50) ? 'good' : (fps < 30) ? 'bad' : 'ok';
          const color = (fps > 50) ? 'green' : (fps < 30) ? 'red' : 'gray';
          value.innerHTML = ok;
          value.style.color = color;
          msg.style.borderColor = color;
        }, 5000);
      }
    }
    return this.statsInstance;
  }

    private static playMusic(): void {
      const music = Dom.get('music') as HTMLAudioElement;
      const muteButton = Dom.get('mute');
      
      if (!music || !muteButton) {
        console.warn('Music or mute button elements not found');
        return;
      }
  
      try {
        // Set initial music state
        music.loop = true;
        music.volume = 0.05;
        
        // Get stored mute state
        const storedMuted = localStorage.getItem('muted');
        music.muted = storedMuted === 'true';
        
        // Update initial button state
        Dom.toggleClassName('mute', 'on', music.muted);
  
        // Add click handler
        muteButton.addEventListener('click', () => {
          // Toggle muted state
          music.muted = !music.muted;
          // Store muted state
          localStorage.setItem('muted', music.muted.toString());
          // Update button appearance
          Dom.toggleClassName('mute', 'on', music.muted);
        });
  
        // Initial play attempt
        const playPromise = music.play();
        if (playPromise) {
          playPromise.catch(() => {
            // Add click-to-play if autoplay is blocked
            const resumeAudio = () => {
              music.play();
              document.removeEventListener('click', resumeAudio);
            };
            document.addEventListener('click', resumeAudio);
          });
        }
      } catch (error) {
        console.error('Error initializing audio:', error);
      }
  }
}