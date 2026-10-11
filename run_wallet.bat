@echo off
title Cold Wallet HD Crypto
cd /d "%~dp0"
echo ===================================================
echo Starting Cold Wallet HD Crypto...
echo ===================================================
python run_wallet.py
if errorlevel 1 (
    echo.
    echo Server stopped with an error. Check if Python is in your PATH.
    pause
)
