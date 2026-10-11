import React from 'react';
import Link from 'next/router';
import { useRouter } from 'next/router';

interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Executive Overview', href: '/dashboard', icon: '📊' },
  { label: 'Transaction Monitor', href: '/dashboard/transactions', icon: '⚡', badge: 'LIVE' },
  { label: 'User Ledger & Wallets', href: '/dashboard/users', icon: '👥' },
  { label: 'Audit & RPC Logs', href: '/dashboard/logs', icon: '📜' },
  { label: 'Nodes & System Health', href: '/dashboard/health', icon: '🟢', badge: '7/7' },
  { label: 'Security & Settings', href: '/dashboard/settings', icon: '🔒' },
];

export const AdminSidebar: React.FC = () => {
  const router = useRouter();

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-section-title">NAVIGATION</div>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const isActive = router.pathname === item.href;
          return (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                router.push(item.href);
              }}
              className={`nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.label}</span>
              {item.badge && <span className={`nav-badge ${item.badge === 'LIVE' ? 'live' : ''}`}>{item.badge}</span>}
            </a>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="footer-status-box">
          <div className="status-indicator">
            <span className="status-dot"></span>
            <span className="status-label">ZERO-TRUST ENCLAVE</span>
          </div>
          <div className="status-detail">ISOLATED /APPS/ADMIN</div>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
