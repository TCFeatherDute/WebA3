import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { EventService } from '../../core/services/event.service';
import { ApiError, CharityEvent } from '../../core/models';

/**
 * Admin event listing page.
 *
 * Loads every event regardless of status and renders the key
 * administrative details in a table. Each row exposes Edit and
 * Delete actions. Delete calls the API; when the event already has
 * registrations the API returns HTTP 409 and the descriptive message
 * is shown to the staff member instead of removing the row.
 */
@Component({
  imports: [RouterLink, CurrencyPipe, DatePipe],
  selector: 'app-event-list',
  styleUrl: './event-list.css',
  templateUrl: './event-list.html',
})
export class EventList implements OnInit {
  private readonly eventService = inject(EventService);

  /** All events returned by the API. */
  protected readonly events = signal<CharityEvent[]>([]);
  /** Whether the initial load is in progress. */
  protected readonly loading = signal<boolean>(true);
  /** Error message for the initial load, if any. */
  protected readonly loadError = signal<string>('');
  /** Success message shown after a deletion. */
  protected readonly successMessage = signal<string>('');
  /** Error message shown when a deletion is blocked or fails. */
  protected readonly actionError = signal<string>('');
  /** Id of the event currently being deleted (drives the busy state). */
  protected readonly deletingId = signal<number | null>(null);

  /** Total number of events in the table. */
  protected readonly totalEvents = computed(() => this.events().length);

  /**
   * Loads the complete event list.
   */
  ngOnInit(): void {
    this.loadEvents();
  }

  /**
   * Fetches all events from the API and manages the loading / error
   * signals used by the template.
   */
  protected loadEvents(): void {
    this.loading.set(true);
    this.loadError.set('');
    this.actionError.set('');
    this.successMessage.set('');

    this.eventService.getEvents().subscribe({
      next: (events) => {
        this.events.set(events);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.loadError.set(this.describeError(err));
      },
    });
  }

  /**
   * Prompts for confirmation and deletes the event.
   *
   * The API blocks deletion when registrations exist (HTTP 409) and
   * returns a message plus the registration count; that message is
   * surfaced verbatim.
   *
   * @param event - The event row the staff member asked to delete.
   */
  protected deleteEvent(event: CharityEvent): void {
    const confirmed = window.confirm(
      `Delete "${event.name}"? This action cannot be undone.`
    );
    if (!confirmed) {
      return;
    }

    this.deletingId.set(event.event_id);
    this.actionError.set('');
    this.successMessage.set('');

    this.eventService.deleteEvent(event.event_id).subscribe({
      next: () => {
        this.events.update((list) =>
          list.filter((e) => e.event_id !== event.event_id)
        );
        this.deletingId.set(null);
        this.successMessage.set(
          `Event "${event.name}" was deleted successfully.`
        );
      },
      error: (err: HttpErrorResponse) => {
        this.deletingId.set(null);
        // HTTP 409: the event has registrations and must not be deleted.
        if (err.status === 409) {
          const body = err.error as ApiError | null;
          const count = body?.registration_count;
          this.actionError.set(
            (body?.error ?? 'This event cannot be deleted.') +
              (count !== undefined
                ? ` (${count} registration${count === 1 ? '' : 's'} on record.)`
                : '')
          );
        } else {
          this.actionError.set(this.describeError(err));
        }
      },
    });
  }

  /**
   * Returns the CSS modifier class for a status badge.
   *
   * @param status - Event status (Active / Past / Suspended).
   * @returns A BEM modifier suffix.
   */
  protected statusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
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
