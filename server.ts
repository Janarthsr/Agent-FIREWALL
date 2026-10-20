import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { execFile, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Resilient Python binary locator for dev and Cloud Run production
let cachedPythonBin: string | null = null;

function getPythonBinary(): string {
  if (cachedPythonBin && fs.existsSync(cachedPythonBin)) {
    return cachedPythonBin;
  }

  // 1. Check local standalone Python in workspace
  const localCandidates = [
    path.join(__dirname, 'python', 'bin', 'python3'),
    path.join(__dirname, 'python', 'bin', 'python3.11'),
    path.join(process.cwd(), 'python', 'bin', 'python3'),
    path.join(process.cwd(), 'python', 'bin', 'python3.11'),
    path.join(__dirname, '.python', 'bin', 'python3'),
    path.join(process.cwd(), '.python', 'bin', 'python3'),
  ];
  for (const cand of localCandidates) {
    if (fs.existsSync(cand)) {
      cachedPythonBin = cand;
      return cand;
    }
  }

  // 2. Check system PATH locations
  const systemCandidates = [
    '/usr/bin/python3',
    '/usr/local/bin/python3',
    '/usr/bin/python3.11',
    '/usr/local/bin/python3.11',
    '/opt/python/bin/python3',
  ];
  for (const cand of systemCandidates) {
    if (fs.existsSync(cand)) {
      cachedPythonBin = cand;
      return cand;
    }
  }

  // 3. Fallback: try invoking ensure-python script synchronously
  try {
    const ensureScript = path.join(__dirname, 'scripts', 'ensure-python.cjs');
    if (fs.existsSync(ensureScript)) {
      console.log('[server] Attempting emergency Python installation via ensure-python.cjs...');
      execSync(`node "${ensureScript}"`, { stdio: 'inherit' });
      for (const cand of localCandidates) {
        if (fs.existsSync(cand)) {
          cachedPythonBin = cand;
          return cand;
        }
      }
    }
  } catch (err: any) {
    console.error('[server] Emergency Python installation failed:', err.message);
  }

  return 'python3';
}

// Helper to execute Python CLI bridge
function runPython(cmd: string, data: any = {}): Promise<any> {
  return new Promise((resolve, reject) => {
    const jsonInput = JSON.stringify(data);
    const pythonBin = getPythonBinary();
    const pythonDir = path.dirname(path.dirname(pythonBin));
    const pythonBinDir = path.dirname(pythonBin);
    const customPath = `${pythonBinDir}:${process.env.PATH || ''}`;

    execFile(
      pythonBin,
      [path.join(__dirname, 'backend', 'cli.py'), cmd, jsonInput],
      {
        maxBuffer: 10 * 1024 * 1024,
        env: {
          ...process.env,
          PATH: customPath,
          PYTHONUNBUFFERED: '1',
          PYTHONHOME: fs.existsSync(path.join(pythonDir, 'lib')) ? pythonDir : process.env.PYTHONHOME,
        },
      },
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Python error for ${cmd}:`, stderr || error.message);
          try {
            const parsed = JSON.parse(stdout);
            return resolve(parsed);
          } catch {
            return reject(new Error(stderr || error.message));
          }
        }
        try {
          const text = stdout.trim();
          const jsonMatch = text.match(/\{[\s\S]*\}$/);
          const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
          resolve(parsed);
        } catch (e) {
          console.error(`Failed to parse python stdout for ${cmd}:`, stdout);
          reject(new Error(`Failed to parse response: ${stdout}`));
        }
      }
    );
  });
}

// REST API ROUTES

// 1. Auth
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const result = await runPython('login', req.body);
    if (!result.success) {
      return res.status(401).json({ error: result.error || 'Invalid credentials' });
    }
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/me', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthenticated' });
  }
  const token = authHeader.replace(/^Bearer\s+/i, '');
  try {
    const result = await runPython('get_me', { token });
    if (!result.success || !result.user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users', async (req: Request, res: Response) => {
  try {
    const result = await runPython('get_users');
    res.json(result.users || []);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Projects
app.get('/api/projects', async (req: Request, res: Response) => {
  try {
    const result = await runPython('get_projects');
    res.json(result.projects || []);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/projects', async (req: Request, res: Response) => {
  try {
    const result = await runPython('create_project', req.body);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/projects/:id/publish', async (req: Request, res: Response) => {
  try {
    const result = await runPython('publish_project', { project_id: req.params.id });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/projects/:id/documents', async (req: Request, res: Response) => {
  try {
    const result = await runPython('add_project_document', {
      project_id: req.params.id,
      document: req.body.document,
      user_id: req.body.user_id,
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/projects/:id', async (req: Request, res: Response) => {
  try {
    const result = await runPython('get_project', { project_id: req.params.id });
    if (!result.success) {
      return res.status(404).json({ error: result.error || 'Not found' });
    }
    res.json(result.project);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Confidential brief access control (403 demo)
app.get('/api/projects/:id/brief', async (req: Request, res: Response) => {
  try {
    const userId = (req.query.user_id as string) || 'usr_student';
    const userRole = (req.query.user_role as string) || 'student';
    const result = await runPython('get_confidential_brief', {
      project_id: req.params.id,
      user_id: userId,
      user_role: userRole,
    });

    if (result.status_code === 403 || !result.success) {
      return res.status(403).json({
        error: result.error || 'Access denied — charter acceptance required.',
        action: 'BRIEF_ACCESS_DENIED',
      });
    }
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Charter
app.post('/api/charters/:id/accept', async (req: Request, res: Response) => {
  try {
    const result = await runPython('accept_charter', {
      charter_id: req.params.id,
      project_id: req.body.project_id,
      user_id: req.body.user_id,
      version: req.body.version || '1.0',
      model_ack: req.body.model_ack ?? true,
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Scoping
app.post('/api/projects/:id/scope', async (req: Request, res: Response) => {
  try {
    const result = await runPython('propose_milestones', {
      project_id: req.params.id,
      user_id: req.body.user_id || 'usr_sponsor',
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/projects/:id/milestones/accept', async (req: Request, res: Response) => {
  try {
    const result = await runPython('accept_milestones', {
      project_id: req.params.id,
      user_id: req.body.user_id || 'usr_sponsor',
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Matching (with COI filtering)
app.get('/api/projects/:id/matches', async (req: Request, res: Response) => {
  try {
    const result = await runPython('get_matches', {
      project_id: req.params.id,
      user_id: (req.query.user_id as string) || 'usr_sponsor',
    });
    res.json(result.matches);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Funding (Escrow Mock)
app.post('/api/milestones/:id/fund', async (req: Request, res: Response) => {
  try {
    const result = await runPython('fund_milestone', {
      milestone_id: req.params.id,
      project_id: req.body.project_id,
      amount_inr: req.body.amount_inr || 35000,
      user_id: req.body.user_id || 'usr_sponsor',
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Firewall evaluate & receipts
app.post('/api/firewall/evaluate', async (req: Request, res: Response) => {
  try {
    const result = await runPython('firewall_evaluate', req.body);
    res.json(result.evaluation);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/firewall/receipts', async (req: Request, res: Response) => {
  try {
    const result = await runPython('get_receipts', {
      project_id: req.query.project_id as string,
    });
    res.json(result.receipts || []);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Approvals queue
app.get('/api/approvals', async (req: Request, res: Response) => {
  try {
    const result = await runPython('get_approvals');
    res.json(result.approvals || []);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/approvals/:id/decision', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: 'Authentication required to decide approvals' });
  }
  const token = authHeader.replace(/^Bearer\s+/i, '');
  try {
    const result = await runPython('decide_approval', {
      approval_id: req.params.id,
      decision: req.body.decision, // APPROVED or DENIED
      token: token,
      decided_by: req.body.decided_by,
      reason: req.body.reason || 'Human reviewer decision',
    });
    if (!result.success) {
      return res.status(result.status_code || 403).json(result);
    }
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 10. Submissions & Similarity
app.get('/api/projects/:id/submissions', async (req: Request, res: Response) => {
  try {
    const result = await runPython('get_submissions', { project_id: req.params.id });
    res.json(result.submissions || []);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/milestones/:id/submissions', async (req: Request, res: Response) => {
  try {
    const result = await runPython('submit_work', {
      milestone_id: req.params.id,
      project_id: req.body.project_id,
      author_id: req.body.author_id,
      file_name: req.body.file_name,
      content: req.body.content,
      ai_use_pct: req.body.ai_use_pct,
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 11. Reviews & Settlement
app.post('/api/contributions/:id/review', async (req: Request, res: Response) => {
  try {
    const result = await runPython('review_submission', {
      submission_id: req.params.id,
      reviewer_id: req.body.reviewer_id || 'usr_expert',
      decision: req.body.decision,
      feedback: req.body.feedback,
      score: req.body.score || 88,
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/milestones/:id/settle', async (req: Request, res: Response) => {
  try {
    const result = await runPython('settle_milestone', {
      milestone_id: req.params.id,
      project_id: req.body.project_id,
      user_id: req.body.user_id || 'usr_sponsor',
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/payouts/:id/explain', async (req: Request, res: Response) => {
  try {
    const model = (req.query.model as string) || 'FUNDED';
    const result = await runPython('get_rewards', { model, budget: 100000 });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 12. Ledger endpoints
app.get('/api/ledger', async (req: Request, res: Response) => {
  try {
    const result = await runPython('get_ledger', {
      project_id: req.query.project_id as string,
      actor_id: req.query.actor_id as string,
      action: req.query.action as string,
    });
    res.json(result.entries || []);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/ledger/verify', async (req: Request, res: Response) => {
  try {
    const result = await runPython('verify_ledger');
    res.json(result.verification);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/ledger/head', async (req: Request, res: Response) => {
  try {
    const result = await runPython('get_ledger');
    const entries = result.entries || [];
    res.json({ head_hash: entries.length > 0 ? entries[0].current_hash : '0'.repeat(64) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 13. Public Credential Verification
app.get('/api/verify/:code', async (req: Request, res: Response) => {
  try {
    const result = await runPython('verify_credential', { code: req.params.code });
    if (!result.credential) {
      return res.status(404).json({ error: 'Credential not found' });
    }
    res.json(result.credential);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 14. Disputes
app.get('/api/disputes', async (req: Request, res: Response) => {
  try {
    const result = await runPython('get_disputes');
    res.json(result.disputes || []);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/disputes', async (req: Request, res: Response) => {
  try {
    const result = await runPython('create_dispute', req.body);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/disputes/:id/resolve', async (req: Request, res: Response) => {
  try {
    const result = await runPython('resolve_dispute', {
      dispute_id: req.params.id,
      resolution: req.body.resolution,
      admin_id: req.body.admin_id || 'usr_admin',
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 15. Demo Controls
app.post('/api/demo/reset', async (req: Request, res: Response) => {
  try {
    const result = await runPython('repair_demo');
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/demo/fast-forward', async (req: Request, res: Response) => {
  try {
    const result = await runPython('fast_forward_demo');
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/demo/tamper/:id', async (req: Request, res: Response) => {
  try {
    const result = await runPython('tamper_ledger', { entry_id: req.params.id });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/demo/repair', async (req: Request, res: Response) => {
  try {
    const result = await runPython('repair_demo');
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Mount Vite in dev mode
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Agent Firewall live on http://0.0.0.0:${PORT}`);
    try {
      const activePy = getPythonBinary();
      console.log(`[server] Active Python 3.11 runtime: ${activePy}`);
    } catch (e: any) {
      console.warn(`[server] Python detection warning: ${e.message}`);
    }
  });
}

startServer();
