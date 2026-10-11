import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Player } from '../../core/models/player.model';

/*
 * ============================================================================
 *  MAPA DE ESTE ARCHIVO
 * ============================================================================
 *  [DATOS]      intensities, games, players
 *  [SELECCIÓN]  selectedIntensity (getter/setter), selectedGame
 *  [LAYOUT]     gamesOpen / gamesVisible / gamesOverlay + openGames() / closeGames():
 *               pasan de columna a fila (y viceversa) en dos tiempos:
 *                 ABRIR : 1) los juegos aparecen debajo, sin mover nada
 *                         2) la columna se acomoda en fila
 *                 CERRAR: 1) la fila se acomoda en columna y los juegos se desvanecen
 *                            a la vez  2) los juegos se quitan del DOM
 *  [SCROLL]     scroll libre + centrado del logo más visible, en vertical (columna)
 *               o en horizontal (fila). Los "helpers por eje" hacen que el mismo
 *               código sirva para los dos.
 *  [CLIC]       onLevelClick / selectIntensity (closeGames está en [LAYOUT])
 *  [SHAKE]      temblor periódico del logo seleccionado (solo en columna)
 * ============================================================================
 */

type IntensityId = 'romper-hielo' | 'beber' | 'parchar' | 'calentar' | 'gozar';
type GameId = 'barajas' | 'ruleta' | 'tablero';

@Component({
  selector: 'app-mode-selection',
  templateUrl: './mode-selection.page.html',
  styleUrls: ['./mode-selection.page.scss'],
  standalone: false,
})
export class ModeSelectionPage implements OnInit, AfterViewInit, OnDestroy {

  // ==========================================================================
  //  REFERENCIAS AL DOM
  // ==========================================================================

  /** [SCROLL] [LAYOUT] [SHAKE] Contenedor de los logos (#list en el HTML). */
  @ViewChild('list') list!: ElementRef<HTMLElement>;

  /** [LAYOUT] Sección de juegos (#gamesSection en el HTML). Solo existe mientras gamesVisible es true. */
  @ViewChild('gamesSection') gamesSection?: ElementRef<HTMLElement>;

  // ==========================================================================
  //  [DATOS]
  // ==========================================================================

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

  // ==========================================================================
  //  [SELECCIÓN]
  // ==========================================================================

  private _selectedIntensity: IntensityId = 'romper-hielo';

  /** Intensidad activa. El HTML la usa para [class.selected] y data-intensity (fondo). */
  get selectedIntensity(): IntensityId {
    return this._selectedIntensity;
  }

  set selectedIntensity(id: IntensityId) {
    if (id === this._selectedIntensity) return;
    this._selectedIntensity = id;
    this.clearShake();   // [SHAKE] al cambiar de logo se corta cualquier temblor pendiente
  }

  selectedGame: GameId = 'barajas';

  // ==========================================================================
  //  [LAYOUT] estado de la vista
  // ==========================================================================

  /**
   * false: logos en columna (scroll vertical).
   * true:  logos en fila (scroll horizontal).
   * Es el eje que usan todos los helpers de [SCROLL].
   */
  gamesOpen = false;

  /** La sección de juegos existe en el DOM (@if en el HTML). */
  gamesVisible = false;

  /**
   * La sección de juegos está "flotando" (position: absolute) y NO ocupa espacio,
   * así que no empuja ni encoge la sección de intensidad. Se usa mientras entra
   * (antes del acomodo) y mientras sale (durante el acomodo).
   */
  gamesOverlay = false;

  /** true mientras dura cualquier fase de la transición columna <-> fila. */
  private layoutBusy = false;
  private layoutTimer?: ReturnType<typeof setTimeout>;
  private readonly GAMES_ANIMATION_MS = 300;      // aparición de los juegos
  private readonly LAYOUT_ANIMATION_MS = 500;     // acomodo columna <-> fila
  private readonly LAYOUT_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';

  // ==========================================================================
  //  [SCROLL] estado interno
  // ==========================================================================

  /** Tiempo sin eventos de scroll para considerar que la lista "se quedó quieta". */
  private readonly SETTLE_DELAY_MS = 120;
  private settleTimer?: ReturnType<typeof setTimeout>;

  /** Destino de un scroll provocado por código (clic). Mientras no sea null, se ignora el scroll libre. */
  private programmaticTarget: number | null = null;
  private programmaticTimer?: ReturnType<typeof setTimeout>;

  /** true mientras el usuario tiene el dedo apoyado en la lista. */
  private touching = false;

