import { computed, Injectable, signal } from '@angular/core';
import { CARD_ACTIVITIES } from '../../data/card-activities';
import { TurnActivity } from '../models/turn-activity.model';

@Injectable({
  providedIn: 'root',
})
export class GameSessionService {
  private deck: TurnActivity[] = [];

  readonly started = signal(false);
  readonly currentPlayerIndex = signal(0);
  readonly revealedActivity = signal<TurnActivity | null>(null);
  readonly hasRevealedActivity = computed(() => this.revealedActivity() !== null);

  startSession(): void {
    this.currentPlayerIndex.set(0);
    this.revealedActivity.set(null);
    this.deck = this.shuffle([...CARD_ACTIVITIES]);
    this.started.set(true);
  }

  resetSession(): void {
    this.started.set(false);
    this.currentPlayerIndex.set(0);
    this.revealedActivity.set(null);
    this.deck = [];
  }

  drawActivity(): TurnActivity {
    if (!this.started()) this.startSession();

    const currentActivity = this.revealedActivity();
    if (currentActivity) return currentActivity;

    if (this.deck.length === 0) {
      this.deck = this.shuffle([...CARD_ACTIVITIES]);
    }

    const activity = this.deck.pop();
    if (!activity) {
      throw new Error('No card activities are available in the deck.');
    }

    this.revealedActivity.set(activity);
    return activity;
  }

  drawActivityForCategory(category: string): TurnActivity {
    if (!this.started()) this.startSession();

    const currentActivity = this.revealedActivity();
    if (currentActivity) return currentActivity;

    let activityIndex = this.deck.findIndex(activity => activity.category === category);
    if (activityIndex === -1) {
      this.deck = this.shuffle([...CARD_ACTIVITIES]);
      activityIndex = this.deck.findIndex(activity => activity.category === category);
    }

    if (activityIndex === -1) {
      throw new Error(`No card activities are available for category "${category}".`);
    }

    const [activity] = this.deck.splice(activityIndex, 1);
    this.revealedActivity.set(activity);
    return activity;
  }

  completeTurn(playerCount: number): void {
    this.revealedActivity.set(null);
    if (playerCount > 0) {
      this.currentPlayerIndex.update(index => (index + 1) % playerCount);
    } else {
      this.currentPlayerIndex.set(0);
    }
  }

  private shuffle<T>(items: T[]): T[] {
    for (let index = items.length - 1; index > 0; index--) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [items[index], items[randomIndex]] = [items[randomIndex], items[index]];
    }
    return items;
  }
}
