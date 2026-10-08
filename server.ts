import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini if API key is present
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', hasGeminiKey: Boolean(apiKey) });
});

// Quest Master AI Assistant endpoint
app.post('/api/quest-master', async (req, res) => {
  try {
    const { message, studentState } = req.body;

    if (!ai || !apiKey) {
      // Smart academic rule-based fallback response
      const fallbackResponse = generateFallbackQuestMasterResponse(message, studentState);
      return res.json({ response: fallbackResponse });
    }

    const systemPrompt = `You are the "Quest Master", the academic mentor and RPG guildmaster of StudyQuest RPG.
Your mission is to guide school and high-school students through their learning journey with RPG-themed enthusiasm, warmth, and actionable academic advice.
Current Student Status:
- Name: ${studentState?.name || 'Adventurer'}
- Level: ${studentState?.level || 1} (${studentState?.rank || 'Apprentice'})
- Coins: ${studentState?.coins || 0}
- Current Streak: ${studentState?.streak || 0} days
- Weak topics: ${studentState?.weakTopics?.join(', ') || 'None identified yet'}
- Strong subjects: ${studentState?.strongSubjects?.join(', ') || 'Balanced'}

Rules:
1. Always be encouraging, constructive, and motivating. Never demean or guilt the student.
2. If the student has an exam upcoming (e.g. "in 3 days"), create a clear day-by-day study campaign.
3. If they ask about a concept or question, break it down clearly with step-by-step intuition, bullet points, and an RPG metaphor if suitable.
4. Keep responses concise (under 200 words unless building a detailed study plan).
5. Always offer a concrete "Next Quest" recommendation.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: message,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    res.json({ response: response.text || "May your mind stay sharp! What would you like to study next?" });
  } catch (error) {
    console.error('Quest Master error:', error);
    const fallbackResponse = generateFallbackQuestMasterResponse(req.body.message, req.body.studentState);
    res.json({ response: fallbackResponse });
  }
});

// Dynamic AI Quiz Question Generator
app.post('/api/generate-quiz', async (req, res) => {
  try {
    const { subject, chapter, count = 5, difficulty = 'medium' } = req.body;

    if (!ai || !apiKey) {
      return res.json({ questions: null, useLocalPool: true });
    }

    const prompt = `Create ${count} multiple-choice academic quiz questions for the subject "${subject}", chapter "${chapter}" at ${difficulty} difficulty.
Each question must have 4 distinct options, 1 correct option index (0 to 3), and a brief pedagogical explanation.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              correctAnswer: { type: Type.INTEGER },
              explanation: { type: Type.STRING },
              topic: { type: Type.STRING },
              difficulty: { type: Type.STRING },
            },
            required: ['question', 'options', 'correctAnswer', 'explanation', 'topic'],
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || '[]');
    res.json({ questions: parsed, useLocalPool: false });
  } catch (error) {
    console.error('Quiz generation error:', error);
    res.json({ questions: null, useLocalPool: true });
  }
});

function generateFallbackQuestMasterResponse(message: string, studentState: any): string {
  const msg = (message || '').toLowerCase();
  const name = studentState?.name || 'Hero';
  const streak = studentState?.streak || 5;

  if (msg.includes('exam') || msg.includes('test') || msg.includes('day')) {
    return `Greetings, ${name}! A major trial approaches. Here is your 3-Day Campaign:

⚔️ Day 1: Foundation Siege - Review high-weight core concepts and formulas for 45 minutes. Complete a Chapter Quiz.
🛡️ Day 2: Battle Trials - Tackle 15-20 practice problems targeting weak areas. Practice under a 30-min Focus Timer.
👑 Day 3: Final Boss Prep - Take a mock Boss Battle, review your mistakes, and get plenty of rest to recharge your mana!

You've got this. Shall we begin a 25-minute focus session right now?`;
  }

  if (msg.includes('what should i study') || msg.includes('recommend') || msg.includes('next')) {
    const weak = studentState?.weakTopics?.[0] || 'Chemical Bonding';
    return `Based on your recent journey records, ${name}, your Next Best Move is:

🎯 Quest: 30 minutes on "${weak}"
💡 Intel: Your mastery in this chapter is ripe for advancement. Strengthening this will unlock +150 XP and prepare you for the upcoming Realm Boss!

Press "Start Quest" or launch the study timer to embark!`;
  }

  if (msg.includes('formula') || msg.includes('physics') || msg.includes('math')) {
    return `Quick Wisdom Rune for you, ${name}:
- Newton's Second Law: F = dp/dt = m·a (Force equals mass times acceleration)
- Work-Energy Theorem: W_net = ΔK = ½mv² - ½mu²
- Quadratic Formula: x = (-b ± √(b² - 4ac)) / (2a)

Remember: Understanding the derivation is stronger armor than mere memorization. Want me to break down any specific equation?`;
  }

  return `Greetings, ${name}! Your current study streak shines at ${streak} days. Remember that every 25 minutes of deep focus earns you XP, upgrades your academic rank, and expands your kingdom. What subject realm shall we conquer today?`;
}

// Vite integration
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const distPath = path.resolve(__dirname, 'dist');
  const indexHtmlPath = path.resolve(distPath, 'index.html');

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'Endpoint not found' });
      }
      res.sendFile(indexHtmlPath);
    });
  }

  const portNum = Number(PORT) || 3000;
  app.listen(portNum, '0.0.0.0', () => {
    console.log(`StudyQuest RPG server running on http://0.0.0.0:${portNum} (mode: ${isProd ? 'production' : 'development'})`);
  });
}

startServer();
