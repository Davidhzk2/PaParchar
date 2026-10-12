import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular/lazy';
import { Avatar, Gender } from '../../core/models/player.model';
import { mockAvatars } from '../../data/mockdata';
import { RivePreviewComponent } from '../riveAnimation/player/player.component';

@Component({
  selector: 'app-add-user-modal',
  templateUrl: './add-user-modal.component.html',
  styleUrls: ['./add-user-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RivePreviewComponent],
})
export class AddUserModalComponent {
  avatars: Avatar[] = mockAvatars;
  selectedAvatar: Avatar = this.avatars[Math.floor(Math.random() * this.avatars.length)];

  playerName = '';
  gender: Gender = 'male';
  genderPreference = 'female';

  constructor(private modalCtrl: ModalController) {}

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
      'confirm',
    );
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }
}