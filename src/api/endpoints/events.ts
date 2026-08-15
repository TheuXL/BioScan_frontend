import { apiGet } from '../client';

export interface EonetEvent {
  id: string;
  title: string;
  description?: string;
  link?: string;
  categories?: Array<{ id: number; title: string }>;
  geometries?: Array<{
    date: string;
    type: string;
    coordinates: number[] | number[][] | number[][][];
  }>;
}

export interface EonetEventsResponse {
  title?: string;
  events: EonetEvent[];
}

export function fetchEvents(extra?: Record<string, string | number>) {
  return apiGet<EonetEventsResponse>('/api/events', extra);
}

export function fetchEventCategories() {
  return apiGet<{ categories: Array<{ id: number; title: string; description?: string }> }>(
    '/api/events/categories',
  );
}

export function fetchEventCategoryEvents(categoryId: number, extra?: Record<string, string | number>) {
  return apiGet<EonetEventsResponse>(`/api/events/categories/${categoryId}`, extra);
}

export function fetchEventSources() {
  return apiGet<Record<string, unknown>>('/api/events/sources');
}

export function fetchEventLayers() {
  return apiGet<Record<string, unknown>>('/api/events/layers');
}

export function fetchEventLayerCategory(categoryId: number) {
  return apiGet<Record<string, unknown>>(`/api/events/layers/${categoryId}`);
}
