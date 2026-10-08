import { AddUserModalComponent } from '../features/add-user-modal/add-user-modal.component';
import { ChangeDetectorRef, Component, ElementRef, NgZone, QueryList, ViewChild, ViewChildren, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NavController, ModalController } from '@ionic/angular/lazy';
import { Player } from '../core/models/player.model';

const ICON_MALE = `
<svg viewBox="0 -1 30 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<g>
<path d="M26.7468 5.58373C26.516 5.21133 26.0972 5.0484 25.6414 5.01349C24.7496 4.92912 18.9204 5.25788 18.0713 5.51681C17.2878 5.72628 16.6952 6.20342 16.7351 6.95694C16.812 7.71629 17.4417 8.13233 18.3391 8.17597C18.8149 8.19633 19.8719 8.1556 21.0486 8.08578C19.6269 9.0546 16.8462 11.129 15.8975 11.9756C13.6837 9.86049 10.9543 9.49973 8.53257 11.1406C6.88865 12.2549 5.56097 13.6339 4.79457 15.0246C3.72901 16.9593 3.73471 18.9377 4.81451 20.596C5.84588 22.1816 7.49551 23.3454 9.34456 23.7934C9.91723 23.9331 10.4899 24 11.0512 24C12.3902 24 13.678 23.6131 14.7863 22.8595C16.3961 21.7685 17.5271 20.4244 18.0628 18.9755C18.6611 17.3492 18.4958 15.6734 17.5841 14.1082C18.701 13.3983 21.4333 11.321 22.7125 10.2649C22.2737 11.4257 21.8977 12.4847 21.7666 12.9677C21.5358 13.855 21.7467 14.6173 22.4133 14.8995C23.1057 15.1672 23.7296 14.7366 24.1627 14.0383C24.6613 13.2906 26.7468 7.72211 26.9405 6.82893C27.0488 6.37507 27.0232 5.9183 26.7468 5.57791V5.58373ZM15.3932 17.9514C15.0769 18.8126 14.2991 19.6941 13.2079 20.436C12.2962 21.0557 11.1566 21.2419 9.99701 20.9626C8.84597 20.6833 7.8203 19.9647 7.18495 18.9872C6.8801 18.5188 6.561 17.7507 7.27613 16.4531C7.81745 15.4727 8.84882 14.4195 10.1053 13.567C10.6694 13.183 11.2079 13.0259 11.7093 13.0259C13.1965 13.0259 14.3704 14.4136 15.0228 15.4203C15.5841 16.2815 15.7037 17.1106 15.3932 17.9573V17.9514Z"/>
</g>
</svg>`;

const ICON_FEMALE = `
<svg viewBox="0 -1 30 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<g>
<path d="M21.942 6.00736C19.4636 2.03796 15.8439 0.905194 12.7163 3.11392C11.0057 4.32241 9.62424 5.81804 8.82677 7.32629C7.71803 9.42458 7.72396 11.5702 8.84752 13.3687C9.9207 15.0884 11.6372 16.3505 13.5612 16.8364C13.7568 16.8869 13.9525 16.9248 14.1452 16.9563C14.1452 16.9627 14.1452 16.9658 14.1422 16.9721C14.0859 17.3003 14.0296 19.569 14.0296 20.7901C12.826 20.8185 11.7884 20.85 11.4534 20.91C10.7804 21.0299 10.1638 21.4748 10.1638 22.3709C10.1638 23.0556 10.7508 23.6835 11.5067 23.8003C11.8417 23.8287 12.8526 23.8602 14.0563 23.8886C14.0829 25.1697 14.1393 26.274 14.1956 26.6306C14.2786 27.3752 14.6996 28 15.5385 28C16.2115 28 16.7718 27.4036 16.8815 26.5706C16.9378 26.2141 16.9645 25.1413 16.9645 23.8886C17.9724 23.8602 18.8411 23.8287 19.262 23.7687C20.187 23.6488 20.8303 23.1439 20.8303 22.3078C20.8303 21.4716 20.2137 21.0551 19.3747 20.8784C19.0397 20.7901 18.0851 20.7585 16.9675 20.7585C16.9408 19.6857 16.9111 17.5085 16.8548 17.0605C16.8489 17.0037 16.837 16.95 16.8281 16.8932C17.679 16.7008 18.4883 16.3442 19.2235 15.8236C20.8985 14.6403 22.0754 13.1826 22.6327 11.6112C23.2968 9.73065 23.0567 7.79328 21.942 6.0042V6.00736ZM19.8579 10.5037C19.5288 11.4377 18.7195 12.3937 17.5841 13.1984C16.6354 13.8704 15.4496 14.0724 14.243 13.7695C13.0453 13.4666 11.9781 12.6872 11.317 11.627C10.9998 11.119 10.6678 10.286 11.4119 8.87871C11.9751 7.81536 13.0483 6.67313 14.3557 5.74862C14.9427 5.33212 15.503 5.16173 16.0247 5.16173C17.5722 5.16173 18.7936 6.66682 19.4725 7.75857C20.0565 8.69254 20.181 9.59181 19.8579 10.51V10.5037Z"/>
</g>
</svg>`;

const ICON_BOTH = `
<svg viewBox="0 -1 30 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<g>
<path d="M24.7824 3.50219C24.5818 3.18181 24.2178 3.04164 23.8216 3.01161C23.0465 2.93902 17.98 3.22185 17.2421 3.44462C16.5611 3.62483 16.046 4.03532 16.0807 4.68358C16.1476 5.33686 16.6948 5.69478 17.4749 5.73233C17.8884 5.74985 18.8071 5.7148 19.8298 5.65473C18.6635 6.44066 17.0267 7.68213 16.2194 8.38547C14.3176 6.66593 11.9998 6.39811 9.9395 7.77975C8.51068 8.73838 7.35672 9.92479 6.6906 11.1212C5.76447 12.7857 5.76942 14.4877 6.70794 15.9144C7.60435 17.2785 9.03813 18.2797 10.6452 18.6651C10.7938 18.7002 10.9449 18.7302 11.0935 18.7552C11.0613 19.426 11.0365 20.5749 11.0365 21.2807C10.0311 21.3033 9.16442 21.3283 8.8846 21.3758C8.32248 21.471 7.80741 21.8239 7.80741 22.5347C7.80741 23.0779 8.29772 23.5759 8.92917 23.6686C9.20899 23.6911 10.0534 23.7161 11.0588 23.7386C11.0811 24.7548 11.1281 25.6309 11.1752 25.9137C11.2445 26.5044 11.5961 27 12.2969 27C12.8591 27 13.3271 26.5269 13.4187 25.8662C13.4657 25.5833 13.488 24.7323 13.488 23.7386C14.33 23.7161 15.0555 23.6911 15.4072 23.6435C16.1798 23.5484 16.7171 23.1479 16.7171 22.4847C16.7171 21.8214 16.202 21.491 15.5013 21.3508C15.2214 21.2807 14.4241 21.2557 13.4905 21.2557C13.4732 20.5799 13.4534 19.3534 13.4236 18.6977C14.1145 18.5425 14.7757 18.2622 15.375 17.8592C16.7741 16.9206 17.7572 15.7642 18.2227 14.5177C18.7576 13.0785 18.5892 11.5943 17.7374 10.2176C18.6313 9.62443 20.2483 8.36544 21.2735 7.52695C20.8922 8.52563 20.5653 9.43671 20.4514 9.8522C20.2508 10.6156 20.434 11.2714 21.0135 11.5142C21.6152 11.7444 22.1575 11.374 22.5339 10.7733C22.9673 10.13 24.7799 5.33936 24.9483 4.57095C25.0424 4.18049 25.0201 3.78752 24.7799 3.49468L24.7824 3.50219ZM15.9049 13.6417C15.63 14.3826 14.954 15.141 14.0056 15.7792C13.2132 16.3123 12.2226 16.4725 11.2148 16.2323C10.2144 15.992 9.3229 15.3737 8.77069 14.5327C8.50573 14.1298 8.22838 13.469 8.84993 12.3527C9.32043 11.5092 10.2168 10.6031 11.3089 9.86972C11.7992 9.53933 12.2672 9.40417 12.703 9.40417C13.9957 9.40417 15.0159 10.5981 15.583 11.4641C16.0708 12.205 16.1748 12.9183 15.9049 13.6467V13.6417Z"/>
</g>
</svg>`;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})

