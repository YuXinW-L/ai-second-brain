// 前端固定调用本地正在运行的 FastAPI 后端。
// 你已经在终端里通过 uvicorn 启动了它：
// uvicorn app.main:app --host 127.0.0.1 --port 8000

export const API_BASE =
  (import.meta as any).env?.VITE_API_BASE?.toString?.() ?? "http://localhost:8010";

export interface JournalEntry {
  id: string;
  timestamp: string;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface SearchResults {
  total: number;
  items: JournalEntry[];
}

export async function listJournalEntries(): Promise<SearchResults> {
  const res = await fetch(`${API_BASE}/api/v1/journal?limit=100`);
  if (!res.ok) {
    throw new Error(`加载日记失败: ${res.status}`);
  }
  return res.json();
}

export async function createJournalEntry(input: {
  timestamp: string;
  title: string;
  content: string;
  tags: string[];
}): Promise<JournalEntry> {
  const res = await fetch(`${API_BASE}/api/v1/journal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`创建日记失败: ${res.status} ${text}`);
  }
  return res.json();
}

export async function getJournalEntry(id: string): Promise<JournalEntry> {
  const res = await fetch(`${API_BASE}/api/v1/journal/${id}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`获取日记失败: ${res.status} ${text}`);
  }
  return res.json();
}

export async function updateJournalEntry(id: string, input: {
  timestamp?: string;
  title?: string;
  content?: string;
  tags?: string[];
}): Promise<JournalEntry> {
  const res = await fetch(`${API_BASE}/api/v1/journal/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`更新日记失败: ${res.status} ${text}`);
  }
  return res.json();
}

export async function deleteJournalEntry(id: string): Promise<JournalEntry> {
  const res = await fetch(`${API_BASE}/api/v1/journal/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`删除日记失败: ${res.status} ${text}`);
  }
  return res.json();
}

export async function semanticSearch(query: string, topK: number = 5): Promise<any[]> {
  const res = await fetch(`${API_BASE}/api/v1/ai/search?query=${encodeURIComponent(query)}&top_k=${topK}`, {
    method: "POST",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`搜索失败: ${res.status} ${text}`);
  }
  return res.json();
}

export interface ChatResponse {
  response: string;
  conversation_id: string;
}

export interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

export async function chatWithAI(message: string, conversationId?: string, history?: any[]): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/api/v1/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, conversation_id: conversationId, history }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`对话失败: ${res.status} ${text}`);
  }
  return res.json();
}

export async function getConversations(): Promise<Conversation[]> {
  const res = await fetch(`${API_BASE}/api/v1/ai/conversations`, {
    method: "GET",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`获取会话列表失败: ${res.status} ${text}`);
  }
  return res.json();
}

export async function getConversationHistory(conversationId: string): Promise<any[]> {
  const res = await fetch(`${API_BASE}/api/v1/ai/conversations/${conversationId}`, {
    method: "GET",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`获取对话历史失败: ${res.status} ${text}`);
  }
  return res.json();
}

export async function createConversation(): Promise<Conversation> {
  const res = await fetch(`${API_BASE}/api/v1/ai/conversations`, {
    method: "POST",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`创建会话失败: ${res.status} ${text}`);
  }
  return res.json();
}

export async function generateWeeklyReflection(): Promise<{ reflection: string }> {
  const res = await fetch(`${API_BASE}/api/v1/ai/weekly-reflection`, {
    method: "GET",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`生成总结失败: ${res.status} ${text}`);
  }
  return res.json();
}
