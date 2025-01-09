export class Stats {
  private startTime: number;
  private prevTime: number;
  private ms: number;
  private msMin: number;
  private msMax: number;
  private fps: number;
  private fpsMin: number;
  private fpsMax: number;
  private frames: number;
  private mode: number;
  private container!: HTMLDivElement;
  private fpsDiv!: HTMLDivElement;
  private fpsText!: HTMLDivElement;
  private fpsGraph!: HTMLDivElement;
  private msDiv!: HTMLDivElement;
  private msText!: HTMLDivElement;
  private msGraph!: HTMLDivElement;

  private static instance: Stats | null = null;

  private constructor() {
    this.startTime = Date.now();
    this.prevTime = this.startTime;
    this.ms = 0;
    this.msMin = 1000;
    this.msMax = 0;
    this.fps = 0;
    this.fpsMin = 1000;
    this.fpsMax = 0;
    this.frames = 0;
    this.mode = 0;

    this.initializeDOM();
  }
  public static getInstance(): Stats {
    if (!Stats.instance) {
      Stats.instance = new Stats();
    }
    return Stats.instance;
  }
  private initializeDOM(): void {
    const existingStats = document.getElementById('stats');
    if (existingStats) {
        existingStats.remove();
    }

    // Create new container
    this.container = document.createElement('div');
    this.container.id = 'stats';
    this.container.style.cssText = 'width:80px;position:fixed;top:0;left:0;';

    // FPS
    this.fpsDiv = document.createElement('div');
    this.fpsDiv.id = 'fps';
    this.fpsDiv.style.cssText = 'padding:0 0 3px 3px;text-align:left;background-color:#002';

    this.fpsText = document.createElement('div');
    this.fpsText.id = 'fpsText';
    this.fpsText.style.cssText = 'color:#0ff;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px';
    this.fpsText.innerHTML = 'FPS';

    this.fpsGraph = document.createElement('div');
    this.fpsGraph.id = 'fpsGraph';
    this.fpsGraph.style.cssText = 'position:relative;width:74px;height:30px;background-color:#0ff';

    // MS
    this.msDiv = document.createElement('div');
    this.msDiv.id = 'ms';
    this.msDiv.style.cssText = 'padding:0 0 3px 3px;text-align:left;background-color:#020;display:none';

    this.msText = document.createElement('div');
    this.msText.id = 'msText';
    this.msText.style.cssText = 'color:#0f0;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px';
    this.msText.innerHTML = 'MS';

    this.msGraph = document.createElement('div');
    this.msGraph.id = 'msGraph';
    this.msGraph.style.cssText = 'position:relative;width:74px;height:30px;background-color:#0f0';

    // Build DOM hierarchy
    this.fpsDiv.appendChild(this.fpsText);
    this.fpsDiv.appendChild(this.fpsGraph);
    this.msDiv.appendChild(this.msText);
    this.msDiv.appendChild(this.msGraph);
    this.container.appendChild(this.fpsDiv);
    this.container.appendChild(this.msDiv);

    // Create graph bars
    this.createBars(this.fpsGraph);
    this.createBars(this.msGraph);

    // document.body.appendChild(this.container);
  }

  private createBars(graph: HTMLDivElement): void {
    for (let i = 0; i < 74; i++) {
      const bar = document.createElement('span');
      bar.style.cssText = `width:1px;height:30px;float:left;background-color:${graph.id === 'fpsGraph' ? '#113' : '#131'}`;
      graph.appendChild(bar);
    }
  }

  private setMode(value: number): void {
    this.mode = value;
    switch (this.mode) {
      case 0:
        this.fpsDiv.style.display = 'block';
        this.msDiv.style.display = 'none';
        break;
      case 1:
        this.fpsDiv.style.display = 'none';
        this.msDiv.style.display = 'block';
        break;
    }
  }

  private updateGraph(dom: HTMLDivElement, value: number): void {
    const child = dom.appendChild(dom.firstChild as Node);
    (child as HTMLElement).style.height = `${value}px`;
  }

  public current(): number {
    return this.fps;
  }

  public begin(): void {
    this.startTime = Date.now();
  }

  public end(): number {
    const time = Date.now();

    this.ms = time - this.startTime;
    this.msMin = Math.min(this.msMin, this.ms);
    this.msMax = Math.max(this.msMax, this.ms);

    this.msText.textContent = `${this.ms} MS (${this.msMin}-${this.msMax})`;
    this.updateGraph(this.msGraph, Math.min(30, 30 - (this.ms / 200) * 30));

    this.frames++;

    if (time > this.prevTime + 1000) {
      this.fps = Math.round((this.frames * 1000) / (time - this.prevTime));
      this.fpsMin = Math.min(this.fpsMin, this.fps);
      this.fpsMax = Math.max(this.fpsMax, this.fps);

      this.fpsText.textContent = `${this.fps} FPS (${this.fpsMin}-${this.fpsMax})`;
      this.updateGraph(this.fpsGraph, Math.min(30, 30 - (this.fps / 100) * 30));

      this.prevTime = time;
      this.frames = 0;
    }

    return time;
  }

  public update(): void {
    this.startTime = this.end();
  }

  public get domElement(): HTMLDivElement {
    return this.container;
  }
}