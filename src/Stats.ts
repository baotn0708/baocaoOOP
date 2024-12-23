// src/Stats.ts
export class Stats {
  private startTime: number;
  private prevTime: number;
  private fps: number;
  private frames: number;
  private mode: number; // 0: FPS, 1: MS
  public domElement: HTMLDivElement;

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

  public begin(): void {
    this.startTime = performance.now();
  }

  public end(): number {
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

  public update(): void {
    this.startTime = this.end();
  }

  public currentFps(): number {
    return this.fps;
  }
}