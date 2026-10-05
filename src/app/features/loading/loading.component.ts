import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss'],
  standalone: false,
})
export class LoadingComponent implements OnInit {
  loadingProgress: number = 0;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.startLoading();
  }

  startLoading(): void {
    let progress: number = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;

      if (progress >= 100) {
        this.loadingProgress = 100;
        clearInterval(interval);

        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 500); // Wait for 500 milliseconds before navigating to the home page
      } else {
        this.loadingProgress = Math.min(progress, 99); // Ensure progress does not exceed 100
      }
    }, 500); // Update progress every 500 milliseconds
  }
}
