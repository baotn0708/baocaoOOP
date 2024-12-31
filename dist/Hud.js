import { Dom } from './Dom.js';
/**
 * Quản lý HUD (Heads-up Display) và các TWEAK UI HANDLERS nếu muốn.
 * Có thể mở rộng với thông tin tốc độ, vòng đua, v.v.
 */
export class Hud {
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
        const el = Dom.get(id);
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
        return this.speedElem;
    }
}
