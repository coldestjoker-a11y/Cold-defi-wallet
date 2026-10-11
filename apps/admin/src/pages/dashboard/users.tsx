import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import AdminLayout from '../../components/AdminLayout';
import { adminFetch } from '../../lib/adminApiClient';
import type { AdminUserWallet } from '@enterprise/shared';

export default function UsersLedgerPage() {
  const [users, setUsers] = useState<AdminUserWallet[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<AdminUserWallet | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (search.trim()) queryParams.set('search', search.trim());
      queryParams.set('limit', '50');

      const res = await adminFetch<{ total: number; users: AdminUserWallet[] }>(
        `/api/admin/users?${queryParams.toString()}`
      );
      setUsers(res.users || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error('Error fetching admin users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  return (
    <AdminLayout pageTitle="User Wallets & Connection Ledger">
      <Head>
        <title>User Wallets — Enterprise Admin</title>
      </Head>

      <div className="table-card">
        <div className="table-header-bar">
          <form onSubmit={handleSearchSubmit} className="filter-bar">
            <input
              type="text"
              placeholder="Search by 0x address or account index..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="filter-input"
              style={{ width: 340 }}
            />
            <button
              type="submit"
              className="filter-input"
              style={{ cursor: 'pointer', background: '#2563eb', color: '#fff', border: 'none', fontWeight: 600 }}
            >
              SEARCH
            </button>
          </form>

          <span style={{ fontSize: 12, color: '#94a3b8' }}>
            Total Registered Enclave Wallets: <strong style={{ color: '#fff' }}>{total}</strong>
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Wallet Address</th>
                <th>HD Index</th>
                <th>Portfolio Value</th>
                <th>Holdings Summary</th>
                <th>Total Txs</th>
                <th>State</th>
                <th>Last Active</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 32, color: '#64748b' }}>
                    {loading ? 'Retrieving user wallets...' : 'No wallets found matching search.'}
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.address}>
                    <td className="mono" style={{ color: '#60a5fa', fontWeight: 600 }}>
                      <span title={u.address}>{u.address}</span>
                    </td>
                    <td className="mono" style={{ color: '#94a3b8' }}>
                      m/44'/60'/0'/0/{u.accountIndex}
                    </td>
                    <td className="mono" style={{ fontWeight: 700, color: '#34d399' }}>
                      ${u.totalValueUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {Object.entries(u.holdings).map(([asset, balance]) => (
                          balance > 0 ? (
                            <span
                              key={asset}
                              className="mono"
                              style={{
                                fontSize: 11,
                                background: 'rgba(255, 255, 255, 0.05)',
                                padding: '2px 6px',
                                borderRadius: 4,
                                color: '#e2e8f0',
                              }}
                            >
                              {balance} {asset}
                            </span>
                          ) : null
                        ))}
                      </div>
                    </td>
                    <td className="mono" style={{ color: '#cbd5e1' }}>
                      {u.txCount}
                    </td>
                    <td>
                      <span className="status-badge confirmed">ACTIVE</span>
                    </td>
                    <td style={{ color: '#64748b', fontSize: 11 }}>
                      {new Date(u.lastSeenAt * 1000).toLocaleTimeString()}
                    </td>
                    <td>
                      <button
                        onClick={() => setSelectedWallet(u)}
                        className="filter-input"
                        style={{
                          cursor: 'pointer',
                          padding: '3px 8px',
                          fontSize: 11,
                          background: 'rgba(59, 130, 246, 0.1)',
                          borderColor: 'rgba(59, 130, 246, 0.3)',
                          color: '#60a5fa',
                        }}
                      >
                        INSPECT
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Modal */}
      {selectedWallet && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
        >
          <div
            style={{
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: 8,
              padding: 24,
              width: '90%',
              maxWidth: 520,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, color: '#fff' }}>Wallet Ledger Inspection</h3>
              <button
                onClick={() => setSelectedWallet(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 18 }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase' }}>Public Address</div>
              <div className="mono" style={{ color: '#60a5fa', fontSize: 12, wordBreak: 'break-all' }}>
                {selectedWallet.address}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', marginBottom: 8 }}>Asset Balances</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {Object.entries(selectedWallet.holdings).map(([asset, balance]) => (
                  <div
                    key={asset}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      padding: '8px 12px',
                      borderRadius: 4,
                      border: '1px solid #1e293b',
                    }}
                  >
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>{asset}:</span>
                    <strong className="mono" style={{ marginLeft: 6, color: '#f8fafc' }}>
                      {balance}
                    </strong>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setSelectedWallet(null)}
              className="login-btn"
              style={{ marginTop: 8 }}
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
