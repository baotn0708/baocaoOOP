export class Polyfill {
  public static applyRequestAnimationFrame(): void {
    if (!window.requestAnimationFrame) {
      window.requestAnimationFrame = (window as any).webkitRequestAnimationFrame
        || (window as any).mozRequestAnimationFrame
        || (window as any).oRequestAnimationFrame
        || (window as any).msRequestAnimationFrame
        || function(callback: FrameRequestCallback) {
             window.setTimeout(callback, 1000 / 60);
           };
    }
  }
}