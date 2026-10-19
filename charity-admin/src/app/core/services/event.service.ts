/**
 * @file event.service.ts
 * @description Angular service that encapsulates every HTTP call the
 * admin website makes: listing events, loading one event with its
 * registrations, and creating / updating / deleting events.
 *
 * Components never build API URLs themselves. They depend on this
 * injectable service, which keeps the data flow easy to trace:
 * component -> EventService -> Express API -> MySQL.
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config';
import {
  Category,
  Charity,
  CharityEvent,
  EventFormData,
  RegistrationFormData,
} from '../models';

/**
 * Injectable service for the event resource (admin operations).
 */
@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/events`;

  /**
   * Fetches every event regardless of its status, as required by the
   * admin listing feature.
   *
   * @returns Observable emitting the full event array.
   */
  getEvents(): Observable<CharityEvent[]> {
    return this.http.get<CharityEvent[]>(this.baseUrl);
  }

  /**
   * Fetches one event including its registrations, sorted by the
   * latest registration date on the server. The edit form uses the
   * registrations array to display associated booking data.
   *
   * @param eventId - Unique id of the event.
   * @returns Observable emitting the detailed event object.
   */
  getEventById(eventId: number): Observable<CharityEvent> {
    return this.http.get<CharityEvent>(`${this.baseUrl}/${eventId}`);
  }

  /**
   * Creates a new charity event.
   *
   * @param form - Validated event form values.
   * @returns Observable emitting the id of the created event.
   */
  createEvent(form: EventFormData): Observable<{
    event_id: number;
    message: string;
  }> {
    return this.http.post<{ event_id: number; message: string }>(
      this.baseUrl,
      form
    );
  }

  /**
   * Updates an existing charity event.
   *
   * @param eventId - Unique id of the event to update.
   * @param form - Validated event form values.
   * @returns Observable emitting the confirmation response.
   */
  updateEvent(
    eventId: number,
    form: EventFormData
  ): Observable<{ event_id: number; message: string }> {
    return this.http.put<{ event_id: number; message: string }>(
      `${this.baseUrl}/${eventId}`,
      form
    );
  }

  /**
   * Deletes an event. The API responds with HTTP 409 when the event
   * already has registrations; the component surfaces that message
   * to the staff member.
   *
   * @param eventId - Unique id of the event to delete.
   * @returns Observable emitting the confirmation response.
   */
  deleteEvent(eventId: number): Observable<{
    event_id: number;
    message: string;
  }> {
    return this.http.delete<{ event_id: number; message: string }>(
      `${this.baseUrl}/${eventId}`
    );
  }

  /**
   * Updates an existing registration's attendee details and ticket
   * count. The linked event is not changed by the API.
   *
   * @param registrationId - Unique id of the registration.
   * @param form - Validated registration form values.
   * @returns Observable emitting the confirmation response.
   */
  updateRegistration(
    registrationId: number,
    form: RegistrationFormData
  ): Observable<{ registration_id: number; message: string }> {
    return this.http.put<{ registration_id: number; message: string }>(
      `${API_BASE_URL}/registrations/${registrationId}`,
      form
    );
  }

  /**
   * Deletes a single registration. The parent event is unaffected.
   *
   * @param registrationId - Unique id of the registration.
   * @returns Observable emitting the confirmation response.
   */
  deleteRegistration(
    registrationId: number
  ): Observable<{ registration_id: number; message: string }> {
    return this.http.delete<{ registration_id: number; message: string }>(
      `${API_BASE_URL}/registrations/${registrationId}`
    );
  }

  /**
   * Fetches the full list of event categories for the form dropdown.
   *
   * @returns Observable emitting the category array.
   */
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${API_BASE_URL}/categories`);
  }

  /**
   * Fetches the full list of registered charities for the form dropdown.
   *
   * @returns Observable emitting the charity array.
   */
  getCharities(): Observable<Charity[]> {
    return this.http.get<Charity[]>(`${API_BASE_URL}/charities`);
  }
}
