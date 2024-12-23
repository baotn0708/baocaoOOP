// src/Dom.ts
export class Dom {
  // Lấy thẻ HTMLElement hoặc document
  public static get(id: string | HTMLElement | Document): HTMLElement | Document {
    if (id instanceof HTMLElement || id === document) {
      return id;
    }
    return document.getElementById(id as string) as HTMLElement;
  }

  // Set innerHTML cho một phần tử
  public static set(id: string | HTMLElement | Document, html: string): void {
    const el = Dom.get(id);
    if (el !== document) {
      (el as HTMLElement).innerHTML = html;
    }
  }

  // Thêm sự kiện
  public static on(
    ele: string | HTMLElement | Document,
    type: string,
    fn: EventListenerOrEventListenerObject,
    capture?: boolean
  ): void {
    Dom.get(ele).addEventListener(type, fn, capture);
  }

  // Bỏ sự kiện
  public static un(
    ele: string | HTMLElement | Document,
    type: string,
    fn: EventListenerOrEventListenerObject,
    capture?: boolean
  ): void {
    Dom.get(ele).removeEventListener(type, fn, capture);
  }

  // Hiển thị phần tử
  public static show(ele: string | HTMLElement | Document, displayType = 'block'): void {
    (Dom.get(ele) as HTMLElement).style.display = displayType;
  }

  // Bỏ focus
  public static blur(ev: Event): void {
    (ev.target as HTMLElement)?.blur();
  }

  // Thêm hoặc xóa className cho phần tử
  public static toggleClassName(
    ele: string | HTMLElement | Document,
    name: string,
    on?: boolean
  ): void {
    const element = Dom.get(ele) as HTMLElement;
    const classes = element.className.split(' ');
    const idx = classes.indexOf(name);

    if (typeof on === 'undefined') {
      on = (idx < 0);
    }
    if (on && idx < 0) {
      classes.push(name);
    } else if (!on && idx >= 0) {
      classes.splice(idx, 1);
    }
    element.className = classes.join(' ');
  }

  // Lưu trữ localStorage (hoặc sessionStorage) tùy ý
  public static storage: Storage = window.localStorage || { };
}