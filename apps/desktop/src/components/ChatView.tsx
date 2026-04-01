import React from 'react';
import ReactMarkdown from 'react-markdown';
import {
  PlusCircle,
  MessageSquare,
  Search,
  Share2,
  MoreVertical,
  Bot,
  User,
  Send,
  Paperclip
} from 'lucide-react';
import { Conversation } from '../lib/api/backend';

interface ChatViewProps {
  conversations: Conversation[];
  loadingConversations: boolean;
  currentConversation: Conversation | null;
  chatMessages: { role: string; content: string }[];
  chatInput: string;
  setChatInput: (input: string) => void;
  chatLoading: boolean;
  error: string | null;
  loadConversations: () => void;
  loadConversation: (conversationId: string) => void;
  startNewConversation: () => void;
  handleChatSubmit: (e: React.FormEvent) => void;
}

const ChatView: React.FC<ChatViewProps> = ({
  conversations,
  loadingConversations,
  currentConversation,
  chatMessages,
  chatInput,
  setChatInput,
  chatLoading,
  error,
  loadConversations,
  loadConversation,
  startNewConversation,
  handleChatSubmit
}) => {
  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="w-80 flex-shrink-0 border-r border-indigo-100/20 bg-white/50 flex flex-col">
        <div className="p-4 border-b border-indigo-100/10">
          <button 
            onClick={startNewConversation}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all shadow-lg shadow-indigo-100"
          >
            <PlusCircle size={18} />
            <span>开启新对话</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">最近对话</div>
          {loadingConversations ? (
            <div className="px-3 py-4 text-slate-500 text-sm">加载中...</div>
          ) : conversations.length === 0 ? (
            <div className="px-3 py-4 text-slate-500 text-sm">还没有对话记录</div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => loadConversation(conversation.id)}
                className={`group flex items-center gap-3 px-3 py-4 ${currentConversation?.id === conversation.id ? 'bg-white rounded-xl border border-indigo-600/20 shadow-sm relative overflow-hidden' : 'hover:bg-indigo-50 rounded-xl transition-colors'} cursor-pointer`}
              >
                {currentConversation?.id === conversation.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600"></div>
                )}
                <MessageSquare 
                  size={18} 
                  className={currentConversation?.id === conversation.id ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-600 transition-colors'} 
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${currentConversation?.id === conversation.id ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'} truncate`}>
                    {conversation.title || "无标题对话"}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(conversation.updated_at + (conversation.updated_at.includes('Z') ? '' : 'Z')).toLocaleString('zh-CN')}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-white relative">
        <header className="h-16 flex-shrink-0 flex items-center justify-between px-6 border-b border-indigo-100/10">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-slate-800">{currentConversation?.title || "AI 对话"}</h1>
            {currentConversation && (
              <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">活跃</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-indigo-50">
              <Search size={20} />
            </button>
            <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-indigo-50">
              <Share2 size={20} />
            </button>
            <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-indigo-50">
              <MoreVertical size={20} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth">
          {chatMessages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-slate-400 text-lg mb-4">开始与AI对话吧！</div>
              <div className="text-slate-500 text-sm">你可以询问关于你日志的问题，或者寻求建议。</div>
            </div>
          ) : (
            chatMessages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-4 max-w-4xl mx-auto ${message.role === "user" ? 'flex-row-reverse' : ''}`}
              >
                <div className={`size-8 rounded-lg ${message.role === "user" ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600'} flex flex-shrink-0 items-center justify-center`}>
                  {message.role === "user" ? <User size={20} /> : <Bot size={20} />}
                </div>
                <div className={`flex-1 ${message.role === "user" ? 'flex flex-col items-end space-y-1' : 'space-y-4'}`}>
                  <div className={`${message.role === "user" ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-none shadow-md max-w-[80%]' : 'bg-slate-50 p-5 rounded-2xl rounded-tl-none border border-indigo-100/10 shadow-sm'}`}>
                    <div className="leading-relaxed">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  </div>
                  {message.role === "user" && (
                    <span className="text-[10px] text-slate-400 px-2 uppercase font-bold tracking-widest">已送达</span>
                  )}
                </div>
              </div>
            ))
          )}
          {chatLoading && (
            <div className="flex gap-4 max-w-4xl mx-auto">
              <div className="size-8 rounded-lg bg-indigo-50 flex flex-shrink-0 items-center justify-center text-indigo-600">
                <Bot size={20} />
              </div>
              <div className="flex-1 space-y-4">
                <div className="bg-slate-50 p-5 rounded-2xl rounded-tl-none border border-indigo-100/10 shadow-sm">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-indigo-100/10 bg-white/80 backdrop-blur-md">
          <div className="max-w-4xl mx-auto relative group">
            <form onSubmit={handleChatSubmit}>
              <textarea 
                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-5 pr-16 focus:ring-2 focus:ring-indigo-100 resize-none transition-all placeholder-slate-400 min-h-[56px] text-slate-700"
                placeholder="向你的大脑提问..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                rows={1}
              ></textarea>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button type="button" className="p-2 text-slate-400 hover:text-indigo-600 transition-colors rounded-lg">
                  <Paperclip size={20} />
                </button>
                <button 
                  type="submit" 
                  className="bg-indigo-600 text-white size-10 rounded-xl flex items-center justify-center hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-transform active:scale-95"
                >
                  <Send size={20} />
                </button>
              </div>
            </form>
          </div>
          <div className="mt-3 flex justify-center">
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.15em] font-medium">Shift + Enter 换行 • AI 可能会提供不准确的信息</p>
          </div>
          {error && (
            <div className="max-w-4xl mx-auto mt-4 text-sm text-red-500">{error}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatView;