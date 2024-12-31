System.register("Dom", [], function (exports_1, context_1) {
    "use strict";
    var Dom;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
            // src/Dom.ts
            Dom = class Dom {
                // Lấy thẻ HTMLElement hoặc document
                static get(id) {
                    if (id instanceof HTMLElement || id === document) {
                        return id;
                    }
                    return document.getElementById(id);
                }
                // Set innerHTML cho một phần tử
                static set(id, html) {
                    const el = Dom.get(id);
                    if (el !== document) {
                        el.innerHTML = html;
                    }
                }
                // Thêm sự kiện
                static on(ele, type, fn, capture) {
                    Dom.get(ele).addEventListener(type, fn, capture);
                }
                // Bỏ sự kiện
                static un(ele, type, fn, capture) {
                    Dom.get(ele).removeEventListener(type, fn, capture);
                }
                // Hiển thị phần tử
                static show(ele, displayType = 'block') {
                    Dom.get(ele).style.display = displayType;
                }
                // Bỏ focus
                static blur(ev) {
                    var _a;
                    (_a = ev.target) === null || _a === void 0 ? void 0 : _a.blur();
                }
                // Thêm hoặc xóa className cho phần tử
                static toggleClassName(ele, name, on) {
                    const element = Dom.get(ele);
                    const classes = element.className.split(' ');
                    const idx = classes.indexOf(name);
                    if (typeof on === 'undefined') {
                        on = (idx < 0);
                    }
                    if (on && idx < 0) {
                        classes.push(name);
                    }
                    else if (!on && idx >= 0) {
                        classes.splice(idx, 1);
                    }
                    element.className = classes.join(' ');
                }
            };
            exports_1("Dom", Dom);
            // Lưu trữ localStorage (hoặc sessionStorage) tùy ý
            Dom.storage = window.localStorage || {};
        }
    };
});
System.register("Util", [], function (exports_2, context_2) {
    "use strict";
    var Util;
    var __moduleName = context_2 && context_2.id;
    return {
        setters: [],
        execute: function () {
            // src/Util.ts
            Util = class Util {
                static timestamp() {
                    return new Date().getTime();
                }
                static toInt(obj, def) {
                    if (obj !== null) {
                        const x = parseInt(obj, 10);
                        if (!isNaN(x))
                            return x;
                    }
                    return (def !== undefined) ? Util.toInt(def, 0) : 0;
                }
                static toFloat(obj, def) {
                    if (obj !== null) {
                        const x = parseFloat(obj);
                        if (!isNaN(x))
                            return x;
                    }
                    return (def !== undefined) ? Util.toFloat(def, 0.0) : 0.0;
                }
                static limit(value, min, max) {
                    return Math.max(min, Math.min(value, max));
                }
                static randomInt(min, max) {
                    return Math.round(Util.interpolate(min, max, Math.random()));
                }
                static randomChoice(options) {
                    return options[Util.randomInt(0, options.length - 1)];
                }
                static percentRemaining(n, total) {
                    return (n % total) / total;
                }
                static accelerate(v, accel, dt) {
                    return v + (accel * dt);
                }
                static interpolate(a, b, percent) {
                    return a + (b - a) * percent;
                }
                static easeIn(a, b, percent) {
                    return a + (b - a) * Math.pow(percent, 2);
                }
                static easeOut(a, b, percent) {
                    return a + (b - a) * (1 - Math.pow(1 - percent, 2));
                }
                static easeInOut(a, b, percent) {
                    return a + (b - a) * ((-Math.cos(percent * Math.PI) / 2) + 0.5);
                }
                static exponentialFog(distance, density) {
                    // (trích từ common.js)
                    return 1 / Math.pow(Math.E, (distance * distance * density));
                }
                static increase(start, increment, max) {
                    // (trích từ common.js)
                    let result = start + increment;
                    while (result >= max)
                        result -= max;
                    while (result < 0)
                        result += max;
                    return result;
                }
                static project(p, cameraX, cameraY, cameraZ, cameraDepth, width, height, roadWidth) {
                    // (trích từ common.js)
                    p.camera.x = (p.world.x || 0) - cameraX;
                    p.camera.y = (p.world.y || 0) - cameraY;
                    p.camera.z = (p.world.z || 0) - cameraZ;
                    p.screen.scale = cameraDepth / p.camera.z;
                    p.screen.x = Math.round((width / 2) + (p.screen.scale * p.camera.x * width / 2));
                    p.screen.y = Math.round((height / 2) - (p.screen.scale * p.camera.y * height / 2));
                    p.screen.w = Math.round((p.screen.scale * roadWidth * width / 2));
                    // ... có thể mở rộng thêm logic khác nếu cần
                }
                static overlap(x1, w1, x2, w2, percent) {
                    // (trích từ common.js)
                    const half = (percent || 1) / 2;
                    const min1 = x1 - (w1 * half);
                    const max1 = x1 + (w1 * half);
                    const min2 = x2 - (w2 * half);
                    const max2 = x2 + (w2 * half);
                    return ((max1 >= min2) && (min1 <= max2));
                }
            };
            exports_2("Util", Util);
        }
    };
});
System.register("Stats", [], function (exports_3, context_3) {
    "use strict";
    var Stats;
    var __moduleName = context_3 && context_3.id;
    return {
        setters: [],
        execute: function () {
            // src/Stats.ts
            Stats = class Stats {
                constructor() {
                    this.startTime = performance.now();
                    this.prevTime = this.startTime;
                    this.fps = 0;
                    this.frames = 0;
                    this.mode = 0;
                    // container chính
                    this.domElement = document.createElement('div');
                    this.domElement.id = 'stats';
                    this.domElement.style.cssText = 'width:80px;opacity:0.9;cursor:pointer;';
                    // Tạo FPS div
                    const fpsDiv = document.createElement('div');
                    fpsDiv.id = 'fps';
                    fpsDiv.style.cssText = 'padding:0 0 3px 3px;text-align:left;background-color:#002;';
                    this.domElement.appendChild(fpsDiv);
                    const fpsText = document.createElement('div');
                    fpsText.style.cssText = 'color:#0ff;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px';
                    fpsText.innerHTML = 'FPS';
                    fpsDiv.appendChild(fpsText);
                    const fpsGraph = document.createElement('div');
                    fpsGraph.style.cssText = 'position:relative;width:74px;height:30px;background-color:#0ff;';
                    fpsDiv.appendChild(fpsGraph);
                    // Tạo MS div
                    const msDiv = document.createElement('div');
                    msDiv.id = 'ms';
                    msDiv.style.cssText = 'padding:0 0 3px 3px;text-align:left;background-color:#020;display:none;';
                    this.domElement.appendChild(msDiv);
                    const msText = document.createElement('div');
                    msText.style.cssText = 'color:#0f0;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px';
                    msText.innerHTML = 'MS';
                    msDiv.appendChild(msText);
                    const msGraph = document.createElement('div');
                    msGraph.style.cssText = 'position:relative;width:74px;height:30px;background-color:#0f0;';
                    msDiv.appendChild(msGraph);
                    // Thêm sự kiện click để chuyển giữa FPS/MS
                    this.domElement.addEventListener('mousedown', (event) => {
                        event.preventDefault();
                        this.mode = (this.mode + 1) % 2;
                        fpsDiv.style.display = this.mode === 0 ? 'block' : 'none';
                        msDiv.style.display = this.mode === 1 ? 'block' : 'none';
                    });
                }
                begin() {
                    this.startTime = performance.now();
                }
                end() {
                    const time = performance.now();
                    const ms = time - this.startTime;
                    this.frames++;
                    if (time > this.prevTime + 1000) {
                        this.fps = Math.round((this.frames * 1000) / (time - this.prevTime));
                        this.prevTime = time;
                        this.frames = 0;
                    }
                    return ms;
                }
                update() {
                    this.startTime = this.end();
                }
                currentFps() {
                    return this.fps;
                }
            };
            exports_3("Stats", Stats);
        }
    };
});
System.register("Game", ["Dom", "Util"], function (exports_4, context_4) {
    "use strict";
    var Dom_1, Util_1, Game;
    var __moduleName = context_4 && context_4.id;
    return {
        setters: [
            function (Dom_1_1) {
                Dom_1 = Dom_1_1;
            },
            function (Util_1_1) {
                Util_1 = Util_1_1;
            }
        ],
        execute: function () {
            Game = class Game {
                static run(options) {
                    Game.loadImages(options.images, (images) => {
                        options.ready(images);
                        Game.setKeyListener(options.keys);
                        let now, last = Util_1.Util.timestamp(), dt = 0, gdt = 0;
                        function frame() {
                            now = Util_1.Util.timestamp();
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
                        Dom_1.Dom.on(result[i], 'load', onload);
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
                    Dom_1.Dom.on(document, 'keydown', (ev) => {
                        const kev = ev;
                        onkey(kev.keyCode, 'down');
                    });
                    Dom_1.Dom.on(document, 'keyup', (ev) => {
                        const kev = ev;
                        onkey(kev.keyCode, 'up');
                    });
                    //Dom.on(document, 'keyup',   (ev: KeyboardEvent) => onkey(ev.keyCode, 'up'));
                }
                static playMusic() {
                    const music = Dom_1.Dom.get('music');
                    music.loop = true;
                    music.volume = 0.05;
                    music.muted = (Dom_1.Dom.storage.muted === 'true');
                    music.play();
                    Dom_1.Dom.toggleClassName('mute', 'on', music.muted);
                    Dom_1.Dom.on('mute', 'click', () => {
                        Dom_1.Dom.storage.muted = music.muted = !music.muted;
                        Dom_1.Dom.toggleClassName('mute', 'on', music.muted);
                    });
                }
            };
            exports_4("Game", Game);
        }
    };
});
System.register("Hud", ["Dom"], function (exports_5, context_5) {
    "use strict";
    var Dom_2, Hud;
    var __moduleName = context_5 && context_5.id;
    return {
        setters: [
            function (Dom_2_1) {
                Dom_2 = Dom_2_1;
            }
        ],
        execute: function () {
            /**
             * Quản lý HUD (Heads-up Display) và các TWEAK UI HANDLERS nếu muốn.
             * Có thể mở rộng với thông tin tốc độ, vòng đua, v.v.
             */
            Hud = class Hud {
                // Thêm các UI phần tử khác nếu cần
                constructor() {
                    // Tìm nạp các thẻ DOM cho HUD, ví dụ:
                    this.speedElem = this.ensureElement('hud-speed');
                    this.lapTimeElem = this.ensureElement('hud-lap-time');
                    this.bestTimeElem = this.ensureElement('hud-best-time');
                    // Khởi tạo hiển thị nếu cần
                }
                /**
                 * Đảm bảo luôn lấy được 1 phần tử DOM.
                 */
                ensureElement(id) {
                    const el = Dom_2.Dom.get(id);
                    if (!el) {
                        // Tự động tạo nếu chưa tồn tại
                        const newEl = document.createElement('div');
                        newEl.id = id;
                        document.body.appendChild(newEl);
                        return newEl;
                    }
                    return el;
                }
                /**
                 * Cập nhật tốc độ cho HUD
                 */
                updateSpeed(speed) {
                    this.speedElem.innerText = `Speed: ${Math.round(speed)}`;
                }
                /**
                 * Cập nhật thời gian vòng đua
                 */
                updateLapTime(currentLap) {
                    const seconds = currentLap.toFixed(2);
                    this.lapTimeElem.innerText = `Lap Time: ${seconds}s`;
                }
                /**
                 * Cập nhật thời gian tốt nhất
                 */
                updateBestTime(bestLap) {
                    if (bestLap !== null) {
                        const seconds = bestLap.toFixed(2);
                        this.bestTimeElem.innerText = `Best Time: ${seconds}s`;
                    }
                    else {
                        this.bestTimeElem.innerText = 'Best Time: --';
                    }
                }
                /**
                 * Ví dụ: TWEAK UI HANDLERS (như thay đổi slider, debug info)
                 * Tùy ít hay nhiều mà tách tiếp thành class riêng.
                 */
                addDebugSlider() {
                    const slider = document.createElement('input');
                    slider.type = 'range';
                    slider.min = '0';
                    slider.max = '10';
                    slider.value = '5';
                    slider.addEventListener('input', () => {
                        const val = parseInt(slider.value, 10);
                        // Ở đây có thể gửi val sang các module khác để điều chỉnh, 
                        // ví dụ cameraHeight, difficulty...
                    });
                    document.body.appendChild(slider);
                }
                getSpeedElemContainer() {
                    return this.speedElem.parentElement.parentElement;
                }
            };
            exports_5("Hud", Hud);
        }
    };
});
System.register("RoadManager", ["Util"], function (exports_6, context_6) {
    "use strict";
    var Util_2, ROAD, RoadManager;
    var __moduleName = context_6 && context_6.id;
    return {
        setters: [
            function (Util_2_1) {
                Util_2 = Util_2_1;
            }
        ],
        execute: function () {
            /**
             * Hằng số để dễ cấu hình chiều dài, độ dốc, độ cong...
             */
            ROAD = {
                LENGTH: { NONE: 0, SHORT: 25, MEDIUM: 50, LONG: 100 },
                HILL: { NONE: 0, LOW: 20, MEDIUM: 40, HIGH: 60 },
                CURVE: { NONE: 0, EASY: 2, MEDIUM: 4, HARD: 6 }
            };
            /**
             * RoadManager chịu trách nhiệm quản lý các khúc đường,
             * tách biệt logic xây dựng khỏi phần vẽ, thống kê...
             */
            RoadManager = class RoadManager {
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
                        this.addSegment(Util_2.Util.interpolate(curve, 0, pct), Util_2.Util.interpolate(endY, startY, pct));
                    }
                    // Giữ nguyên
                    for (let n = 0; n < hold; n++) {
                        this.addSegment(curve, endY);
                    }
                    // Giảm dần
                    for (let n = 0; n < leave; n++) {
                        const pct = n / leave;
                        this.addSegment(Util_2.Util.interpolate(0, curve, pct), Util_2.Util.interpolate(startY, endY, pct));
                    }
                }
                lastY() {
                    return this.segments.length === 0 ? 0 : this.segments[this.segments.length - 1].hill;
                }
                findSegment(z, segmentLength) {
                    const index = Math.floor(z / segmentLength) % this.segments.length;
                    return this.segments[index];
                }
            };
            exports_6("RoadManager", RoadManager);
        }
    };
});
System.register("Renderer", [], function (exports_7, context_7) {
    "use strict";
    var Renderer;
    var __moduleName = context_7 && context_7.id;
    return {
        setters: [],
        execute: function () {
            Renderer = class Renderer {
                constructor(ctx, width, height) {
                    this.ctx = ctx;
                    this.width = width;
                    this.height = height;
                }
                /**
                 * Draw solid background layers (sky, hills, trees).
                 *
                 * @param image - The preloaded background image (like background.png).
                 * @param destY - The vertical offset at which sub-rectangle is drawn.
                 * @param srcRect - Source sprite rectangle for each layer from the background image.
                 * @param offsetX - Horizontal offset for parallax scrolling.
                 */
                drawBackground(image, destY, srcRect, offsetX) {
                    // Typically you'll do multiple calls for SKY, HILLS, and TREES
                    // offsetX can be used for parallax movement
                    const sourceX = srcRect.x + offsetX;
                    const sx = sourceX % srcRect.w; // simple wrap-around offset
                    // Draw in multiple segments if needed so it tiles horizontally
                    // We'll do a simple approach here:
                    this.ctx.drawImage(image, sx, srcRect.y, Math.min(srcRect.w, srcRect.w - sx), srcRect.h, 0, destY, Math.min(this.width, this.width), srcRect.h);
                    // If needed, you can draw a second partial strip to tile beyond edges
                }
                /**
                 * Draw a filled polygon for roads, rumbles, etc.
                 *
                 * @param x1,y1,x2,y2,x3,y3,x4,y4 - 4 corners of the polygon.
                 * @param color - Fill color.
                 */
                drawPolygon(x1, y1, x2, y2, x3, y3, x4, y4, color) {
                    this.ctx.fillStyle = color;
                    this.ctx.beginPath();
                    this.ctx.moveTo(x1, y1);
                    this.ctx.lineTo(x2, y2);
                    this.ctx.lineTo(x3, y3);
                    this.ctx.lineTo(x4, y4);
                    this.ctx.closePath();
                    this.ctx.fill();
                }
                /**
                 * Draw a road segment, including grass background, rumble strips, lanes.
                 * This mirrors Render.segment(...) in common.js
                 *
                 * @param lanes - Number of lanes on the road.
                 * @param x1,y1,w1 - The screen position and projected road width for segment start.
                 * @param x2,y2,w2 - The screen position and projected road width for segment end.
                 * @param color - An object holding 'grass', 'road', 'rumble', and optional 'lane'.
                 * @param fog - A fog factor 0..1 for distance fade-out.
                 */
                drawSegment(lanes, x1, y1, w1, x2, y2, w2, color, fog) {
                    // Grass background
                    this.ctx.fillStyle = color.grass;
                    this.ctx.fillRect(0, y2, this.width, (y1 - y2));
                    // Rumble strips
                    const r1 = this.rumbleWidth(w1, lanes);
                    const r2 = this.rumbleWidth(w2, lanes);
                    // Road polygons
                    this.drawPolygon(x1 - w1 - r1, y1, x1 - w1, y1, x2 - w2, y2, x2 - w2 - r2, y2, color.rumble);
                    this.drawPolygon(x1 + w1 + r1, y1, x1 + w1, y1, x2 + w2, y2, x2 + w2 + r2, y2, color.rumble);
                    this.drawPolygon(x1 - w1, y1, x1 + w1, y1, x2 + w2, y2, x2 - w2, y2, color.road);
                    // Lane markers (if any)
                    if (color.lane) {
                        let lanew1 = (w1 * 2) / lanes;
                        let lanew2 = (w2 * 2) / lanes;
                        let lanex1 = x1 - w1 + lanew1;
                        let lanex2 = x2 - w2 + lanew2;
                        for (let lane = 1; lane < lanes; lane++) {
                            this.drawPolygon(lanex1 - this.laneMarkerWidth(w1, lanes) / 2, y1, lanex1 + this.laneMarkerWidth(w1, lanes) / 2, y1, lanex2 + this.laneMarkerWidth(w2, lanes) / 2, y2, lanex2 - this.laneMarkerWidth(w2, lanes) / 2, y2, color.lane);
                            lanex1 += lanew1;
                            lanex2 += lanew2;
                        }
                    }
                    // Fog overlay
                    this.drawFog(0, y2, this.width, (y1 - y2), fog);
                }
                /**
                 * Classic sprite drawing with (x,y) anchored relative to sprite size.
                 *
                 * @param sprite - The sprite image to draw from.
                 * @param spr - Coordinates/size in the sprite sheet.
                 * @param scale - Scaling factor for the sprite (distance-based).
                 * @param destX,destY - Where to place it on screen.
                 * @param offsetX,offsetY - Offsets for horizontal/vertical anchor (-0.5 for center, -1 for bottom, etc.).
                 * @param clipY - If the lower portion of the sprite is clipped by a hill, pass a y-value to cut off.
                 */
                drawSprite(sprite, spr, scale, destX, destY, offsetX, offsetY, clipY) {
                    const scaledW = spr.w * scale;
                    const scaledH = spr.h * scale;
                    const drawX = destX + (scaledW * offsetX);
                    const drawY = destY + (scaledH * offsetY);
                    // If clipY is given, we might need to skip drawing lower portion
                    if (clipY !== undefined && (drawY + scaledH) >= clipY) {
                        const clipH = (drawY + scaledH) - clipY;
                        if (clipH < scaledH) {
                            this.ctx.drawImage(sprite, spr.x, spr.y, spr.w, (spr.h - (spr.h * (clipH / scaledH))), drawX, drawY, scaledW, (scaledH - clipH));
                        }
                    }
                    else {
                        this.ctx.drawImage(sprite, spr.x, spr.y, spr.w, spr.h, drawX, drawY, scaledW, scaledH);
                    }
                }
                /**
                 * Draw the player’s car from a sprite, accounting for tilt or up/down slope.
                 *
                 * @param sprite - The main spritesheet image.
                 * @param spr - Which sprite coordinates to draw.
                 * @param scale - Distance scaling factor for the car.
                 * @param destX,destY - On-screen position for the car.
                 * @param steer - Steering factor to handle left/right frames if you have multiple player sprite angles.
                 * @param updown - Slope factor to switch between uphill/downhill frames, if needed.
                 */
                drawPlayer(sprite, spr, scale, destX, destY, steer, updown) {
                    // If you have separate frames for left, right, straight, you can choose them here
                    // For simplicity, just draw the requested sprite
                    this.drawSprite(sprite, spr, scale, destX, destY, -0.5, -1);
                }
                /**
                 * Overlay a fog rectangle that darkens distant road segments.
                 *
                 * @param x,y - Top-left corner of the rectangle to darken.
                 * @param width,height - Rectangle dimensions.
                 * @param fog - A factor 0..1 (1 = fully covered, 0 = no fog).
                 */
                drawFog(x, y, width, height, fog) {
                    if (fog <= 0)
                        return;
                    const alpha = Math.max(0, Math.min(1, fog));
                    this.ctx.save();
                    this.ctx.globalAlpha = alpha;
                    this.ctx.fillStyle = '#808080'; // or any suitable fog color
                    this.ctx.fillRect(x, y, width, height);
                    this.ctx.restore();
                }
                /**
                 * Utility to compute rumble strip width from the projected road width.
                 */
                rumbleWidth(projectedRoadWidth, lanes) {
                    // Matches the logic in common.js
                    return projectedRoadWidth / Math.max(6, 2 * lanes);
                }
                /**
                 * Utility to compute lane marker width from the projected road width.
                 */
                laneMarkerWidth(projectedRoadWidth, lanes) {
                    return projectedRoadWidth / Math.max(32, 8 * lanes);
                }
            };
            exports_7("Renderer", Renderer);
        }
    };
});
System.register("Main", ["Dom", "Stats", "Game", "Util", "RoadManager", "Renderer", "Hud"], function (exports_8, context_8) {
    "use strict";
    var Dom_3, Stats_1, Game_1, Util_3, RoadManager_1, Renderer_1, Hud_1, fps, step, width, height, segmentLength, centrifugal, offRoadLimit, ctx, background, sprites, roadManager, hud, position, trackLength, playerX, playerZ, speed, maxSpeed, accel, decel, breaking, offRoadDecel, keyLeft, keyRight, keyFaster, keySlower, currentLapTime, cars, stats, keys;
    var __moduleName = context_8 && context_8.id;
    // Khởi tạo canvas + trackLength
    function ready(images) {
        background = images[0];
        sprites = images[1];
        ctx = Dom_3.Dom.get('canvas').getContext('2d');
        trackLength = roadManager.getSegments().length * segmentLength;
        // Gắn DOM HUD
        document.body.appendChild(hud.getSpeedElemContainer());
    }
    /**
     * Cập nhật offset xe AI (tránh nhau, v.v.)
     *  - Mô phỏng logic ở main.js tùy biến AI.
     */
    function updateCarOffset(car, oldSeg, newSeg) {
        // 1) Xe trôi nhẹ nhàng trái/phải
        const drift = (Math.random() * 0.01) - 0.005;
        let newX = car.x + drift;
        // 2) Giới hạn vị trí trong [-1..1]
        if (newX < -1)
            newX = -1;
        if (newX > 1)
            newX = 1;
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
    function updateCars(dt, playerSegment, playerW) {
        for (const car of cars) {
            // Đoạn cũ
            const oldSeg = roadManager.findSegment(car.z, segmentLength);
            // Tăng z xe
            car.z = Util_3.Util.increase(car.z, dt * car.speed, trackLength);
            car.percent = Util_3.Util.percentRemaining(car.z, segmentLength);
            // Đoạn mới
            const newSeg = roadManager.findSegment(car.z, segmentLength);
            // Cập nhật offset
            car.x = updateCarOffset(car, oldSeg, newSeg);
            // (Nếu cần lưu hoặc xóa car khỏi oldSeg, thêm vào newSeg)
            // Va chạm với người chơi (đơn giản):
            // Giả sử nếu car ở gần cùng Z, ta kiểm tra overlap
            const playerZAbs = position + playerZ;
            if (Math.abs(car.z - playerZAbs) < segmentLength) {
                if (Util_3.Util.overlap(car.x, car.spriteW, playerX, playerW, 0.8)) {
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
    function update(dt) {
        // Tính tỷ lệ tốc độ so với tốc độ tối đa
        const speedPercent = speed / maxSpeed;
        // Mức bẻ lái = tốc độ * dt * hằng số nào đó (ở đây là 2)
        const dx = dt * 2 * speedPercent;
        // Xác định segment người chơi đang đứng (dựa vào position+playerZ)
        const playerSegment = roadManager.findSegment(position + playerZ, segmentLength);
        // Giả định bề ngang sprite của người chơi
        const playerW = 64;
        // 1) Bẻ lái trái/phải
        if (keyLeft)
            playerX -= dx;
        if (keyRight)
            playerX += dx;
        // 2) Ảnh hưởng cong của đoạn đường
        playerX -= dx * speedPercent * playerSegment.curve * centrifugal;
        // 3) Tăng/giảm tốc độ
        if (keyFaster)
            speed = Util_3.Util.accelerate(speed, accel, dt);
        else if (keySlower)
            speed = Util_3.Util.accelerate(speed, breaking, dt);
        else
            speed = Util_3.Util.accelerate(speed, decel, dt);
        // Giới hạn lại tốc độ
        speed = Util_3.Util.limit(speed, 0, maxSpeed);
        // 4) Cập nhật xe AI (va chạm, vị trí)
        updateCars(dt, playerSegment, playerW);
        // 5) Cập nhật vị trí camera (Z)
        position = Util_3.Util.increase(position, speed * dt, trackLength);
        // 6) Xử lý offroad: nếu playerX ngoài [-1..1], giảm tốc
        if ((playerX < -1) || (playerX > 1)) {
            speed *= 0.98;
            if (speed < offRoadLimit)
                speed = offRoadLimit;
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
    function render() {
        ctx.clearRect(0, 0, width, height);
        const renderer = new Renderer_1.Renderer(ctx, width, height);
        renderer.drawBackground(background, 0, { x: 0, y: 0, w: 320, h: 240 }, 0);
        const baseSegment = roadManager.findSegment(position, segmentLength);
        const basePercent = Util_3.Util.percentRemaining(position, segmentLength);
        const drawDistance = 300;
        const cameraZ = position;
        const lanes = 3;
        for (let n = 0; n < drawDistance; n++) {
            const index = (baseSegment.index + n) % roadManager.getSegments().length;
            const seg = roadManager.getSegments()[index];
            const fog = Util_3.Util.exponentialFog(n / drawDistance, 5);
            const projected = { world: { x: 0, y: 0, z: 0 }, camera: {}, screen: {} };
            projected.world.z = (index * segmentLength) - cameraZ;
            Util_3.Util.project(projected, 0, 0, 0, 1, width, height, 2000);
            const x1 = 0, y1 = 0, w1 = 0, x2 = 0, y2 = 0, w2 = 0;
            renderer.drawSegment(lanes, x1, y1, w1, x2, y2, w2, { road: '#999', rumble: '#fff', grass: '#070' }, fog);
        }
        for (const car of cars) {
            const scale = 1;
            const x2d = 0;
            const y2d = 0;
            renderer.drawSprite(sprites, { x: 0, y: 0, w: car.spriteW, h: car.spriteW }, scale, x2d, y2d, -0.5, -1);
        }
        const scale = 1;
        const playerX2d = 0;
        const playerY2d = 0;
        renderer.drawSprite(sprites, { x: 0, y: 0, w: 64, h: 64 }, scale, playerX2d, playerY2d, -0.5, -1);
    }
    return {
        setters: [
            function (Dom_3_1) {
                Dom_3 = Dom_3_1;
            },
            function (Stats_1_1) {
                Stats_1 = Stats_1_1;
            },
            function (Game_1_1) {
                Game_1 = Game_1_1;
            },
            function (Util_3_1) {
                Util_3 = Util_3_1;
            },
            function (RoadManager_1_1) {
                RoadManager_1 = RoadManager_1_1;
            },
            function (Renderer_1_1) {
                Renderer_1 = Renderer_1_1;
            },
            function (Hud_1_1) {
                Hud_1 = Hud_1_1;
            }
        ],
        execute: function () {
            // Các hằng số, giống main.js
            fps = 60;
            step = 1 / fps;
            width = 1024;
            height = 768;
            segmentLength = 200;
            centrifugal = 0.3;
            offRoadLimit = segmentLength / 4;
            // Road + HUD
            roadManager = new RoadManager_1.RoadManager();
            roadManager.buildDefaultRoad();
            hud = new Hud_1.Hud();
            hud.addDebugSlider();
            // Game state
            position = 0; // camera Z
            trackLength = 0; // tổng chiều dài đường
            playerX = 0; // -1..1
            playerZ = 200; // camera offset
            speed = 0;
            maxSpeed = segmentLength / step;
            accel = maxSpeed / 5;
            decel = -maxSpeed / 5;
            breaking = -maxSpeed;
            offRoadDecel = -maxSpeed / 2;
            keyLeft = false, keyRight = false;
            keyFaster = false, keySlower = false;
            // Đếm thời gian vòng, quản lý xe
            currentLapTime = 0;
            cars = []; // có thể khởi tạo AI cars.push(...)
            // ...existing code...
            // Khởi tạo stats
            stats = new Stats_1.Stats();
            // Key bindings
            keys = [
                { key: 37, mode: 'down', action: () => (keyLeft = true) },
                { key: 37, mode: 'up', action: () => (keyLeft = false) },
                { key: 39, mode: 'down', action: () => (keyRight = true) },
                { key: 39, mode: 'up', action: () => (keyRight = false) },
                { key: 38, mode: 'down', action: () => (keyFaster = true) },
                { key: 38, mode: 'up', action: () => (keyFaster = false) },
                { key: 40, mode: 'down', action: () => (keySlower = true) },
                { key: 40, mode: 'up', action: () => (keySlower = false) }
            ];
            // Chạy game
            Game_1.Game.run({
                canvas: Dom_3.Dom.get('canvas'),
                images: ['background', 'sprites'],
                ready,
                keys,
                update,
                render,
                step,
                stats
            });
        }
    };
});
