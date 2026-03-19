import React from 'react';
import {
  Book,
  MessageSquare,
  Search,
  BarChart3,
  Brain
} from 'lucide-react';

type View = 'journal' | 'search' | 'chat' | 'reflection';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const navItems = [
    { id: 'journal', label: '日志管理', icon: Book },
    { id: 'search', label: '语义搜索', icon: Search },
    { id: 'chat', label: 'AI聊天', icon: MessageSquare },
    { id: 'reflection', label: '每周总结', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col h-full">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <Brain size={20} />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900">第二大脑</h1>
        </div>
        <p className="text-xs text-slate-500 font-medium px-1">您的知识中心</p>
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id as View)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              currentView === item.id 
                ? 'bg-indigo-50 text-indigo-600 font-medium' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <item.icon size={18} />
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <img 
              alt="个人资料" 
              className="w-8 h-8 rounded-full" 
              src="https://picsum.photos/seed/user/100/100"
              referrerPolicy="no-referrer"
            />
            <div className="overflow-hidden">
              <p className="text-xs font-semibold truncate text-slate-900">用户</p>
              <p className="text-[10px] text-slate-500">本地模式</p>
            </div>
          </div>
          <button className="w-full text-xs font-medium py-2 rounded-lg border border-slate-200 hover:bg-white transition-colors text-slate-700">
            设置
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;