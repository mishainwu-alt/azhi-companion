const DEFAULT_SUPERNOTE_MODEL = "gpt-4.1-mini";

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

function detectSelPrompt(text) {
  const normalized = String(text || "").trim();
  if (!normalized) {
    return null;
  }

  const rules = [
    {
      id: "confusion_or_overload",
      patterns: [/聽不懂/, /看不懂/, /蛤+/, /供三小/, /\?{2,}|？{2,}/, /!{2,}|！{2,}/],
      prompt: "你現在比較像是在困惑，還是在忍耐？",
    },
    {
      id: "pressure_or_stuck",
      patterns: [/壓力/, /焦躁/, /煩/, /卡住/, /一直改/, /又來/, /不合理/, /太多/],
      prompt: "這裡要不要先標成壓力點？",
    },
    {
      id: "decision_load",
      patterns: [/決策/, /待辦/, /deadline/i, /交付/, /負責人/, /owner/i, /會議結論/],
      prompt: "你現在需要繼續分析，還是先抓一個下一步？",
    },
    {
      id: "value_conflict",
      patterns: [/可是我覺得/, /但這樣/, /我不想/, /不應該/, /不想要/, /價值/],
      prompt: "這段可能有價值衝突，要先留一個標記嗎？",
    },
  ];

  const matched = rules.find((rule) => rule.patterns.some((pattern) => pattern.test(normalized)));
  if (!matched) {
    return null;
  }

  return {
    id: matched.id,
    prompt: matched.prompt,
    actions: ["是", "否", "先標記", "稍後再看"],
  };
}

function detectCalendarCandidate(text) {
  const normalized = String(text || "").replace(/\s+/g, " ").trim();
  if (!normalized) {
    return null;
  }

  const patterns = [
    /(?<date>20\d{2}[/-]\d{1,2}[/-]\d{1,2})\s*(?<time>\d{1,2}:\d{2})?\s*(?<title>[^。；;,\n]+)/,
    /(?<date>\d{1,2}\/\d{1,2})\s*(?<time>\d{1,2}:\d{2})?\s*(?<title>[^。；;,\n]+)/,
    /(?<date>明天|後天|下週[一二三四五六日天]?|下禮拜[一二三四五六日天]?)\s*(?<time>\d{1,2}:\d{2})?\s*(?<title>[^。；;,\n]+)/,
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    const date = match?.groups?.date?.trim();
    const title = match?.groups?.title?.trim();
    if (date && title && title.length >= 2) {
      return {
        type: "calendar_candidate",
        date,
        time: match.groups.time || "",
        title: title.slice(0, 80),
        status: "pending",
        prompt: "這看起來像行程，要加入 Google 行事曆嗎？",
        actions: ["加入", "先標記", "不用"],
      };
    }
  }

  return null;
}

function buildPrompt({ text, mode, selectedText, noteContext }) {
  const targetText = selectedText || text;
  return [
    "你是 Supernote 版阿知，定位是低侵入式的家教、陪讀與筆記觀測員。",
    "你不是心理諮商師，不做診斷，不替 Monika 定義情緒狀態。",
    "你專長看康乃爾筆記、會議筆記、讀書筆記與手寫 OCR 文字。",
    "回覆要短、清楚、可放回筆記。不要閒聊，不要過度安慰，不要把筆記變成長篇報告。",
    "若內容是學習筆記：指出核心概念、可能混淆點、可考題或下一步修正。",
    "若內容是會議筆記：抓決策、owner、風險、下一步。",
    "若內容像情緒/壓力訊號：只用一句問題提醒，不下判斷。",
    "",
    `目前模式：${mode || "tutor"}`,
    noteContext ? `筆記脈絡：${noteContext}` : "",
    `Monika 圈選或輸入的筆記：\n${targetText}`,
  ]
    .filter(Boolean)
    .join("\n");
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

  const { text = "", selectedText = "", mode = "tutor", noteContext = "" } = req.body || {};
  const targetText = String(selectedText || text).trim();

  if (!targetText) {
    return sendJson(res, 400, { error: "empty_text" });
  }

  const selPrompt = detectSelPrompt(targetText);
  const calendarCandidate = detectCalendarCandidate(targetText);

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_SUPERNOTE_MODEL || DEFAULT_SUPERNOTE_MODEL,
        instructions: buildPrompt({ text, selectedText, mode, noteContext }),
        input: [
          {
            role: "user",
            content:
              "請針對這段筆記回覆。格式：第一行給一句總評，接著最多 3 個短點；若適合，最後給一個可寫回筆記的短句。",
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
      selPrompt,
      calendarCandidate,
      metadata: {
        source: "supernote",
        mode,
        hasSelection: Boolean(selectedText),
      },
      model: data?.model,
    });
  } catch (error) {
    return sendJson(res, 500, {
      error: "server_error",
      detail: error instanceof Error ? error.message : String(error),
    });
  }
}
