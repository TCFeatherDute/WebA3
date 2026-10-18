import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { routes } from './app.routes';

/**
 * Root application providers.
 *
 * - `provideRouter` activates the client-side router and binds route
 *   parameters directly to component inputs (used by the edit form).
 * - `provideHttpClient` (with the fetch backend) enables the
 *   injected HttpClient used by the event service.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withFetch()),
  ],
};
