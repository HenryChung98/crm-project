import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    if (!prompt) return NextResponse.json({ error: "prompt required" }, { status: 400 });
    const llmUrl = process.env.LLM_SERVER_URL;

    if (llmUrl) {
      // 외부 LLM 서버로 포워딩 (vLLM, llama-server 등)
      const r = await fetch(`${llmUrl.replace(/\/$/, "")}/v1/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          inputs: [{ role: "user", content: prompt }],
          max_new_tokens: 256,
        }),
      });
      if (!r.ok) {
        const text = await r.text();
        return NextResponse.json({ error: "LLM server error", detail: text }, { status: 502 });
      }

      const data = await r.json();
      // 여러 LLM 응답 형식에 대해 안전하게 텍스트를 추출
      const text =
        data.text ??
        data.choices?.[0]?.text ??
        data.completions?.[0]?.data?.[0]?.content ??
        JSON.stringify(data);
      return NextResponse.json({ text });
    }
    // LLM_SERVER_URL이 없으면 로컬 모크(빠른 개발용)
    const mock = `모크 응답: 받은 프롬프트 => ${prompt.slice(0, 500)}`;
    return NextResponse.json({ text: mock });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? String(err) }, { status: 500 });
  }
}
