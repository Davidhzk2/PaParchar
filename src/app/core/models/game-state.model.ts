import { Player } from './player.model';

export type IntensityId = 'romper-hielo' | 'beber' | 'parchar' | 'calentar' | 'gozar';
export type GameId = 'barajas' | 'ruleta' | 'tablero';

export interface GameState {
  players: Player[];
  selectedIntensity: IntensityId;
  selectedGame: GameId;
}
