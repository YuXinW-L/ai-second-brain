import { FormEvent, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Sidebar from "../components/Sidebar";
import JournalView from "../components/JournalView";
import ChatView from "../components/ChatView";
import SearchView from "../components/SearchView";
import SummaryView from "../components/SummaryView";
import {
  API_BASE,
  createJournalEntry,
  listJournalEntries,
  getJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  semanticSearch,
  chatWithAI,
  generateWeeklyReflection,
  getConversations,
  getConversationHistory,
  createConversation,
  type JournalEntry,
  type Conversation,
  type ChatResponse,
} from "../lib/api/backend";

type View = "journal" | "search" | "chat" | "reflection";

export function App() {
  const [activeTab, setActiveTab] = useState<View>("journal");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");

  // 编辑状态
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editTags, setEditTags] = useState("");

  // AI功能状态
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [reflection, setReflection] = useState("");
  const [reflectionLoading, setReflectionLoading] = useState(false);
  
  // 会话相关状态
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [loadingConversations, setLoadingConversations] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await listJournalEntries();
        setEntries(res.items);
      } catch (e) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 加载会话列表
  useEffect(() => {
    if (activeTab === "chat") {
      loadConversations();
    }
  }, [activeTab]);

  async function loadConversations() {
    try {
      setLoadingConversations(true);
      const res = await getConversations();
      setConversations(res);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoadingConversations(false);
    }
  }

  async function loadConversation(conversationId: string) {
    try {
      setChatLoading(true);
      const history = await getConversationHistory(conversationId);
      setChatMessages(history);
      const conversation = conversations.find(c => c.id === conversationId);
      if (conversation) {
        setCurrentConversation(conversation);
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setChatLoading(false);
    }
  }

  async function startNewConversation() {
    try {
      setChatLoading(true);
      const conversation = await createConversation();
      setCurrentConversation(conversation);
      setChatMessages([]);
      await loadConversations();
    } catch (e) {
      setError(String(e));
    } finally {
      setChatLoading(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      setError(null);
      const nowIso = new Date().toISOString();
      const newEntry = await createJournalEntry({
        timestamp: nowIso,
        title: title.trim(),
        content,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
      setEntries((prev) => [newEntry, ...prev]);
      setTitle("");
      setContent("");
      setTags("");
    } catch (e) {
      setError(String(e));
    }
  }

  async function handleEdit(entry: JournalEntry) {
    setEditingEntry(entry);
    setEditTitle(entry.title);
    setEditContent(entry.content);
    setEditTags(entry.tags.join(", "));
  }

  async function handleUpdate(e: FormEvent) {
    e.preventDefault();
    if (!editingEntry || !editContent.trim()) return;

    try {
      setError(null);
      const updatedEntry = await updateJournalEntry(editingEntry.id, {
        timestamp: editingEntry.timestamp,
        title: editTitle.trim(),
        content: editContent,
        tags: editTags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
      setEntries((prev) => prev.map((e) => e.id === updatedEntry.id ? updatedEntry : e));
      setEditingEntry(null);
      setEditTitle("");
      setEditContent("");
      setEditTags("");
    } catch (e) {
      setError(String(e));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("确定要删除这篇日记吗？")) return;

    try {
      setError(null);
      await deleteJournalEntry(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (e) {
      setError(String(e));
    }
  }

  function handleCancelEdit() {
    setEditingEntry(null);
    setEditTitle("");
    setEditContent("");
    setEditTags("");
  }

  // AI功能处理函数
  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setSearchLoading(true);
      const results = await semanticSearch(searchQuery);
      setSearchResults(results);
    } catch (e) {
      setError(String(e));
    } finally {
      setSearchLoading(false);
    }
  }

  async function handleChatSubmit(e: FormEvent) {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = { role: "user", content: chatInput };
    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");

    try {
      setChatLoading(true);
      const response = await chatWithAI(chatInput, currentConversation?.id);
      const aiMessage = { role: "assistant", content: response.response };
      setChatMessages((prev) => [...prev, aiMessage]);
      
      // 更新当前会话信息
      if (!currentConversation || response.conversation_id !== currentConversation.id) {
        await loadConversations();
        await loadConversation(response.conversation_id);
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setChatLoading(false);
    }
  }

  async function handleGenerateReflection() {
    try {
      setReflectionLoading(true);
      const response = await generateWeeklyReflection();
      setReflection(response.reflection);
    } catch (e) {
      setError(String(e));
    } finally {
      setReflectionLoading(false);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans antialiased text-slate-900">
      <Sidebar currentView={activeTab} setView={setActiveTab} />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex overflow-hidden"
          >
            {activeTab === "journal" && (
              <JournalView
                entries={entries}
                loading={loading}
                error={error}
                title={title}
                setTitle={setTitle}
                content={content}
                setContent={setContent}
                tags={tags}
                setTags={setTags}
                editingEntry={editingEntry}
                setEditingEntry={setEditingEntry}
                editTitle={editTitle}
                setEditTitle={setEditTitle}
                editContent={editContent}
                setEditContent={setEditContent}
                editTags={editTags}
                setEditTags={setEditTags}
                onSubmit={onSubmit}
                handleUpdate={handleUpdate}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                handleCancelEdit={handleCancelEdit}
              />
            )}
            {activeTab === "search" && (
              <SearchView
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                searchResults={searchResults}
                searchLoading={searchLoading}
                error={error}
                handleSearch={handleSearch}
              />
            )}
            {activeTab === "chat" && (
              <ChatView
                conversations={conversations}
                loadingConversations={loadingConversations}
                currentConversation={currentConversation}
                chatMessages={chatMessages}
                chatInput={chatInput}
                setChatInput={setChatInput}
                chatLoading={chatLoading}
                error={error}
                loadConversations={loadConversations}
                loadConversation={loadConversation}
                startNewConversation={startNewConversation}
                handleChatSubmit={handleChatSubmit}
              />
            )}
            {activeTab === "reflection" && (
              <SummaryView
                reflection={reflection}
                reflectionLoading={reflectionLoading}
                error={error}
                handleGenerateReflection={handleGenerateReflection}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
