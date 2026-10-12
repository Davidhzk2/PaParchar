import { Component, computed, Signal } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular/lazy';
import { GameId, IntensityId } from '../../core/models/game-state.model';
import { Player } from '../../core/models/player.model';
import { GameStateService } from '../../core/services/game-state.service';

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
  readonly currentPlayerIndex = 0;
  readonly playerStage: Signal<PlayerStageItem[]>;

  constructor(
    private gameState: GameStateService,
    private navCtrl: NavController,
    private toastCtrl: ToastController,
  ) {
    this.players = this.gameState.players;
    this.selectedGame = this.gameState.selectedGame;
    this.selectedIntensity = this.gameState.selectedIntensity;
    this.playerStage = computed(() => {
      const players = this.players();
      if (players.length === 0) return [];

      const currentIndex = this.currentPlayerIndex % players.length;
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
    if (this.players().length >= 2) return;

    const toast = await this.toastCtrl.create({
      message: 'Agrega al menos 2 jugadores para empezar.',
      duration: 2500,
      position: 'bottom',
    });
    await toast.present();
    await this.navCtrl.navigateRoot(['/mode-selection']);
  }

  goBack(): void {
    void this.navCtrl.navigateBack(['/mode-selection']);
  }
}
