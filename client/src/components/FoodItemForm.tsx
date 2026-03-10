import { useEffect, useRef, useState } from 'react';
import { priceHistoryApi } from '../api/priceHistory';
import type { FoodItem, CreateFoodItemDto } from '../types';
import { CATEGORIES, UNITS, CATEGORY_DEFAULTS } from '../types';

interface Props {
  initial?: FoodItem;
  onSubmit: (dto: CreateFoodItemDto) => Promise<void>;
  onCancel: () => void;
  bulkMode?: boolean;
}

function today() {
  return new Date().toISOString().split('T')[0];
}

function addDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

const defaultForm = (): CreateFoodItemDto => ({
  name: '',
  categoryId: 1,
  quantity: 1,
  unitId: 1,
  purchaseDate: today(),
  expiryDate: addDays(CATEGORY_DEFAULTS[1].expiryDays),
  cost: 0,
  notes: '',
});

export default function FoodItemForm({ initial, onSubmit, onCancel, bulkMode }: Props) {
  const nameRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<CreateFoodItemDto>(
    initial
      ? {
          name: initial.name,
          categoryId: initial.categoryId,
          quantity: initial.quantity,
          unitId: initial.unitId,
          purchaseDate: initial.purchaseDate.split('T')[0],
          expiryDate: initial.expiryDate.split('T')[0],
          cost: initial.cost,
          notes: initial.notes ?? '',
        }
      : defaultForm()
  );
  const [submitting, setSubmitting] = useState(false);
  const [suggestionApplied, setSuggestionApplied] = useState(false);

  // Auto-focus name on mount
  useEffect(() => { nameRef.current?.focus(); }, []);

  // Price memory debounced lookup
  useEffect(() => {
    if (!form.name || initial || suggestionApplied) return;
    const timer = setTimeout(async () => {
      const suggestion = await priceHistoryApi.getSuggestion(form.name);
      if (suggestion) {
        setForm(f => ({
          ...f,
          cost: suggestion.suggestedCost,
          unitId: suggestion.suggestedUnitId,
          expiryDate: addDays(suggestion.suggestedExpiryDays),
        }));
        setSuggestionApplied(true);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [form.name]);

  useEffect(() => { if (!form.name) setSuggestionApplied(false); }, [form.name]);

  const handleCategoryChange = (catId: number) => {
    const defaults = CATEGORY_DEFAULTS[catId];
    setForm(f => ({
      ...f,
      categoryId: catId,
      unitId: defaults?.unitId ?? f.unitId,
      expiryDate: addDays(defaults?.expiryDays ?? 7),
    }));
    setSuggestionApplied(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(form);
      if (bulkMode) {
        setForm(defaultForm());
        setSuggestionApplied(false);
        setTimeout(() => nameRef.current?.focus(), 50);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="form-panel">
      <div className="form-panel-header">
        <h3>{initial ? 'Edit Item' : 'Add Food Item'}</h3>
        {bulkMode && <span className="bulk-badge">Bulk Mode — stays open</span>}
        {!initial && suggestionApplied && (
          <span className="suggestion-badge">💡 Price from history</span>
        )}
      </div>
      <form onSubmit={handleSubmit} className="food-form">
        {/* Row 1: Name + Category */}
        <div className="form-row">
          <div className="form-group form-group-lg">
            <label>Name *</label>
            <input
              ref={nameRef}
              type="text"
              required
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Chicken Breast"
              autoComplete="off"
            />
          </div>
          <div className="form-group">
            <label>Category *</label>
            <select value={form.categoryId} onChange={e => handleCategoryChange(Number(e.target.value))}>
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        {/* Row 2: Qty + Unit + Cost + Dates (compact single row) */}
        <div className="form-row">
          <div className="form-group form-group-sm">
            <label>Qty *</label>
            <input
              type="number" min="0.01" step="0.01" required
              value={form.quantity}
              onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) }))}
            />
          </div>
          <div className="form-group form-group-sm">
            <label>Unit *</label>
            <select value={form.unitId} onChange={e => setForm(f => ({ ...f, unitId: Number(e.target.value) }))}>
              {UNITS.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <div className="form-group form-group-sm">
            <label>Cost ($) *</label>
            <input
              type="number" min="0" step="0.01" required
              value={form.cost}
              onChange={e => setForm(f => ({ ...f, cost: Number(e.target.value) }))}
            />
          </div>
          <div className="form-group form-group-sm">
            <label>Purchased</label>
            <input
              type="date" required value={form.purchaseDate}
              onChange={e => setForm(f => ({ ...f, purchaseDate: e.target.value }))}
            />
          </div>
          <div className="form-group form-group-sm">
            <label>Expires *</label>
            <input
              type="date" required value={form.expiryDate}
              onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))}
            />
          </div>
        </div>

        {/* Row 3: Notes */}
        <div className="form-group">
          <label>Notes</label>
          <input
            type="text" value={form.notes ?? ''}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            placeholder="Optional notes"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Saving...' : initial ? 'Save Changes' : 'Add Item'}
          </button>
          <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
