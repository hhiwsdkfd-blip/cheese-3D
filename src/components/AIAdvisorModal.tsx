import React, { useState, useEffect } from 'react';
import { ChessAnalysisResult } from '../types/chess';
import { Sparkles, X, RefreshCw, ShieldAlert, Target, Compass, Brain } from 'lucide-react';

interface AIAdvisorModalProps {
  fen: string;
  history: string[];
  currentTurn: 'w' | 'b';
  isOpen: boolean;
  onClose: () => void;
}

export const AIAdvisorModal: React.FC<AIAdvisorModalProps> = ({
  fen,
  history,
  currentTurn,
  isOpen,
  onClose,
}) => {
  const [analysis, setAnalysis] = useState<ChessAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          difficulty: 'أستاذ كبير',
        }),
      });

      const data = await res.json();
      if (data.success && data.analysis) {
        setAnalysis(data.analysis);
      } else {
        setError(data.error || 'تعذر الحصول على التحليل من الذكاء الاصطناعي');
      }
    } catch (err: any) {
      setError('خطأ في الاتصال بخدمة التحليل الشطرنجي');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 font-['Cairo',sans-serif]" dir="rtl">
      <div className="w-full max-w-lg bg-neutral-900 border border-amber-500/40 rounded-2xl p-6 shadow-2xl text-white max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2 text-amber-400">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <Brain className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-black">المحلل الاستراتيجي (Gemini AI)</h3>
              <p className="text-[11px] text-neutral-400">تحليل الموقف التكتيكي وتوصيات الأستاذ الدولي</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="py-4 overflow-y-auto space-y-4 flex-1">
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-neutral-400">
              <Sparkles className="w-8 h-8 text-amber-400 animate-spin" />
              <p className="text-xs font-semibold text-amber-300">جاري قراءة الرقعة وحساب أفضل النقلات التكتيكية...</p>
              <div className="w-32 h-1 bg-neutral-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 animate-pulse w-full"></div>
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
              {error}
            </div>
          )}

          {!loading && analysis && (
            <>
              {/* Evaluation Pill */}
              <div className="p-3.5 rounded-xl bg-neutral-800/70 border border-neutral-700/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-neutral-300">تقييم الموقف:</span>
                </div>
                <span className="font-bold text-sm text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/20">
                  {analysis.evaluation}
                </span>
              </div>

              {/* Best Move Commentary */}
              <div className="p-4 rounded-xl bg-neutral-800/50 border border-neutral-700/80">
                <div className="flex items-center gap-2 mb-2 text-amber-400">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs font-black">النقلة المقترحة والشرح التكتيكي:</span>
                </div>
                <p className="text-xs text-neutral-200 leading-relaxed">
                  {analysis.bestMoveCommentary}
                </p>
              </div>

              {/* Threats */}
              {analysis.tacticalThreats && analysis.tacticalThreats.length > 0 && (
                <div className="p-4 rounded-xl bg-neutral-800/50 border border-neutral-700/80">
                  <div className="flex items-center gap-2 mb-2 text-rose-400">
                    <ShieldAlert className="w-4 h-4" />
                    <span className="text-xs font-black">التهديدات المباشرة:</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-neutral-300 list-disc list-inside">
                    {analysis.tacticalThreats.map((threat, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {threat}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Strategic Plan */}
              {analysis.strategicPlan && (
                <div className="p-4 rounded-xl bg-neutral-800/50 border border-neutral-700/80">
                  <div className="flex items-center gap-2 mb-2 text-sky-400">
                    <Compass className="w-4 h-4" />
                    <span className="text-xs font-black">الخطة الاستراتيجية العامة:</span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {analysis.strategicPlan}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
          <button
            type="button"
            onClick={fetchAnalysis}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>إعادة التحليل</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-black transition-all cursor-pointer"
          >
            حسناً، فهمت
          </button>
        </div>
      </div>
    </div>
  );
};
