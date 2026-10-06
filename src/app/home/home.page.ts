import { Component, signal } from '@angular/core';
import { NavController, ModalController } from '@ionic/angular/lazy';

import { AddUserModalComponent } from '../features/add-user-modal/add-user-modal.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})

export class HomePage {
  players: string[] = [];
  isAddUserModalOpen = signal(false);

  constructor(
    private navCtrl: NavController,
    private modalCtrl: ModalController
  ) {}

  async openAddUserModal() {
    if (this.isAddUserModalOpen()) {
      return;
    }

    this.isAddUserModalOpen.set(true);

    try {
      const addUserModal = await this.modalCtrl.create({
        component: AddUserModalComponent,
        cssClass: 'retro-tv-modal',
      });
      const dismissed = addUserModal.onDidDismiss();

      await addUserModal.present();
      await dismissed;
    } finally {
      this.isAddUserModalOpen.set(false);
    }
  }

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
