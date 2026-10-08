import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Player } from '../../core/models/player.model';

type IntensityId = 'romper-hielo' | 'beber';
type GameId = 'barajas' | 'ruleta' | 'tablero';

@Component({
  selector: 'app-mode-selection',
  templateUrl: './mode-selection.page.html',
  styleUrls: ['./mode-selection.page.scss'],
  standalone: false,
})
export class ModeSelectionPage implements OnInit {
  readonly intensities: { id: IntensityId; label: string; image: string }[] = [
    {
      id: 'romper-hielo',
      label: "Pa' Romper Hielo",
      image: "assets/Logo_Pa'Beber.png",
    },
    {
      id: 'beber',
      label: "Pa' Beber",
      image: "assets/Logo_Pa'Romper.png",
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

  constructor(private router: Router) { }

  ngOnInit() {
    const navigationPlayers = this.router.getCurrentNavigation()?.extras.state?.['players'];
    const historyPlayers = window.history.state?.players;
    const players = navigationPlayers ?? historyPlayers;
    this.players = this.isPlayerList(players) ? players : [];
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
