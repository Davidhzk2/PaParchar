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
  gender = 'both';
  avatar = 'assets/Logo.png';

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {}

  addPlayer(){
    if(!this.playerName.trim()) return;

    this.modalCtrl.dismiss({
      name: this.playerName.trim(),
      avatar: this.avatar,
      preferGender: this.gender,
    }, 'confirm');

  }

  closeModal(){
    this.modalCtrl.dismiss();
  }

}