  // ==========================================================================
  //  [SHAKE] estado interno
  // ==========================================================================

  private readonly SHAKE_INTERVAL_MS = 5000;
  private shakeTimer?: ReturnType<typeof setInterval>;

  // ==========================================================================
  //  CONSTRUCTOR Y CICLO DE VIDA
  // ==========================================================================

  constructor(
    private router: Router,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
  ) { }

  /** [DATOS] Recupera los jugadores enviados desde la pantalla anterior. */
  ngOnInit() {
    const navigationPlayers = this.router.getCurrentNavigation()?.extras.state?.['players'];
    const historyPlayers = window.history.state?.players;
    const players = navigationPlayers ?? historyPlayers;
    this.players = this.isPlayerList(players) ? players : [];
  }

  ngAfterViewInit() {
    const el = this.list.nativeElement;

    // [SCROLL] Posiciona la lista en la intensidad seleccionada al entrar (empieza en columna).
    const index = this.intensities.findIndex(i => i.id === this.selectedIntensity);
    el.scrollTop = index * this.itemSize;

    // [SCROLL] Cuando el navegador avisa que el scroll terminó, centramos el logo más cercano.
    el.addEventListener('scrollend', () => {
      if (!this.touching) this.settle();
    });

    // [SHAKE] Al terminar el temblor se quita la clase para que no quede "armada".
    el.addEventListener('animationend', (e: AnimationEvent) => {
      if (e.animationName === 'remember') {
        (e.target as HTMLElement).classList.remove('shake');
      }
    });

    this.startShakeLoop();
  }

  ngOnDestroy() {
    clearTimeout(this.settleTimer);
    clearTimeout(this.programmaticTimer);
    clearTimeout(this.layoutTimer);
    clearInterval(this.shakeTimer);
  }

  // ==========================================================================
  //  [SHAKE] temblor periódico del logo seleccionado
  //  Usa los keyframes `remember` y la clase `.shake` del SCSS.
  //  Solo se ejecuta con los logos en columna.
  // ==========================================================================

  private startShakeLoop() {
    // Fuera de la zona: el intervalo no dispara detección de cambios cada 5 s.
    this.ngZone.runOutsideAngular(() => {
      this.shakeTimer = setInterval(() => this.playShake(), this.SHAKE_INTERVAL_MS);
    });
  }

  private playShake() {
    if (this.gamesOpen) return;                                   // en fila no hay temblor
    if (this.touching || this.layoutBusy || this.programmaticTarget !== null) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const selected = this.list.nativeElement
      .querySelector<HTMLElement>('.intensity__level.selected');
    if (!selected) return;

    selected.classList.remove('shake');
    void selected.offsetWidth;          // reflow: permite reiniciar la animación
    selected.classList.add('shake');
  }

  private clearShake() {
    this.list?.nativeElement
      .querySelectorAll('.shake')
      .forEach(el => el.classList.remove('shake'));
  }

  // ==========================================================================
  //  [SCROLL] helpers que dependen del eje
  //  Columna -> scrollTop / alto.  Fila -> scrollLeft / ancho.
  // ==========================================================================

  /** Tamaño de cada logo en el eje de scroll actual (lo define --slot en el SCSS). */
  private get itemSize(): number {
    const first = this.list.nativeElement.querySelector<HTMLElement>('.intensity__level');
    if (!first) return 120;
    return this.gamesOpen ? first.offsetWidth : first.offsetHeight;
  }

  /** Posición actual del scroll en el eje activo. */
  private get scrollPos(): number {
    const el = this.list.nativeElement;
    return this.gamesOpen ? el.scrollLeft : el.scrollTop;
  }

  /** Máximo scroll posible en el eje activo. */
  private get maxScroll(): number {
    const el = this.list.nativeElement;
    return this.gamesOpen
      ? el.scrollWidth - el.clientWidth
      : el.scrollHeight - el.clientHeight;
  }

  /** Desplaza suavemente la lista a `pos` en el eje activo. */
  private scrollToPos(pos: number) {
    this.list.nativeElement.scrollTo(
      this.gamesOpen
        ? { left: pos, behavior: 'smooth' }
        : { top: pos, behavior: 'smooth' },
    );
  }

  /** Índice del logo más cercano al centro de la ventana. */
  private get nearestIndex(): number {
    const index = Math.round(this.scrollPos / this.itemSize);
    return Math.min(Math.max(index, 0), this.intensities.length - 1);
  }

