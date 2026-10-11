export type UserRole = 'admin' | 'auditor' | 'viewer';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt: number;
  lastLoginAt: number;
  twoFactorEnabled: boolean;
}

export type TransactionStatus = 'CONFIRMED' | 'PENDING' | 'FAILED' | 'FLAGGED';

export interface AdminTransaction {
  txHash: string;
  fromAddress: string;
  toAddress: string;
  asset: string;
  amount: number;
  amountUsd: number;
  chain: string;
  chainId: number;
  status: TransactionStatus;
  timestamp: number;
  gasGwei: number;
  gasCostEth: number;
  type: 'TRANSFER' | 'SWAP' | 'BRIDGE' | 'FAUCET';
  riskScore: 'LOW' | 'MEDIUM' | 'HIGH';
  simulationPassed: boolean;
}

export interface AdminUserWallet {
  address: string;
  label?: string;
  accountIndex: number;
  holdings: Record<string, number>;
  totalValueUsd: number;
  txCount: number;
  lastSeenAt: number;
  isExternal: boolean;
  status: 'ACTIVE' | 'FLAGGED' | 'INACTIVE';
}

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
export type LogCategory = 'RPC' | 'AUTH' | 'TX' | 'SECURITY' | 'SYSTEM';

export interface AdminLog {
  id: string;
  timestamp: number;
  level: LogLevel;
  category: LogCategory;
  message: string;
  ipAddress?: string;
  adminId?: string;
  details?: Record<string, any>;
}

export interface RpcNodeHealth {
  chain: string;
  chainId: number;
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  latencyMs: number;
  blockHeight: number;
  endpoint: string;
}

export interface AdminSystemHealth {
  status: 'OPERATIONAL' | 'DEGRADED' | 'OUTAGE';
  version: string;
  uptimeSeconds: number;
  activeSessions: number;
  databaseStatus: 'CONNECTED' | 'DISCONNECTED';
  totalTransactionsRecorded: number;
  totalVolumeUsd: number;
  rpcHealth: Record<string, RpcNodeHealth>;
  systemMemoryUsageMb: number;
}
