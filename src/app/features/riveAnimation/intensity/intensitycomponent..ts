import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, ViewChild } from '@angular/core';
import { Alignment, Fit, Layout, Rive } from '@rive-app/webgl2';

export type IntensityId = 'romper-hielo' | 'beber' | 'parchar' | 'calentar' | 'gozar';

/** id de la app -> nombre del view model anidado dentro de "Intenisty" (cada uno es un "Activators"). */
const VM_PROP: Record<IntensityId, string> = {
  'romper-hielo': 'paHielo',
  beber: 'paBeber',
  parchar: 'paParchar',
  calentar: 'paCalentar',
  gozar: 'paGozar',
};

type ViewModelRoot = NonNullable<Rive['viewModelInstance']>;

interface Lane {
  canvas: HTMLCanvasElement;
  rive?: Rive;
  ready: boolean;
}

/**
 * Dos canvas ("carriles") con el mismo artboard "Intensity", apilados.
 *
 * El orden de dibujo de los componentes dentro de "Intensity" es fijo (lo define la jerarquía
 * del editor), así que no se puede hacer que el que entra quede por encima del que sale.
 * En su lugar se alternan los carriles:
 *
 *   - El carril de ABAJO pasa ARRIBA y recibe la intensidad nueva (screenState = true) -> su Entry.
 *   - El carril que estaba arriba pasa ABAJO y se pone todo en false -> su Exit.
 *
 * Así la entrada siempre se ve por encima de la salida, y ambas corren a la vez.
 */
@Component({
  selector: 'rive-intensity',
  standalone: true,
  template: `
    <canvas #laneA class="lane"></canvas>
    <canvas #laneB class="lane"></canvas>
  `,
  styles: [`
    :host { display: block; position: relative; width: 100%; height: 100%; }
    .lane { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
  `],
})
export class RiveIntensityComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('laneA', { static: true }) laneA!: ElementRef<HTMLCanvasElement>;
  @ViewChild('laneB', { static: true }) laneB!: ElementRef<HTMLCanvasElement>;

  /** Intensidad cuyo componente debe estar activo (null = ninguno). */
  @Input() active: IntensityId | null = null;

  private lanes: Lane[] = [];
  private top = 1;                          // índice del carril que está arriba
  private shown: IntensityId | null = null; // intensidad que ya se aplicó

  private resizeObserver?: ResizeObserver;
  private currentFit?: Fit;

  constructor(private host: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    this.lanes = [this.laneA, this.laneB].map(ref => {
      const lane: Lane = { canvas: ref.nativeElement, ready: false };
      lane.rive = new Rive({
        src: 'assets/Rive/paparchar.riv',
        canvas: lane.canvas,
        artboard: 'Intensity',
        stateMachine: 'IntensityMachine',
        autoBind: true,                       // cada carril tiene su propia instancia del view model
        autoplay: true,
        layout: this.computeLayout(),         // ajuste inicial según la orientación del contenedor
        onLoad: () => {
          lane.rive?.resizeDrawingSurfaceToCanvas();
          lane.ready = true;
          this.apply();                       // aplica la intensidad que ya estaba seleccionada
        },
      });
      return lane;
    });

    // Reajusta cuando cambia el tamaño del contenedor (rotar el teléfono, abrir el teclado, etc.).
    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(this.host.nativeElement);
  }

  // ---- Ajuste del artboard al contenedor ----

  /**
   * Contenedor más ancho que alto  -> el artboard se ajusta al ANCHO.
   * Contenedor más alto que ancho  -> el artboard se ajusta al ALTO.
   * (El eje que sobra se recorta, centrado.)
   */
  private computeLayout(): Layout {
    const { clientWidth: w, clientHeight: h } = this.host.nativeElement;
    this.currentFit = w > h ? Fit.FitWidth : Fit.FitHeight;
    return new Layout({ fit: this.currentFit, alignment: Alignment.Center });
  }

  private onResize(): void {
    const { clientWidth: w, clientHeight: h } = this.host.nativeElement;
    const fit = w > h ? Fit.FitWidth : Fit.FitHeight;

    this.lanes.forEach(lane => {
      if (!lane.rive || !lane.ready) return;
      lane.rive.resizeDrawingSurfaceToCanvas();               // el buffer sigue el tamaño del canvas
      if (fit !== this.currentFit) {
        lane.rive.layout = new Layout({ fit, alignment: Alignment.Center });
      }
    });
    this.currentFit = fit;
  }

  ngOnChanges(): void {
    this.apply();
  }

  /**
   * Activa una intensidad directamente, sin pasar por la detección de cambios de Angular.
   * Si el Rive todavía no cargó, el valor queda guardado y se aplica al cargar.
   */
  setActive(id: IntensityId | null): void {
    this.active = id;
    this.apply();
  }

  private apply(retries = 20): void {
    if (this.lanes.length === 0 || !this.lanes.every(l => l.ready)) return;   // se aplicará en onLoad
    if (this.active === this.shown) return;                                    // ya está aplicada

    const incoming = this.lanes[1 - this.top];   // el carril de abajo pasa arriba
    const outgoing = this.lanes[this.top];       // el que estaba arriba pasa abajo
    const inRoot = incoming.rive?.viewModelInstance;
    const outRoot = outgoing.rive?.viewModelInstance;

    if (!inRoot || !outRoot) {
      // El view model puede enlazarse un instante después de onLoad: reintenta unos fotogramas.
      if (retries > 0) requestAnimationFrame(() => this.apply(retries - 1));
      return;
    }

    this.setFlags(inRoot, this.active);   // solo la intensidad nueva en true -> Entry
    this.setFlags(outRoot, null);         // todo en false -> el activo hace su Exit

    incoming.canvas.style.zIndex = '2';   // la entrada, por encima
    outgoing.canvas.style.zIndex = '1';   // la salida, debajo

    this.top = 1 - this.top;
    this.shown = this.active;
  }

  /** screenState = true solo para `id`; false para el resto. */
  private setFlags(root: ViewModelRoot, id: IntensityId | null): void {
    (Object.keys(VM_PROP) as IntensityId[]).forEach(key => {
      const flag = root.viewModel(VM_PROP[key])?.boolean('screenState');
      if (flag) flag.value = key === id;
    });
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.lanes.forEach(l => l.rive?.cleanup());
  }
}