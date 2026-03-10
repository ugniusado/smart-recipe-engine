export interface FoodItem {
  id: number;
  name: string;
  category: string;
  categoryId: number;
  quantity: number;
  unit: string;
  unitId: number;
  purchaseDate: string;
  expiryDate: string;
  cost: number;
  status: string;
  statusId: number;
  daysRemaining: number;
  urgency: 'expired' | 'urgent' | 'soon' | 'safe';
  notes?: string;
  createdAt: string;
}

export interface CreateFoodItemDto {
  name: string;
  categoryId: number;
  quantity: number;
  unitId: number;
  purchaseDate: string;
  expiryDate: string;
  cost: number;
  notes?: string;
}

export interface UpdateFoodItemDto extends CreateFoodItemDto {
  id: number;
}

export interface DashboardSummary {
  totalActiveItems: number;
  expiredCount: number;
  urgentCount: number;
  safeCount: number;
  atRiskValue: number;
  expiredValue: number;
  daysWithoutWaste: number;
  weeklySavings: number;
}

export interface MonthlyReport {
  year: number;
  month: number;
  monthName: string;
  totalConsumed: number;
  totalWasted: number;
  totalSaved: number;
}

export interface WasteFrequency {
  itemName: string;
  timesWasted: number;
  timesPurchased: number;
  wastePercentage: number;
  totalValueWasted: number;
}

export interface SavingsMilestone {
  daysWithoutWaste: number;
  amountSaved: number;
  hasMilestone: boolean;
  milestoneMessage?: string;
}

export interface RecipeSearch {
  urgentIngredients: string[];
  pantryStaples: string[];
  searchUrl: string;
  searchQuery: string;
}

export interface PantryStaple {
  id: number;
  name: string;
  isEnabled: boolean;
}

export interface ItemSuggestion {
  name: string;
  suggestedCost: number;
  suggestedExpiryDays: number;
  suggestedUnitId: number;
  suggestedUnit: string;
}

export const CATEGORIES = [
  { id: 1, name: 'Produce' },
  { id: 2, name: 'Dairy' },
  { id: 3, name: 'Meat' },
  { id: 4, name: 'Freezer' },
  { id: 5, name: 'Pantry' },
  { id: 6, name: 'Beverages' },
  { id: 7, name: 'Other' },
];

export const UNITS = [
  { id: 1, name: 'Piece' },
  { id: 2, name: 'Kilogram' },
  { id: 3, name: 'Gram' },
  { id: 4, name: 'Liter' },
  { id: 5, name: 'Milliliter' },
  { id: 6, name: 'Pack' },
  { id: 7, name: 'Dozen' },
  { id: 8, name: 'Pound' },
  { id: 9, name: 'Ounce' },
  { id: 10, name: 'Cup' },
];

export const STATUS = {
  Active: 1,
  Consumed: 2,
  Wasted: 3,
};

// Smart defaults per category
export const CATEGORY_DEFAULTS: Record<number, { expiryDays: number; unitId: number }> = {
  1: { expiryDays: 5, unitId: 1 },   // Produce
  2: { expiryDays: 7, unitId: 4 },   // Dairy
  3: { expiryDays: 3, unitId: 2 },   // Meat
  4: { expiryDays: 90, unitId: 2 },  // Freezer
  5: { expiryDays: 365, unitId: 6 }, // Pantry
  6: { expiryDays: 14, unitId: 4 },  // Beverages
  7: { expiryDays: 7, unitId: 1 },   // Other
};
