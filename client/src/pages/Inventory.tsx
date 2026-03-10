import { useEffect, useRef, useState, useCallback } from 'react';
import { Plus, Trash2, Search, Utensils, CircleX, ShoppingBag, Recycle, Flame } from 'lucide-react';
import { foodItemsApi } from '../api/foodItems';
import type { FoodItem, CreateFoodItemDto, UpdateFoodItemDto } from '../types';
import FoodItemForm from '../components/FoodItemForm';
import { formatCurrency, URGENCY_COLOR, URGENCY_LABEL } from '../utils/format';

/* ── Quick-add presets ── */
const QUICK_PRESETS = [
  { label: '🥛 Milk',    categoryId: 2, unitId: 4, expiryDays: 7,  cost: 3.49 },
  { label: '🥚 Eggs',    categoryId: 2, unitId: 1, expiryDays: 21, cost: 4.99 },
  { label: '🍗 Chicken', categoryId: 3, unitId: 2, expiryDays: 3,  cost: 8.99 },
  { label: '🍞 Bread',   categoryId: 5, unitId: 6, expiryDays: 7,  cost: 2.99 },
  { label: '🍌 Banana',  categoryId: 1, unitId: 1, expiryDays: 5,  cost: 1.49 },
  { label: '🍅 Tomato',  categoryId: 1, unitId: 1, expiryDays: 6,  cost: 2.29 },
];

/* ── Undo Toast ── */
interface ToastState { msg: string; type: 'success' | 'warn'; onUndo?: () => void; }
function Toast({ toast }: { toast: ToastState | null }) {
  if (!toast) return null;
  return (
    <div className={`toast toast-${toast.type}`}>
      {toast.type === 'success' ? <Utensils size={13} /> : <CircleX size={13} />}
      <span>{toast.msg}</span>
      {toast.onUndo && (
        <button className="toast-undo-btn" onClick={toast.onUndo}>Undo</button>
      )}
    </div>
  );
}

