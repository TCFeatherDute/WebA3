
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';

import { EventService } from '../../core/services/event.service';
import { EventDetail as EventDetailModel } from '../../core/models/models';

@Component({
  selector: 'app-event-detail',
  imports: [RouterLink, CurrencyPipe, DatePipe, DecimalPipe],
  templateUrl: './event-detail.html',
  styleUrl: './event-detail.css'
})
export class EventDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly eventService = inject(EventService);

  readonly event = signal<EventDetailModel | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isInteger(id) || id <= 0) {
      this.error.set('Invalid event ID.');
      this.loading.set(false);
      return;
    }

    this.eventService.getEventById(id).subscribe({
      next: (data) => {
        this.event.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load event details:', err);
        this.error.set('Unable to load event details.');
        this.loading.set(false);
      }
    });
  }

  progress(): number {
    const current = this.event();

    if (!current || Number(current.goal_amount) <= 0) {
      return 0;
    }

    return Math.min(
      100,
      Number(current.current_amount) / Number(current.goal_amount) * 100
    );
  }
}
