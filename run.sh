#!/usr/bin/env bash
set -e

echo "============================================================"
echo "AGENT FIREWALL — GARDENIA 2K26 FINALS"
echo "Initializing deterministic demo environment..."
echo "============================================================"

# Seed SQLite database and generate synthetic poisoned PDF
python3 seed/generate_pdf.py
python3 seed/seed.py

# Run unit tests
echo "Executing test verification suite..."
python3 -m unittest discover tests

echo "Starting Agent Firewall application on port 3000..."
npm run dev
