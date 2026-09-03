import fs from 'fs';
import path from 'path';
import express, { Request, Response } from 'express';
import { TTSClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import blogRouter from './blog-api.js';
import authRouter from './auth-api.js';
import { gameRecordsRouter } from './game-records-api.js';
import { initTables } from './src/storage/database/db-client.js';

// Load .env.local manually
try {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^\s*([^#][^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        if ((value.startsWith("'") && value.endsWith("'")) ||
            (value.startsWith('"') && value.endsWith('"'))) {
          value = value.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    });
    console.log('.env.local loaded');
  }
} catch (err) {
  console.warn('Failed to load .env.local:', err);
}

const app = express();
// In development, API_PORT is set by dev.sh (e.g. 3001, proxied by Vite)
// In production, DEPLOY_RUN_PORT is set by start.sh (e.g. 5000)
const PORT = parseInt(process.env.API_PORT || process.env.DEPLOY_RUN_PORT || process.env.PORT || '3001', 10);

app.use(express.json());

// Auth API routes
app.use('/api/auth', authRouter);

// Blog API routes
app.use('/api/blog', blogRouter);

// Game Records API routes
app.use('/api/game-records', gameRecordsRouter);

// Serve static files from dist (production) or proxy to Vite (development)
const isDev = process.env.NODE_ENV !== 'production';

if (!isDev) {
  app.use(express.static(path.join(__dirname, '../dist')));
}

// TTS API endpoint
app.post('/api/tts', async (req: Request, res: Response) => {
  try {
    const { text, anger } = req.body as { text?: string; anger?: number };

    if (!text) {
      res.status(400).json({ error: 'Missing text parameter' });
      return;
    }

    const angerLevel = typeof anger === 'number' ? Math.max(0, Math.min(100, anger)) : 50;

    // Map anger level to speech parameters
    // High anger → fast, loud, harsh
    // Low anger → slow, soft, gentle
    let speechRate: number;
    let loudnessRate: number;
    let speaker: string;

    if (angerLevel >= 80) {
      // Very angry: fast and loud
      speechRate = 30;
      loudnessRate = 20;
      speaker = 'zh_female_meilinvyou_saturn_bigtts';
    } else if (angerLevel >= 60) {
      // Angry: slightly fast
      speechRate = 15;
      loudnessRate = 10;
      speaker = 'zh_female_meilinvyou_saturn_bigtts';
    } else if (angerLevel >= 40) {
      // Still upset: normal pace
      speechRate = 0;
      loudnessRate = 0;
      speaker = 'zh_female_meilinvyou_saturn_bigtts';
    } else if (angerLevel >= 20) {
      // Calming down: slightly slow and soft
      speechRate = -10;
      loudnessRate = -10;
      speaker = 'zh_female_meilinvyou_saturn_bigtts';
    } else {
      // Almost forgiven: slow and gentle
      speechRate = -20;
      loudnessRate = -15;
      speaker = 'saturn_zh_female_keainvsheng_tob';
    }

    const config = new Config({
      apiKey: process.env.COZE_WORKLOAD_IDENTITY_API_KEY,
      baseUrl: process.env.COZE_INTEGRATION_BASE_URL,
    });
    const forwardHeaders = HeaderUtils.extractForwardHeaders(req.headers as Record<string, string>);
    const client = new TTSClient(config, forwardHeaders);

    const response = await client.synthesize({
      uid: `honghong-${Date.now()}`,
      text,
      speaker,
      audioFormat: 'mp3',
      sampleRate: 24000,
      speechRate,
      loudnessRate,
    });

    res.json({
      audioUrl: response.audioUri,
      audioSize: response.audioSize,
    });
  } catch (error) {
    console.error('TTS Error:', error);
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    if (errMsg.includes('资源点不足') || errMsg.includes('额度')) {
      res.status(503).json({ error: '语音服务额度已用完', code: 'QUOTA_EXCEEDED' });
    } else {
      res.status(500).json({ error: 'TTS synthesis failed', code: 'TTS_ERROR' });
    }
  }
});

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// SPA fallback (production only)
if (!isDev) {
  app.get('{*path}', (_req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

async function start() {
  try {
    await initTables();
  } catch (err) {
    console.error('Failed to initialize database:', err);
  }
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start();
