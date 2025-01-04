export class Dom {
  public static get(id: string | HTMLElement | Document): HTMLElement {
    if (id instanceof HTMLElement || id === document) return id as HTMLElement;
    return document.getElementById(id as string)!;
  }

  public static set(id: string | HTMLElement, html: string): void {
    this.get(id).innerHTML = html;
  }

  public static on(ele: string | HTMLElement, type: string, fn: EventListenerOrEventListenerObject, capture?: boolean): void {
    this.get(ele).addEventListener(type, fn, capture);
  }

  public static un(ele: string | HTMLElement, type: string, fn: EventListenerOrEventListenerObject, capture?: boolean): void {
    this.get(ele).removeEventListener(type, fn, capture);
  }

  public static show(ele: string | HTMLElement, type?: string): void {
    this.get(ele).style.display = type || 'block';
  }

  public static blur(ev: Event): void {
    (ev.target as HTMLElement).blur();
  }

  public static addClassName(ele: string | HTMLElement, name: string): void {
    this.toggleClassName(ele, name, true);
  }

  public static removeClassName(ele: string | HTMLElement, name: string): void {
    this.toggleClassName(ele, name, false);
  }

  public static toggleClassName(ele: string | HTMLElement, name: string, on?: boolean): void {
    const element = this.get(ele);
    const classes = element.className.split(' ');
    const n = classes.indexOf(name);
    const forceOn = (typeof on === 'undefined') ? (n < 0) : on;
    
    if (forceOn && n < 0) {
      classes.push(name);
    } else if (!forceOn && n >= 0) {
      classes.splice(n, 1);
    }
    
    element.className = classes.join(' ');
  }

  public static storage: Storage = window.localStorage || {} as Storage;
}