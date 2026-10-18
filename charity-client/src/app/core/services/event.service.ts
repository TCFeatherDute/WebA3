
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_CONFIG } from '../config/config';
import {
  CharityEvent,
  EventDetail,
  EventSearchParams,
  RegistrationRequest,
  RegistrationResponse
} from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = API_CONFIG.baseUrl;

  // Retrieve events with optional search filters.
  getEvents(filters: EventSearchParams = {}): Observable<CharityEvent[]> {
    let params = new HttpParams();

    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    }

    return this.http.get<CharityEvent[]>(
      `${this.apiUrl}/events`,
      { params }
    );
  }

  // Retrieve one event and its registration records.
  getEventById(id: number): Observable<EventDetail> {
    return this.http.get<EventDetail>(
      `${this.apiUrl}/events/${id}`
    );
  }

  // Submit an event registration.
  registerForEvent(
    data: RegistrationRequest
  ): Observable<RegistrationResponse> {
    return this.http.post<RegistrationResponse>(
      `${this.apiUrl}/registrations`,
      data
    );
  }
}
