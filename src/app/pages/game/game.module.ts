import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular/lazy';
import { GamePageRoutingModule } from './game-routing.module';
import { GamePage } from './game.page';
import { RivePreviewComponent } from '../../features/riveAnimation/player/player.component';

@NgModule({
  imports: [CommonModule, IonicModule, GamePageRoutingModule, RivePreviewComponent],
  declarations: [GamePage],
})
export class GamePageModule {}
