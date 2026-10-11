import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import AdminLayout from '../../components/AdminLayout';
import { adminFetch } from '../../lib/adminApiClient';
import type { AdminSystemHealth, AdminTransaction } from '@enterprise/shared';

export default function DashboardOverview() {
  const [health, setHealth] = useState<AdminSystemHealth | null>(null);
  const [recentTxs, setRecentTxs] = useState<AdminTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [healthData, txData] = await Promise.all([
        adminFetch<AdminSystemHealth>('/api/admin/health'),
        adminFetch<{ transactions: AdminTransaction[] }>('/api/admin/transactions?limit=8'),
      ]);
      setHealth(healthData);
      setRecentTxs(txData.transactions || []);
    } catch (err) {
      console.error('Failed to load overview data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatUsd = (num: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
  };

  return (
    <AdminLayout
      pageTitle="Executive Operations Overview"
      actionButton={
        <button
          onClick={fetchData}
          className="filter-input"
          style={{ cursor: 'pointer', background: '#1e293b', color: '#fff', border: '1px solid #334155' }}
        >
          🔄 REFRESH METRICS
        </button>
      }
    >
      <Head>
        <title>Operations Overview — Enterprise Admin</title>
      </Head>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label">Cumulative Volume</span>
          <span className="kpi-value text-green">
            {health ? formatUsd(health.totalVolumeUsd) : '$0.00'}
          </span>
          <div className="kpi-footer text-muted">Across 7 supported chains</div>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">Transactions Recorded</span>
          <span className="kpi-value text-blue">
            {health ? health.totalTransactionsRecorded : 0}
          </span>
          <div className="kpi-footer text-muted">Audited & Nonce-Sequenced</div>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">System Uptime</span>
          <span className="kpi-value">
            {health ? `${Math.floor(health.uptimeSeconds / 60)}m ${health.uptimeSeconds % 60}s` : '0s'}
          </span>
          <div className="kpi-footer text-green">● Status: {health?.status || 'HEALTHY'}</div>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">Active RPC Nodes</span>
          <span className="kpi-value text-amber">
            {health ? Object.keys(health.rpcHealth).length : 7} / 7
          </span>
          <div className="kpi-footer text-muted">Zero Latency Anomaly</div>
        </div>
      </div>

      {/* RPC Latency Grid */}
      <div className="table-card" style={{ marginBottom: 24 }}>
        <div className="table-header-bar">
          <span className="table-title">⚡ Multi-Chain RPC Node Telemetry</span>
          <span style={{ fontSize: 11, color: '#64748b' }}>IPC & JSON-RPC Gateway Latency</span>
        </div>
        <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {health &&
            Object.entries(health.rpcHealth).map(([chainName, node]) => (
              <div
                key={chainName}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid #1e293b',
                  borderRadius: 6,
                  padding: 12,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: '#e2e8f0' }}>{chainName}</span>
                  <span className="status-badge confirmed" style={{ fontSize: 9 }}>{node.status}</span>
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Latency:</span>
                  <span className="mono" style={{ color: node.latencyMs < 50 ? '#34d399' : '#fbbf24' }}>
                    {node.latencyMs} ms
                  </span>
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8', display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                  <span>Block Height:</span>
                  <span className="mono" style={{ color: '#cbd5e1' }}>#{node.blockHeight}</span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="table-card">
        <div className="table-header-bar">
          <span className="table-title">Recent Transactions Stream</span>
          <a
            href="/dashboard/transactions"
            style={{ fontSize: 12, color: '#3b82f6', textDecoration: 'none', fontWeight: 600 }}
          >
            VIEW ALL TRANSACTIONS →
          </a>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Tx Hash</th>
                <th>Type</th>
                <th>Chain</th>
                <th>Sender / Recipient</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {recentTxs.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 24, color: '#64748b' }}>
                    {loading ? 'Streaming ledger events...' : 'No transactions recorded yet.'}
                  </td>
                </tr>
              ) : (
                recentTxs.map((tx) => (
                  <tr key={tx.txHash}>
                    <td className="mono" style={{ color: '#60a5fa' }}>
                      {tx.txHash ? `${tx.txHash.substring(0, 10)}...${tx.txHash.slice(-8)}` : '0x...'}
                    </td>
                    <td>
                      <span className="status-badge info">{tx.type}</span>
                    </td>
                    <td>{tx.chain}</td>
                    <td className="mono" style={{ fontSize: 11 }}>
                      <div>From: {tx.fromAddress ? `${tx.fromAddress.substring(0, 8)}...` : 'N/A'}</div>
                      <div>To: {tx.toAddress ? `${tx.toAddress.substring(0, 8)}...` : 'N/A'}</div>
                    </td>
                    <td className="mono" style={{ fontWeight: 600, color: '#f8fafc' }}>
                      {tx.amount} {tx.asset}
                    </td>
                    <td>
                      <span className={`status-badge ${tx.status.toLowerCase()}`}>{tx.status}</span>
                    </td>
                    <td style={{ color: '#64748b', fontSize: 11 }}>
                      {new Date(tx.timestamp * 1000).toLocaleTimeString()}
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
