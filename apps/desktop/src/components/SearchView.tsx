import React from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Search,
  MoreVertical,
  ArrowRight
} from 'lucide-react';

interface SearchResult {
  entry_id: string;
  timestamp: string;
  title: string;
  content: string;
  tags: string[];
  distance: number;
}

interface SearchViewProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: SearchResult[];
  searchLoading: boolean;
  error: string | null;
  handleSearch: (e: React.FormEvent) => void;
}

const SearchView: React.FC<SearchViewProps> = ({
  searchQuery,
  setSearchQuery,
  searchResults,
  searchLoading,
  error,
  handleSearch
}) => {
  return (
    <div className="flex-1 flex overflow-hidden">
      <main className="flex-1 overflow-y-auto bg-slate-50">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <header className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">语义搜索</h2>
            <p className="text-slate-500">使用自然语言检索你数字生活中的任何点滴。</p>
          </header>

          <form onSubmit={handleSearch} className="relative group mb-12">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search size={24} className="text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            </div>
            <input 
              className="block w-full pl-14 pr-24 py-5 text-lg bg-white border-none rounded-2xl shadow-xl shadow-indigo-100/20 focus:ring-2 focus:ring-indigo-600 text-slate-900 placeholder-slate-400"
              placeholder="搜索你的记忆..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
              <button 
                type="submit"
                className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
              >
                搜索
              </button>
            </div>
          </form>

          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">搜索结果 ({searchResults.length})</h3>
              <div className="flex gap-2 items-center text-slate-400">
                <span className="text-xs font-medium">排序方式: 相关度</span>
                <MoreVertical size={14} />
              </div>
            </div>

            {searchLoading ? (
              <div className="text-center py-12">
                <div className="text-slate-500 text-sm">搜索中...</div>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-slate-500 text-sm">暂无搜索结果</div>
              </div>
            ) : (
              searchResults.map((result, index) => (
                <div key={result.entry_id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:border-indigo-600/30 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">日记</span>
                        <span className="text-xs text-slate-400 font-medium">
                          {new Date(result.timestamp).toLocaleString(undefined, {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <h4 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {result.title || "（无标题）"}
                      </h4>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span className="text-xs font-bold text-emerald-600">{(1 - result.distance).toFixed(2)} 相关度</span>
                    </div>
                  </div>
                  <div className="text-slate-600 leading-relaxed mb-6">
                    <ReactMarkdown>{result.content}</ReactMarkdown>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center justify-between">
                    <div className="flex gap-2">
                      {result.tags.map(tag => (
                        <span key={tag} className="bg-slate-100 px-3 py-1 rounded-lg text-xs font-medium text-slate-600">#{tag}</span>
                      ))}
                    </div>
                    <button className="flex items-center gap-1 text-indigo-600 text-sm font-bold hover:underline">
                      打开日记
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          {error && (
            <div className="mt-6 text-sm text-red-500">{error}</div>
          )}
        </div>
      </main>

      <div className="w-80 flex-shrink-0 border-l border-slate-200 bg-white hidden xl:flex flex-col p-6">
        <h3 className="text-sm font-bold text-slate-900 mb-4">语义上下文</h3>
        <div className="space-y-4">
          <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/20">
            <h4 className="text-xs font-bold text-indigo-600 uppercase mb-2">优化查询中</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              AI 正在您的工作区文档、笔记和通信中重点搜索相关内容。
            </p>
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-3">建议过滤器</h4>
            <div className="flex flex-wrap gap-2">
              {['最近 30 天', '包含标签', '长文本', '短文本'].map(f => (
                <button key={f} className="bg-slate-100 text-slate-600 text-xs px-3 py-1.5 rounded-lg border border-transparent hover:border-indigo-600/30">{f}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchView;