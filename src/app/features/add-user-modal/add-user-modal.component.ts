import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular/lazy';

@Component({
  selector: 'app-add-user-modal',
  templateUrl: './add-user-modal.component.html',
  styleUrls: ['./add-user-modal.component.scss'],
  standalone: false,
})
export class AddUserModalComponent  implements OnInit {
  playerName:string = '';
  gender:string= 'male';
  genderPreference = 'female';
  avatar = 'assets/Logo.png';

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {}

  onGenderChange(gender: string) {
    this.gender = gender;
    this.genderPreference = gender === 'male' ? 'female' : 'male';
  }

  addPlayer(){
    if(!this.playerName.trim()) return;

    this.modalCtrl.dismiss({
      name: this.playerName.trim(),
      avatar: this.avatar,
      gender: this.gender,
      preferGender: this.genderPreference,
    }, 'confirm');

  }

  closeModal(){
    this.modalCtrl.dismiss();
  }

}
