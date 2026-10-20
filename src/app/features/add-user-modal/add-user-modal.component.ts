import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlertController, IonicModule, ModalController } from '@ionic/angular/lazy';
import { Avatar, Gender, Player } from '../../core/models/player.model';
import { mockAvatars } from '../../data/mockdata';
import { RivePreviewComponent } from '../riveAnimation/player/player.component';

@Component({
  selector: 'app-add-user-modal',
  templateUrl: './add-user-modal.component.html',
  styleUrls: ['./add-user-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RivePreviewComponent],
})
export class AddUserModalComponent implements OnInit {
  @Input() edit = false;
  @Input() player?: Player;

  avatars: Avatar[] = mockAvatars;
  selectedAvatar: Avatar = this.avatars[Math.floor(Math.random() * this.avatars.length)];

  playerName = '';
  gender: Gender = 'male';
  genderPreference: Player['preferGender'] = 'female';

  constructor(
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
  ) {}

  ngOnInit(): void {
    if (!this.edit || !this.player) return;

    this.playerName = this.player.name;
    this.gender = this.player.gender;
    this.genderPreference = this.player.preferGender;
    this.selectedAvatar = this.avatars.find(avatar =>
      avatar.src === this.player?.avatar.src
      && avatar.artboard === this.player.avatar.artboard
      && avatar.stateMachine === this.player.avatar.stateMachine,
    ) ?? this.player.avatar;
  }

  // Cambia cuando cambia el avatar o el género: se usa como `track` para recrear el rive-player
  get avatarKey(): string {
    const a = this.selectedAvatar;
    return `${a.src}|${a.artboard}|${a.stateMachine}|${this.gender}`;
  }

  onGenderChange(gender: Gender) {
    this.gender = gender;
    this.genderPreference = gender === 'male' ? 'female' : 'male';
  }

  changeAvatar(direction: -1 | 1): void {
    const currentIndex = this.avatars.indexOf(this.selectedAvatar);
    const nextIndex = (currentIndex + direction + this.avatars.length) % this.avatars.length;
    this.selectedAvatar = this.avatars[nextIndex];
  }

  addPlayer() {
    if (!this.playerName.trim()) return;

    this.modalCtrl.dismiss(
      {
        name: this.playerName.trim(),
        avatar: this.selectedAvatar,
        gender: this.gender,
        preferGender: this.genderPreference,
      },
      this.edit ? 'update' : 'confirm',
    );
  }

  async deletePlayer(): Promise<void> {
    if (!this.edit || !this.player) return;

    const alert = await this.alertCtrl.create({
      header: 'Eliminar jugador',
      message: `¿Seguro que quieres eliminar a ${this.player.name}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          role: 'confirm',
        },
      ],
    });

    await alert.present();
    const { role } = await alert.onDidDismiss();
    if (role === 'confirm') {
      await this.modalCtrl.dismiss(undefined, 'delete');
    }
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }
}