export default function Inventory() {
  const [items, setItems]             = useState<FoodItem[]>([]);
  const [showAll, setShowAll]         = useState(false);
  const [search, setSearch]           = useState('');
  const [selected, setSelected]       = useState<FoodItem | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading]         = useState(true);
  const [toast, setToast]             = useState<ToastState | null>(null);
  const toastTimer                    = useRef<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await foodItemsApi.getAll(!showAll);
      setItems(data);
    } finally {
      setLoading(false);
    }
  }, [showAll]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (selected) {
      const fresh = items.find(i => i.id === selected.id);
      setSelected(fresh ?? null);
    }
  }, [items]);

  const showToastMsg = (msg: string, type: ToastState['type'], onUndo?: () => void) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({
      msg, type,
      onUndo: onUndo ? () => {
        if (toastTimer.current) clearTimeout(toastTimer.current);
        setToast(null);
        onUndo();
      } : undefined,
    });
    toastTimer.current = window.setTimeout(() => setToast(null), 3000);
  };

  const handleCreate = async (dto: CreateFoodItemDto) => {
    await foodItemsApi.create(dto);
    load();
  };

  const handleUpdate = async (dto: UpdateFoodItemDto) => {
    await foodItemsApi.update(dto);
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Permanently delete this item from inventory?')) return;
    await foodItemsApi.delete(id);
    if (selected?.id === id) setSelected(null);
    load();
  };

  const handleStatus = async (id: number, statusId: number) => {
    const item = items.find(i => i.id === id);
    const name = item?.name ?? 'Item';
    const cost = item?.cost ?? 0;
    const isExpired = item?.urgency === 'expired';
    await foodItemsApi.changeStatus(id, statusId);
    if (selected?.id === id) setSelected(null);
    const msg = statusId === 2
      ? `Great job! "${name}" consumed — ${formatCurrency(cost)} saved.`
      : isExpired
        ? `"${name}" composted — ${formatCurrency(cost)} lost to expiry.`
        : `"${name}" wasted — ${formatCurrency(cost)} lost.`;
    showToastMsg(msg, statusId === 2 ? 'success' : 'warn',
      async () => { await foodItemsApi.changeStatus(id, 1); load(); }
    );
    load();
  };

  const handleQuickAdd = async (preset: typeof QUICK_PRESETS[0]) => {
    const today = new Date();
    const expiry = new Date();
    expiry.setDate(today.getDate() + preset.expiryDays);
    const name = preset.label.replace(/^.{2}\s/, '');
    await foodItemsApi.create({
      name,
      categoryId: preset.categoryId,
      quantity: 1,
      unitId: preset.unitId,
      purchaseDate: today.toISOString().split('T')[0],
      expiryDate: expiry.toISOString().split('T')[0],
      cost: preset.cost,
    });
    showToastMsg(`${name} added with defaults.`, 'success');
    load();
  };

  const filtered = items
    .filter(i =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.category.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => a.daysRemaining - b.daysRemaining);

  // Top 3 urgent/expired active items for the empty pane
  const cookToday = items
    .filter(i => i.statusId === 1 && (i.urgency === 'urgent' || i.urgency === 'expired'))
    .sort((a, b) => a.daysRemaining - b.daysRemaining)
    .slice(0, 3);

  return (
    <div className="page inventory-page">
      <Toast toast={toast} />

      <div className="page-header" style={{ flexShrink: 0 }}>
        <h1>Inventory</h1>
        <div className="header-actions">
          <label className="toggle-label">
            <input type="checkbox" checked={showAll} onChange={e => setShowAll(e.target.checked)} />
            Show consumed/wasted
          </label>
          <button
            className="btn-primary"
            onClick={() => { setSelected(null); setShowAddForm(v => !v); }}
          >
            <Plus size={15} /> {showAddForm ? 'Cancel Add' : 'Add Item'}
          </button>
        </div>
      </div>

      {showAddForm && (
        <div style={{ flexShrink: 0 }}>
          <FoodItemForm
            onSubmit={handleCreate}
            onCancel={() => setShowAddForm(false)}
            bulkMode
          />
        </div>
      )}

      <div className="master-detail">
        {/* LEFT — list pane */}
        <div className="list-pane">
          <div className="quick-add-row">
            <span className="quick-add-label">Quick add:</span>
            {QUICK_PRESETS.map(p => (
              <button
                key={p.label}
                className="btn-preset"
                onClick={() => handleQuickAdd(p)}
                title={`Add ${p.label.replace(/^.{2}\s/, '')} with defaults`}
              >{p.label}</button>
            ))}
          </div>

          <div className="search-bar">
            <Search size={14} />
            <input
              type="text"
              placeholder="Search name or category…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="loading">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state" style={{ margin: 0 }}>
              <strong>No items found.</strong>
              <p>Add groceries with the button above.</p>
            </div>
          ) : (
            <ul className="item-list">
              {filtered.map(item => (
                <li
                  key={item.id}
                  className={`item-row ${selected?.id === item.id ? 'item-row-selected' : ''}`}
                  onClick={() => { setSelected(item); setShowAddForm(false); }}
                >
                  <div className={`urgency-stripe-v ${URGENCY_COLOR[item.urgency]}`} />
                  <div className="item-row-body">
                    <div className="item-row-top">
                      <span className="item-row-name">{item.name}</span>
                      <span className={`badge badge-${item.urgency}`}>
                        {item.daysRemaining < 0
                          ? `${Math.abs(item.daysRemaining)}d ago`
                          : `${item.daysRemaining}d`}
                      </span>
                    </div>
                    <div className="item-row-meta">
                      <span>{item.category}</span>
                      <span>{item.quantity} {item.unit}</span>
                      <span>{formatCurrency(item.cost)}</span>
                      {item.status !== 'Active' && <span className="status-tag">{item.status}</span>}
                    </div>
                  </div>
                  {item.statusId === 1 && (
                    <div className="item-row-actions">
                      {item.urgency === 'expired' ? (
                        <button
                          className="btn-action btn-compost"
                          onClick={e => { e.stopPropagation(); handleStatus(item.id, 3); }}
                          title="Compost — it's expired"
                        ><Recycle size={12} /></button>
                      ) : (
                        <button
                          className="btn-action btn-eat"
                          onClick={e => { e.stopPropagation(); handleStatus(item.id, 2); }}
                          title="Consumed — I ate this"
                        ><Utensils size={12} /></button>
                      )}
                      <button
                        className="btn-action btn-toss"
                        onClick={e => { e.stopPropagation(); handleStatus(item.id, 3); }}
                        title="Wasted — it rotted"
                      ><CircleX size={12} /></button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* RIGHT — detail pane */}
        <div className="detail-pane">
          {!selected && !showAddForm ? (
            <div className="detail-placeholder">
              <ShoppingBag size={44} style={{ opacity: 0.12, margin: '0 auto 1.1rem', display: 'block' }} />
              <p style={{ fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                No item selected
              </p>
              <p>Choose a food item from the list to manage it,<br />or click <strong>Add Item</strong> to stock your fridge.</p>

              {cookToday.length > 0 && (
                <div className="cook-today-section">
                  <div className="cook-today-title">
                    <Flame size={12} color="#f97316" /> Cook These Today
                  </div>
                  <div className="cook-today-list">
                    {cookToday.map(item => (
                      <button
                        key={item.id}
                        className="cook-today-item"
                        onClick={() => setSelected(item)}
                      >
                        <div className={`urgency-stripe-v ${URGENCY_COLOR[item.urgency]}`}
                          style={{ height: 32, alignSelf: 'auto' }} />
                        <div style={{ flex: 1, textAlign: 'left' }}>
                          <div className="cook-today-name">{item.name}</div>
                          <div className="cook-today-meta">{formatCurrency(item.cost)} · {URGENCY_LABEL[item.urgency]}</div>
                        </div>
                        <span className={`badge badge-${item.urgency}`}>
                          {item.daysRemaining < 0
                            ? `${Math.abs(item.daysRemaining)}d ago`
                            : `${item.daysRemaining}d`}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : selected ? (
            <div className="detail-content">
              <div className="detail-header">
                <div>
                  <h2 className="detail-name">{selected.name}</h2>
                  <span className={`badge badge-${selected.urgency}`}>
                    {URGENCY_LABEL[selected.urgency]}
                    {' — '}
                    {selected.daysRemaining < 0
                      ? `expired ${Math.abs(selected.daysRemaining)}d ago`
                      : `${selected.daysRemaining} days left`}
                  </span>
                </div>
              </div>

              {selected.statusId === 1 && (
                <div className="detail-quick-actions">
                  {selected.urgency === 'expired' ? (
                    <button className="btn-detail-compost" onClick={() => handleStatus(selected.id, 3)}>
                      <Recycle size={14} /> Compost — it's expired
                    </button>
                  ) : (
                    <button className="btn-detail-eat" onClick={() => handleStatus(selected.id, 2)}>
                      <Utensils size={14} /> Consumed — I ate this
                    </button>
                  )}
                  <button className="btn-detail-toss" onClick={() => handleStatus(selected.id, 3)}>
                    <CircleX size={14} /> Wasted — it rotted
                  </button>
                  <button className="btn-detail-delete" onClick={() => handleDelete(selected.id)}>
                    <Trash2 size={14} /> Delete from inventory
                  </button>
                </div>
              )}
              {selected.statusId !== 1 && (
                <div className="detail-quick-actions">
                  <button className="btn-detail-delete" onClick={() => handleDelete(selected.id)}>
                    <Trash2 size={14} /> Remove record
                  </button>
                </div>
              )}

              <div style={{ marginTop: '1rem' }}>
                <FoodItemForm
                  key={selected.id}
                  initial={selected}
                  onSubmit={(dto) => handleUpdate({ ...dto, id: selected.id })}
                  onCancel={() => setSelected(null)}
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
