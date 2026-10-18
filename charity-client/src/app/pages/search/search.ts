
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { EventService } from '../../core/services/event.service';
import {
  CharityEvent,
  EventSearchParams
} from '../../core/models/models';
import { EventCard } from '../../shared/event-card/event-card';

@Component({
  selector: 'app-search',
  imports: [FormsModule, EventCard],
  templateUrl: './search.html',
  styleUrl: './search.css'
})
export class Search implements OnInit {
  private readonly eventService = inject(EventService);

  keyword = '';
  location = '';
  category = '';
  status = '';

  readonly events = signal<CharityEvent[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly hasSearched = signal(false);

  ngOnInit(): void {
    this.searchEvents();
  }

  searchEvents(): void {
    const filters: EventSearchParams = {
      keyword: this.keyword.trim(),
      location: this.location.trim(),
      category: this.category,
      status: this.status
    };

    this.loading.set(true);
    this.error.set('');

    this.eventService.getEvents(filters).subscribe({
      next: (events) => {
        this.events.set(events);
        this.hasSearched.set(true);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Search request failed:', err);
        this.error.set('Unable to search charity events.');
        this.hasSearched.set(true);
        this.loading.set(false);
      }
    });
  }

  resetFilters(): void {
    this.keyword = '';
    this.location = '';
    this.category = '';
    this.status = '';

    this.searchEvents();
  }
}
