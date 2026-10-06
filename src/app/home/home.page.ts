import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})

export class HomePage {
  players: string[] = [];

  constructor(private navCtrl: NavController) {}

  onAddCard() {
    this.players.push('Jugador');
  }

  onRemoveCard(index: number) {
    this.players.splice(index, 1);
  }

  startGame(){
    this.navCtrl.navigateRoot(['/intensity']);
  }
}
