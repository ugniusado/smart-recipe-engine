import { useEffect, useRef, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { reportsApi } from '../api/reports';
import type { MonthlyReport, WasteFrequency, SavingsMilestone } from '../types';
import { Trophy, BarChart2 } from 'lucide-react';
import { formatCurrency, formatCurrencyCompact } from '../utils/format';

export default function Reports() {
  const [monthly, setMonthly]       = useState<MonthlyReport[]>([]);
  const [frequency, setFrequency]   = useState<WasteFrequency[]>([]);
  const [milestone, setMilestone]   = useState<SavingsMilestone | null>(null);
  const [loading, setLoading]       = useState(true);
  const [period, setPeriod]         = useState<6 | 12>(6);
  const firstRender                 = useRef(true);

  // Initial full load
  useEffect(() => {
    Promise.all([
      reportsApi.getMonthly(period),
      reportsApi.getWasteFrequency(),
      reportsApi.getMilestones(),
    ]).then(([m, f, ms]) => {
      setMonthly(m);
      setFrequency(f);
      setMilestone(ms);
    }).finally(() => setLoading(false));
  }, []);

  // Reload only monthly when period changes (skip first render)
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    reportsApi.getMonthly(period).then(m => setMonthly(m));
  }, [period]);

  if (loading) return <div className="loading">Loading reports...</div>;

  const maxMonthly = Math.max(...monthly.map(m => Math.max(m.totalConsumed, m.totalWasted)), 1);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Waste Accountant</h1>
      </div>

      {milestone?.hasMilestone && (
        <div className="milestone-banner">
          <Trophy size={22} />
          <span>{milestone.milestoneMessage}</span>
        </div>
      )}

      {!milestone?.hasMilestone && milestone && (
        <div className="milestone-info">
          <div className="milestone-stat">
            <div className="milestone-val">{milestone.daysWithoutWaste}</div>
            <div className="milestone-label">Days Without Waste</div>
          </div>
          <div className="milestone-divider" />
          <div className="milestone-stat">
            <div className="milestone-val">{formatCurrencyCompact(milestone.amountSaved)}</div>
            <div className="milestone-label">Saved This Week</div>
          </div>
        </div>
      )}

      <div className="section">
        <div className="section-header">
          <h2>Money Saved vs. Wasted</h2>
          <div className="period-toggle">
            <button
              className={`btn-period${period === 6 ? ' active' : ''}`}
              onClick={() => setPeriod(6)}
            >6 Months</button>
            <button
              className={`btn-period${period === 12 ? ' active' : ''}`}
              onClick={() => setPeriod(12)}
            >1 Year</button>
          </div>
        </div>

        {monthly.every(m => m.totalConsumed === 0 && m.totalWasted === 0) ? (
          <div className="empty-state">
            <BarChart2 size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.3, display: 'block' }} />
            <strong>No data yet.</strong>
            <p>Mark items as Consumed or Tossed to start tracking savings.</p>
          </div>
        ) : (
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthly} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="monthName" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis
                  domain={[0, Math.ceil(maxMonthly * 1.25)]}
                  tickFormatter={v => `$${v}`}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  width={60}
                />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                  labelStyle={{ color: '#cbd5e1' }}
                  formatter={(v) => typeof v === 'number' ? formatCurrency(v) : v}
                />
                <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 13 }} />
                <Bar dataKey="totalConsumed" name="Saved (Consumed)" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="totalWasted"   name="Wasted"            fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="section">
        <h2>Wall of Shame — Most Wasted Items</h2>
        {frequency.length === 0 ? (
          <div className="empty-state">
            <Trophy size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.3, display: 'block' }} />
            <strong>No waste data yet.</strong>
            <p>Keep up the good work — your conscience is clean!</p>
          </div>
        ) : (
          <div className="shame-list">
            {frequency.slice(0, 10).map((item, idx) => (
              <div key={item.itemName} className="shame-item">
                <div className="shame-rank">#{idx + 1}</div>
                <div className="shame-details">
                  <div className="shame-name">{item.itemName}</div>
                  <div className="shame-stats">
                    Wasted {item.timesWasted}× of {item.timesPurchased} purchases
                  </div>
                </div>
                <div className="shame-cost-badge">
                  {formatCurrency(item.totalValueWasted)} lost
                </div>
                <div className="shame-pct-col">
                  <div className="shame-bar-track">
                    <div className="shame-bar" style={{ width: `${item.wastePercentage}%` }} />
                  </div>
                  <span className="shame-pct-label">{item.wastePercentage.toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="section">
        <h2>Monthly Breakdown</h2>
        {monthly.every(m => m.totalConsumed === 0 && m.totalWasted === 0) ? (
          <div className="empty-state">No transaction data yet.</div>
        ) : (
          <table className="food-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Consumed ($)</th>
                <th>Wasted ($)</th>
                <th>Net ($)</th>
              </tr>
            </thead>
            <tbody>
              {monthly.map(m => {
                const net = m.totalConsumed - m.totalWasted;
                return (
                  <tr key={`${m.year}-${m.month}`}>
                    <td>{m.monthName} {m.year}</td>
                    <td className="text-green">{formatCurrency(m.totalConsumed)}</td>
                    <td className="text-red">{formatCurrency(m.totalWasted)}</td>
                    <td className={`net-cell ${net >= 0 ? 'text-green' : 'text-red'}`}>
                      {net >= 0 ? '+' : ''}{formatCurrency(net)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
