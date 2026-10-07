import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Alignment, Fit, Layout, Rive } from '@rive-app/webgl2';
import { Gender } from '../../../core/models/player.model';

const BOOLEAN_PROP = 'stateBoolean';

type AvatarSize = 'large' | 'medium' | 'small';

@Component({
  selector: 'rive-player',
  standalone: true,
  host: {
    '[class.size-large]': 'size === "large"',
    '[class.size-medium]': 'size === "medium"',
    '[class.size-small]': 'size === "small"',
  },
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
})
export class RivePreviewComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('riveCanvas') canvas!: ElementRef<HTMLCanvasElement>;

  @Input() src = 'assets/Rive/paparchar.riv';
  @Input() artboard = 'Chicken';
  @Input() stateMachine = 'ChickenMachine';
  @Input() gender: Gender = 'male';
  @Input() showGender = false;
  @Input() size: AvatarSize = 'medium';

  private rive?: Rive;
  private boolProp?: { value: boolean };
  private _isIdle = false;
  private viewInitialized = false;
  private riveGeneration = 0;
  private resizeObserver?: ResizeObserver;

  @Input()
  set isIdle(value: boolean) {
    this._isIdle = value;
    this.applyState();
  }
  get isIdle(): boolean {
    return this._isIdle;
  }

  get genderIcon(): string {
    return this.gender === 'female'
      ? 'assets/Iconos/female.svg'
      : 'assets/Iconos/male.svg';
  }

  ngAfterViewInit(): void {
    this.viewInitialized = true;
    this.resizeObserver = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
        this.rive?.resizeDrawingSurfaceToCanvas();
      }
    });
    this.resizeObserver.observe(this.canvas.nativeElement);
    this.createRive();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      this.viewInitialized &&
      (changes['src'] || changes['artboard'] || changes['stateMachine'])
    ) {
      this.createRive();
    }
  }

  toggle(): void {
    this.isIdle = !this._isIdle;
  }

  private applyState(): void {
    if (this.boolProp) {
      this.boolProp.value = this._isIdle;
    }
  }

  private createRive(): void {
    const generation = ++this.riveGeneration;
    this.rive?.cleanup();
    this.boolProp = undefined;

    this.rive = new Rive({
      src: this.src,
      canvas: this.canvas.nativeElement,
      artboard: this.artboard,
      stateMachine: this.stateMachine,
      layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
      autoBind: true,
      autoplay: true,
      onLoad: () => {
        if (generation !== this.riveGeneration) {
          return;
        }

        this.rive?.resizeDrawingSurfaceToCanvas();
        this.boolProp = this.rive?.viewModelInstance?.boolean(BOOLEAN_PROP) ?? undefined;
        this.applyState();
      },
      onLoadError: (error) => {
        if (generation === this.riveGeneration) {
          console.error('Error al cargar el avatar Rive:', error);
        }
      },
    });
  }

  ngOnDestroy(): void {
    this.riveGeneration++;
    this.resizeObserver?.disconnect();
    this.rive?.cleanup();
  }
}