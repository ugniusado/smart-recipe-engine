import { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle, CheckCircle, XCircle, TrendingUp, Package,
  Utensils, CircleX, ShieldCheck, Recycle, AlertOctagon
} from 'lucide-react';
import { foodItemsApi } from '../api/foodItems';
import { reportsApi } from '../api/reports';
import type { FoodItem, DashboardSummary, CreateFoodItemDto } from '../types';
import { formatCurrencyCompact, formatCurrency, URGENCY_COLOR } from '../utils/format';
import FoodItemForm from '../components/FoodItemForm';

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

/* ── Compact KPI Card ── */
interface KpiProps {
  title: string; value: string | number; icon: React.ReactNode;
  accent: string; sub?: string; pulse?: boolean;
}
function KpiCard({ title, value, icon, accent, sub, pulse }: KpiProps) {
  return (
    <div className={`kpi-card kpi-${accent}${pulse ? ' kpi-pulse' : ''}`}>
      <div className="kpi-icon">{icon}</div>
      <div className="kpi-body">
        <div className="kpi-value">{value}</div>
        <div className="kpi-title">{title}</div>
        {sub && <div className="kpi-sub">{sub}</div>}
      </div>
    </div>
  );
}

/* ── Expiry Progress Bar — label floats right of track ── */
function ExpiryBar({ item }: { item: FoodItem }) {
  const purchase = new Date(item.purchaseDate).getTime();
  const expiry   = new Date(item.expiryDate).getTime();
  const now      = Date.now();
  const total    = expiry - purchase;
  const pct      = total > 0 ? Math.min(100, Math.max(0, ((now - purchase) / total) * 100)) : 100;
  const label    = item.daysRemaining < 0
    ? `${Math.abs(item.daysRemaining)}d ago`
    : `${item.daysRemaining}d left`;

  return (
    <div className="expiry-bar-outer" title={label}>
      <div className="expiry-bar-track">
        <div className={`expiry-bar ${URGENCY_COLOR[item.urgency]}-bar`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`expiry-bar-badge badge badge-${item.urgency}`}>{label}</span>
    </div>
  );
}

/* ── Edit Modal ── */
function EditModal({ item, onSave, onClose }: {
  item: FoodItem;
  onSave: (dto: CreateFoodItemDto) => Promise<void>;
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <FoodItemForm initial={item} onSubmit={onSave} onCancel={onClose} />
      </div>
    </div>
  );
}

