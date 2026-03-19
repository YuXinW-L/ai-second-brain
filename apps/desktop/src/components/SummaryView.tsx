import React from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Activity,
  FileText,
  Smile,
  CloudCheck,
  Brain,
  Target,
  Lightbulb,
  TrendingUp,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

interface SummaryViewProps {
  reflection: string;
  reflectionLoading: boolean;
  error: string | null;
  handleGenerateReflection: () => void;
}

const SummaryView: React.FC<SummaryViewProps> = ({
  reflection,
  reflectionLoading,
  error,
  handleGenerateReflection
}) => {
  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-slate-50">
      <header className="sticky top-0 z-10 flex items-center justify-between px-8 py-4 bg-slate-50/80 backdrop-blur-md border-b border-indigo-100/20">
        <div className="flex flex-col">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">周度回顾</h2>
          <p className="text-sm text-slate-500">{new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleGenerateReflection}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
            disabled={reflectionLoading}
          >
            <Activity size={18} />
            <span>{reflectionLoading ? '生成中...' : '生成本周总结'}</span>
          </button>
        </div>
      </header>

      <div className="p-8 max-w-5xl mx-auto w-full flex flex-col gap-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-indigo-100/20 shadow-sm flex flex-col gap-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">本周条目</span>
              <FileText size={18} className="text-indigo-600" />
            </div>
            <div className="text-3xl font-black text-slate-900">12</div>
            <div className="text-xs text-green-500 font-bold flex items-center gap-1 mt-1">
              <TrendingUp size={12} />
              比上周增加 20%
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-indigo-100/20 shadow-sm flex flex-col gap-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">主要情绪</span>
              <Smile size={18} className="text-indigo-600" />
            </div>
            <div className="text-3xl font-black text-slate-900">沉思</div>
            <div className="text-xs text-indigo-600 font-bold mt-1">平衡的认知状态</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-indigo-100/20 shadow-sm flex flex-col gap-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">状态</span>
              <CloudCheck size={18} className="text-indigo-600" />
            </div>
            <div className="text-3xl font-black text-slate-900">已是最新</div>
            <div className="text-xs text-slate-400 mt-1">最后同步于 4 分钟前</div>
          </div>
        </div>

        <section className="bg-white rounded-xl border border-indigo-100/20 shadow-xl overflow-hidden">
          <div className="h-48 w-full bg-indigo-50 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-600 via-transparent to-transparent"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <img 
                src="https://picsum.photos/seed/summary/1200/400" 
                alt="Neural Network Pattern" 
                className="w-full h-full object-cover opacity-60"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute bottom-6 left-8 flex items-center gap-3">
              <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full border border-indigo-100/20">
                <span className="text-indigo-600 text-sm font-bold flex items-center gap-2">
                  <Brain size={16} />
                  AI 综合洞察
                </span>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-12">
            {reflectionLoading ? (
              <div className="text-center py-12">
                <div className="text-slate-500 text-sm">生成中...</div>
              </div>
            ) : reflection ? (
              <article className="max-w-none">
                <div className="space-y-8 text-slate-700 leading-relaxed">
                  <ReactMarkdown>{reflection}</ReactMarkdown>
                </div>
              </article>
            ) : (
              <div className="text-center py-12">
                <div className="text-slate-500 text-sm">点击上方按钮生成本周的总结报告。</div>
              </div>
            )}

            {reflection && (
              <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                <p className="text-sm text-slate-500">这份周度总结对你有帮助吗？</p>
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700">
                    <ThumbsUp size={16} />
                    有用
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700">
                    <ThumbsDown size={16} />
                    需要调整
                  </button>
                  <button className="ml-4 text-indigo-600 font-bold text-sm hover:underline">
                    查看详细分析报告
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
        {error && (
          <div className="mt-6 text-sm text-red-500">{error}</div>
        )}
      </div>
    </div>
  );
};

export default SummaryView;