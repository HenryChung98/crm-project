"use client";
import { useState } from "react";

export default function TestPage() {
  const [prompt, setPrompt] = useState("");
  const [resp, setResp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResp(null);
    setLoading(true);
    try {
      const r = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!r.ok) throw new Error(`API error ${r.status}`);
      const data = await r.json();
      // API route는 { text: string } 형식으로 반환함
      setResp(data.text ?? JSON.stringify(data));
    } catch (err: any) {
      setError(err.message ?? "Unknown");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-start justify-center p-8">
      <div className="w-full max-w-2xl rounded-2xl shadow p-6">
        <h1 className="text-xl font-semibold mb-4">LLM 통합 테스트</h1>

        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block">
            <div className="text-sm text-gray-600 mb-2">프롬프트</div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={6}
              placeholder="CRM 예: 고객에게 보낼 답장 초안 생성..."
              className="w-full textarea resize-none rounded-md border p-3"
            />
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 rounded-md border hover:opacity-90"
              disabled={loading}
            >
              {loading ? "요청 중..." : "생성 요청"}
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-md border"
              onClick={() => {
                setPrompt("");
                setResp(null);
                setError(null);
              }}
            >
              초기화
            </button>
          </div>
        </form>

        <section className="mt-6">
          <h2 className="text-sm font-medium mb-2">응답</h2>
          <div className="min-h-[120px] p-3 rounded-md border">
            {error && <div className="text-red-600">에러: {error}</div>}
            {!error && loading && <div>생성중...</div>}
            {!error && !loading && resp && <pre className="whitespace-pre-wrap">{resp}</pre>}
            {!error && !loading && !resp && <div className="text-gray-500">아직 응답 없음</div>}
          </div>
        </section>
      </div>
    </main>
  );
}
