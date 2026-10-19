import {
  Component,
  OnInit,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { EventService } from '../../core/services/event.service';
import {
  ApiError,
  Category,
  Charity,
  CharityEvent,
  EventFormData,
  EventStatus,
  Registration,
  RegistrationFormData,
} from '../../core/models';

/**
 * Cleaned event payload where every numeric field is a real number
 * (or null), ready to be sent to the API. It is structurally
 * compatible with the `EventFormData` contract accepted by the service.
 */
interface SubmittedEventPayload {
  charity_id: number;
  category_id: number;
  name: string;
  description: string;
  event_date: string;
  location: string;
  purpose: string;
  ticket_price: number;
  goal_amount: number | null;
  current_amount: number | null;
  status: EventStatus;
  image: string;
  latitude: number | null;
  longitude: number | null;
}

/**
 * Empty form used when creating a new event.
 * @returns A fresh form-data object with safe defaults.
 */
function emptyForm(): EventFormData {
  return {
    charity_id: '',
    category_id: '',
    name: '',
    description: '',
    event_date: '',
    location: '',
    purpose: '',
    ticket_price: 0,
    goal_amount: '',
    current_amount: '',
    status: 'Active',
    image: '',
    // Central Sydney coordinates are pre-filled so the Open-Meteo
    // weather card always has a venue location; staff can overwrite
    // them with the exact venue if they know it.
    latitude: -33.8688,
    longitude: 151.2093,
  };
}

/**
 * Admin event form page, shared by the New and Edit features.
 *
 * Without a route `id` it creates an event; with an `id` it loads the
 * event (including its registrations), pre-fills the form and updates
 * the record on submit. In edit mode the associated registrations are
 * displayed underneath the form as required by the brief.
 */
@Component({
  imports: [FormsModule, RouterLink, DatePipe],
  selector: 'app-event-form',
  styleUrl: './event-form.css',
  templateUrl: './event-form.html',
})
export class EventForm implements OnInit {
  /**
   * Route parameter `:id`. It is `undefined` on the `/events/new` route
   * (component input binding clears the value when no parameter exists),
   * and a numeric string on `/events/:id/edit`.
   */
  public readonly id = input<string | undefined>(undefined);

  /**
   * Parsed event id, or `0` in create mode. Any non-numeric or missing
   * route value (e.g. `undefined`) safely resolves to create mode.
   */
  protected readonly eventId = computed<number>(() => {
    const raw = this.id();
    if (raw === undefined || raw === null || raw.trim() === '') {
      return 0;
    }
    const parsed = Number(raw);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : 0;
  });

  /** Whether the component is operating in edit mode. */
  protected readonly isEdit = computed(() => this.eventId() > 0);

  private readonly eventService = inject(EventService);

  /** Charities for the hosting-charity dropdown. */
  protected readonly charities = signal<Charity[]>([]);
  /** Categories for the category dropdown. */
  protected readonly categories = signal<Category[]>([]);
  /** The loaded event in edit mode (drives the registrations panel). */
  protected readonly event = signal<CharityEvent | null>(null);

  /** True while the event / reference data is loading. */
  protected readonly loading = signal<boolean>(true);
  /** Initial load error (e.g. event not found). */
  protected readonly loadError = signal<string>('');
  /** True while a create / update request is in flight. */
  protected readonly submitting = signal<boolean>(false);
  /** Server-side error returned on submit. */
  protected readonly submitError = signal<string>('');
  /** True once the event has been saved successfully. */
  protected readonly saved = signal<boolean>(false);

  /**
   * Id of the registration currently being edited inline, or `null`
   * when no edit panel is open.
   */
  protected readonly editingRegistrationId = signal<number | null>(null);
  /** True while a registration update request is in flight. */
  protected readonly savingRegistration = signal<boolean>(false);
  /** Id of the registration currently being deleted (for button state). */
  protected readonly deletingRegistrationId = signal<number | null>(null);
  /** Error shown inside the registrations card after an edit/delete. */
  protected readonly registrationError = signal<string>('');

  /** Form model bound with ngModel for the event form. */
  protected form: EventFormData = emptyForm();

  /** Form model bound with ngModel for the inline registration editor. */
  protected registrationForm: RegistrationFormData = {
    full_name: '',
    email: '',
    phone: '',
    tickets: 1,
  };

  /** Selectable status values. */
  protected readonly statuses: EventStatus[] = ['Active', 'Past', 'Suspended'];

  /** Existing image paths suggested by the datalist helper. */
  protected readonly imageSuggestions = [
    '/images/funrun.jpg',
    '/images/concert.jpg',
    '/images/workshop.jpg',
    '/images/fair.jpg',
    '/images/gala.jpg',
    '/images/auction.jpg',
    '/images/cleaning.jpg',
    '/images/volunteer.jpg',
  ];

  /**
   * In edit mode loads the event and its registrations; in both modes
   * loads the charity and category dropdown data.
   */
  ngOnInit(): void {
    this.eventService.getCharities().subscribe({
      next: (data) => this.charities.set(data),
    });
    this.eventService.getCategories().subscribe({
      next: (data) => this.categories.set(data),
    });

    if (this.isEdit()) {
      this.eventService.getEventById(this.eventId()).subscribe({
        next: (event) => {
          this.event.set(event);
          this.form = this.toFormData(event);
          this.loading.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.loading.set(false);
          this.loadError.set(
            err.status === 404
              ? 'The requested event does not exist.'
              : this.describeError(err)
          );
        },
      });
    } else {
      this.loading.set(false);
    }
  }

  /**
   * Validates and submits the form.
   *
   * Angular's template-driven validation handles the required fields;
   * additional numeric checks are performed before building the final
   * payload. On success the confirmation panel is shown.
   *
   * @param ngForm - The Angular form reference from the template.
   */
  protected onSubmit(ngForm: NgForm): void {
    this.submitError.set('');

    if (ngForm.invalid) {
      ngForm.form.markAllAsTouched();
      this.submitError.set('Please complete all required fields (marked with *).');
      return;
    }

    const payload = this.buildPayload();

    if (payload.ticket_price < 0) {
      this.submitError.set('Ticket price cannot be negative.');
      return;
    }
    if (payload.goal_amount !== null && payload.goal_amount < 0) {
      this.submitError.set('Goal amount cannot be negative.');
      return;
    }
    if (payload.current_amount !== null && payload.current_amount < 0) {
      this.submitError.set('Current amount cannot be negative.');
      return;
    }

    this.submitting.set(true);

    const request$ = this.isEdit()
      ? this.eventService.updateEvent(this.eventId(), payload)
      : this.eventService.createEvent(payload);

    request$.subscribe({
      next: () => {
        this.submitting.set(false);
        this.saved.set(true);
      },
      error: (err: HttpErrorResponse) => {
        this.submitting.set(false);
        this.submitError.set(this.describeError(err));
      },
    });
  }

  /**
   * Maps an event record to the form model.
   *
   * @param event - The loaded event.
   * @returns Form data pre-filled with the event values.
   */
  private toFormData(event: CharityEvent): EventFormData {
    return {
      charity_id: event.charity_id,
      category_id: event.category_id,
      name: event.name,
      description: event.description ?? '',
      event_date: event.event_date,
      location: event.location,
      purpose: event.purpose ?? '',
      ticket_price: event.ticket_price,
      goal_amount: event.goal_amount ?? '',
      current_amount: event.current_amount ?? '',
      status: (event.status as EventStatus) ?? 'Active',
      image: event.image ?? '',
      latitude: event.latitude ?? '',
      longitude: event.longitude ?? '',
    };
  }

  /**
   * Converts the bound form values into the numeric payload expected
   * by the API.
   *
   * @returns A cleaned event form payload.
   */
  private buildPayload(): SubmittedEventPayload {
    return {
      charity_id: Number(this.form.charity_id),
      category_id: Number(this.form.category_id),
      name: this.form.name.trim(),
      description: this.form.description?.trim() || '',
      event_date: this.form.event_date,
      location: this.form.location.trim(),
      purpose: this.form.purpose?.trim() || '',
      ticket_price: Number(this.form.ticket_price),
      goal_amount: this.toNullableNumber(this.form.goal_amount),
      current_amount: this.toNullableNumber(this.form.current_amount),
      status: this.form.status,
      image: this.form.image?.trim() || '',
      latitude: this.toNullableNumber(this.form.latitude),
      longitude: this.toNullableNumber(this.form.longitude),
    };
  }

  /**
   * Converts a form value to a number or null when left blank.
   *
   * @param value - Raw bound value.
   * @returns A number or null.
   */
  private toNullableNumber(value: string | number | null | undefined): number | null {
    if (value === '' || value === null || value === undefined) {
      return null;
    }
    return Number(value);
  }

  /**
   * Reloads the detailed event (including its registrations) so the
   * registrations panel reflects the latest data after an edit/delete.
   */
  private reloadEvent(): void {
    this.eventService.getEventById(this.eventId()).subscribe({
      next: (event) => this.event.set(event),
    });
  }

  /**
   * Opens the inline editor and pre-fills it with the chosen
   * registration's current values.
   *
   * @param registration - The registration row to edit.
   */
  protected startEditRegistration(registration: Registration): void {
    this.registrationError.set('');
    this.editingRegistrationId.set(registration.registration_id);
    this.registrationForm = {
      full_name: registration.full_name,
      email: registration.email,
      phone: registration.phone,
      tickets: registration.tickets,
    };
  }

  /**
   * Discards the inline registration editor without saving.
   */
  protected cancelEditRegistration(): void {
    this.editingRegistrationId.set(null);
    this.registrationError.set('');
  }

  /**
   * Validates and submits the inline registration edit.
   *
   * @param regForm - The Angular form reference for the editor.
   */
  protected saveRegistration(regForm: NgForm): void {
    this.registrationError.set('');

    if (regForm.invalid) {
      regForm.form.markAllAsTouched();
      this.registrationError.set('Please complete all required fields.');
      return;
    }

    const tickets = Number(this.registrationForm.tickets);
    if (!Number.isInteger(tickets) || tickets < 1) {
      this.registrationError.set('At least one ticket must be purchased.');
      return;
    }

    const registrationId = this.editingRegistrationId();
    if (registrationId === null) {
      return;
    }

    this.savingRegistration.set(true);

    const payload: RegistrationFormData = {
      full_name: this.registrationForm.full_name.trim(),
      email: this.registrationForm.email.trim(),
      phone: this.registrationForm.phone.trim(),
      tickets,
    };

    this.eventService.updateRegistration(registrationId, payload).subscribe({
      next: () => {
        this.savingRegistration.set(false);
        this.editingRegistrationId.set(null);
        this.reloadEvent();
      },
      error: (err: HttpErrorResponse) => {
        this.savingRegistration.set(false);
        this.registrationError.set(this.describeError(err));
      },
    });
  }

  /**
   * Asks for confirmation then deletes the given registration.
   *
   * @param registration - The registration row to remove.
   */
  protected deleteRegistration(registration: Registration): void {
    const confirmed = window.confirm(
      `Delete the registration for ${registration.full_name} ` +
      `(${registration.tickets} ticket(s))? This cannot be undone.`
    );
    if (!confirmed) {
      return;
    }

    this.deletingRegistrationId.set(registration.registration_id);
    this.registrationError.set('');

    this.eventService
      .deleteRegistration(registration.registration_id)
      .subscribe({
        next: () => {
          this.deletingRegistrationId.set(null);
          if (this.editingRegistrationId() === registration.registration_id) {
            this.editingRegistrationId.set(null);
          }
          this.reloadEvent();
        },
        error: (err: HttpErrorResponse) => {
          this.deletingRegistrationId.set(null);
          this.registrationError.set(this.describeError(err));
        },
      });
  }

  /**
   * Converts an HttpErrorResponse into a readable message.
   *
   * @param err - The HTTP error returned by the API.
   * @returns A message suitable for display in the UI.
   */
  private describeError(err: HttpErrorResponse): string {
    if (err.status === 0) {
      return 'Cannot reach the API. Is the Node.js server running on port 3000?';
    }
    const body = err.error as ApiError | null;
    return body?.error ?? 'Unexpected server error. Please try again.';
  }
}
