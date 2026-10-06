
import { AddUserModalComponent } from '../features/add-user-modal/add-user-modal.component';
import { ChangeDetectorRef, Component, ElementRef, ViewChild, signal } from '@angular/core';
import { NavController, ModalController } from '@ionic/angular/lazy';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  @ViewChild('logoWrapper') logoWrapper!: ElementRef<HTMLElement>;

  players: string[] = [];
  isAddUserModalOpen = signal(false);

  constructor(
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private cdr: ChangeDetectorRef,

  ) {}

  async openAddUserModal() {
    if (this.isAddUserModalOpen()) {
      return;
    }

    this.isAddUserModalOpen.set(true);

    try {
      const addUserModal = await this.modalCtrl.create({
        component: AddUserModalComponent,
        cssClass: 'retro-tv-modal',
      });
      const dismissed = addUserModal.onDidDismiss();

      await addUserModal.present();
      await dismissed;
    } finally {
      this.isAddUserModalOpen.set(false);
    }
  }
  showContent = false;


  onLogoAnimationEnd() {
    if (this.showContent) return;

    const el = this.logoWrapper.nativeElement;

    // First: posición actual (centrado)
    const first = el.getBoundingClientRect();

    // Last: mostrar contenido y dejar que el layout lleve el logo arriba
    this.showContent = true;
    this.cdr.detectChanges();
    const last = el.getBoundingClientRect();

    // Invert: lo devolvemos visualmente a donde estaba
    const deltaY = first.top - last.top;
    el.style.transition = 'none';
    el.style.transform = `translateY(${deltaY}px)`;

    // Forzar reflow para que el navegador registre el estado invertido
    el.getBoundingClientRect();

    // Play: animamos hacia la posición final
    el.style.transition = 'transform 1s 2s cubic-bezier(0, 0, 0.306, 0.992)';
    el.style.transform = '';

    el.addEventListener('transitionend', () => {
      el.style.transition = '';
    }, { once: true });
  }

  onAddCard() { this.players.push('Jugador'); }
  onRemoveCard(index: number) { this.players.splice(index, 1); }
  startGame() { this.navCtrl.navigateRoot(['/intensity']); }
}