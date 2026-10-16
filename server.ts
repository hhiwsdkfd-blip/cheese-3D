import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// Initialize Gemini SDK if API key is present
const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Chess analysis API endpoint
app.post('/api/chess/analyze', async (req, res) => {
  try {
    const { fen, history, currentTurn, difficulty } = req.body;
    const ai = getGenAI();

    if (!ai) {
      // Graceful fallback with heuristic advice if API key is pending
      return res.json({
        success: true,
        source: 'local_heuristic',
        analysis: {
          evaluation: currentTurn === 'w' ? '+0.4 تفوق طفيف للأبيض' : '-0.4 تفوق طفيف للأسود',
          suggestedMove: currentTurn === 'w' ? 'e4' : 'e5',
          bestMoveCommentary: 'السيطرة على المربعات المركزية وفتح خطوط الانتشار للقطع الخفيفة (الفيلة والخيول).',
          strategyExplanation: 'تطوير القطع نحو المركز في الافتتاح، وتأمين الملك عبر التبييت المبكر، والربط بين الرخاخ على الصف الأخير.',
          commonMistakes: [
            'تحريك نفس القطعة عدة مرات في الافتتاح دون داعٍ',
            'إهمال سلامة الملك وتأخير التبييت',
            'ترك القطع الخفيفة بدون حماية كافية'
          ],
          tacticalThreats: ['انتبه لقطعك غير المحمية', 'حافظ على التنسيق بين الرخاخ والفيلة'],
          strategicPlan: 'الضغط على الأوتار المفتوحة ومحاولة إيجاد نقاط ضعف في هيكل بيادق الخصم.',
        },
      });
    }

    const prompt = `أنت مساعد شطرنج ذكي وخبير دولي كبير (Grandmaster AI Coach).
الموقع الحالي بصيغة FEN:
${fen}
سجل النقلات الأخيرة:
${(history || []).slice(-10).join(' ')}
الدور الحالي: ${currentTurn === 'w' ? 'الأبيض (White)' : 'الأسود (Black)'}
مستوى التفكير المطلوب: ${difficulty || 'خبير'}

قم بتقديم استشارة شطرنجية شاملة واحترافية باللغة العربية:
1. اقتراح أفضل نقلة محددة بدقة (مثلاً: Nf3 أو e4 أو O-O) مع شرح تكتيكي واضح لسبب اختيارها.
2. شرح الاستراتيجيات الأساسية لهذا الموقف بالتحديد (المربعات الهامة، هيكل البيادق، سلامة الملك).
3. تسليط الضوء على الأخطاء الشائعة (Common Blunders) التي يقع فيها اللاعبون في مثل هذا الموقف ويجب تجنبها.
4. التهديدات التكتيكية المباشرة الحالية.
5. خطة استراتيجية للمراحل القادمة.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'أنت مدرب ومساعد شطرنج عالمي خبير باللغة العربية. قدم تحليلاً دقيقاً ومفيداً للاعبين من جميع المستويات بصيغة JSON محددة.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            evaluation: {
              type: Type.STRING,
              description: 'التقييم الرقمي والوصفي، مثلا +1.2 تفوق طفيف للأبيض',
            },
            suggestedMove: {
              type: Type.STRING,
              description: 'النقلة الأفضل المقترحة بصيغة SAN مثل Nf3 أو e4',
            },
            bestMoveCommentary: {
              type: Type.STRING,
              description: 'شرح النقلة الأفضل ولماذا ينصح بلعبها',
            },
            strategyExplanation: {
              type: Type.STRING,
              description: 'شرح الاستراتيجيات الأساسية والمفاهيم الجوهرية لهذا الموقف',
            },
            commonMistakes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'الأخطاء الشائعة والتحذيرات التكتيكية التي يجب تجنبها في هذا الموقف',
            },
            tacticalThreats: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'قائمة بالتهديدات التكتيكية الحالية المباشرة',
            },
            strategicPlan: {
              type: Type.STRING,
              description: 'الخطة الاستراتيجية المقترحة للمرحلة القادمة',
            },
          },
          required: [
            'evaluation',
            'suggestedMove',
            'bestMoveCommentary',
            'strategyExplanation',
            'commonMistakes',
            'tacticalThreats',
            'strategicPlan',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      source: 'gemini',
      analysis: parsed,
    });
  } catch (error: any) {
    console.error('Chess analysis error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'حدث خطأ أثناء تحليل الموقف',
    });
  }
});

// Configure Vite or Static Assets
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, port },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Chess 3D Server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
