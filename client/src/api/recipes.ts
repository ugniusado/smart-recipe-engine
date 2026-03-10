import api from './client';
import type { RecipeSearch } from '../types';

export const recipesApi = {
  getUrgentSearch: (includePantryStaples = true) =>
    api.get<RecipeSearch>(`/recipes/urgent-search?includePantryStaples=${includePantryStaples}`)
       .then(r => r.data),
};
