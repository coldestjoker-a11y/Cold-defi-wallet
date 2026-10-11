import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import AdminLayout from '../../components/AdminLayout';
import { adminFetch } from '../../lib/adminApiClient';
import type { AdminTransaction } from '@enterprise/shared';
import { SUPPORTED_CHAINS } from '@enterprise/shared';

export default function TransactionsMonitorPage() {
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [chainFilter, setChainFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (statusFilter !== 'ALL') queryParams.set('status', statusFilter);
      if (chainFilter !== 'ALL') queryParams.set('chain', chainFilter);
      if (search.trim()) queryParams.set('search', search.trim());
      queryParams.set('limit', '100');

      const res = await adminFetch<{ total: number; transactions: AdminTransaction[] }>(
        `/api/admin/transactions?${queryParams.toString()}`
      );
      setTransactions(res.transactions || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error('Error fetching admin transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [statusFilter, chainFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTransactions();
  };

  const exportCsv = () => {
    if (!transactions.length) return;
    const headers = ['TxHash', 'Chain', 'From', 'To', 'Asset', 'Amount', 'AmountUSD', 'Status', 'Timestamp', 'GasCostETH'];
    const rows = transactions.map((t) => [
      t.txHash,
      t.chain,
      t.fromAddress,
      t.toAddress,
      t.asset,
      t.amount,
      t.amountUsd,
      t.status,
      new Date(t.timestamp * 1000).toISOString(),
      t.gasCostEth,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `defi_transactions_audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout
      pageTitle="Multi-Chain Transaction Monitor"
      actionButton={
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={exportCsv}
            className="filter-input"
            style={{ cursor: 'pointer', background: '#0f172a', color: '#38bdf8', border: '1px solid #0284c7' }}
          >
            📥 EXPORT AUDIT CSV
          </button>
          <button
            onClick={fetchTransactions}
            className="filter-input"
            style={{ cursor: 'pointer', background: '#1e293b', color: '#fff', border: '1px solid #334155' }}
          >
            🔄 REFRESH
          </button>
        </div>
      }
    >
      <Head>
        <title>Transactions Monitor — Enterprise Admin</title>
      </Head>

      <div className="table-card">
        {/* Filter Toolbar */}
        <div className="table-header-bar">
          <form onSubmit={handleSearchSubmit} className="filter-bar">
            <input
              type="text"
              placeholder="Search by hash, sender or recipient..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="filter-input"
              style={{ width: 280 }}
            />
            <button
              type="submit"
              className="filter-input"
              style={{ cursor: 'pointer', background: '#2563eb', color: '#fff', border: 'none', fontWeight: 600 }}
            >
              SEARCH
            </button>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="ALL">Status: All</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="PENDING">PENDING</option>
              <option value="FAILED">FAILED</option>
            </select>

            <select
              value={chainFilter}
              onChange={(e) => setChainFilter(e.target.value)}
              className="filter-select"
            >
              <option value="ALL">Chain: All (7 Chains)</option>
              {SUPPORTED_CHAINS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </form>

          <span style={{ fontSize: 12, color: '#94a3b8' }}>
            Found <strong style={{ color: '#fff' }}>{total}</strong> recorded records
          </span>
        </div>

        {/* Transaction Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Transaction Hash</th>
                <th>Chain</th>
                <th>From (Sender)</th>
                <th>To (Recipient)</th>
                <th>Value</th>
                <th>USD Value</th>
                <th>Gas Fee</th>
                <th>Risk</th>
                <th>Status</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: 32, color: '#64748b' }}>
                    {loading ? 'Querying transaction ledger...' : 'No transactions matching active filter criteria.'}
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.txHash}>
                    <td className="mono" style={{ color: '#60a5fa', fontWeight: 600 }}>
                      <span title={tx.txHash}>
                        {tx.txHash ? `${tx.txHash.substring(0, 8)}...${tx.txHash.slice(-6)}` : '0x...'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 500, color: '#e2e8f0' }}>{tx.chain}</span>
                    </td>
                    <td className="mono" style={{ fontSize: 11 }}>
                      <span title={tx.fromAddress}>
                        {tx.fromAddress ? `${tx.fromAddress.substring(0, 6)}...${tx.fromAddress.slice(-4)}` : 'N/A'}
                      </span>
                    </td>
                    <td className="mono" style={{ fontSize: 11 }}>
                      <span title={tx.toAddress}>
                        {tx.toAddress ? `${tx.toAddress.substring(0, 6)}...${tx.toAddress.slice(-4)}` : 'N/A'}
                      </span>
                    </td>
                    <td className="mono" style={{ fontWeight: 600, color: '#fff' }}>
                      {tx.amount} {tx.asset}
                    </td>
                    <td className="mono" style={{ color: '#94a3b8' }}>
                      ${tx.amountUsd.toFixed(2)}
                    </td>
                    <td className="mono" style={{ fontSize: 11, color: '#94a3b8' }}>
                      {tx.gasCostEth} ETH
                    </td>
                    <td>
                      <span
                        className="status-badge"
                        style={{
                          backgroundColor: tx.riskScore === 'LOW' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: tx.riskScore === 'LOW' ? '#10b981' : '#ef4444',
                          border: `1px solid ${tx.riskScore === 'LOW' ? '#059669' : '#dc2626'}`,
                        }}
                      >
                        {tx.riskScore}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${tx.status.toLowerCase()}`}>{tx.status}</span>
                    </td>
                    <td style={{ color: '#64748b', fontSize: 11 }}>
                      {new Date(tx.timestamp * 1000).toLocaleString()}
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
