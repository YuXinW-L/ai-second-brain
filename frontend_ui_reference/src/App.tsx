import React, { useState } from 'react';
import { 
  Book, 
  MessageSquare, 
  Search, 
  BarChart3, 
  Settings, 
  PlusCircle, 
  CheckCircle2, 
  X, 
  Bold, 
  Italic, 
  List, 
  Link as LinkIcon, 
  Image as ImageIcon,
  Edit,
  Trash2,
  Share2,
  Download,
  Target,
  Brain,
  Activity,
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
  Send,
  Paperclip,
  Bot,
  User,
  MoreVertical,
  History,
  LayoutDashboard,
  FileText,
  Calendar,
  CloudCheck,
  TrendingUp,
  Smile
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---

type View = 'journal' | 'chat' | 'search' | 'summary';

interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  tags: string[];
}

// --- Mock Data ---

const INITIAL_ENTRIES: JournalEntry[] = [
  {
    id: '1',
    date: '2023年10月24日',
    title: '第四季度策略脑暴',
    content: '探索下个月产品发布的新增长渠道。需要考虑红人合作伙伴关系...',
    tags: ['工作', '策略']
  },
  {
    id: '2',
    date: '2023年10月22日',
    title: '阅读清单：《代码整洁之道》',
    content: '读完了前三章。对有意义命名的强调是我在目前的重构中可以立即应用的...',
    tags: ['学习']
  },
  {
    id: '3',
    date: '2023年10月20日',
    title: '每日反思',
    content: '今天感觉效率很高。早起习惯开始养成了。期待周末的徒步旅行...',
    tags: ['个人', '习惯']
  },
  {
    id: '4',
    date: '2023年10月18日',
    title: '应用架构笔记',
    content: '考虑迁移到 Serverless 后端以获得更好的扩展性。需要研究冷启动优化...',
    tags: ['技术']
  }
];

// --- Components ---

