
/** One charity event returned by the REST API. */
export interface CharityEvent {
  event_id: number;
  charity_id: number;
  category_id: number;
  name: string;
  description: string | null;
  event_date: string;
  location: string;
  purpose: string | null;
  ticket_price: number;
  goal_amount: number;
  current_amount: number;
  status: string;
  image: string | null;
  latitude: number | null;
  longitude: number | null;
  category_name: string;
  charity_name: string;
  registration_count: number;
}

/** A registration associated with an event. */
export interface EventRegistration {
  registration_id: number;
  event_id: number;
  full_name: string;
  email: string;
  phone: string;
  tickets: number;
  registration_date: string;
}

/** The event details endpoint includes registrations. */
export interface EventDetail extends CharityEvent {
  registrations: EventRegistration[];
}

/** Data submitted by a visitor registering for an event. */
export interface RegistrationRequest {
  event_id: number;
  full_name: string;
  email: string;
  phone: string;
  tickets: number;
}

/** Response returned after a successful registration. */
export interface RegistrationResponse {
  registration_id: number;
  message: string;
}

/** Optional filters supported by GET /api/events. */
export interface EventSearchParams {
  keyword?: string;
  location?: string;
  category?: number | string;
  status?: string;
}
