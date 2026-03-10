import api from './client';
import type { PantryStaple } from '../types';

export const pantryStaplesApi = {
  getAll: () =>
    api.get<PantryStaple[]>('/pantrystaples').then(r => r.data),
  create: (name: string) =>
    api.post<PantryStaple>('/pantrystaples', { name }).then(r => r.data),
  toggle: (id: number) =>
    api.patch(`/pantrystaples/${id}/toggle`),
  delete: (id: number) =>
    api.delete(`/pantrystaples/${id}`),
};
