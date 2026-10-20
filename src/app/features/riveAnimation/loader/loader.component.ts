import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Rive } from '@rive-app/webgl2';

@Component({
  selector: 'rive-loader',
  standalone: true,
  template: `<canvas #riveCanvas aria-hidden="true"></canvas>`,
  styleUrls: ['./loader.component.scss'],
})
export class RiveLoaderComponent implements AfterViewInit, OnDestroy {
  @ViewChild('riveCanvas') canvas!: ElementRef<HTMLCanvasElement>;

  private rive?: Rive;

  ngAfterViewInit(): void {
    this.rive = new Rive({
      src: 'assets/Rive/paparchar.riv',
      canvas: this.canvas.nativeElement,
      artboard: 'Loader',
      stateMachine: 'LoaderMachine',
      autoplay: true,
      onLoad: () => {
        const artboards = this.rive?.contents?.artboards ?? [];

        console.table(
          artboards.map((artboard) => ({
            artboard: artboard.name,
            stateMachines: artboard.stateMachines
              .map((machine) => machine.name)
              .join(', '),
          })),
        );

        console.log(
          'Artboard Chicken:',
          artboards.find((artboard) => artboard.name === 'Chicken') ?? 'No existe',
        );

        this.rive?.resizeDrawingSurfaceToCanvas();
      },
      onLoadError: (error) => console.error('Error al cargar el archivo Rive:', error),
    });
  }

  ngOnDestroy(): void {
    this.rive?.cleanup();
  }
}