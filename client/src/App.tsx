import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { LayoutDashboard, Package, BarChart2, ChefHat, Flame } from 'lucide-react';
import { reportsApi } from './api/reports';
import { formatCurrencyCompact } from './utils/format';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';
import Recipes from './pages/Recipes';
import './App.css';

function WelcomeToast() {
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    reportsApi.getDashboard().then(s => {
      const urgent = s.urgentCount + s.expiredCount;
      if (urgent > 0) {
        const atRisk = formatCurrencyCompact(s.atRiskValue);
        setMsg(
          `Welcome back! ${urgent} item${urgent > 1 ? 's' : ''} need attention.` +
          (s.atRiskValue > 0 ? ` Cook now to save ${atRisk}.` : '')
        );
        setTimeout(() => setMsg(null), 5000);
      }
    }).catch(() => {});
  }, []);

  if (!msg) return null;
  return (
    <div className="welcome-toast">
      <Flame size={16} className="welcome-toast-icon" style={{ color: '#f97316', flexShrink: 0 }} />
      {msg}
    </div>
  );
}

function Nav() {
  const links = [
    { to: '/', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { to: '/inventory', label: 'Inventory', icon: <Package size={18} /> },
    { to: '/reports', label: 'Reports', icon: <BarChart2 size={18} /> },
    { to: '/recipes', label: 'Recipes', icon: <ChefHat size={18} /> },
  ];
  return (
    <nav className="sidebar">
      <div className="sidebar-brand">
        <ChefHat size={24} />
        <span>Smart Fridge</span>
      </div>
      <ul className="nav-list">
        {links.map(l => (
          <li key={l.to}>
            <NavLink
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {l.icon}
              <span>{l.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <WelcomeToast />
      <div className="app-layout">
        <Nav />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/recipes" element={<Recipes />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
