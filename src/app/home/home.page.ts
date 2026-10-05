import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  players: string[] = [];

  onAddCard() {
    this.players.push('Jugador');
  }

  onRemoveCard(index: number) {
    this.players.splice(index, 1);
  }
}
