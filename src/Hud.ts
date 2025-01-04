import { Dom } from "./utils/Dom";

interface HudItem {
  value: any;
  dom: HTMLElement;
}

export class Hud {
  private items: Record<string, HudItem>;

  constructor() {
    this.items = {
      speed:            { value: null, dom: Dom.get('speed_value') },
      current_lap_time: { value: null, dom: Dom.get('current_lap_time_value') },
      last_lap_time:    { value: null, dom: Dom.get('last_lap_time_value') },
      fast_lap_time:    { value: null, dom: Dom.get('fast_lap_time_value') }
    };
  }

  public updateHud(key: string, value: string | number): void {
    if (this.items[key] && this.items[key].value !== value) {
      this.items[key].value = value;
      Dom.set(this.items[key].dom, String(value));
    }
  }
}