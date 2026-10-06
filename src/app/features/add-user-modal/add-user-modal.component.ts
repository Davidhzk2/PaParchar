import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular/lazy';

@Component({
  selector: 'app-add-user-modal',
  templateUrl: './add-user-modal.component.html',
  styleUrls: ['./add-user-modal.component.scss'],
  standalone: false,
})
export class AddUserModalComponent  implements OnInit {
  name:string = '';
  gender = 'both';

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {}

  closeModal(){
    this.modalCtrl.dismiss();
  }

}
