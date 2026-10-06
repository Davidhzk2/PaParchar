import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss'],
  standalone: false,
})
export class LoadingComponent implements OnInit, OnDestroy {
  private navigationTimer?: ReturnType<typeof setTimeout>;

  constructor(private navCtrl: NavController) {}

  ngOnInit(): void {
    this.navigationTimer = setTimeout(() => {
      void this.navCtrl.navigateRoot(['/home']);
    }, 3000);
  }

  ngOnDestroy(): void {
    if (this.navigationTimer) {
      clearTimeout(this.navigationTimer);
    }
  }
}
