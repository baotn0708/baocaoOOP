// src/Game.ts
import { Dom } from './Dom';
import { Util } from './Util';
export class Game {
    static run(options) {
        Game.loadImages(options.images, (images) => {
            options.ready(images);
            Game.setKeyListener(options.keys);
            let now, last = Util.timestamp(), dt = 0, gdt = 0;
            function frame() {
                now = Util.timestamp();
                dt = Math.min(1, (now - last) / 1000);
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
    static loadImages(names, callback) {
        const result = [];
        let count = names.length;
        const onload = () => (--count === 0) && callback(result);
        for (let i = 0; i < names.length; i++) {
            result[i] = new Image();
            Dom.on(result[i], 'load', onload);
            result[i].src = `images/${names[i]}.png`;
        }
    }
    static setKeyListener(keys) {
        const onkey = (keyCode, mode) => {
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
            const kev = ev;
            onkey(kev.keyCode, 'down');
        });
        Dom.on(document, 'keyup', (ev) => {
            const kev = ev;
            onkey(kev.keyCode, 'up');
        });
        //Dom.on(document, 'keyup',   (ev: KeyboardEvent) => onkey(ev.keyCode, 'up'));
    }
    static playMusic() {
        const music = Dom.get('music');
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
