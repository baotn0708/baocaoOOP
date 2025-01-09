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
          this.statsInstance = Stats.getInstance();
          
          // Get parent element
          const parent = document.getElementById(parentId);
          if (parent) {
              // Remove existing container if any
              const existingContainer = document.getElementById('stats-container');
              if (existingContainer) {
                  existingContainer.remove();
              }
  
              // Create new container
              const statsContainer = document.createElement('div');
              statsContainer.id = 'stats-container';
              
              // Add stats element to container
              statsContainer.appendChild(this.statsInstance.domElement);
              
              // Add container to parent
              parent.appendChild(statsContainer);
          }
      }
      return this.statsInstance;
  }

  private static playMusic(): void {
    const music = document.getElementById('music') as HTMLAudioElement;
    const muteButton = document.getElementById('mute') as HTMLButtonElement;
    
    console.log('Music element:', music);
    console.log('Mute button:', muteButton);

    if (!music || !muteButton) {
      console.warn('Music or mute button elements not found');
      return;
    }

    // Set initial audio state
    music.loop = true;
    music.volume = 0.05;

    // Get stored mute state and apply it
    const storedMuted = localStorage.getItem('muted') === 'true';
    music.muted = storedMuted;
    
    // Update button appearance
    if (storedMuted) {
      muteButton.classList.add('on');
    } else {
      muteButton.classList.remove('on');
    }

    // Add click handler
    muteButton.onclick = () => {
      console.log('Mute clicked, current muted:', music.muted);
      
      // Toggle audio state
      music.muted = !music.muted;
      
      // Store new state
      localStorage.setItem('muted', music.muted.toString());
      
      // Update button appearance
      if (music.muted) {
        muteButton.classList.add('on');
      } else {
        muteButton.classList.remove('on');
      }
      
      console.log('Mute state updated:', music.muted);
    };

    // Start playing
    try {
      const playPromise = music.play();
      if (playPromise) {
        playPromise.catch((error) => {
          console.warn('Autoplay prevented:', error);
          // Add click-to-play if autoplay blocked
          document.addEventListener('click', function resumeAudio() {
            music.play();
            document.removeEventListener('click', resumeAudio);
          });
        });
      }
    } catch (error) {
      console.error('Audio playback error:', error);
    }
  }
}