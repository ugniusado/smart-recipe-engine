import api from './client';
import type { ItemSuggestion } from '../types';

export const priceHistoryApi = {
  getSuggestion: (name: string) =>
    api.get<ItemSuggestion>(`/pricehistory/suggestion?name=${encodeURIComponent(name)}`)
       .then(r => r.data)
       .catch(() => null),
};
