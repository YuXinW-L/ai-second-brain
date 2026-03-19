import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  PlusCircle,
  CheckCircle2,
  X,
  Edit,
  Trash2
} from 'lucide-react';
import { JournalEntry } from '../lib/api/backend';

interface JournalViewProps {
  entries: JournalEntry[];
  loading: boolean;
  error: string | null;
  title: string;
  setTitle: (title: string) => void;
  content: string;
  setContent: (content: string) => void;
  tags: string;
  setTags: (tags: string) => void;
  editingEntry: JournalEntry | null;
  setEditingEntry: (entry: JournalEntry | null) => void;
  editTitle: string;
  setEditTitle: (title: string) => void;
  editContent: string;
  setEditContent: (content: string) => void;
  editTags: string;
  setEditTags: (tags: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  handleUpdate: (e: React.FormEvent) => void;
  handleEdit: (entry: JournalEntry) => void;
  handleDelete: (id: string) => void;
  handleCancelEdit: () => void;
}

const JournalView: React.FC<JournalViewProps> = ({
  entries,
  loading,
  error,
  title,
  setTitle,
  content,
  setContent,
  tags,
  setTags,
  editingEntry,
  setEditingEntry,
  editTitle,
  setEditTitle,
  editContent,
  setEditContent,
  editTags,
  setEditTags,
  onSubmit,
  handleUpdate,
  handleEdit,
  handleDelete,
  handleCancelEdit
}) => {
  // 处理标签输入
  const handleTagInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTags(e.target.value);
  };

  // 处理编辑标签输入
  const handleEditTagInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditTags(e.target.value);
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      <section className="flex-1 flex flex-col h-full bg-white border-r border-slate-100">
        <header className="h-16 border-b border-slate-100 flex items-center justify-between px-8">
          <div className="flex items-center gap-4 text-slate-400">
            {/* 这里可以添加格式化工具按钮 */}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded">已保存</span>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto px-12 py-10 max-w-4xl mx-auto w-full">
          {editingEntry ? (
            <form onSubmit={handleUpdate} className="space-y-6">
              <h3 className="text-xl font-bold text-slate-900">编辑日记</h3>
              <input 
                className="w-full text-4xl font-black border-none focus:ring-0 placeholder:text-slate-200 mb-8 bg-transparent text-slate-900" 
                placeholder="未命名条目" 
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
              <textarea 
                className="w-full flex-1 min-h-[400px] text-lg leading-relaxed border-none focus:ring-0 resize-none placeholder:text-slate-300 bg-transparent text-slate-700" 
                placeholder="开始记录您的想法... (支持 Markdown)"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
              ></textarea>
            </form>
          ) : (
            <form id="journal-form" onSubmit={onSubmit} className="space-y-6">
              <h3 className="text-xl font-bold text-slate-900">新日记</h3>
              <input 
                className="w-full text-4xl font-black border-none focus:ring-0 placeholder:text-slate-200 mb-8 bg-transparent text-slate-900" 
                placeholder="未命名条目" 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea 
                className="w-full flex-1 min-h-[400px] text-lg leading-relaxed border-none focus:ring-0 resize-none placeholder:text-slate-300 bg-transparent text-slate-700" 
                placeholder="开始记录您的想法... (支持 Markdown)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              ></textarea>
            </form>
          )}
        </div>

        <footer className="p-6 border-t border-slate-100 bg-slate-50/50">
          <div className="max-w-4xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex gap-2">
                {editingEntry ? (
                  <input
                    type="text"
                    value={editTags}
                    onChange={handleEditTagInput}
                    placeholder="标签，逗号分隔"
                    className="text-sm border border-slate-200 rounded-full px-3 py-1"
                  />
                ) : (
                  <input
                    type="text"
                    value={tags}
                    onChange={handleTagInput}
                    placeholder="标签，逗号分隔"
                    className="text-sm border border-slate-200 rounded-full px-3 py-1"
                  />
                )}
              </div>
            </div>
            {editingEntry ? (
              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={handleCancelEdit}
                  className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3 px-8 rounded-xl transition-all flex items-center gap-2"
                >
                  <X size={20} />
                  取消
                </button>
                <button 
                  type="submit" 
                  form={editingEntry ? undefined : 'journal-form'}
                  onClick={handleUpdate}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center gap-2"
                >
                  <CheckCircle2 size={20} />
                  更新日记
                </button>
              </div>
            ) : (
              <button 
                type="submit" 
                form="journal-form"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center gap-2"
              >
                <CheckCircle2 size={20} />
                保存日记
              </button>
            )}
          </div>
          {error && (
            <div className="max-w-4xl mx-auto w-full mt-4 text-sm text-red-500">{error}</div>
          )}
        </footer>
      </section>

      <section className="w-80 flex-shrink-0 flex flex-col bg-slate-50 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">最近日记</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="text-slate-500 text-sm">加载中...</div>
          ) : entries.length === 0 ? (
            <div className="text-slate-500 text-sm">还没有任何日记，先写一篇吧。</div>
          ) : (
            entries.map(entry => (
              <div key={entry.id} className="group relative bg-white p-4 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                    {new Date(entry.timestamp).toLocaleString(undefined, {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(entry)}
                      className="text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">{entry.title || "（无标题）"}</h3>
                <div className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                  <ReactMarkdown>{entry.content}</ReactMarkdown>
                </div>
                <div className="flex gap-1">
                  {entry.tags.map(tag => (
                    <span key={tag} className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">#{tag}</span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default JournalView;