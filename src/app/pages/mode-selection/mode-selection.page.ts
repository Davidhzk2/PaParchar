import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Player } from '../../core/models/player.model';

type IntensityId = 'romper-hielo' | 'beber' | 'parchar' | 'calentar' | 'gozar';
type GameId = 'barajas' | 'ruleta' | 'tablero';

@Component({
  selector: 'app-mode-selection',
  templateUrl: './mode-selection.page.html',
  styleUrls: ['./mode-selection.page.scss'],
  standalone: false,
})
export class ModeSelectionPage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('list') list!: ElementRef<HTMLElement>;

  readonly intensities: { id: IntensityId; label: string; image: string }[] = [
    {
      id: 'romper-hielo',
      label: "Pa' Romper Hielo",
      image: "assets/Logo_Pa'Romper.png",
    },
    {
      id: 'beber',
      label: "Pa' Beber",
      image: "assets/Logo_Pa'Beber.png",
    },
    {
      id: 'parchar',
      label: "Pa' Parchar",
      image: "assets/Logo.png",
    },
    {
      id: 'calentar',
      label: "Pa' Calentar",
      image: "assets/Logo_Pa'Calentar.png",
    },
    {
      id: 'gozar',
      label: "Pa' Gozar",
      image: "assets/Logo_Pa'Gozar.png",
    },
  ];

  readonly games: { id: GameId; label: string }[] = [
    { id: 'barajas', label: 'Barajas' },
    { id: 'ruleta', label: 'Ruleta' },
    { id: 'tablero', label: 'Tablero' },
  ];

  players: Player[] = [];
  selectedIntensity: IntensityId = 'romper-hielo';
  selectedGame: GameId = 'barajas';

  // Tiempo sin eventos de scroll para considerar que la lista "se quedó quieta"
  private readonly SETTLE_DELAY_MS = 120;
  private settleTimer?: ReturnType<typeof setTimeout>;
  private programmaticTarget: number | null = null;
  private programmaticTimer?: ReturnType<typeof setTimeout>;
  private touching = false;

  constructor(private router: Router) { }

  ngOnInit() {
    const navigationPlayers = this.router.getCurrentNavigation()?.extras.state?.['players'];
    const historyPlayers = window.history.state?.players;
    const players = navigationPlayers ?? historyPlayers;
    this.players = this.isPlayerList(players) ? players : [];
  }

  ngAfterViewInit() {
    const index = this.intensities.findIndex(i => i.id === this.selectedIntensity);
    this.list.nativeElement.scrollTop = index * this.itemHeight;
    // Deja la lista posicionada en la intensidad seleccionada al entrar
    this.list.nativeElement.addEventListener('scrollend', () => {
      if (!this.touching) this.settle();
    });
  }

  ngOnDestroy() {
    clearTimeout(this.settleTimer);
    clearTimeout(this.programmaticTimer);
  }

  /** Alto real de cada logo (lo define --item-h en el SCSS). */
  private get itemHeight(): number {
    const first = this.list.nativeElement.querySelector<HTMLElement>('.intensity__level');
    return first?.offsetHeight ?? 120;
  }

  /** Índice del logo más cercano al centro de la ventana. */
  private get nearestIndex(): number {
    const index = Math.round(this.list.nativeElement.scrollTop / this.itemHeight);
    return Math.min(Math.max(index, 0), this.intensities.length - 1);
  }

  // ---- Scroll libre + centrado al detenerse ----

  onScroll() {
    if (this.programmaticTarget !== null) {
      const el = this.list.nativeElement;
      if (Math.abs(el.scrollTop - this.programmaticTarget) <= 1) {
        this.programmaticTarget = null;   // ya llegó: se libera el bloqueo
      }
      return;                             // mientras anima, ignora el resto
    }
    this.updateSelectionFromScroll();
    this.scheduleSettle();
  }

  onTouchStart() {
    this.touching = true;
    this.programmaticTarget = null;       // si el usuario toca, manda el usuario
    clearTimeout(this.settleTimer);
  }

  onTouchEnd() {
    this.touching = false;
    this.updateSelectionFromScroll();
    this.scheduleSettle();
  }

  /** Actualiza la selección en vivo; en los extremos fuerza el primero/último. */
  private updateSelectionFromScroll() {
    const el = this.list.nativeElement;
    const max = el.scrollHeight - el.clientHeight;

    let index: number;
    if (el.scrollTop <= 1) index = 0;                               // tope superior
    else if (el.scrollTop >= max - 1) index = this.intensities.length - 1;  // tope inferior
    else index = this.nearestIndex;

    const id = this.intensities[index].id;
    if (id !== this.selectedIntensity) this.selectedIntensity = id;
  }



  private scheduleSettle() {
    clearTimeout(this.settleTimer);
    if (this.touching) return;   // con el dedo apoyado no centramos aunque esté quieto
    this.settleTimer = setTimeout(() => this.settle(), this.SETTLE_DELAY_MS);
  }

  private settle() {
    if (this.programmaticTarget !== null) return;
    const el = this.list.nativeElement;
    const max = el.scrollHeight - el.clientHeight;
    const index = this.nearestIndex;
    this.selectedIntensity = this.intensities[index].id;

    // Nunca pedimos un destino mayor al máximo scroll posible
    const target = Math.min(index * this.itemHeight, max);
    if (Math.abs(el.scrollTop - target) > 1) {
      el.scrollTo({ top: target, behavior: 'smooth' });
    }
  }

  // ---- Clic en un logo ----

  selectIntensity(index: number) {
    const el = this.list.nativeElement;
    const max = el.scrollHeight - el.clientHeight;
    const target = Math.min(index * this.itemHeight, max);

    clearTimeout(this.settleTimer);   // cancela cualquier centrado pendiente
    this.selectedIntensity = this.intensities[index].id;

    // Bloquea la lógica de scroll hasta llegar al destino
    this.programmaticTarget = target;
    clearTimeout(this.programmaticTimer);
    this.programmaticTimer = setTimeout(() => (this.programmaticTarget = null), 700);  // red de seguridad

    el.scrollTo({ top: target, behavior: 'smooth' });
  }

  private isPlayerList(value: unknown): value is Player[] {
    return Array.isArray(value) && value.every((player: unknown) => {
      if (typeof player !== 'object' || player === null) return false;

      const candidate = player as Record<string, unknown>;
      const avatar = candidate['avatar'];
      if (typeof avatar !== 'object' || avatar === null) return false;

      const candidateAvatar = avatar as Record<string, unknown>;
      return typeof candidate['name'] === 'string'
        && (candidate['gender'] === 'male' || candidate['gender'] === 'female')
        && (candidate['preferGender'] === 'male'
          || candidate['preferGender'] === 'female'
          || candidate['preferGender'] === 'both')
        && typeof candidateAvatar['src'] === 'string'
        && typeof candidateAvatar['artboard'] === 'string'
        && typeof candidateAvatar['stateMachine'] === 'string'
        && (candidateAvatar['gender'] === 'male' || candidateAvatar['gender'] === 'female');
    });
  }
}