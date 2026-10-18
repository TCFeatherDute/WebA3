
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';

import { EventService } from '../../core/services/event.service';
import { WeatherService, EventWeather } from '../../core/services/weather';
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
  private readonly weatherService = inject(WeatherService);

  readonly event = signal<EventDetailModel | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');

  readonly weather = signal<EventWeather | null>(null);
  readonly weatherLoading = signal(false);
  readonly weatherError = signal(false);

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

        if (data.latitude != null && data.longitude != null) {
          this.loadWeather(
            Number(data.latitude),
            Number(data.longitude),
            data.event_date
          );
        }
      },
      error: (err) => {
        console.error('Failed to load event details:', err);
        this.error.set('Unable to load event details.');
        this.loading.set(false);
      }
    });
  }

  private loadWeather(
    latitude: number,
    longitude: number,
    eventDate: string
  ): void {
    this.weatherLoading.set(true);
    this.weatherError.set(false);

    this.weatherService
      .getEventWeather(latitude, longitude, eventDate)
      .subscribe({
        next: (forecast) => {
          this.weather.set(forecast);
          this.weatherLoading.set(false);
        },
        error: (err) => {
          console.error('Weather request failed:', err);
          this.weatherError.set(true);
          this.weatherLoading.set(false);
        }
      });
  }

  progress(): number {
    const current = this.event();

    if (!current || Number(current.goal_amount) <= 0) {
      return 0;
    }

    return Math.max(
      0,
      Math.min(
        100,
        Number(current.current_amount) /
          Number(current.goal_amount) * 100
      )
    );
  }
}
