import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular/lazy';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import { AddUserModalModule } from '../features/add-user-modal/add-user-modal.module';

import { RiveLoaderComponent } from '../features/riveAnimation/loader/loader.component';
import { RivePreviewComponent } from '../features/riveAnimation/player/player.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    AddUserModalModule,
    RiveLoaderComponent,
    RivePreviewComponent
  ],
  declarations: [HomePage]
})
export class HomePageModule {}
