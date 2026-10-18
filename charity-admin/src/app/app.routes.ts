import { Routes } from '@angular/router';
import { EventList } from './pages/event-list/event-list';
import { EventForm } from './pages/event-form/event-form';

/**
 * Admin application routes.
 *
 * - `/events`          lists every event (the default landing page)
 * - `/events/new`      creates a new event
 * - `/events/:id/edit` updates an existing event and shows its bookings
 */
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'events' },
  { path: 'events', component: EventList },
  { path: 'events/new', component: EventForm },
  { path: 'events/:id/edit', component: EventForm },
  { path: '**', redirectTo: 'events' },
];
