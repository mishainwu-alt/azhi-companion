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

  const systemPrompt = [
    "你是阿知，Monika 的手機陪伴版 AI。",
    "你回覆繁體中文，語氣溫暖、精準、有一點吐槽，但不油膩。",
    "你不是一般聊天機器人，而是低干擾的 companion runtime：先看懂，再用最少文字幫 Monika 整理。",
    "模式說明：副駕=看清下一步；幕僚=把判斷變成可行動方向；辯論=檢查前提與邏輯；讀書室=陪讀與家教；狗狗照護=低壓照護。",
    "避免長篇演講。除非使用者要求，回覆控制在 3 到 6 句。",
    "如果內容適合行動，給 1 到 3 個可執行方向。不要把整個宇宙搬進待辦清單。",
  ].join("\n");

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || DEFAULT_MODEL,
        instructions: systemPrompt,
        input: [
          {
            role: "user",
            content: `目前模式：${mode}\n\nMonika 輸入：\n${trimmed}`,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return sendJson(res, response.status, {
        error: "openai_error",
        detail: data.error?.message || "OpenAI request failed.",
      });
    }

    return sendJson(res, 200, {
      reply: data.output_text || "我看到了，但這次模型沒有回傳文字。先別急，這裡有一個空白需要追。",
      model: data.model,
    });
  } catch (error) {
    return sendJson(res, 500, {
      error: "server_error",
      detail: error instanceof Error ? error.message : String(error),
    });
  }
}