export class HomePage {
  @ViewChild('logoWrapper') logoWrapper!: ElementRef<HTMLElement>;
  @ViewChildren('card') cards!: QueryList<ElementRef<HTMLElement>>;

  players = signal<Player[]>([]);
  isAddUserModalOpen = signal(false);
  showContent = false;

  chickenIdle = false;

  removingPlayers = signal<Set<Player>>(new Set());

  private readonly REMOVE_ANIMATION_MS = 300;   // igual a la duración del CSS
  private readonly REFLOW_ANIMATION_MS = 400;

  // Se sanitizan una sola vez, no en cada ciclo de detección de cambios
  private readonly genderIcons: Record<string, SafeHtml>;

  constructor(
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private sanitizer: DomSanitizer,
  ) {
    this.genderIcons = {
      both: this.sanitizer.bypassSecurityTrustHtml(ICON_BOTH),
      female: this.sanitizer.bypassSecurityTrustHtml(ICON_FEMALE),
      male: this.sanitizer.bypassSecurityTrustHtml(ICON_MALE),
    };
  }

  async openAddUserModal() {
    if (this.isAddUserModalOpen()) {
      return;
    }

    this.isAddUserModalOpen.set(true);

    try {
      const addUserModal = await this.modalCtrl.create({
        component: AddUserModalComponent,
        cssClass: 'addModal',
      });
      const dismissed = addUserModal.onDidDismiss<{
        name: string;
        gender: Player['gender'];
        avatar: Player['avatar'];
        preferGender: Player['preferGender'];
      }>();

      await addUserModal.present();
      const { data, role } = await dismissed;
      if (role === 'confirm' && data) {
        this.ngZone.run(() => {
          this.animateReflow(() => {
            this.players.update(players => [...players, data]);
          });
        });
      }
    } finally {
      this.isAddUserModalOpen.set(false);
    }
  }

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

  /**
   * FLIP para el grid: mide cada card, aplica el cambio, y anima cada una
   * desde su posición anterior hasta la nueva.
   */
  private animateReflow(mutate: () => void) {
    // First: posición actual de cada card
    const first = new Map<HTMLElement, DOMRect>();
    this.cards?.forEach(c => first.set(c.nativeElement, c.nativeElement.getBoundingClientRect()));

    // Aplica el cambio y deja que el grid se reorganice
    mutate();
    this.cdr.detectChanges();

    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Last + Invert + Play
    this.cards.forEach(c => {
      const el = c.nativeElement;
      const prev = first.get(el);
      if (!prev) return;                        // card nueva: no hay posición previa

      const last = el.getBoundingClientRect();
      const dx = prev.left - last.left;
      const dy = prev.top - last.top;
      if (!dx && !dy) return;                   // no se movió

      el.animate(
        [{ translate: `${dx}px ${dy}px` }, { translate: '0 0' }],
        { duration: this.REFLOW_ANIMATION_MS, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
      );
    });
  }

  onRemoveCard(player: Player) {
    this.ngZone.run(() => {
      if (this.removingPlayers().has(player)) return;

      // 1. Marca la card: el CSS dispara la animación de salida
      this.removingPlayers.update(set => new Set(set).add(player));
      this.cdr.detectChanges();

      // 2. Al terminar la animación, la quitamos y reorganizamos el grid
      setTimeout(() => {
        this.animateReflow(() => {
          this.players.update(players => players.filter(p => p !== player));
          this.removingPlayers.update(set => {
            const next = new Set(set);
            next.delete(player);
            return next;
          });
        });
      }, this.REMOVE_ANIMATION_MS);
    });
  }

  startGame() { this.navCtrl.navigateRoot(['/intensity']); }
}