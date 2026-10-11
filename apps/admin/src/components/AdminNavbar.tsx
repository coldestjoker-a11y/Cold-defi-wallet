import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getAdminUser, clearAdminSession, adminFetch } from '../lib/adminApiClient';

export const AdminNavbar: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<number>(900); // 15 mins

  useEffect(() => {
    setUser(getAdminUser());
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
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

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
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
        <div className="session-timer-pill" title="15-minute JWT session expiry count">
          <span className="dot pulse"></span>
          <span>SESSION:</span>
          <strong>{formatTime(timeLeft)}</strong>
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
