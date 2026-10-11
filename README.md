# Cold Wallet — Enterprise Multi-Chain HD Crypto Wallet

Cold Wallet is a refurbished, production-grade self-custody crypto wallet built on standard Web3 cryptographic protocols:

## Core Features

- **Standard Cryptography & Seed Phrases**:
  - BIP-39 compliant 12-word Secret Recovery Phrases.
  - BIP-44 hierarchical deterministic (HD) key derivation (`m/44'/60'/0'/0/{index}`).
  - Standard SECP256K1 elliptic curve cryptography.
  - Authentic ECDSA transaction signing with Keccak-256 transaction hashes.
  - EIP-191 `personal_sign` message signing.

- **Send & Receive Crypto**:
  - **Receive**: Dynamic high-resolution QR code generator, checksummed public address, 1-click address copy, and instant Testnet Faucet buttons (+1.0 ETH, +500 USDC, +250 USDT, +0.1 WBTC).
  - **Send**: Recipient address validation, "MAX" balance button, live USD valuation, 3-speed gas selector (Slow, Standard, Fast), real cryptographic transaction signing, and automatic balance deduction.

- **Multi-Account Support**:
  - Derive multiple sub-accounts (`Account 1`, `Account 2`, `Account 3`...) from the same seed phrase.
  - Switch active accounts with 1 click; balances, QR codes, and addresses update instantly.

- **Private Key & Backup Controls**:
  - Secure "Reveal Secret Recovery Phrase" with masked chips and copy button.
  - Secure "Export Private Key" with show/hide password toggle and copy button.
  - Standalone private key import support.

- **DeFi AMM Swaps & Cross-Chain Liquidity Bridge**:
  - Decentralized exchange (DEX) swaps using Uniswap v2 constant product formula ($x \cdot y = k$) with 0.3% protocol fee and slippage tolerance.
  - Cross-chain bridge supporting 8 networks (Ethereum, BNB Chain, Arbitrum, Polygon, Base, Solana, Avalanche, Optimism).

- **Multi-Network Switcher**:
  - Sepolia Testnet, Ethereum Mainnet, Arbitrum One, Polygon PoS, Base, BNB Smart Chain, and Local Sandbox.

- **Real-Time Immutable Ledger**:
  - Complete transaction audit trail (Transfers, Faucet Deposits, Swaps, Bridges) with block numbers, fees, and clickable hashes.
  - 1-Click Export to JSON.

- **Responsive & Mobile-First UI**:
  - Desktop, tablet, and mobile optimized.
  - Mobile bottom navigation bar (`Assets`, `Activity`, `Send`, `Receive`, `Swap`, `Security`).
  - Touch-friendly tap targets and responsive bottom-sheet modals.

## Quick Start

### 1. Launch Wallet
Run the launcher script:
```bash
python run_wallet.py
```
Or on Windows, double-click `run_wallet.bat`.

The interface will open automatically at:
**[http://localhost:8000](http://localhost:8000)**

### 2. Run Verification Test Suite
To run the automated 13-point test suite:
```bash
python scratch/test_complete_wallet.py
```

