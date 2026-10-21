import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular/lazy';
import { Player } from '../../core/models/player.model';
import { TurnActivity } from '../../core/models/turn-activity.model';
import { RivePreviewComponent } from '../riveAnimation/player/player.component';

@Component({
  selector: 'app-turn-resolution-modal',
  templateUrl: './turn-resolution-modal.component.html',
  styleUrls: ['./turn-resolution-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RivePreviewComponent],
})
export class TurnResolutionModalComponent {
  @Input({ required: true }) player!: Player;
  @Input({ required: true }) activity!: TurnActivity;
  @Input() categoryColor = '#d4146d';

  constructor(private modalCtrl: ModalController) {}

  resolveTurn(fulfilled: boolean): void {
    void this.modalCtrl.dismiss(undefined, fulfilled ? 'fulfilled' : 'not-fulfilled');
  }

  close(): void {
    void this.modalCtrl.dismiss();
  }
}
