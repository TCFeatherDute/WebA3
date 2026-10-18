
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { EventService } from '../../core/services/event.service';
import { CharityEvent } from '../../core/models/models';
import { EventCard } from '../../shared/event-card/event-card';

@Component({
  selector: 'app-home',
  imports: [RouterLink, EventCard],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  private readonly eventService = inject(EventService);

  // Reactive state
  readonly events = signal<CharityEvent[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  readonly totalEvents = signal(0);
  readonly totalRaised = signal(0);

  ngOnInit(): void {
    this.eventService.getEvents().subscribe({
      next: (events) => {
        this.totalEvents.set(events.length);

        this.totalRaised.set(
          events.reduce(
            (sum, event) => sum + Number(event.current_amount || 0),
            0
          )
        );

        this.events.set(
          events
            .filter(event => event.status === 'Active')
            .slice(0, 6)
        );

        this.error.set('');
        this.loading.set(false);
      },

      error: (err) => {
        console.error('Failed to load events:', err);
        this.error.set('Unable to load charity events.');
        this.loading.set(false);
      }
    });
  }
}
