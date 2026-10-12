import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getAdminUser, clearAdminSession, adminFetch } from '../lib/adminApiClient';

export const AdminNavbar: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(getAdminUser());
  }, []);

  const handleLogout = async () => {
    try {
      await adminFetch('/api/admin/auth/logout', { method: 'POST' });
    } catch (e) {
      // Ignore network error on logout
    }
    clearAdminSession();
    router.replace('/login');
  };

  return (
    <header className="admin-navbar">
      <div className="navbar-left">
        <div className="navbar-brand">
          <div className="brand-badge">SECURE</div>
          <span className="brand-name">ENTERPRISE ADMIN GATEWAY</span>
          <span className="brand-version">v2.0.0</span>
        </div>
      </div>

      <div className="navbar-right">
        <div className="session-timer-pill" title="Static Session (No Timeout)">
          <span className="dot pulse" style={{ backgroundColor: '#10b981' }}></span>
          <span>SESSION:</span>
          <strong style={{ color: '#10b981' }}>STATIC (ACTIVE)</strong>
        </div>

        <div className="twofa-status-pill">
          <span className="shield-icon">🛡️</span>
          <span>2FA VERIFIED</span>
        </div>

        <div className="admin-profile-pill">
          <div className="avatar-letter">A</div>
          <div className="profile-info">
            <span className="admin-name">{user?.username || 'SuperAdmin'}</span>
            <span className="admin-role">ROLE: ADMIN</span>
          </div>
        </div>

        <button onClick={handleLogout} className="logout-btn" title="Terminate Session">
          LOGOUT
        </button>
      </div>
    </header>
  );
};

export default AdminNavbar;
