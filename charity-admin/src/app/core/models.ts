/**
 * @file models.ts
 * @description Shared TypeScript interfaces that describe the JSON
 * payloads exchanged with the charity events API.
 *
 * Property names intentionally mirror the snake_case column names of
 * the MySQL database so that API payloads can be bound and sent back
 * without any manual field mapping.
 */

/**
 * A charity organisation that hosts one or more events.
 */
export interface Charity {
  /** Primary key of the charity. */
  charity_id: number;
  /** Display name of the charity. */
  charity_name: string;
  /** Public contact email address. */
  contact_email?: string;
  /** Public contact phone number. */
  contact_phone?: string;
  /** Short description of the charity's mission. */
  description?: string;
}

/**
 * A category used to group events (e.g. Fun Run, Concert).
 */
export interface Category {
  /** Primary key of the category. */
  category_id: number;
  /** Display name of the category. */
  category_name: string;
  /** Short description of the category. */
  description?: string;
}

/**
 * A single event registration / ticket purchase.
 */
export interface Registration {
  /** Primary key of the registration. */
  registration_id: number;
  /** Foreign key referencing the registered event. */
  event_id: number;
  /** Full name of the attendee. */
  full_name: string;
  /** Attendee email address (unique per event). */
  email: string;
  /** Attendee contact phone number. */
  phone: string;
  /** Number of tickets purchased (1 or more). */
  tickets: number;
  /** Date and time the registration was created. */
  registration_date: string;
}

/**
 * Payload sent to PUT /api/registrations/:id by the admin edit form.
 *
 * The linked event cannot be changed; only the attendee's contact
 * details and ticket count are editable.
 */
export interface RegistrationFormData {
  /** Attendee full name. */
  full_name: string;
  /** Attendee email address (unique per event). */
  email: string;
  /** Attendee contact phone number. */
  phone: string;
  /** Number of tickets purchased (1 or more). */
  tickets: number | string;
}

/** Administrative status values allowed by the database constraint. */
export type EventStatus = 'Active' | 'Past' | 'Suspended';

/**
 * A charity event.
 *
 * `registrations` is only populated by the single-event endpoint
 * (GET /api/events/:id); list endpoints leave it undefined.
 * `registration_count` is a convenience aggregate returned by the
 * list endpoint for admin tables.
 */
export interface CharityEvent {
  /** Primary key of the event. */
  event_id: number;
  /** Foreign key of the hosting charity. */
  charity_id: number;
  /** Foreign key of the event category. */
  category_id: number;
  /** Event title. */
  name: string;
  /** Long-form event description. */
  description?: string;
  /** Event date formatted as YYYY-MM-DD. */
  event_date: string;
  /** Venue / location of the event. */
  location: string;
  /** Fundraising purpose statement. */
  purpose?: string;
  /** Price per ticket (AUD). */
  ticket_price: number;
  /** Fundraising goal amount (AUD). */
  goal_amount?: number;
  /** Amount raised so far (AUD). */
  current_amount?: number;
  /** Administrative status: Active, Past or Suspended. */
  status: EventStatus | string;
  /** Path or URL to the event image. */
  image?: string;
  /** Latitude of the venue (used by the Open-Meteo API). */
  latitude?: number;
  /** Longitude of the venue (used by the Open-Meteo API). */
  longitude?: number;
  /** Category name provided by the API SQL joins. */
  category_name?: string;
  /** Hosting charity name provided by the API SQL joins. */
  charity_name?: string;
  /** Number of registrations (list endpoint aggregate). */
  registration_count?: number;
  /** Registrations for this event (detail endpoint only). */
  registrations?: Registration[];
}

/**
 * Payload sent to POST /api/events and PUT /api/events/:id.
 *
 * The admin form binds directly to this shape; numeric fields are
 * converted to numbers before the payload is submitted.
 */
export interface EventFormData {
  /** Foreign key of the hosting charity. */
  charity_id: number | string;
  /** Foreign key of the event category. */
  category_id: number | string;
  /** Event title. */
  name: string;
  /** Long-form event description. */
  description?: string;
  /** Event date formatted as YYYY-MM-DD. */
  event_date: string;
  /** Venue / location of the event. */
  location: string;
  /** Fundraising purpose statement. */
  purpose?: string;
  /** Price per ticket (AUD). */
  ticket_price: number | string;
  /** Fundraising goal amount (AUD). */
  goal_amount?: number | string | null;
  /** Amount raised so far (AUD). */
  current_amount?: number | string | null;
  /** Administrative status: Active, Past or Suspended. */
  status: EventStatus;
  /** Path or URL to the event image. */
  image?: string;
  /** Latitude of the venue. */
  latitude?: number | string | null;
  /** Longitude of the venue. */
  longitude?: number | string | null;
}

/**
 * Generic API error body returned by the Express routes.
 */
export interface ApiError {
  /** Human-readable error message. */
  error: string;
  /** Registration count included with the HTTP 409 delete response. */
  registration_count?: number;
  /** Optional low-level error detail. */
  detail?: string;
}
