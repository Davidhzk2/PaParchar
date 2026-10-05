import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss'],
  standalone: false,
})
export class LoadingComponent implements OnInit, OnDestroy {
  private navigationTimer?: ReturnType<typeof setTimeout>;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.navigationTimer = setTimeout(() => {
      void this.router.navigate(['/home']);
    }, 3000);
  }

  ngOnDestroy(): void {
    if (this.navigationTimer) {
      clearTimeout(this.navigationTimer);
    }
  }
}
