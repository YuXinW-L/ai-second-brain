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
