import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';
import { ModeSelectionPage } from './mode-selection.page';
import { RivePreviewComponent } from '../../features/riveAnimation/player/player.component';

describe('ModeSelectionPage', () => {
  let component: ModeSelectionPage;
  let fixture: ComponentFixture<ModeSelectionPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), RivePreviewComponent],
      declarations: [ModeSelectionPage],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ModeSelectionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