const Sidebar = ({ currentView, setView }: { currentView: View, setView: (v: View) => void }) => {
  const navItems = [
    { id: 'journal', label: '日志', icon: Book },
    { id: 'chat', label: 'AI 聊天', icon: MessageSquare },
    { id: 'search', label: '语义搜索', icon: Search },
    { id: 'summary', label: '每周总结', icon: BarChart3 },
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
              <p className="text-xs font-semibold truncate text-slate-900">Alex Rivera</p>
              <p className="text-[10px] text-slate-500">专业版方案</p>
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

const JournalView = () => {
  const [entries] = useState<JournalEntry[]>(INITIAL_ENTRIES);
  const [tags, setTags] = useState(['反思', '灵感']);

  return (
    <div className="flex-1 flex overflow-hidden">
      <section className="flex-1 flex flex-col h-full bg-white border-r border-slate-100">
        <header className="h-16 border-b border-slate-100 flex items-center justify-between px-8">
          <div className="flex items-center gap-4 text-slate-400">
            <Bold size={18} className="cursor-pointer hover:text-indigo-600 transition-colors" />
            <Italic size={18} className="cursor-pointer hover:text-indigo-600 transition-colors" />
            <List size={18} className="cursor-pointer hover:text-indigo-600 transition-colors" />
            <LinkIcon size={18} className="cursor-pointer hover:text-indigo-600 transition-colors" />
            <ImageIcon size={18} className="cursor-pointer hover:text-indigo-600 transition-colors" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded">2分钟前已自动保存</span>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto px-12 py-10 max-w-4xl mx-auto w-full">
          <input 
            className="w-full text-4xl font-black border-none focus:ring-0 placeholder:text-slate-200 mb-8 bg-transparent text-slate-900" 
            placeholder="未命名条目" 
            type="text"
          />
          <textarea 
            className="w-full flex-1 min-h-[400px] text-lg leading-relaxed border-none focus:ring-0 resize-none placeholder:text-slate-300 bg-transparent text-slate-700" 
            placeholder="开始记录您的想法... (支持 Markdown)"
          ></textarea>
        </div>

        <footer className="p-6 border-t border-slate-100 bg-slate-50/50">
          <div className="max-w-4xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-400"><Target size={18} /></span>
              <div className="flex gap-2">
                {tags.map(tag => (
                  <span key={tag} className="bg-indigo-50 text-indigo-600 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1 border border-indigo-100">
                    #{tag}
                    <X size={12} className="cursor-pointer" onClick={() => setTags(tags.filter(t => t !== tag))} />
                  </span>
                ))}
                <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                  <PlusCircle size={18} />
                </button>
              </div>
            </div>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center gap-2">
              <CheckCircle2 size={20} />
              保存条目
            </button>
          </div>
        </footer>
      </section>

      <section className="w-80 flex-shrink-0 flex flex-col bg-slate-50 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">最近条目</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {entries.map(entry => (
            <div key={entry.id} className="group relative bg-white p-4 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{entry.date}</span>
                <div className="opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity">
                  <Edit size={14} className="text-slate-400 hover:text-indigo-600" />
                  <Trash2 size={14} className="text-slate-400 hover:text-red-500" />
                </div>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">{entry.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">{entry.content}</p>
              <div className="flex gap-1">
                {entry.tags.map(tag => (
                  <span key={tag} className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">#{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const SummaryView = () => {
  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-slate-50">
      <header className="sticky top-0 z-10 flex items-center justify-between px-8 py-4 bg-slate-50/80 backdrop-blur-md border-b border-indigo-100/20">
        <div className="flex flex-col">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">周度回顾</h2>
          <p className="text-sm text-slate-500">2023年10月21日 - 10月27日</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">
            <Activity size={18} />
            <span>生成新总结</span>
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
            <article className="max-w-none">
              <div className="space-y-8 text-slate-700 leading-relaxed">
                <section>
                  <h4 className="text-indigo-600 font-bold text-lg mb-3 flex items-center gap-2">
                    <Target size={20} />
                    核心关注与项目
                  </h4>
                  <p className="mb-4">
                    本周的认知负荷主要集中在 <strong>“项目 X”</strong> 和高层架构规划上。你投入了约 15 小时进行专注执行，早间时段的生产力有明显峰值。
                  </p>
                  <ul className="list-disc pl-5 space-y-2 marker:text-indigo-600">
                    <li><strong>深度工作时段：</strong> 本周你进入了 4 次心流状态，主要集中在上午 8:00 到 11:00 之间。</li>
                    <li><strong>问题解决：</strong> 周三在解决周二记录中提到的可扩展性问题上取得了突破。</li>
                    <li><strong>协作情况：</strong> 社交消耗记录极低；互动被归类为高价值且具有建设性。</li>
                  </ul>
                </section>

                <section>
                  <h4 className="text-indigo-600 font-bold text-lg mb-3 flex items-center gap-2">
                    <Lightbulb size={20} />
                    求知好奇心
                  </h4>
                  <p className="mb-4">
                    你的外部数据输入（书签和剪藏）显示出向 <strong>神经可塑性</strong> 和 <strong>AI 伦理</strong> 的强烈转向。这与你扩展跨学科知识的目标相一致。
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-lg border-l-4 border-indigo-600">
                      <p className="text-sm italic font-medium">“人类记忆与数字卸载的交汇点是个人成长的下一个前沿。”</p>
                      <p className="text-xs text-slate-500 mt-2">— 摘自周四的反思笔记</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg border-l-4 border-indigo-600">
                      <p className="text-sm italic font-medium">“我们不需要更快的电脑；我们需要更好的电脑交互接口。”</p>
                      <p className="text-xs text-slate-500 mt-2">— 剪藏文章的情感倾向</p>
                    </div>
                  </div>
                </section>

                <div className="bg-indigo-50/50 p-6 rounded-xl border border-indigo-100 mt-12">
                  <h4 className="text-indigo-600 font-bold text-lg mb-4 flex items-center gap-2">
                    <Lightbulb size={20} />
                    下周行动建议
                  </h4>
                  <div className="space-y-4">
                    {[
                      "数字边界：你的晚间反思表明深夜面对屏幕影响了次日的专注力。考虑将“无手机”窗口提前至晚上 8:30。",
                      "精力管理：既然早晨是你的精力高峰期，请将行政事务安排在下午 3:00 之后，以最大化认知吞吐量。",
                      "知识综合：你收集了 8 篇关于 AI 伦理的文章但尚未撰写总结。请在周二安排 30 分钟的“综合 session”。"
                    ].map((text, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="size-8 rounded-full bg-indigo-600 text-white flex shrink-0 items-center justify-center font-bold text-sm">{i+1}</div>
                        <p className="text-sm">{text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>

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
          </div>
        </section>
      </div>
    </div>
  );
};

const ChatView = () => {
  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="w-80 flex-shrink-0 border-r border-indigo-100/20 bg-white/50 flex flex-col">
        <div className="p-4 border-b border-indigo-100/10">
          <button className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all shadow-lg shadow-indigo-100">
            <PlusCircle size={18} />
            <span>开启新对话</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">最近对话</div>
          <div className="group flex items-center gap-3 px-3 py-4 bg-white rounded-xl border border-indigo-600/20 shadow-sm cursor-pointer relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600"></div>
            <MessageSquare size={18} className="text-indigo-600" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-slate-900">探索本地优先技术</p>
              <p className="text-xs text-slate-400 mt-1">2 天前</p>
            </div>
          </div>
          {['每周总结构思', '凤凰项目路线图', '菠菜晚餐食谱'].map((chat, i) => (
            <div key={i} className="group flex items-center gap-3 px-3 py-4 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer">
              <MessageSquare size={18} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-slate-700">{chat}</p>
                <p className="text-xs text-slate-400 mt-1">{i + 5} 天前</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-white relative">
        <header className="h-16 flex-shrink-0 flex items-center justify-between px-6 border-b border-indigo-100/10">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-slate-800">探索本地优先技术</h1>
            <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">活跃</span>
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
          <div className="flex gap-4 max-w-4xl mx-auto">
            <div className="size-8 rounded-lg bg-indigo-50 flex flex-shrink-0 items-center justify-center text-indigo-600">
              <Bot size={20} />
            </div>
            <div className="flex-1 space-y-4">
              <div className="bg-slate-50 p-5 rounded-2xl rounded-tl-none border border-indigo-100/10 shadow-sm">
                <p className="leading-relaxed text-slate-700">你好！我一直在分析你最近关于本地优先（local-first）开发的笔记。你特别提到了对 <strong>CRDTs</strong> 和 <strong>Automerge</strong> 的兴趣。今天你想如何深入探讨这些内容？</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 max-w-4xl mx-auto flex-row-reverse">
            <div className="size-8 rounded-lg bg-indigo-600 flex flex-shrink-0 items-center justify-center text-white">
              <User size={20} />
            </div>
            <div className="flex-1 flex flex-col items-end space-y-1">
              <div className="bg-indigo-600 text-white p-5 rounded-2xl rounded-tr-none shadow-md max-w-[80%]">
                <p className="leading-relaxed">我很好奇如何实现一个协作式的 Markdown 编辑器。你能根据本地优先原则给我一个高层级的技术栈建议吗？</p>
              </div>
              <span className="text-[10px] text-slate-400 px-2 uppercase font-bold tracking-widest">已送达</span>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-indigo-100/10 bg-white/80 backdrop-blur-md">
          <div className="max-w-4xl mx-auto relative group">
            <textarea 
              className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-5 pr-16 focus:ring-2 focus:ring-indigo-100 resize-none transition-all placeholder-slate-400 min-h-[56px] text-slate-700" 
              placeholder="向你的大脑提问..." 
              rows={1}
            ></textarea>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors rounded-lg">
                <Paperclip size={20} />
              </button>
              <button className="bg-indigo-600 text-white size-10 rounded-xl flex items-center justify-center hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-transform active:scale-95">
                <Send size={20} />
              </button>
            </div>
          </div>
          <div className="mt-3 flex justify-center">
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.15em] font-medium">Shift + Enter 换行 • AI 可能会提供不准确的信息</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const SearchView = () => {
  return (
    <div className="flex-1 flex overflow-hidden">
      <main className="flex-1 overflow-y-auto bg-slate-50">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <header className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">语义搜索</h2>
            <p className="text-slate-500">使用自然语言检索你数字生活中的任何点滴。</p>
          </header>

          <div className="relative group mb-12">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search size={24} className="text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            </div>
            <input 
              className="block w-full pl-14 pr-24 py-5 text-lg bg-white border-none rounded-2xl shadow-xl shadow-indigo-100/20 focus:ring-2 focus:ring-indigo-600 text-slate-900 placeholder-slate-400" 
              placeholder="搜索你的记忆..." 
              type="text" 
              defaultValue="语义搜索在产品策略中的重要性"
            />
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
              <button className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
                搜索
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">最佳匹配结果 (3)</h3>
              <div className="flex gap-2 items-center text-slate-400">
                <span className="text-xs font-medium">排序方式: 相关度</span>
                <MoreVertical size={14} />
              </div>
            </div>

            {[
              {
                type: '笔记',
                date: '2023年10月24日',
                title: 'Alpha 项目策略会议',
                relevance: '98%',
                content: '...讨论了新模块中 语义搜索 和 知识图谱 的重要性。我们需要一个优先考虑用户上下文而非简单关键字匹配的 产品策略...',
                tags: ['人工智能', '策略', '产品']
              },
              {
                type: '文章',
                date: '2023年9月12日',
                title: '向量数据库的未来',
                relevance: '92%',
                content: '...扩展 语义搜索 需要高效的向量索引。该 策略 涉及从传统 SQL 查询转向能够捕捉细微差别的嵌入向量...',
                tags: ['工程', '向量数据库']
              }
            ].map((result, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:border-indigo-600/30 transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">{result.type}</span>
                      <span className="text-xs text-slate-400 font-medium">{result.date}</span>
                    </div>
                    <h4 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{result.title}</h4>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-xs font-bold text-emerald-600">{result.relevance} 相关度</span>
                  </div>
                </div>
                <div className="text-slate-600 leading-relaxed mb-6">
                  {result.content.split(/(语义搜索|知识图谱|产品策略|策略)/).map((part, j) => 
                    ['语义搜索', '知识图谱', '产品策略', '策略'].includes(part) 
                      ? <span key={j} className="bg-indigo-50 text-indigo-600 font-semibold px-1 rounded">{part}</span>
                      : part
                  )}
                </div>
                <div className="flex flex-wrap gap-2 items-center justify-between">
                  <div className="flex gap-2">
                    {result.tags.map(tag => (
                      <span key={tag} className="bg-slate-100 px-3 py-1 rounded-lg text-xs font-medium text-slate-600">#{tag}</span>
                    ))}
                  </div>
                  <button className="flex items-center gap-1 text-indigo-600 text-sm font-bold hover:underline">
                    打开{result.type}
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <div className="w-80 flex-shrink-0 border-l border-slate-200 bg-white hidden xl:flex flex-col p-6">
        <h3 className="text-sm font-bold text-slate-900 mb-4">语义上下文</h3>
        <div className="space-y-4">
          <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/20">
            <h4 className="text-xs font-bold text-indigo-600 uppercase mb-2">优化查询中</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              AI 正在您的工作区文档、笔记和通信中重点搜索“产品策略”和“搜索技术”。
            </p>
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-3">建议过滤器</h4>
            <div className="flex flex-wrap gap-2">
              {['最近 30 天', '仅限 PDF', '来自 Slack', '草稿'].map(f => (
                <button key={f} className="bg-slate-100 text-slate-600 text-xs px-3 py-1.5 rounded-lg border border-transparent hover:border-indigo-600/30">{f}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState<View>('journal');

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans antialiased text-slate-900">
      <Sidebar currentView={view} setView={setView} />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex overflow-hidden"
          >
            {view === 'journal' && <JournalView />}
            {view === 'chat' && <ChatView />}
            {view === 'search' && <SearchView />}
            {view === 'summary' && <SummaryView />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
