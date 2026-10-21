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

interface BoardCell {
  row: number;
  column: number;
  columnSpan?: number;
  rowSpan?: number;
}

interface BoardPlayerToken {
  player: Player;
  playerIndex: number;
  cell: BoardCell;
  offsetX: number;
  offsetY: number;
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
const DICE_ROLL_DURATION_MS = 900;
const DICE_PIP_LAYOUT: Record<number, readonly number[]> = {
  1: [5],
  2: [1, 9],
  3: [1, 5, 9],
  4: [1, 3, 7, 9],
  5: [1, 3, 5, 7, 9],
  6: [1, 3, 4, 6, 7, 9],
};
const BOARD_CATEGORIES_BY_POSITION = [
  'Probabilidad', 'Probabilidad', 'Probabilidad', 'Parche', 'Probabilidad', 'Probabilidad',
  'Parche', 'Reto', 'Probabilidad', 'Bebé', 'Parche', 'Probabilidad', 'Verdad', 'Parche',
  'Probabilidad', 'Parche', 'Probabilidad', 'Reto', 'Bebé', 'Parche', 'Probabilidad',
  'Probabilidad', 'Verdad', 'Parche', 'Probabilidad', 'Bebé', 'Parche', 'Reto',
  'Probabilidad', 'Probabilidad', 'Parche', 'Verdad', 'Bebé', 'Yo nunca', 'Probabilidad',
  'Parche', 'Verdad', 'Reto', 'Bebé', 'Probabilidad', 'Parche', 'Verdad', 'Yo nunca',
  'Bebé', 'Probabilidad', 'Verdad', 'Parche', 'Reto', 'Bebé', 'Probabilidad', 'Bebé',
  'Parche', 'Verdad', 'Probabilidad', 'Yo nunca', 'Bebé', 'Verdad', 'Reto', 'Parche',
  'Verdad', 'Bebé', 'Yo nunca',
] as const;
const BOARD_PATH: readonly BoardCell[] = [
  { row: 8, column: 4 },
  { row: 8, column: 5 },
  { row: 8, column: 6 },
  { row: 8, column: 7 },
  { row: 8, column: 8 },
  { row: 8, column: 9 },
  { row: 7, column: 9 },
  { row: 6, column: 9 },
  { row: 5, column: 9 },
  { row: 4, column: 9 },
  { row: 3, column: 9 },
  { row: 2, column: 9 },
  { row: 1, column: 9 },
  { row: 1, column: 8 },
  { row: 1, column: 7 },
  { row: 1, column: 6 },
  { row: 1, column: 5 },
  { row: 1, column: 4 },
  { row: 1, column: 3 },
  { row: 1, column: 2 },
  { row: 1, column: 1 },
  { row: 2, column: 1 },
  { row: 3, column: 1 },
  { row: 4, column: 1 },
  { row: 5, column: 1 },
  { row: 6, column: 1 },
  { row: 7, column: 1 },
  { row: 7, column: 2 },
  { row: 7, column: 3 },
  { row: 7, column: 4 },
  { row: 7, column: 5 },
  { row: 7, column: 6 },
  { row: 7, column: 7 },
  { row: 7, column: 8 },
  { row: 6, column: 8 },
  { row: 5, column: 8 },
  { row: 4, column: 8 },
  { row: 3, column: 8 },
  { row: 2, column: 8 },
  { row: 2, column: 7 },
  { row: 2, column: 6 },
  { row: 2, column: 5 },
  { row: 2, column: 4 },
  { row: 2, column: 3 },
  { row: 2, column: 2 },
  { row: 3, column: 2 },
  { row: 4, column: 2 },
  { row: 5, column: 2 },
  { row: 6, column: 2 },
  { row: 6, column: 3 },
  { row: 6, column: 4 },
  { row: 6, column: 5 },
  { row: 6, column: 6 },
  { row: 6, column: 7 },
  { row: 5, column: 7 },
  { row: 4, column: 7 },
  { row: 3, column: 7 },
  { row: 3, column: 6 },
  { row: 3, column: 5 },
  { row: 3, column: 4 },
  { row: 3, column: 3 },
  { row: 4, column: 3 },
];
const BOARD_START_CELL: BoardCell = { row: 8, column: 1, columnSpan: 3 };

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
  readonly diceValue = signal<number | null>(null);
  readonly isRollingDice = signal(false);
  readonly isMovingBoardToken = signal(false);
  readonly playerPositions = signal<number[]>([]);
  readonly dicePipPositions = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  readonly boardPlayerTokens = computed(() =>
    this.players().map((player, playerIndex) => ({
      player,
      playerIndex,
      cell: this.getBoardCell(this.playerPositions()[playerIndex] ?? 0),
      offsetX: ((playerIndex % 3) - 1) * 6,
      offsetY: (Math.floor(playerIndex / 3) - 0.5) * 6,
    })),
  );
  readonly dicePips = computed(() => {
    const value = this.diceValue();
    return value === null ? [] : DICE_PIP_LAYOUT[value];
  });

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
      this.playerPositions.update(positions =>
        this.players().map((_, index) => positions[index] ?? 0),
      );
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

  async onDiceClick(): Promise<void> {
    if (this.isRollingDice() || this.isMovingBoardToken() || this.isResolvingTurn()) return;

    this.isRollingDice.set(true);
    const result = Math.floor(Math.random() * 6) + 1;

    try {
      await new Promise<void>(resolve => setTimeout(resolve, DICE_ROLL_DURATION_MS));
      this.diceValue.set(result);
      this.isRollingDice.set(false);
      await this.moveCurrentPlayer(result);
    } finally {
      this.isRollingDice.set(false);
      this.isMovingBoardToken.set(false);
    }
  }

  private async moveCurrentPlayer(steps: number): Promise<void> {
    const playerIndex = this.gameSession.currentPlayerIndex();
    const player = this.players()[playerIndex];
    if (!player) return;

    this.isMovingBoardToken.set(true);
    const currentPosition = this.playerPositions()[playerIndex] ?? 0;
    const targetPosition = Math.min(currentPosition + steps, BOARD_PATH.length);

    for (let position = currentPosition + 1; position <= targetPosition; position++) {
      await new Promise<void>(resolve => setTimeout(resolve, 220));
      this.playerPositions.update(positions =>
        positions.map((current, index) => index === playerIndex ? position : current),
      );
    }

    const category = BOARD_CATEGORIES_BY_POSITION[targetPosition - 1];
    const selectedCategory = ROULETTE_CATEGORIES.find(item => item.category === category);
    if (!selectedCategory) {
      throw new Error(`No activity category is configured for board position ${targetPosition}.`);
    }

    const activity = this.gameSession.drawActivityForCategory(selectedCategory.category);
    this.isMovingBoardToken.set(false);
    await this.openTurnResolution(player, activity, selectedCategory.color);
  }

  private getBoardCell(position: number): BoardCell {
    if (position <= 0) return BOARD_START_CELL;
    return BOARD_PATH[Math.min(position, BOARD_PATH.length) - 1];
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