  // ==========================================================================
  //  [SCROLL] scroll libre + centrado al detenerse
  //  Los tres métodos públicos están enlazados en el HTML:
  //  (scroll)="onScroll()" (touchstart)="onTouchStart()" (touchend)="onTouchEnd()"
  // ==========================================================================

  onScroll() {
    if (this.layoutBusy) return;          // durante columna <-> fila no interferimos

    if (this.programmaticTarget !== null) {
      if (Math.abs(this.scrollPos - this.programmaticTarget) <= 1) {
        this.programmaticTarget = null;   // ya llegó: se libera el bloqueo
      }
      return;                             // mientras anima por clic, ignora el resto
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
    if (this.layoutBusy) return;
    this.updateSelectionFromScroll();
    this.scheduleSettle();
  }

  /** Actualiza la selección en vivo; en los extremos fuerza el primero/último. */
  private updateSelectionFromScroll() {
    const pos = this.scrollPos;
    const max = this.maxScroll;

    let index: number;
    if (pos <= 1) index = 0;                                        // tope inicial
    else if (pos >= max - 1) index = this.intensities.length - 1;   // tope final
    else index = this.nearestIndex;

    const id = this.intensities[index].id;
    if (id !== this.selectedIntensity) this.selectedIntensity = id;
  }

  /** Programa el centrado para cuando la lista deje de moverse. */
  private scheduleSettle() {
    clearTimeout(this.settleTimer);
    if (this.touching) return;   // con el dedo apoyado no centramos aunque esté quieto
    this.settleTimer = setTimeout(() => this.settle(), this.SETTLE_DELAY_MS);
  }

  /** Centra el logo más cercano. */
  private settle() {
    if (this.layoutBusy || this.programmaticTarget !== null) return;
    const index = this.nearestIndex;
    this.selectedIntensity = this.intensities[index].id;

    // Nunca pedimos un destino mayor al máximo scroll posible.
    const target = Math.min(index * this.itemSize, this.maxScroll);
    if (Math.abs(this.scrollPos - target) > 1) {
      this.scrollToPos(target);
    }
  }

  // ==========================================================================
  //  [CLIC] (click)="onLevelClick(i)" en cada logo
  // ==========================================================================

  /**
   * Columna:
   *   - clic en el logo seleccionado  -> abre los juegos (pasa a fila)
   *   - clic en otro logo             -> solo lo selecciona y lo centra
   * Fila:
   *   - clic en cualquier logo        -> solo lo selecciona y lo centra
   */
  onLevelClick(index: number) {
    const isSelected = this.intensities[index].id === this.selectedIntensity;

    if (!this.gamesOpen && isSelected) {
      this.openGames(index);
    } else {
      this.selectIntensity(index);
    }
  }

  /** Selecciona un logo y lo lleva al centro con scroll suave. */
  selectIntensity(index: number) {
    if (this.layoutBusy) return;
    const target = Math.min(index * this.itemSize, this.maxScroll);

    clearTimeout(this.settleTimer);   // cancela cualquier centrado pendiente
    this.selectedIntensity = this.intensities[index].id;

    // Bloquea el scroll libre hasta llegar al destino.
    this.programmaticTarget = target;
    clearTimeout(this.programmaticTimer);
    this.programmaticTimer = setTimeout(() => (this.programmaticTarget = null), 700);  // red de seguridad

    this.scrollToPos(target);
  }

  // ==========================================================================
  //  [LAYOUT] transición columna <-> fila
  // ==========================================================================

  /** Respeta la preferencia del sistema de reducir animaciones. */
  private get reduceMotion(): boolean {
    return matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /** Cancela cualquier lógica de scroll pendiente (se llama al empezar una transición). */
  private stopScrollLogic() {
    clearTimeout(this.settleTimer);
    clearTimeout(this.programmaticTimer);
    this.programmaticTarget = null;
  }

  // ---- ABRIR: columna -> fila ---------------------------------------------

  /**
   * Fase 1: los juegos aparecen flotando debajo, sin afectar la sección de intensidad.
   * Fase 2 (al terminar la aparición): la columna se acomoda en fila.
   */
  private openGames(index: number) {
    if (this.layoutBusy || this.gamesOpen) return;

    this.layoutBusy = true;
    this.stopScrollLogic();

    // Fase 1: los juegos entran como overlay (no ocupan espacio).
    this.gamesOverlay = true;
    this.gamesVisible = true;
    this.cdr.detectChanges();

    const games = this.gamesSection?.nativeElement;
    const startFlip = () => this.ngZone.run(() => this.runLayoutFlip(true, index));

    if (!games || this.reduceMotion) {
      startFlip();
      return;
    }

    games
      .animate(
        [
          { opacity: 0, translate: '0 1.5rem' },
          { opacity: 1, translate: '0 0' },
        ],
        { duration: this.GAMES_ANIMATION_MS, easing: this.LAYOUT_EASING, fill: 'backwards' },
      )
      .finished.then(startFlip, startFlip);
  }

  // ---- CERRAR: fila -> columna --------------------------------------------

  /** Vuelve de fila a columna (por ejemplo desde el botón de atrás). */
  closeGames() {
    if (this.layoutBusy || !this.gamesOpen) return;

    this.layoutBusy = true;
    this.stopScrollLogic();

    const index = this.intensities.findIndex(i => i.id === this.selectedIntensity);
    this.runLayoutFlip(false, index);
  }

  // ---- Núcleo: acomodo con FLIP -------------------------------------------

  /**
   * Técnica FLIP:
   *  (1) mide cada logo y el alto de la ventana
   *  (2) aplica el layout nuevo
   *  (3) reubica el scroll en el nuevo eje
   *  (4) anima cada logo desde su posición vieja a la nueva
   *
   * open = true : los juegos pasan de overlay a ocupar su espacio.
   * open = false: los juegos pasan a overlay y se desvanecen mientras se acomoda
   *               la columna; al final se quitan del DOM.
   */
  private runLayoutFlip(open: boolean, index: number) {
    const el = this.list.nativeElement;
    const levels = Array.from(el.querySelectorAll<HTMLElement>('.intensity__level'));

    // (1) First
    const firstRects = levels.map(l => l.getBoundingClientRect());
    const firstHeight = el.getBoundingClientRect().height;

    // (2) Aplica el layout nuevo
    this.selectedIntensity = this.intensities[index].id;
    this.gamesOpen = open;
    this.gamesOverlay = !open;           // abrir: ocupa espacio. cerrar: sale del flujo.
    if (open) this.clearShake();         // [SHAKE] en fila no hay temblor
    this.cdr.detectChanges();

    // (3) Reubica el scroll en el nuevo eje, sin animación
    const pos = Math.min(index * this.itemSize, this.maxScroll);
    el.scrollLeft = open ? pos : 0;
    el.scrollTop = open ? 0 : pos;

    // (4) Last + Invert + Play
    const duration = this.reduceMotion ? 0 : this.LAYOUT_ANIMATION_MS;

    if (duration > 0) {
      const options = { duration, easing: this.LAYOUT_EASING };

      // Cada logo se desliza desde su posición anterior (usa `translate`, no choca con el shake)
      levels.forEach((level, i) => {
        const last = level.getBoundingClientRect();
        const dx = firstRects[i].left - last.left;
        const dy = firstRects[i].top - last.top;
        if (!dx && !dy) return;
        level.animate(
          [{ translate: `${dx}px ${dy}px` }, { translate: '0 0' }],
          options,
        );
      });

      // Al ABRIR, la ventana encoge gradualmente para no recortar los logos en pleno viaje.
      // Al CERRAR no se anima: los logos miden un % del alto de la ventana, así que animar
      // ese alto cambia el tamaño del contenido y el navegador recorta/desplaza el scroll,
      // dejando el logo seleccionado descentrado.
      if (open) {
        const lastHeight = el.getBoundingClientRect().height;
        el.animate(
          [{ height: `${firstHeight}px` }, { height: `${lastHeight}px` }],
          options,
        );
      }

      // Al cerrar, los juegos se desvanecen a la vez que se acomoda la columna
      if (!open) {
        this.gamesSection?.nativeElement.animate(
          [
            { opacity: 1, translate: '0 0' },
            { opacity: 0, translate: '0 1.5rem' },
          ],
          { ...options, fill: 'forwards' },
        );
      }
    }

    // Fin de la transición
    clearTimeout(this.layoutTimer);
    this.layoutTimer = setTimeout(() => {
      if (!open) {
        this.gamesVisible = false;       // ahora sí se quitan los juegos del DOM
        this.cdr.detectChanges();
      }

      // Con el layout ya estable, deja el logo seleccionado exactamente centrado.
      const finalPos = Math.min(index * this.itemSize, this.maxScroll);
      if (this.gamesOpen) el.scrollLeft = finalPos;
      else el.scrollTop = finalPos;

      this.layoutBusy = false;
    }, duration + 50);
  }

  // ==========================================================================
  //  [DATOS] validación de los jugadores recibidos por navegación
  // ==========================================================================

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