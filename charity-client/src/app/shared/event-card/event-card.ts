
import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CharityEvent } from '../../core/models/models';

@Component({
  selector: 'app-event-card',
  imports: [CommonModule, RouterLink],
  templateUrl: './event-card.html',
  styleUrl: './event-card.css'
})
export class EventCard {
  event = input.required<CharityEvent>();

  get progress(): number {
    const event = this.event();

    if (!event.goal_amount || event.goal_amount <= 0) {
      return 0;
    }

    return Math.min(
      100,
      (event.current_amount / event.goal_amount) * 100
    );
  }
}