/* ── Dashboard ── */
export default function Dashboard() {
  const [items, setItems]       = useState<FoodItem[]>([]);
  const [summary, setSummary]   = useState<DashboardSummary | null>(null);
  const [loading, setLoading]   = useState(true);
  const [toast, setToast]       = useState<ToastState | null>(null);
  const [editItem, setEditItem] = useState<FoodItem | null>(null);
  const toastTimer              = useRef<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [itemsData, summaryData] = await Promise.all([
        foodItemsApi.getAll(true),
        reportsApi.getDashboard(),
      ]);
      setItems(itemsData);
      setSummary(summaryData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const showToast = (msg: string, type: ToastState['type'], onUndo?: () => void) => {
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

  const handleStatus = async (e: React.MouseEvent, id: number, statusId: number) => {
    e.stopPropagation();
    const item = items.find(i => i.id === id);
    const name = item?.name ?? 'Item';
    const cost = item?.cost ?? 0;
    const isExpired = item?.urgency === 'expired';
    await foodItemsApi.changeStatus(id, statusId);
    const msg = statusId === 2
      ? `Great job! "${name}" consumed — ${formatCurrency(cost)} saved.`
      : isExpired
        ? `"${name}" composted — ${formatCurrency(cost)} lost to expiry.`
        : `"${name}" wasted — ${formatCurrency(cost)} lost.`;
    showToast(msg, statusId === 2 ? 'success' : 'warn',
      async () => { await foodItemsApi.changeStatus(id, 1); load(); }
    );
    load();
  };

  const handleEdit = async (dto: CreateFoodItemDto) => {
    if (!editItem) return;
    await foodItemsApi.update({ ...dto, id: editItem.id });
    setEditItem(null);
    load();
  };

  const sorted = [...items].sort((a, b) => a.daysRemaining - b.daysRemaining);

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="page">
      <Toast toast={toast} />
      {editItem && (
        <EditModal item={editItem} onSave={handleEdit} onClose={() => setEditItem(null)} />
      )}

      <div className="page-header">
        <h1>Mission Control</h1>
        {summary && summary.atRiskValue > 0 && (
          <div className="at-risk-ticker">
            <AlertTriangle size={14} />
            <span>{formatCurrencyCompact(summary.atRiskValue)} at risk — cook now!</span>
          </div>
        )}
      </div>

      {summary && (
        <div className="kpi-grid">
          <KpiCard title="Active Items"   value={summary.totalActiveItems}  icon={<Package size={20}/>}      accent="blue" />
          <KpiCard title="Urgent (0-2d)"  value={summary.urgentCount}       icon={<AlertTriangle size={20}/>} accent="orange"
            sub={`${formatCurrencyCompact(summary.atRiskValue)} at risk`}
            pulse={summary.urgentCount > 0} />
          <KpiCard title="Expired"        value={summary.expiredCount}      icon={<XCircle size={20}/>}      accent="red"
            sub={`${formatCurrencyCompact(summary.expiredValue)} lost`} />
          <KpiCard title="No-Waste Days"  value={summary.daysWithoutWaste}  icon={<CheckCircle size={20}/>}  accent="green" />
          <KpiCard title="Weekly Savings" value={formatCurrencyCompact(summary.weeklySavings)} icon={<TrendingUp size={20}/>} accent="purple" />
          <KpiCard title="Safe Items"     value={summary.safeCount}         icon={<ShieldCheck size={20}/>}  accent="teal" />
        </div>
      )}

      <div className="section">
        <div className="section-header">
          <h2>Expiry Heatmap</h2>
          <div className="legend">
            <span className="legend-dot urg-safe-dot" />Safe (8d+)
            <span className="legend-dot urg-soon-dot" />Soon (3-7d)
            <span className="legend-dot urg-urgent-dot" />Urgent (0-2d)
            <span className="legend-dot urg-expired-dot" />Expired
          </div>
        </div>

        {sorted.length === 0 ? (
          <div className="empty-state">
            <Package size={32} style={{ margin: '0 auto 0.6rem', opacity: 0.25, display: 'block' }} />
            <strong>Fridge is empty.</strong>
            <p>Go to Inventory → Add Item to start tracking.</p>
          </div>
        ) : (
          <div className="food-table-wrapper">
            <table className="food-table">
              <thead>
                <tr>
                  <th style={{ width: 8 }} />
                  <th>Name</th>
                  <th>Category</th>
                  <th>Qty</th>
                  <th>Cost</th>
                  <th>Expires</th>
                  <th>Time Remaining</th>
                  <th>Quick Actions</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(item => (
                  <tr
                    key={item.id}
                    className={`row-${item.urgency} row-clickable`}
                    onDoubleClick={() => setEditItem(item)}
                    title="Double-click to edit"
                  >
                    <td className="urgency-stripe-cell">
                      <div className={`urgency-stripe ${URGENCY_COLOR[item.urgency]}`} />
                    </td>
                    <td className="item-name">
                      {item.urgency === 'expired' && (
                        <AlertOctagon size={12} color="#ef4444" style={{ marginRight: 4, verticalAlign: 'middle', flexShrink: 0 }} />
                      )}
                      {item.name}
                    </td>
                    <td><span className="cat-tag">{item.category}</span></td>
                    <td>{item.quantity} {item.unit}</td>
                    <td>{formatCurrency(item.cost)}</td>
                    <td className="date-cell">{new Date(item.expiryDate).toLocaleDateString()}</td>
                    <td style={{ minWidth: 160 }}><ExpiryBar item={item} /></td>
                    <td>
                      <div className="action-btns">
                        {item.urgency === 'expired' ? (
                          <button
                            className="btn-action btn-compost"
                            onClick={e => handleStatus(e, item.id, 3)}
                            title="Compost — it's expired"
                          ><Recycle size={13} /></button>
                        ) : (
                          <button
                            className="btn-action btn-eat"
                            onClick={e => handleStatus(e, item.id, 2)}
                            title="Consumed — I ate this"
                          ><Utensils size={13} /></button>
                        )}
                        <button
                          className="btn-action btn-toss"
                          onClick={e => handleStatus(e, item.id, 3)}
                          title="Wasted — it rotted"
                        ><CircleX size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="table-hint">Double-click any row to edit</div>
          </div>
        )}
      </div>
    </div>
  );
}
