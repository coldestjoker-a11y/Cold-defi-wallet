export const SUPPORTED_CHAINS = [
  { id: 'Sepolia', chainId: 11155111, name: 'Sepolia Testnet', symbol: 'ETH', color: '#10b981' },
  { id: 'Ethereum', chainId: 1, name: 'Ethereum Mainnet', symbol: 'ETH', color: '#627eea' },
  { id: 'Arbitrum', chainId: 42161, name: 'Arbitrum One', symbol: 'ETH', color: '#28a0f0' },
  { id: 'Polygon', chainId: 137, name: 'Polygon PoS', symbol: 'POL', color: '#8247e5' },
  { id: 'Base', chainId: 8453, name: 'Base Mainnet', symbol: 'ETH', color: '#0052ff' },
  { id: 'BNB Chain', chainId: 56, name: 'BNB Smart Chain', symbol: 'BNB', color: '#f3ba2f' },
  { id: 'Local Enclave', chainId: 1337, name: 'Local MPC Enclave', symbol: 'ETH', color: '#06b6d4' }
] as const;

export const ADMIN_SESSION_TIMEOUT_MINUTES = 15;
export const REFRESH_TOKEN_EXPIRY_DAYS = 7;
