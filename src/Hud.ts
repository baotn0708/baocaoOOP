import { Dom } from './Dom.js';

/** 
 * Quản lý HUD (Heads-up Display) và các TWEAK UI HANDLERS nếu muốn.
 * Có thể mở rộng với thông tin tốc độ, vòng đua, v.v.
 */
export class Hud {
  private speedElem: HTMLElement;
  private lapTimeElem: HTMLElement;
  private bestTimeElem: HTMLElement;
  // Thêm các UI phần tử khác nếu cần

  constructor() {
    // Tìm nạp các thẻ DOM cho HUD, ví dụ:
    // this.speedElem    = this.ensureElement('hud-speed');
    this.lapTimeElem  = this.ensureElement('hud-lap-time');
    this.bestTimeElem = this.ensureElement('hud-best-time');
    this.speedElem   = this.ensureElement('speed_value');
    this.lapTimeElem = this.ensureElement('current_lap_time_value');
    // Khởi tạo hiển thị nếu cần
  }

  /**
   * Đảm bảo luôn lấy được 1 phần tử DOM.
   */
  private ensureElement(id: string): HTMLElement {
    const el = Dom.get(id) as HTMLElement;
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
  public updateSpeed(speed: number): void {
    this.speedElem.innerText = `Speed: ${Math.round(speed)}`;
  }

  /**
   * Cập nhật thời gian vòng đua
   */
  public updateLapTime(currentLap: number): void {
    const seconds = currentLap.toFixed(2);
    this.lapTimeElem.innerText = `Lap Time: ${seconds}s`;
  }

  /**
   * Cập nhật thời gian tốt nhất
   */
  public updateBestTime(bestLap: number | null): void {
    if (bestLap !== null) {
      const seconds = bestLap.toFixed(2);
      this.bestTimeElem.innerText = `Best Time: ${seconds}s`;
    } else {
      this.bestTimeElem.innerText = 'Best Time: --';
    }
  }

  /**
   * Ví dụ: TWEAK UI HANDLERS (như thay đổi slider, debug info)
   * Tùy ít hay nhiều mà tách tiếp thành class riêng.
   */
  public addDebugSlider(): void {
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
  public getSpeedElemContainer(): HTMLElement {
    return this.speedElem;
  }

}