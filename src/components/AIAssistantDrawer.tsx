import React, { useState, useEffect } from 'react';
import { ChessAnalysisResult } from '../types/chess';
import {
  Sparkles,
  X,
  RefreshCw,
  ShieldAlert,
  Target,
  Compass,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
} from 'lucide-react';

interface AIAssistantDrawerProps {
  fen: string;
  history: string[];
  currentTurn: 'w' | 'b';
  isOpen: boolean;
  onClose: () => void;
  onHighlightMove: (moveSan: string) => void;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  fen,
  history,
  currentTurn,
  isOpen,
  onClose,
  onHighlightMove,
}) => {
  const [analysis, setAnalysis] = useState<ChessAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'move' | 'strategy' | 'mistakes'>('move');

  const fetchAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/chess/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fen,
          history,
          currentTurn,
          difficulty: 'أستاذ دولي كبير',
        }),
      });

      const data = await res.json();
      if (data.success && data.analysis) {
        setAnalysis(data.analysis);
      } else {
        setError(data.error || 'تعذر الحصول على التحليل الشطرنجي');
      }
    } catch (err) {
      setError('خطأ في الاتصال بمساعد الذكاء الاصطناعي');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAnalysis();
    }
  }, [isOpen, fen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-neutral-900/98 border-l border-amber-500/30 text-white font-['Cairo',sans-serif] shadow-2xl flex flex-col backdrop-blur-md"
      dir="rtl"
    >
      {/* Header */}
      <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-black text-sm text-amber-300">مساعد الشطرنج الذكي (AI Coach)</h3>
            <p className="text-[11px] text-neutral-400">تحليل الوضعيات، اقتراح النقلات، وتجنب الأخطاء</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-1 p-2 bg-neutral-950 border-b border-neutral-800 text-xs font-bold">
        <button
          onClick={() => setActiveTab('move')}
          className={`py-2 px-1 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'move'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>اقتراح نقلة</span>
        </button>
        <button
          onClick={() => setActiveTab('strategy')}
          className={`py-2 px-1 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'strategy'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>شرح الاستراتيجية</span>
        </button>
        <button
          onClick={() => setActiveTab('mistakes')}
          className={`py-2 px-1 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'mistakes'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>أخطاء شائعة</span>
        </button>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-neutral-400">
            <Sparkles className="w-8 h-8 text-amber-400 animate-spin" />
            <p className="text-xs font-bold text-amber-300">جاري قراءة الموقف التكتيكي وحساب أفضل الخطط...</p>
          </div>
        )}

        {error && !loading && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
            {error}
          </div>
        )}

        {!loading && analysis && (
          <>
            {/* Position Evaluation Bar */}
            <div className="p-3 rounded-xl bg-neutral-800/80 border border-neutral-700 flex items-center justify-between text-xs">
              <span className="text-neutral-400 font-semibold">تقييم الموقف الإجمالي:</span>
              <span className="font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
                {analysis.evaluation}
              </span>
            </div>

            {/* TAB 1: SUGGESTED MOVE */}
            {activeTab === 'move' && (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 via-neutral-800/90 to-neutral-900 border border-amber-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <Lightbulb className="w-4 h-4" />
                      النقلة الموصى بها:
                    </span>
                    <span className="text-base font-black px-3 py-0.5 rounded-md bg-amber-500 text-neutral-950">
                      {analysis.suggestedMove || 'Nf3'}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-200 leading-relaxed mt-2">
                    {analysis.bestMoveCommentary}
                  </p>

                  {analysis.suggestedMove && (
                    <button
                      onClick={() => onHighlightMove(analysis.suggestedMove)}
                      className="mt-3.5 w-full py-2 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>إظهار النقلة المقترحة على الرقعة</span>
                    </button>
                  )}
                </div>

                {/* Direct Tactical Threats */}
                {analysis.tacticalThreats && analysis.tacticalThreats.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-neutral-800/60 border border-neutral-700/80">
                    <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold mb-2">
                      <ShieldAlert className="w-4 h-4" />
                      <span>تهديدات مباشرة يجب الانتباه لها:</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-neutral-300 list-disc list-inside">
                      {analysis.tacticalThreats.map((t, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: STRATEGY EXPLANATION */}
            {activeTab === 'strategy' && (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-neutral-800/70 border border-neutral-700">
                  <h4 className="text-xs font-black text-amber-400 flex items-center gap-1.5 mb-2">
                    <Compass className="w-4 h-4" />
                    المفاهيم والاستراتيجيات الجوهرية:
                  </h4>
                  <p className="text-xs text-neutral-200 leading-relaxed">
                    {analysis.strategyExplanation}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-neutral-800/70 border border-neutral-700">
                  <h4 className="text-xs font-black text-sky-400 flex items-center gap-1.5 mb-2">
                    <Target className="w-4 h-4" />
                    الخطة للمرحلة القادمة:
                  </h4>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {analysis.strategicPlan}
                  </p>
                </div>
              </div>
            )}

            {/* TAB 3: COMMON MISTAKES TO AVOID */}
            {activeTab === 'mistakes' && (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25">
                  <div className="flex items-center gap-2 text-rose-400 font-black text-xs mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>أخطاء شائعة وفخاخ تكتيكية في مثل هذا الموقف:</span>
                  </div>
                  <ul className="space-y-2 text-xs text-neutral-200">
                    {(analysis.commonMistakes || []).map((m, idx) => (
                      <li key={idx} className="flex items-start gap-2 leading-relaxed">
                        <span className="text-rose-400 font-bold">•</span>
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer Refresh */}
      <div className="p-3 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between">
        <button
          onClick={fetchAnalysis}
          disabled={loading}
          className="py-2 px-3.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>تحديث التحليل</span>
        </button>

        <button
          onClick={onClose}
          className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-black transition-all"
        >
          إغلاق المساعد
        </button>
      </div>
    </div>
  );
};
