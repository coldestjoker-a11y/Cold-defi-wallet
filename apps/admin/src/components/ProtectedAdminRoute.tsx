import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getAdminToken, getAdminUser, clearAdminSession } from '../lib/adminApiClient';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

export const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ children }) => {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = getAdminToken();
    const user = getAdminUser();

    if (!token) {
      clearAdminSession();
      router.replace(`/login?redirect=${encodeURIComponent(router.asPath)}`);
      return;
    }

    try {
      // Decode JWT payload to check role (static session, no expiration timer)
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));

        if (payload.role !== 'admin' && user?.role !== 'admin') {
          clearAdminSession();
          router.replace('/login?error=unauthorized_role');
          return;
        }
      }
      setAuthorized(true);
    } catch (e) {
      clearAdminSession();
      router.replace('/login?error=invalid_token');
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading || !authorized) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#0a0d14',
        color: '#94a3b8',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(59, 130, 246, 0.2)',
          borderTopColor: '#3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <p style={{ marginTop: '16px', fontSize: '13px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#64748b' }}>
          Verifying Institutional Admin Credentials...
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedAdminRoute;
