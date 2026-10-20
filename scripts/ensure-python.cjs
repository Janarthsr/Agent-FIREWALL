#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const pythonDir = path.join(rootDir, 'python');
const pythonBin = path.join(pythonDir, 'bin', 'python3');

function isPythonWorking(binPath) {
  try {
    if (!fs.existsSync(binPath)) return false;
    const out = execSync(`"${binPath}" --version`, { stdio: 'pipe' }).toString();
    return out.includes('Python 3.11');
  } catch {
    return false;
  }
}

async function main() {
  console.log('[ensure-python] Checking for Python 3.11 runtime...');

  if (isPythonWorking(pythonBin)) {
    console.log(`[ensure-python] Standalone Python 3.11 is verified at ${pythonBin}`);
    return;
  }

  // Also check system python3
  try {
    const sysVer = execSync('python3 --version', { stdio: 'pipe' }).toString();
    console.log(`[ensure-python] System python detected: ${sysVer.trim()}`);
  } catch (e) {
    console.log('[ensure-python] No system python3 detected in PATH.');
  }

  console.log('[ensure-python] Downloading standalone Python 3.11 distribution for Linux x86_64...');
  const tarballUrl = 'https://github.com/astral-sh/python-build-standalone/releases/download/20240224/cpython-3.11.8+20240224-x86_64-unknown-linux-gnu-install_only.tar.gz';
  const tmpTar = path.join('/tmp', `python311-${Date.now()}.tar.gz`);

  try {
    execSync(`curl -fsSL -o "${tmpTar}" "${tarballUrl}"`, { stdio: 'inherit' });
    execSync(`tar -xzf "${tmpTar}" -C "${rootDir}"`, { stdio: 'inherit' });
    try { fs.unlinkSync(tmpTar); } catch {}
    
    console.log('[ensure-python] Standalone Python 3.11 unpacked successfully.');
    
    // Install fastapi, uvicorn, pydantic, sqlalchemy
    console.log('[ensure-python] Installing FastAPI, Pydantic, SQLAlchemy in standalone Python...');
    const pipBin = path.join(pythonDir, 'bin', 'pip');
    execSync(`"${pipBin}" install fastapi uvicorn pydantic sqlalchemy`, { stdio: 'inherit' });
    console.log('[ensure-python] Dependencies installed successfully.');
  } catch (err) {
    console.error('[ensure-python] Failed to install standalone Python:', err.message);
  }
}

main().catch(console.error);
