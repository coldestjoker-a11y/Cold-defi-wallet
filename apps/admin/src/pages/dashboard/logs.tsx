import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import AdminLayout from '../../components/AdminLayout';
import { adminFetch } from '../../lib/adminApiClient';
import type { AdminLog } from '@enterprise/shared';

export default function SecurityLogsPage() {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [total, setTotal] = useState(0);
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (levelFilter !== 'ALL') queryParams.set('level', levelFilter);
      if (categoryFilter !== 'ALL') queryParams.set('category', categoryFilter);
      queryParams.set('limit', '100');

      const res = await adminFetch<{ total: number; logs: AdminLog[] }>(
        `/api/admin/logs?${queryParams.toString()}`
      );
      setLogs(res.logs || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error('Error fetching admin logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [levelFilter, categoryFilter]);

  const getLevelBadgeClass = (level: string) => {
    switch (level.toUpperCase()) {
      case 'CRITICAL':
      case 'ERROR':
        return 'failed';
      case 'WARN':
        return 'pending';
      default:
        return 'info';
    }
  };

  return (
    <AdminLayout
      pageTitle="System Audit & RPC Node Logs"
      actionButton={
        <button
          onClick={fetchLogs}
          className="filter-input"
          style={{ cursor: 'pointer', background: '#1e293b', color: '#fff', border: '1px solid #334155' }}
        >
          🔄 REFRESH AUDIT STREAM
        </button>
      }
    >
      <Head>
        <title>Audit Logs — Enterprise Admin</title>
      </Head>

      <div className="table-card">
        <div className="table-header-bar">
          <div className="filter-bar">
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="filter-select"
            >
              <option value="ALL">Severity: All Levels</option>
              <option value="INFO">INFO</option>
              <option value="WARN">WARN</option>
              <option value="ERROR">ERROR</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="filter-select"
            >
              <option value="ALL">Category: All Categories</option>
              <option value="AUTH">AUTH & SESSIONS</option>
              <option value="SECURITY">SECURITY GATEWAY</option>
              <option value="RPC">BLOCKCHAIN RPC</option>
              <option value="TX">LEDGER TRANSACTIONS</option>
              <option value="SYSTEM">CORE SYSTEM</option>
            </select>
          </div>

          <span style={{ fontSize: 12, color: '#94a3b8' }}>
            Logged Events: <strong style={{ color: '#fff' }}>{total}</strong>
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Level</th>
                <th>Category</th>
                <th>Message</th>
                <th>Actor / Admin</th>
                <th>IP Address</th>
                <th>Metadata</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#64748b' }}>
                    {loading ? 'Retrieving audit events...' : 'No logs recorded for active filter.'}
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td className="mono" style={{ fontSize: 11, color: '#94a3b8' }}>
                      {new Date(log.timestamp * 1000).toLocaleString()}
                    </td>
                    <td>
                      <span className={`status-badge ${getLevelBadgeClass(log.level)}`}>
                        {log.level}
                      </span>
                    </td>
                    <td>
                      <span className="mono" style={{ fontSize: 11, color: '#cbd5e1' }}>
                        [{log.category}]
                      </span>
                    </td>
                    <td style={{ color: '#f1f5f9', fontWeight: 500 }}>
                      {log.message}
                    </td>
                    <td className="mono" style={{ fontSize: 11, color: '#60a5fa' }}>
                      {log.adminId || 'system'}
                    </td>
                    <td className="mono" style={{ fontSize: 11, color: '#94a3b8' }}>
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                    <td className="mono" style={{ fontSize: 10, color: '#64748b' }}>
                      {log.details && Object.keys(log.details).length > 0
                        ? JSON.stringify(log.details)
                        : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
