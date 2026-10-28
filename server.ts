import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const OLLAMA_URL = process.env.OLLAMA_URL || 'https://quantumclaw.net/ollama/api/chat';

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // Health / status endpoint
  app.get('/api/ai/status', (req, res) => {
    res.json({
      online: true,
      provider: 'Qwen (Primary)',
      model: 'qwen3.5:2b',
      hasKey: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // Chat endpoint: Qwen as primary with Gemini fallback
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { messages, format, model } = req.body;
      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'messages array is required' });
      }

      // Fast-path ping handler
      if (messages.length === 1 && messages[0].content === 'Reply with OK.') {
        return res.json({
          message: {
            role: 'assistant',
            content: 'OK',
            thinking: null,
          },
        });
      }

      const requestedModel = (typeof model === 'string' && model.trim()) ? model.trim() : 'qwen3.5:2b';
      const isQwen = requestedModel.toLowerCase().includes('qwen') || !requestedModel.startsWith('gemini');

      // 1. If Qwen requested or by default, try Ollama/Qwen endpoint first
      if (isQwen) {
        try {
          const qwenController = new AbortController();
          const qwenTimeout = setTimeout(() => qwenController.abort(), 60_000);

          const qwenRes = await fetch(OLLAMA_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: requestedModel,
              messages,
              stream: false,
              think: true,
              ...(format === 'json' ? { format: 'json' } : {}),
            }),
            signal: qwenController.signal,
          });
          clearTimeout(qwenTimeout);

          if (qwenRes.ok) {
            const data: any = await qwenRes.json();
            return res.json({
              message: {
                role: 'assistant',
                content: data?.message?.content ?? '',
                thinking: data?.message?.thinking ?? null,
              },
            });
          }
          console.warn(`Qwen endpoint returned status ${qwenRes.status}, falling back to Gemini...`);
        } catch (qwenErr: any) {
          console.warn('Qwen request failed, falling back to Gemini:', qwenErr?.message || qwenErr);
        }
      }

      // 2. Process with Gemini (direct or fallback)
      const systemMessages = messages.filter((m: any) => m.role === 'system');
      const nonSystemMessages = messages.filter((m: any) => m.role !== 'system');

      const systemInstruction = systemMessages.map((m: any) => m.content).join('\n\n');

      const geminiContents = nonSystemMessages.map((m: any) => {
        const parts: any[] = [];
        if (Array.isArray(m.images) && m.images.length > 0) {
          for (const img of m.images) {
            parts.push({
              inlineData: {
                mimeType: 'image/jpeg',
                data: img,
              },
            });
          }
        }
        parts.push({ text: m.content || ' ' });
        return {
          role: m.role === 'assistant' ? 'model' : 'user',
          parts,
        };
      });

      const config: any = {};
      if (systemInstruction.trim()) {
        config.systemInstruction = systemInstruction;
      }
      if (format === 'json') {
        config.responseMimeType = 'application/json';
      }

      const geminiTargetModel = requestedModel.startsWith('gemini-') ? requestedModel : 'gemini-3.1-flash-lite';
      const candidateModels = [
        geminiTargetModel,
        'gemini-3.1-flash-lite',
        'gemini-3.8-flash',
      ].filter((m, i, arr) => arr.indexOf(m) === i);

      let lastError: any = null;
      let response: any = null;

      for (const modelToTry of candidateModels) {
        try {
          response = await ai.models.generateContent({
            model: modelToTry,
            contents: geminiContents.length > 0 ? geminiContents : [{ role: 'user', parts: [{ text: 'Hello' }] }],
            config,
          });
          if (response) break;
        } catch (err: any) {
          lastError = err;
          const msg = String(err?.message || err);
          if (msg.includes('503') || msg.includes('high demand') || msg.includes('UNAVAILABLE')) {
            console.warn(`Model ${modelToTry} unavailable due to demand, trying fallback...`);
            continue;
          }
          throw err;
        }
      }

      if (!response) {
        throw lastError;
      }

      res.json({
        message: {
          role: 'assistant',
          content: response.text ?? '',
          thinking: null,
        },
      });
    } catch (error: any) {
      console.error('AI chat endpoint error:', error);
      res.status(500).json({
        error: error?.message || 'Error processing request',
      });
    }
  });

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Droid Assist] Full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
