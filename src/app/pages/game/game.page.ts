import { Component, computed, Signal, signal } from '@angular/core';
import { ModalController, NavController, ToastController } from '@ionic/angular/lazy';
import { GameId, IntensityId } from '../../core/models/game-state.model';
import { Player } from '../../core/models/player.model';
import { TurnActivity } from '../../core/models/turn-activity.model';
import { GameStateService } from '../../core/services/game-state.service';
import { GameSessionService } from '../../core/services/game-session.service';
import { TurnResolutionModalComponent } from '../../features/turn-resolution-modal/turn-resolution-modal.component';

const GAME_LABELS: Record<GameId, string> = {
  barajas: 'Barajas',
  ruleta: 'Ruleta',
  tablero: 'Tablero OCA',
};

type PlayerStagePosition = 'previous' | 'current' | 'next';
type PlayerStageSize = 'small' | 'medium';

interface PlayerStageItem {
  player: Player;
  position: PlayerStagePosition;
  size: PlayerStageSize;
}

const ROULETTE_CATEGORIES = [
  { category: 'Verdad', color: '#c9e98a' },
  { category: 'Reto', color: '#1e1e1e' },
  { category: 'Yo nunca', color: '#c9185d' },
  { category: 'Probabilidad', color: '#ffe600' },
  { category: 'Parche', color: '#bd4de8' },
  { category: 'Bebé', color: '#ffad45' },
] as const;

const ROULETTE_SPIN_DURATION_MS = 2600;
const ROULETTE_RESULT_DELAY_MS = 1000;

@Component({
  selector: 'app-game',
  templateUrl: './game.page.html',
  styleUrls: ['./game.page.scss'],
  standalone: false,
})
export class GamePage {
  readonly deckCards = [0, 1, 2, 3, 4];
  readonly players: Signal<Player[]>;
  readonly selectedGame: Signal<GameId>;
  readonly selectedIntensity: Signal<IntensityId>;
  readonly playerStage: Signal<PlayerStageItem[]>;
  readonly currentPlayer: Signal<Player | null>;
  readonly revealedActivity: Signal<TurnActivity | null>;
  readonly isResolvingTurn = signal(false);
  readonly isRevealingCard = signal(false);
  readonly isSpinningRoulette = signal(false);
  readonly isRouletteResultPending = signal(false);
  readonly rouletteRotation = signal(0);
  readonly rouletteStartRotation = signal(0);

  constructor(
    private gameState: GameStateService,
    private gameSession: GameSessionService,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private toastCtrl: ToastController,
  ) {
    this.players = this.gameState.players;
    this.selectedGame = this.gameState.selectedGame;
    this.selectedIntensity = this.gameState.selectedIntensity;
    this.revealedActivity = this.gameSession.revealedActivity;
    this.currentPlayer = computed(() => {
      const players = this.players();
      return players[this.gameSession.currentPlayerIndex()] ?? null;
    });
    this.playerStage = computed(() => {
      const players = this.players();
      if (players.length === 0) return [];

      const currentIndex = this.gameSession.currentPlayerIndex() % players.length;
      const previousIndex = (currentIndex - 1 + players.length) % players.length;
      const nextIndex = (currentIndex + 1) % players.length;

      return [
        { player: players[previousIndex], position: 'previous', size: 'small' },
        { player: players[currentIndex], position: 'current', size: 'medium' },
        { player: players[nextIndex], position: 'next', size: 'small' },
      ];
    });
  }

  get gameLabel(): string {
    return GAME_LABELS[this.selectedGame()];
  }

  async ionViewWillEnter(): Promise<void> {
    if (this.players().length >= 2) {
      if (!this.gameSession.started()) this.gameSession.startSession();
      return;
    }

    this.gameSession.resetSession();
    const toast = await this.toastCtrl.create({
      message: 'Agrega al menos 2 jugadores para empezar.',
      duration: 2500,
      position: 'bottom',
    });
    await toast.present();
    await this.navCtrl.navigateRoot(['/mode-selection']);
  }

  async onDeckClick(): Promise<void> {
    if (this.isResolvingTurn() || this.isRevealingCard()) return;

    const player = this.currentPlayer();
    if (!player) return;

    const activityWasAlreadyRevealed = this.revealedActivity() !== null;
    const activity = this.gameSession.drawActivity();
    if (!activityWasAlreadyRevealed) {
      this.isRevealingCard.set(true);
      await new Promise<void>(resolve => setTimeout(resolve, 450));
      this.isRevealingCard.set(false);
    }

    await this.openTurnResolution(player, activity);
  }

  async onRouletteClick(): Promise<void> {
    if (
      this.isResolvingTurn() ||
      this.isRevealingCard() ||
      this.isSpinningRoulette() ||
      this.isRouletteResultPending()
    ) return;

    const player = this.currentPlayer();
    if (!player) return;

    const selectedCategory = ROULETTE_CATEGORIES[
      Math.floor(Math.random() * ROULETTE_CATEGORIES.length)
    ];
    this.rouletteStartRotation.set(this.rouletteRotation());
    this.rouletteRotation.update(rotation => rotation + 1800 + Math.random() * 720);
    this.isSpinningRoulette.set(true);

    try {
      await new Promise<void>(resolve => setTimeout(resolve, ROULETTE_SPIN_DURATION_MS));
      this.isSpinningRoulette.set(false);
      this.isRouletteResultPending.set(true);
      await new Promise<void>(resolve => setTimeout(resolve, ROULETTE_RESULT_DELAY_MS));
      const activity = this.gameSession.drawActivityForCategory(selectedCategory.category);
      await this.openTurnResolution(player, activity, selectedCategory.color);
    } finally {
      this.isSpinningRoulette.set(false);
      this.isRouletteResultPending.set(false);
    }
  }

  private async openTurnResolution(
    player: Player,
    activity: TurnActivity,
    categoryColor?: string,
  ): Promise<void> {
    this.isResolvingTurn.set(true);

    try {
      const modal = await this.modalCtrl.create({
        component: TurnResolutionModalComponent,
        componentProps: {
          player,
          activity,
          ...(categoryColor ? { categoryColor } : {}),
        },
        cssClass: 'turn-resolution-modal',
      });
      const dismissed = modal.onDidDismiss();

      await modal.present();
      const { role } = await dismissed;
      if (role === 'fulfilled' || role === 'not-fulfilled') {
        this.gameSession.completeTurn(this.players().length);
      }
    } finally {
      this.isResolvingTurn.set(false);
    }
  }

  goBack(): void {
    void this.navCtrl.navigateBack(['/mode-selection']);
  }
}
