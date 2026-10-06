import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Rive } from '@rive-app/webgl2';

@Component({
  selector: 'rive-player',
  standalone: true,
  template: `<canvas #riveCanvas></canvas>`,
  styleUrls: ['./player.component.scss'],
})
export class RivePreviewComponent implements AfterViewInit, OnDestroy {
  @ViewChild('riveCanvas') canvas!: ElementRef<HTMLCanvasElement>;
  private rive?: Rive;

  ngAfterViewInit(): void {
    this.rive = new Rive({
      src: 'assets/Rive/paparchar.riv',
      canvas: this.canvas.nativeElement,
      artboard: 'Chicken',            // opcional: nombre del artboard
      stateMachines: 'ChickenMachine', // opcional: nombre de la state machine
      autoplay: true,
      onLoad: () => this.rive?.resizeDrawingSurfaceToCanvas(),
    });
  }

  ngOnDestroy(): void {
    this.rive?.cleanup();
  }
}