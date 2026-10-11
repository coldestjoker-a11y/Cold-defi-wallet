import sys
import os
import time
import socket
import subprocess
import webbrowser

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.settimeout(0.5)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

def free_port(port=8000):
    """Detect and gracefully release port if occupied by a previous zombie process."""
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(0.5)
            if s.connect_ex(("127.0.0.1", port)) == 0:
                print(f"[*] Port {port} is occupied. Releasing port...")
                if os.name == "nt":
                    try:
                        res = subprocess.check_output(f'netstat -ano | findstr :{port}', shell=True).decode()
                        pids = set()
                        for line in res.strip().splitlines():
                            parts = line.split()
                            if len(parts) >= 5 and "LISTENING" in parts:
                                pid = parts[-1]
                                if pid.isdigit() and int(pid) != os.getpid():
                                    pids.add(int(pid))
                        for pid in pids:
                            print(f"[*] Stopping stale process PID {pid}...")
                            subprocess.run(f"taskkill /F /PID {pid}", shell=True, capture_output=True)
                        time.sleep(1)
                    except Exception as e:
                        print(f"[*] Port cleanup notice: {e}")
    except Exception:
        pass

def find_available_port(start_port=8000):
    free_port(start_port)
    for p in [start_port, 8001, 8080, 5000]:
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(("0.0.0.0", p))
                return p
        except OSError:
            continue
    return start_port

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    orch_dir = os.path.join(current_dir, "defi-orchestrator-py")
    sys.path.insert(0, orch_dir)

    import uvicorn
    import main

    port = find_available_port(8000)
    local_ip = get_local_ip()

    print("=" * 72)
    print("      COLD WALLET — STANDARD MULTI-CHAIN HD CRYPTO WALLET")
    print("=" * 72)
    print(f"  [>] Local Desktop Access:  http://localhost:{port}")
    print(f"  [>] Local IP Loopback:     http://127.0.0.1:{port}")
    print(f"  [>] Mobile / WiFi Access:  http://{local_ip}:{port}")
    print("=" * 72)
    print("  Status: BIP-39 Seed Phrases & ECDSA Transaction Signing Active")
    print("  Press Ctrl+C to terminate the server at any time.")
    print("=" * 72)

    # Launch browser automatically
    try:
        webbrowser.open(f"http://localhost:{port}")
    except Exception:
        pass

    uvicorn.run(
        main.app,
        host="0.0.0.0",
        port=port,
        log_level="info",
        access_log=True
    )
