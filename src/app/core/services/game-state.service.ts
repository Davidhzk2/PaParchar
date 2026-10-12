import { computed, Injectable, signal } from '@angular/core';
import { GameId, GameState, IntensityId } from '../models/game-state.model';
import { Player } from '../models/player.model';

const INITIAL_STATE: GameState = {
  players: [],
  selectedIntensity: 'romper-hielo',
  selectedGame: 'barajas',
};

@Injectable({
  providedIn: 'root',
})
export class GameStateService {
  private readonly stateSignal = signal<GameState>(INITIAL_STATE);

  readonly state = this.stateSignal.asReadonly();
  readonly players = computed(() => this.stateSignal().players);
  readonly selectedIntensity = computed(() => this.stateSignal().selectedIntensity);
  readonly selectedGame = computed(() => this.stateSignal().selectedGame);

  setPlayers(players: Player[]): void {
    this.stateSignal.update(state => ({ ...state, players: [...players] }));
  }

  addPlayer(player: Player): void {
    this.stateSignal.update(state => ({ ...state, players: [...state.players, player] }));
  }

  removePlayer(player: Player): void {
    this.stateSignal.update(state => ({
      ...state,
      players: state.players.filter(currentPlayer => currentPlayer !== player),
    }));
  }

  setSelectedIntensity(selectedIntensity: IntensityId): void {
    this.stateSignal.update(state => ({ ...state, selectedIntensity }));
  }

  setSelectedGame(selectedGame: GameId): void {
    this.stateSignal.update(state => ({ ...state, selectedGame }));
  }
}
