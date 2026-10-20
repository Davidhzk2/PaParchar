import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModeSelectionPage } from './mode-selection.page';

const routes: Routes = [
  {
    path: '',
    component: ModeSelectionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModeSelectionPageRoutingModule {}
