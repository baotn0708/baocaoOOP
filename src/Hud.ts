import { Dom } from "./utils/Dom";

interface HudItem {
  value: any;
  dom: HTMLElement;
}

export class Hud {
  private items: Record<string, HudItem>;
  private currentValue: Record<string, string | number> = {};

  constructor() {
    this.items = {
      speed: { value: null, dom: Dom.get('speed_value') },
      current_lap_time: { value: null, dom: Dom.get('current_lap_time_value') },
      last_lap_time: { value: null, dom: Dom.get('last_lap_time_value') },
      fast_lap_time: { value: null, dom: Dom.get('fast_lap_time_value') }
    };

    // Initialize current values
    Object.keys(this.items).forEach(key => {
      this.currentValue[key] = '';
    });
  }

  public resetValue(key: string): void {
    if (this.items[key]) {
      // Clear both the stored value and the display
      this.currentValue[key] = '';
      this.items[key].value = null;
      Dom.set(this.items[key].dom, '');
    }
  }

  public updateHud(key: string, value: string | number): void {
    if (this.items[key]) {
      // Only update if value is different
      if (this.currentValue[key] !== value) {
        this.currentValue[key] = value;
        this.items[key].value = value;
        Dom.set(this.items[key].dom, String(value));
      }
    }
  }
}