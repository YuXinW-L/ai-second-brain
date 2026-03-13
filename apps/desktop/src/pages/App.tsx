import { FormEvent, useEffect, useState } from "react";
import {
  API_BASE,
  createJournalEntry,
  listJournalEntries,
  type JournalEntry,
} from "../lib/api/backend";

export function App() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");

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

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h2 style={{ margin: 0 }}>AI Second Brain</h2>
      <p style={{ color: "#555" }}>
        本地优先的第二大脑：日记、长期记忆 + 本地 AI。
      </p>

      <div style={{ marginBottom: 16, fontSize: 12, color: "#666" }}>
        后端地址（固定）：<code>{API_BASE}</code>
      </div>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1.5fr)",
          gap: 24,
          alignItems: "flex-start",
        }}
      >
        {/* 左侧：新日记表单 */}
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

        {/* 右侧：日记列表 */}
        <div>
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
                  <p
                    style={{
                      margin: 0,
                      fontSize: 14,
                      color: "#374151",
                      whiteSpace: "pre-wrap",
                      maxHeight: 160,
                      overflow: "hidden",
                    }}
                  >
                    {e.content}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}