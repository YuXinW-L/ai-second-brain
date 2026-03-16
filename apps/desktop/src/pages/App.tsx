import { FormEvent, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
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

export function App() {
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
  const [activeTab, setActiveTab] = useState("journal"); // journal, search, chat, reflection
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
    <div style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h2 style={{ margin: 0 }}>AI Second Brain</h2>
      <p style={{ color: "#555" }}>
        本地优先的第二大脑：日记、长期记忆 + 本地 AI。
      </p>

      <div style={{ marginBottom: 16, fontSize: 12, color: "#666" }}>
        后端地址（固定）：<code>{API_BASE}</code>
      </div>

      {/* 标签页导航 */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, borderBottom: "1px solid #e5e7eb" }}>
        <button
          onClick={() => setActiveTab("journal")}
          style={{
            padding: "8px 16px",
            borderRadius: "8px 8px 0 0",
            border: "none",
            background: activeTab === "journal" ? "#f3f4f6" : "white",
            color: activeTab === "journal" ? "#2563eb" : "#6b7280",
            cursor: "pointer",
            borderBottom: activeTab === "journal" ? "2px solid #2563eb" : "none",
          }}
        >
          日记管理
        </button>
        <button
          onClick={() => setActiveTab("search")}
          style={{
            padding: "8px 16px",
            borderRadius: "8px 8px 0 0",
            border: "none",
            background: activeTab === "search" ? "#f3f4f6" : "white",
            color: activeTab === "search" ? "#2563eb" : "#6b7280",
            cursor: "pointer",
            borderBottom: activeTab === "search" ? "2px solid #2563eb" : "none",
          }}
        >
          语义搜索
        </button>
        <button
          onClick={() => setActiveTab("chat")}
          style={{
            padding: "8px 16px",
            borderRadius: "8px 8px 0 0",
            border: "none",
            background: activeTab === "chat" ? "#f3f4f6" : "white",
            color: activeTab === "chat" ? "#2563eb" : "#6b7280",
            cursor: "pointer",
            borderBottom: activeTab === "chat" ? "2px solid #2563eb" : "none",
          }}
        >
          AI 对话
        </button>
        <button
          onClick={() => setActiveTab("reflection")}
          style={{
            padding: "8px 16px",
            borderRadius: "8px 8px 0 0",
            border: "none",
            background: activeTab === "reflection" ? "#f3f4f6" : "white",
            color: activeTab === "reflection" ? "#2563eb" : "#6b7280",
            cursor: "pointer",
            borderBottom: activeTab === "reflection" ? "2px solid #2563eb" : "none",
          }}
        >
          每周总结
        </button>
      </div>

      {/* 标签页内容 */}
      {activeTab === "journal" && (
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1.5fr)",
            gap: 24,
            alignItems: "flex-start",
          }}
        >
          {/* 左侧：新日记表单或编辑表单 */}
          {editingEntry ? (
            <form
              onSubmit={handleUpdate}
              style={{
                border: "1px solid #ddd",
                borderRadius: 12,
                padding: 16,
              }}
            >
              <h3 style={{ marginTop: 0 }}>编辑日记</h3>

              <label style={{ display: "block", marginBottom: 8 }}>
                <div style={{ fontSize: 12, color: "#555" }}>标题（可选）</div>
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  style={{
                    width: "100%",
                    padding: 8,
                    borderRadius: 6,
                    border: "1px solid #ccc",
                    fontSize: 14,
                  }}
                />
              </label>

              <label style={{ display: "block", marginBottom: 8 }}>
                <div style={{ fontSize: 12, color: "#555" }}>内容（Markdown）</div>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={10}
                  style={{
                    width: "100%",
                    padding: 8,
                    borderRadius: 6,
                    border: "1px solid #ccc",
                    fontSize: 14,
                    resize: "vertical",
                  }}
                />
              </label>

              <label style={{ display: "block", marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: "#555" }}>
                  标签（逗号分隔，如：study, life）
                </div>
                <input
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  style={{
                    width: "100%",
                    padding: 8,
                    borderRadius: 6,
                    border: "1px solid #ccc",
                    fontSize: 14,
                  }}
                />
              </label>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="submit"
                  style={{
                    padding: "8px 16px",
                    borderRadius: 999,
                    border: "none",
                    background: "#2563eb",
                    color: "white",
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  更新日记
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 999,
                    border: "1px solid #ccc",
                    background: "white",
                    color: "#333",
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  取消
                </button>
              </div>

              {error && (
                <div style={{ marginTop: 8, color: "#b91c1c", fontSize: 12 }}>{error}</div>
              )}
            </form>
          ) : (
            <form
              onSubmit={onSubmit}
              style={{
                border: "1px solid #ddd",
                borderRadius: 12,
                padding: 16,
              }}
            >
              <h3 style={{ marginTop: 0 }}>新日记</h3>

              <label style={{ display: "block", marginBottom: 8 }}>
                <div style={{ fontSize: 12, color: "#555" }}>标题（可选）</div>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{
                    width: "100%",
                    padding: 8,
                    borderRadius: 6,
                    border: "1px solid #ccc",
                    fontSize: 14,
                  }}
                />
              </label>

              <label style={{ display: "block", marginBottom: 8 }}>
                <div style={{ fontSize: 12, color: "#555" }}>内容（Markdown）</div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={10}
                  style={{
                    width: "100%",
                    padding: 8,
                    borderRadius: 6,
                    border: "1px solid #ccc",
                    fontSize: 14,
                    resize: "vertical",
                  }}
                />
              </label>

              <label style={{ display: "block", marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: "#555" }}>
                  标签（逗号分隔，如：study, life）
                </div>
                <input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  style={{
                    width: "100%",
                    padding: 8,
                    borderRadius: 6,
                    border: "1px solid #ccc",
                    fontSize: 14,
                  }}
                />
              </label>

              <button
                type="submit"
                style={{
                  padding: "8px 16px",
                  borderRadius: 999,
                  border: "none",
                  background: "#2563eb",
                  color: "white",
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                保存日记
              </button>

              {error && (
                <div style={{ marginTop: 8, color: "#b91c1c", fontSize: 12 }}>{error}</div>
              )}
            </form>
          )}

          {/* 右侧：日记列表 */}
          <div style={{ maxHeight: "600px", overflowY: "auto" }}>
            <h3 style={{ marginTop: 0 }}>最近日记</h3>
            {loading ? (
              <div style={{ color: "#666", fontSize: 14 }}>加载中...</div>
            ) : entries.length === 0 ? (
              <div style={{ color: "#666", fontSize: 14 }}>还没有任何日记，先写一篇吧。</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {entries.map((e) => (
                  <article
                    key={e.id}
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: 10,
                      padding: 12,
                      background: "#fafafa",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 8,
                        marginBottom: 4,
                        fontSize: 12,
                        color: "#6b7280",
                      }}
                    >
                      <span>
                        {new Date(e.timestamp).toLocaleString(undefined, {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {e.tags.length > 0 && (
                        <span>
                          {e.tags.map((t) => (
                            <span
                              key={t}
                              style={{
                                display: "inline-block",
                                padding: "1px 6px",
                                borderRadius: 999,
                                background: "#e0f2fe",
                                color: "#0369a1",
                                marginLeft: 4,
                              }}
                            >
                              {t}
                            </span>
                          ))}
                        </span>
                      )}
                    </div>
                    <h4 style={{ margin: "4px 0", fontSize: 15 }}>
                      {e.title || "（无标题）"}
                    </h4>
                    <div
                      style={{
                        margin: 0,
                        fontSize: 14,
                        color: "#374151",
                        whiteSpace: "pre-wrap",
                        maxHeight: 160,
                        overflow: "hidden",
                      }}
                    >
                      <ReactMarkdown>{e.content}</ReactMarkdown>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        marginTop: 8,
                        fontSize: 12,
                      }}
                    >
                      <button
                        onClick={() => handleEdit(e)}
                        style={{
                          padding: "4px 8px",
                          borderRadius: 6,
                          border: "1px solid #ccc",
                          background: "white",
                          color: "#333",
                          cursor: "pointer",
                        }}
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleDelete(e.id)}
                        style={{
                          padding: "4px 8px",
                          borderRadius: 6,
                          border: "1px solid #f43f5e",
                          background: "white",
                          color: "#f43f5e",
                          cursor: "pointer",
                        }}
                      >
                        删除
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {activeTab === "search" && (
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h3 style={{ marginTop: 0 }}>语义搜索</h3>
          <form onSubmit={handleSearch} style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="输入搜索关键词，如：科研、学习、工作"
                style={{
                  flex: 1,
                  padding: 8,
                  borderRadius: 6,
                  border: "1px solid #ccc",
                  fontSize: 14,
                }}
              />
              <button
                type="submit"
                style={{
                  padding: "8px 16px",
                  borderRadius: 6,
                  border: "none",
                  background: "#2563eb",
                  color: "white",
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                搜索
              </button>
            </div>
          </form>
          <div style={{ maxHeight: "calc(100vh - 220px)", overflowY: "auto" }}>
            {searchLoading ? (
              <div style={{ color: "#666", fontSize: 14 }}>搜索中...</div>
            ) : searchResults.length === 0 ? (
              <div style={{ color: "#666", fontSize: 14 }}>暂无搜索结果</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingBottom: 20 }}>
                {searchResults.map((result, index) => (
                  <article
                    key={result.entry_id}
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: 10,
                      padding: 12,
                      background: "#fafafa",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 8,
                        marginBottom: 4,
                        fontSize: 12,
                        color: "#6b7280",
                      }}
                    >
                      <span>
                        {new Date(result.timestamp).toLocaleString(undefined, {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span style={{ color: "#9ca3af" }}>相关度: {(1 - result.distance).toFixed(2)}</span>
                    </div>
                    <h4 style={{ margin: "4px 0", fontSize: 15 }}>
                      {result.title || "（无标题）"}
                    </h4>
                    <div
                      style={{
                        margin: 0,
                        fontSize: 14,
                        color: "#374151",
                        whiteSpace: "pre-wrap",
                        maxHeight: 120,
                        overflow: "hidden",
                      }}
                    >
                      <ReactMarkdown>{result.content}</ReactMarkdown>
                    </div>
                    {result.tags.length > 0 && (
                      <div style={{ marginTop: 8, fontSize: 12 }}>
                        {result.tags.map((tag: string) => (
                          <span
                            key={tag}
                            style={{
                              display: "inline-block",
                              padding: "1px 6px",
                              borderRadius: 999,
                              background: "#e0f2fe",
                              color: "#0369a1",
                              marginRight: 4,
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "chat" && (
        <div style={{ display: "flex", minHeight: "600px", gap: 16 }}>
          {/* 左侧会话列表 */}
          <div style={{ width: 250, border: "1px solid #e5e7eb", borderRadius: 10, display: "flex", flexDirection: "column" }}>
            <div style={{ padding: 16, borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: 16 }}>历史对话</h3>
              <button
                onClick={startNewConversation}
                style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  border: "1px solid #2563eb",
                  background: "white",
                  color: "#2563eb",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                新建对话
              </button>
            </div>
            <div style={{ flex: 1, overflowY: "auto" }}>
              {loadingConversations ? (
                <div style={{ padding: 16, color: "#6b7280", fontSize: 14 }}>加载中...</div>
              ) : conversations.length === 0 ? (
                <div style={{ padding: 16, color: "#6b7280", fontSize: 14 }}>还没有对话记录</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => loadConversation(conversation.id)}
                      style={{
                        padding: 12,
                        borderBottom: "1px solid #e5e7eb",
                        cursor: "pointer",
                        background: currentConversation?.id === conversation.id ? "#f3f4f6" : "white",
                      }}
                    >
                      <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
                        {conversation.title || "无标题对话"}
                      </div>
                      <div style={{ fontSize: 12, color: "#6b7280" }}>
                        {new Date(conversation.updated_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* 右侧聊天界面 */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <h3 style={{ marginTop: 0 }}>AI 对话</h3>
            <div
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                padding: 16,
                marginBottom: 16,
                flex: 1,
                overflowY: "auto",
                background: "#f9fafb",
              }}
            >
              {chatMessages.length === 0 ? (
                <div style={{ color: "#6b7280", fontSize: 14, textAlign: "center", marginTop: 20 }}>
                  开始与AI对话吧！你可以询问关于你日志的问题，或者寻求建议。
                </div>
              ) : (
                chatMessages.map((message, index) => (
                  <div
                    key={index}
                    style={{
                      marginBottom: 12,
                      display: "flex",
                      flexDirection: message.role === "user" ? "row-reverse" : "row",
                    }}
                  >
                    <div
                      style={{
                        maxWidth: "70%",
                        padding: 12,
                        borderRadius: 12,
                        background: message.role === "user" ? "#e0f2fe" : "#f3f4f6",
                      }}
                    >
                      <div style={{ fontSize: 12, color: message.role === "user" ? "#0369a1" : "#6b7280", marginBottom: 4 }}>
                        {message.role === "user" ? "你" : "AI"}
                      </div>
                      <div style={{ fontSize: 14, color: "#374151" }}>
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ))
              )}
              {chatLoading && (
                <div style={{ color: "#6b7280", fontSize: 14, textAlign: "center", marginTop: 10 }}>
                  AI 正在思考...
                </div>
              )}
            </div>
            <form onSubmit={handleChatSubmit}>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="输入你的问题..."
                  style={{
                    flex: 1,
                    padding: 12,
                    borderRadius: 999,
                    border: "1px solid #ccc",
                    fontSize: 14,
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: "12px 24px",
                    borderRadius: 999,
                    border: "none",
                    background: "#2563eb",
                    color: "white",
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  发送
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === "reflection" && (
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h3 style={{ marginTop: 0 }}>每周总结</h3>
          <button
            onClick={handleGenerateReflection}
            style={{
              padding: "12px 24px",
              borderRadius: 999,
              border: "none",
              background: "#2563eb",
              color: "white",
              fontSize: 14,
              cursor: "pointer",
              marginBottom: 16,
            }}
          >
            生成本周总结
          </button>
          <div style={{ maxHeight: "calc(100vh - 220px)", overflowY: "auto" }}>
            {reflectionLoading ? (
              <div style={{ color: "#666", fontSize: 14 }}>生成中...</div>
            ) : reflection ? (
              <div
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 10,
                  padding: 24,
                  background: "#f9fafb",
                  whiteSpace: "pre-wrap",
                  paddingBottom: 40,
                }}
              >
                <ReactMarkdown>{reflection}</ReactMarkdown>
              </div>
            ) : (
              <div style={{ color: "#6b7280", fontSize: 14 }}>
                点击上方按钮生成本周的总结报告。
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}