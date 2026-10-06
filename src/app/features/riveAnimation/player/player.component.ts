import { AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { Rive } from '@rive-app/webgl2';

const BOOLEAN_PROP = 'stateBoolean';

@Component({
  selector: 'rive-player',
  standalone: true,
  template: `<canvas #riveCanvas></canvas>`,
  styleUrls: ['./player.component.scss'],
})
export class RivePreviewComponent implements AfterViewInit, OnDestroy {
  @ViewChild('riveCanvas') canvas!: ElementRef<HTMLCanvasElement>;

  private rive?: Rive;
  private boolProp?: { value: boolean };
  private _isIdle = false;

  // true -> Iddle, false -> Def
  @Input()
  set isIdle(value: boolean) {
    this._isIdle = value;
    this.applyState();
  }
  get isIdle(): boolean {
    return this._isIdle;
  }

  ngAfterViewInit(): void {
    this.rive = new Rive({
      src: 'assets/Rive/paparchar.riv',
      canvas: this.canvas.nativeElement,
      artboard: 'Chicken',
      stateMachine: 'ChickenMachine',   // singular, como pide el aviso
      autoBind: true,                   // enlaza el View Model por defecto del artboard
      autoplay: true,
      onLoad: () => {
        this.rive?.resizeDrawingSurfaceToCanvas();

        const vmi = this.rive?.viewModelInstance;
        console.log('Propiedades del View Model:', vmi?.properties);

        this.boolProp = vmi?.boolean(BOOLEAN_PROP) ?? undefined;
        this.applyState();
      },
    });
  }

  toggle(): void {
    this.isIdle = !this._isIdle;
  }

  private applyState(): void {
    if (this.boolProp) {
      this.boolProp.value = this._isIdle;
    }
  }

  ngOnDestroy(): void {
    this.rive?.cleanup();
  }
}