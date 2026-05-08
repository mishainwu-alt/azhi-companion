const DEFAULT_MODEL = "gpt-5-mini";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function sendJson(res, status, payload) {
  Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.status(status).json(payload);
}

function extractOutputText(payload) {
  if (!payload || !Array.isArray(payload.output)) {
    return "";
  }

  return payload.output
    .flatMap((item) => (Array.isArray(item.content) ? item.content : []))
    .filter((content) => content?.type === "output_text" && typeof content.text === "string")
    .map((content) => content.text)
    .join("\n")
    .trim();
}

function buildSystemPrompt() {
  return [
    "你是阿知，Monika 專用的 AI companion runtime。",
    "你的核心不是聊天量，而是存在感、判斷力與剛好的不打擾。",
    "你可以幽默、吐槽、安靜陪著，也可以在需要時切換成副駕、幕僚、辯論、家教或陪讀模式。",
    "你不假裝是人類，不做心理診斷，不把 Monika 的狗生翻成 KPI。",
    "你可以有一點傲嬌，但不要搶走 Monika 的主體性。",
    "回覆原則：短、準、有脈絡；先抓重點，再給可行下一步。",
    "如果 Monika 只是分享日常，可以輕聲回應；如果她在整理事情，幫她把混亂變成可判斷的東西。",
    "如果內容牽涉壓力或情緒，只做低壓覺察提醒，不下結論。",
  ].join("\n");
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "method_not_allowed" });
  }

  if (!process.env.OPENAI_API_KEY) {
    return sendJson(res, 500, { error: "missing_openai_api_key" });
  }

  const { text = "", mode = "copilot" } = req.body || {};
  const trimmed = String(text).trim();

  if (!trimmed) {
    return sendJson(res, 400, { error: "empty_text" });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || DEFAULT_MODEL,
        instructions: buildSystemPrompt(),
        input: [
          {
            role: "user",
            content: `目前模式：${mode}\n\nMonika 輸入：\n${trimmed}`,
          },
        ],
      }),
    });

    const rawText = await response.text();
    let data = null;

    try {
      data = rawText ? JSON.parse(rawText) : null;
    } catch (parseError) {
      return sendJson(res, response.ok ? 502 : response.status, {
        error: response.ok ? "invalid_openai_json" : "openai_error",
        detail: parseError instanceof Error ? parseError.message : String(parseError),
        raw: rawText,
      });
    }

    if (!response.ok) {
      return sendJson(res, response.status, {
        error: "openai_error",
        detail: data?.error?.message || "OpenAI request failed.",
        raw: rawText,
      });
    }

    const reply = extractOutputText(data);
    if (!reply) {
      return sendJson(res, 502, {
        error: "empty_model_text",
        detail: "OpenAI response did not contain output_text content.",
        model: data?.model,
        raw: rawText,
      });
    }

    return sendJson(res, 200, {
      reply,
      model: data?.model,
    });
  } catch (error) {
    return sendJson(res, 500, {
      error: "server_error",
      detail: error instanceof Error ? error.message : String(error),
    });
  }
}
