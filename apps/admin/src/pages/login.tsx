import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { setAdminToken, clearAdminSession, adminFetch } from '../lib/adminApiClient';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Cold121.1');
  const [twoFactorCode, setTwoFactorCode] = useState('223311');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (router.query.expired) {
      setError('Admin session re-authentication required.');
    } else if (router.query.error === 'unauthorized_role') {
      setError('Access Denied: Account lacks required administrator privileges.');
    }
  }, [router.query]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await adminFetch<{
        status: string;
        access_token: string;
        refresh_token: string;
        user: any;
      }>('/api/admin/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username,
          password,
          two_factor_code: twoFactorCode,
        }),
      });

      if (res.access_token) {
        setAdminToken(res.access_token, res.refresh_token, res.user);
        const redirect = (router.query.redirect as string) || '/dashboard';
        router.push(redirect);
      } else {
        setError('Authentication failed. No token received.');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Head>
        <title>Admin Login — Enterprise DeFi Console</title>
      </Head>

      <div className="login-card">
        <div className="login-header">
          <div className="login-icon-badge">🛡️</div>
          <h1 className="login-title">Institutional Admin Portal</h1>
          <p className="login-sub">DeFi Operations, Treasury & Enclave Monitoring</p>
        </div>

        {error && <div className="alert-banner error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Admin Username</label>
            <input
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin"
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Master Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              required
              autoComplete="current-password"
            />
          </div>

          <div className="form-group">
            <label className="form-label">2FA Authenticator Token (TOTP)</label>
            <input
              type="text"
              className="form-input mono"
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value)}
              placeholder="6-digit code (e.g. 223311)"
              maxLength={6}
              required
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'AUTHENTICATING ZERO-TRUST GATEWAY...' : 'VERIFY & ENTER GATEWAY'}
          </button>
        </form>

        <div className="credentials-hint">
          <div style={{ fontWeight: 600, color: '#94a3b8', marginBottom: 4 }}>
            🔒 STATIC ADMIN CREDENTIALS (NO TIMER):
          </div>
          <div>User: <span className="mono" style={{ color: '#60a5fa' }}>admin</span></div>
          <div>Password: <span className="mono" style={{ color: '#60a5fa' }}>Cold121.1</span></div>
          <div>2FA TOTP: <span className="mono" style={{ color: '#34d399' }}>223311</span></div>
        </div>
      </div>
    </div>
  );
}
