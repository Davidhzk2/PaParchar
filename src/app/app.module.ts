import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular/lazy';
import { FormsModule } from '@angular/forms';
import {LoadingComponent} from "./features/loading/loading.component";

import { RiveLoaderComponent } from './features/riveAnimation/loader/loader.component';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

@NgModule({
  declarations: [AppComponent, LoadingComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, FormsModule, RiveLoaderComponent],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
