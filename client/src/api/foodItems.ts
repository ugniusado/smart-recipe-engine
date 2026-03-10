import api from './client';
import type { FoodItem, CreateFoodItemDto, UpdateFoodItemDto } from '../types';

export const foodItemsApi = {
  getAll: (activeOnly = true) =>
    api.get<FoodItem[]>(`/fooditems?activeOnly=${activeOnly}`).then(r => r.data),
  getById: (id: number) =>
    api.get<FoodItem>(`/fooditems/${id}`).then(r => r.data),
  getUrgent: () =>
    api.get<FoodItem[]>('/fooditems/urgent').then(r => r.data),
  create: (dto: CreateFoodItemDto) =>
    api.post<FoodItem>('/fooditems', dto).then(r => r.data),
  update: (dto: UpdateFoodItemDto) =>
    api.put<FoodItem>(`/fooditems/${dto.id}`, dto).then(r => r.data),
  delete: (id: number) =>
    api.delete(`/fooditems/${id}`),
  changeStatus: (id: number, statusId: number) =>
    api.patch<FoodItem>('/fooditems/status', { id, statusId }).then(r => r.data),
  autoCleanup: () =>
    api.post('/fooditems/auto-cleanup').then(r => r.data),
};
