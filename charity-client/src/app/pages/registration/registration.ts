
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';

import { EventService } from '../../core/services/event.service';
import {
  CharityEvent,
  RegistrationRequest
} from '../../core/models/models';

@Component({
  selector: 'app-registration',
  imports: [FormsModule, RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './registration.html',
  styleUrl: './registration.css'
})
export class Registration implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly eventService = inject(EventService);

  readonly event = signal<CharityEvent | null>(null);
  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly error = signal('');
  readonly success = signal('');
  readonly registrationId = signal<number | null>(null);

  eventId = 0;
  fullName = '';
  email = '';
  phone = '';
  tickets = 1;

  ngOnInit(): void {
    this.eventId = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isInteger(this.eventId) || this.eventId <= 0) {
      this.error.set('Invalid event ID.');
      this.loading.set(false);
      return;
    }

    this.eventService.getEventById(this.eventId).subscribe({
      next: (event) => {
        this.event.set(event);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Unable to load event information.');
        this.loading.set(false);
      }
    });
  }

  get totalPrice(): number {
    return Number(this.event()?.ticket_price ?? 0) * this.tickets;
  }

  submitRegistration(): void {
    if (this.submitting() || this.success()) {
      return;
    }

    if (!this.fullName.trim() || !this.email.trim() ||
        !this.phone.trim() || !Number.isInteger(this.tickets) ||
        this.tickets < 1) {
      this.error.set('Please complete all required fields.');
      return;
    }

    const request: RegistrationRequest = {
      event_id: this.eventId,
      full_name: this.fullName.trim(),
      email: this.email.trim(),
      phone: this.phone.trim(),
      tickets: this.tickets
    };

    this.error.set('');
    this.submitting.set(true);

    this.eventService.registerForEvent(request).subscribe({
      next: (response) => {
        this.registrationId.set(response.registration_id);
        this.success.set(response.message);
        this.submitting.set(false);
      },
      error: (err) => {
        this.error.set(
          err.status === 409
            ? 'This email is already registered for this event.'
            : err.error?.error || 'Registration failed. Please try again.'
        );
        this.submitting.set(false);
      }
    });
  }
}
