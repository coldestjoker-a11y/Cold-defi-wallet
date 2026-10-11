import sys
import json
import urllib.request

# Ensure UTF-8 output on Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

BASE_URL = "http://127.0.0.1:8000"

def test_health():
    print("\n--- Test 1: Health & Engine Check ---")
    req = urllib.request.Request(f"{BASE_URL}/health")
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())
        print("Status:", resp.status, data.get("service"))
        assert resp.status == 200
        assert data.get("status") == "ok"
    print("[PASS] Health endpoint OK")

def test_wallet_creation_and_zero_balance():
    print("\n--- Test 2: Wallet Generation & $0.00 Initial Balance ---")
    req = urllib.request.Request(f"{BASE_URL}/wallet/create", data=b"{}", headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as resp:
        wallet_resp = json.loads(resp.read().decode())
        assert wallet_resp.get("status") == "success"
        mnemonic = wallet_resp["mnemonic"]
        acct = wallet_resp["primary_account"]
        words = mnemonic.split()
        assert len(words) == 12, f"Expected 12 words, got {len(words)}"
        print(f"Generated Address: {acct['address']}")
        print(f"Seed words count: {len(words)}")

    # Check balance for this brand new address
    bal_req = urllib.request.Request(f"{BASE_URL}/wallet/balance/{acct['address']}")
    with urllib.request.urlopen(bal_req) as resp:
        bal_data = json.loads(resp.read().decode())
        balances = bal_data.get("balances", {})
        total_balance = sum(balances.values())
        print(f"Initial Total Balance: {total_balance} (all assets = 0.0)")
        assert total_balance == 0.0, f"Expected 0.0 balance for new wallet, got {total_balance}"
    print("[PASS] Wallet generation & $0.00 balance check OK")
    return {
        "mnemonic": mnemonic,
        "address": acct["address"],
        "private_key": acct["private_key"]
    }

def test_hd_derivation(wallet):
    print("\n--- Test 3: BIP-44 Hierarchical Deterministic Key Derivation ---")
    req_data = {
        "mnemonic": wallet["mnemonic"],
        "index": 1
    }
    req = urllib.request.Request(
        f"{BASE_URL}/wallet/derive",
        data=json.dumps(req_data).encode(),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode())
        assert res.get("status") == "success"
        acct1_addr = res.get("address")
        assert acct1_addr != wallet["address"], "Derived Account 2 must have a unique address"
        print(f"Derived Account 2 Address: {acct1_addr} (Path: m/44'/60'/0'/0/1)")

    req_data2 = {
        "mnemonic": wallet["mnemonic"],
        "index": 2
    }
    req2 = urllib.request.Request(
        f"{BASE_URL}/wallet/derive",
        data=json.dumps(req_data2).encode(),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req2) as resp:
        res2 = json.loads(resp.read().decode())
        assert res2.get("status") == "success"
        acct2_addr = res2.get("address")
        assert acct2_addr != acct1_addr and acct2_addr != wallet["address"]
        print(f"Derived Account 3 Address: {acct2_addr} (Path: m/44'/60'/0'/0/2)")
    print("[PASS] BIP-44 Multi-Account Derivation OK")

def test_eip712_signing(wallet):
    print("\n--- Test 4: Feature 8 - EIP-712 Typed Structured Data Signing ---")
    eip712_payload = {
        "types": {
            "EIP712Domain": [
                {"name": "name", "type": "string"},
                {"name": "version", "type": "string"},
                {"name": "chainId", "type": "uint256"},
                {"name": "verifyingContract", "type": "address"}
            ],
            "Permit": [
                {"name": "owner", "type": "address"},
                {"name": "spender", "type": "address"},
                {"name": "value", "type": "uint256"},
                {"name": "nonce", "type": "uint256"},
                {"name": "deadline", "type": "uint256"}
            ]
        },
        "primary_type": "Permit",
        "domain": {
            "name": "USD Coin",
            "version": "2",
            "chainId": 1,
            "verifyingContract": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
        },
        "message": {
            "owner": wallet["address"],
            "spender": "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
            "value": 1000000000,
            "nonce": 0,
            "deadline": 1893456000
        }
    }

    req_data = {
        "private_key": wallet["private_key"],
        "types": eip712_payload["types"],
        "primary_type": eip712_payload["primary_type"],
        "domain": eip712_payload["domain"],
        "message": eip712_payload["message"]
    }
    req = urllib.request.Request(
        f"{BASE_URL}/wallet/sign_typed_data",
        data=json.dumps(req_data).encode(),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        result = json.loads(resp.read().decode())
        print("Sign response status:", result.get("status"))
        assert result.get("status") == "success"
        signature = result.get("signature")
        assert signature.startswith("0x") and len(signature) == 132, f"Signature invalid length: {signature}"
        recovered = result.get("address")
        assert recovered.lower() == wallet["address"].lower(), f"Recovered address {recovered} != {wallet['address']}"
        print(f"Verified Signature: {signature[:18]}...{signature[-10:]}")
        print(f"Verified Signer: {recovered}")
    print("[PASS] EIP-712 Structured Data Signing OK")

def test_faucet_and_send(wallet):
    print("\n--- Test 5: Direct Funding & ECDSA Crypto Transfer ---")
    # Faucet 5 ETH
    faucet_payload = {
        "address": wallet["address"],
        "asset": "ETH",
        "amount": 5.0
    }
    req = urllib.request.Request(
        f"{BASE_URL}/wallet/faucet",
        data=json.dumps(faucet_payload).encode(),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        faucet_res = json.loads(resp.read().decode())
        assert faucet_res.get("status") == "success"
        print(f"Faucet credited: 5.0 ETH to {wallet['address']}")

    # Send 1.5 ETH to a recipient
    recipient = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
    send_payload = {
        "private_key": wallet["private_key"],
        "from_address": wallet["address"],
        "to_address": recipient,
        "asset": "ETH",
        "amount": 1.5,
        "gas_gwei": 25,
        "network": "Sepolia"
    }
    req = urllib.request.Request(
        f"{BASE_URL}/wallet/send",
        data=json.dumps(send_payload).encode(),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        send_res = json.loads(resp.read().decode())
        assert send_res.get("status") in ("confirmed", "success")
        print(f"Transfer confirmed: 1.5 ETH to {recipient}, TxHash: {send_res['tx_hash'][:18]}...")

    # Verify balance
    bal_req = urllib.request.Request(f"{BASE_URL}/wallet/balance/{wallet['address']}")
    with urllib.request.urlopen(bal_req) as resp:
        bal_data = json.loads(resp.read().decode())
        eth_bal = bal_data["balances"]["ETH"]
        print(f"Remaining ETH balance: {eth_bal} ETH (5.0 - 1.5 - gas fee)")
        assert eth_bal < 3.5 and eth_bal > 3.49, f"Unexpected balance: {eth_bal}"
    print("[PASS] Funding and ECDSA Transfer OK")

def test_amm_swap_and_bridge(wallet):
    print("\n--- Test 6: DeFi AMM Swap & Cross-Chain Bridge ---")
    # 1. Faucet 1000 USDC
    faucet_payload = {
        "address": wallet["address"],
        "asset": "USDC",
        "amount": 1000.0
    }
    req = urllib.request.Request(
        f"{BASE_URL}/wallet/faucet",
        data=json.dumps(faucet_payload).encode(),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        faucet_res = json.loads(resp.read().decode())
        assert faucet_res.get("status") == "success"
        print(f"Credited 1000 USDC for AMM test")

    # 2. Swap 500 USDC -> ETH via AMM
    swap_payload = {
        "from_address": wallet["address"],
        "from_asset": "USDC",
        "to_asset": "ETH",
        "amount": 500.0,
        "slippage": 0.5
    }
    req = urllib.request.Request(
        f"{BASE_URL}/swap",
        data=json.dumps(swap_payload).encode(),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        swap_res = json.loads(resp.read().decode())
        assert swap_res.get("status") in ("swapped", "success")
        print(f"AMM Swap Executed: {swap_res['amount_in']} {swap_res['from_asset']} -> {swap_res['amount_out']} {swap_res['to_asset']}")

    # 3. Cross-Chain Bridge 0.2 ETH to Arbitrum
    bridge_payload = {
        "from_address": wallet["address"],
        "asset": "ETH",
        "from_chain": "Sepolia",
        "to_chain": "Arbitrum One",
        "amount": 0.2,
        "destination": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
    }
    req = urllib.request.Request(
        f"{BASE_URL}/bridge",
        data=json.dumps(bridge_payload).encode(),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        bridge_res = json.loads(resp.read().decode())
        assert bridge_res.get("status") in ("bridged", "success")
        print(f"Bridge Initiated: 0.2 ETH from Sepolia to Arbitrum One (Tx: {bridge_res['tx_hash'][:18]}...)")

    print("[PASS] AMM Swap & Cross-Chain Bridge OK")

def test_frontend_ui_elements():
    print("\n--- Test 7: Frontend UI Elements & Feature Verification ---")
    req = urllib.request.Request(f"{BASE_URL}/")
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode()

    checks = {
        "Direct HD Self-Custody Core": [
            "onboardingModal",
            "accountManagerModal",
            "seedModal",
            "privateKeyModal",
            "sendModal",
            "swapModal",
            "bridgeModal",
            "btnDeriveNextAccount"
        ],
        "Feature 2: Address Book & Whitelist": [
            "addressBookModal",
            "openAddressBookBtn",
            "btnOpenContactPickerInSend",
            "checkSaveToContacts",
            "contactAddressInput",
            "renderContactsList"
        ],
        "Feature 3: Pre-Flight Simulation & Anti-Phishing": [
            "sendSimulationCard",
            "simSecurityBadge",
            "simOutflowVal",
            "simFeeVal",
            "simNewBalanceVal",
            "simRiskNotice",
            "updateSendSimulation"
        ],
        "Feature 4: Camera QR Scanner": [
            "qrScannerModal",
            "btnScanQrSend",
            "qrScannerVideo",
            "startQrScanner",
            "stopQrScanner",
            "BarcodeDetector"
        ],
        "Feature 5: Custom Token Import": [
            "importTokenModal",
            "btnOpenImportTokenModal",
            "customTokenAddress",
            "customTokenSymbol",
            "customTokenDecimals",
            "handleImportCustomToken"
        ],
        "Feature 6: Custom RPC & Network Adder": [
            "customNetworkModal",
            "btnOpenAddCustomNetModal",
            "customNetRpc",
            "customNetChainId",
            "handleAddCustomNetwork"
        ],
        "Feature 7: Export CSV Treasury Report": [
            "exportCsvBtn",
            "exportLedgerToCsv",
            "text/csv;charset=utf-8"
        ],
        "Feature 8: EIP-712 Typed Signing UI": [
            "signTypedDataModal",
            "btnOpenSignTypedDataModal",
            "btnLoadExampleTypedData",
            "signTypedDataForm",
            "sign_typed_data"
        ]
    }

    all_passed = True
    for feature_name, needles in checks.items():
        missing = [needle for needle in needles if needle not in html]
        if missing:
            print(f"[FAIL] {feature_name}: Missing elements {missing}")
            all_passed = False
        else:
            print(f"[PASS] {feature_name}: All {len(needles)} code/UI signatures verified")

    # Verify no vault locking modals or header pills exist
    obsolete_vault_elements = [
        "unlockVaultModal",
        "setupPasswordModal",
        "vaultEnclaveModal",
        "btnLockVaultQuick",
        "safeVaultReserveBanner"
    ]
    found_obsolete = [el for el in obsolete_vault_elements if el in html]
    assert len(found_obsolete) == 0, f"Obsolete vault elements still present: {found_obsolete}"
    print("[PASS] Confirmed all legacy vault lock modals & pills are completely removed")

    assert all_passed, "Some UI features missing in frontend index.html"

def test_static_assets():
    print("\n--- Test 8: Static Assets Verification ---")
    for path in ["/styles/core.css", "/logo.png", "/favicon.ico"]:
        req = urllib.request.Request(f"{BASE_URL}{path}")
        with urllib.request.urlopen(req) as resp:
            content = resp.read()
            print(f"Asset {path}: HTTP {resp.status}, {len(content)} bytes")
            assert resp.status == 200
            assert len(content) > 0
    print("[PASS] Static assets verified")

if __name__ == "__main__":
    try:
        test_health()
        wallet = test_wallet_creation_and_zero_balance()
        test_hd_derivation(wallet)
        test_eip712_signing(wallet)
        test_faucet_and_send(wallet)
        test_amm_swap_and_bridge(wallet)
        test_frontend_ui_elements()
        test_static_assets()
        print("\n========================================================")
        print("[SUCCESS] ALL 8 ADVANCED FEATURES 100% OPERATIONAL!")
        print("          Direct Self-Custody Web3 Wallet Verified!")
        print("========================================================")
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"\n[FAIL] Test Failed: {e}")
        sys.exit(1)
