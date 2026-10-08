import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular/lazy';

import { ModeSelectionPageRoutingModule } from './mode-selection-routing.module';

import { ModeSelectionPage } from './mode-selection.page';
import { RivePreviewComponent } from '../../features/riveAnimation/player/player.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModeSelectionPageRoutingModule,
    RivePreviewComponent
  ],
  declarations: [ModeSelectionPage]
})
export class ModeSelectionPageModule {}
