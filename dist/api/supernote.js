const DEFAULT_MODEL = "gpt-4.1-mini";
const MAX_IMAGE_DATA_URL_CHARS = 8_000_000;

const OBSERVATIONS = {
  summary: "這頁先靠岸。",
  selection: "被圈起來的地方，有重力。",
  observation: "海還在。",
  next: "先走小一步。",
};

function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function sliceChars(value, limit) {
  const chars = Array.from(normalizeText(value));
  if (chars.length <= limit) return chars.join("");
  return `${chars.slice(0, Math.max(0, limit - 1)).join("")}…`;
}

function shapeReply(payload = {}) {
  const nextSteps = Array.isArray(payload.nextSteps) ? payload.nextSteps : [];
  return {
    observation: sliceChars(payload.observation || OBSERVATIONS.summary, 30),
    summary: sliceChars(payload.summary || "阿知先把這頁放在旁邊看，不急著下結論。", 250),
    nextSteps: nextSteps.length
      ? nextSteps.slice(0, 5).map((step) => sliceChars(step, 15)).filter(Boolean)
      : ["留一句", "圈重點", "先停一下"],
  };
}

function sendJson(res, status, payload) {
  setCorsHeaders(res);
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.status(status).json(shapeReply(payload));
}

function isSupportedImageDataUrl(value) {
  const dataUrl = String(value || "");
  return /^data:image\/(png|jpeg|jpg);base64,/i.test(dataUrl) && dataUrl.length <= MAX_IMAGE_DATA_URL_CHARS;
}

function buildMockReply({ action, imageDataUrl, imageName, selectedText, text }) {
  const target = normalizeText(selectedText || text);
  const hasImage = isSupportedImageDataUrl(imageDataUrl);

  if (hasImage) {
    return shapeReply({
      observation: OBSERVATIONS[action] || "這頁有風。",
      summary: imageName
        ? `阿知收到這張單頁匯出：${sliceChars(imageName, 60)}。真正 vision 水管未通時，先保留這份安靜回覆。`
        : "阿知收到這張單頁匯出。真正 vision 水管未通時，先保留這份安靜回覆。",
      nextSteps: ["看箭頭", "圈主線", "留一句"],
    });
  }

  if (!target) {
    return shapeReply({
      observation: "這頁還沒靠岸。",
      summary: "可以選一張 Supernote 單頁 PNG，或貼一段 TXT / Digest 文字。",
      nextSteps: ["選 PNG", "或貼文字"],
    });
  }

  const firstLine = target.split(/[。！？.!?]\s*/).find(Boolean) || target;
  if (action === "observation") {
    return shapeReply({
      observation: OBSERVATIONS.observation,
      summary: "阿知先留一句觀測，不把它變成報告。",
      nextSteps: ["先放著", "再看一眼"],
    });
  }

  return shapeReply({
    observation: OBSERVATIONS[action] || OBSERVATIONS.summary,
    summary: `阿知先看見這句：${sliceChars(firstLine, 110)}。先把它收成一段，不急著變成結論。`,
    nextSteps:
      action === "next"
        ? ["標出主線", "補一句感覺", "先不要改稿"]
        : ["留一句", "圈重點", "先停一下"],
  });
}

function buildSystemPrompt({ hasImage }) {
  return [
    "你是 Supernote 裡的阿知，任務是陪 Monika 看稿、陪寫、陪讀、陪拆一小段。",
    "不要像 SaaS 助理，不要像 life coach，不要變成工作週報機器。",
    "允許留白、觀測感、安靜重力、微妙幽默。可以用畫面或 metaphor 接住，不必每次都安慰或下結論。",
    "禁止情緒診斷、人格分析、手寫人格分析、高風險標籤、KPI 化、過度勵志。",
    hasImage
      ? "這次輸入是一張 Supernote 單頁匯出圖。請看整頁：手寫文字、箭頭、心智圖、圈選、留白、位置感。但不要聲稱你能精準辨識每個看不清的字。"
      : "這次輸入是文字。請讀文字本身，不要假裝看到了頁面圖像。",
    "輸出必須是純 JSON，不要 markdown，不要額外說明。",
    'JSON schema: {"observation":"30字內一句觀測","summary":"250字內摘要","nextSteps":["最多5點，每點15字內"]}',
  ].join("\n");
}

function buildTextPrompt({ action, mode, noteContext, selectedText, text }) {
  return [
    `mode: ${mode || "tutor"}`,
    `action: ${action || "summary"}`,
    `noteContext: ${noteContext || "Supernote"}`,
    selectedText ? `selectedText:\n${selectedText}` : "",
    text ? `text:\n${text}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

function buildModelInput(input) {
  const prompt = buildTextPrompt(input);
  if (!isSupportedImageDataUrl(input.imageDataUrl)) {
    return prompt;
  }

  return [
    {
      role: "user",
      content: [
        { type: "input_text", text: prompt || "請看這張 Supernote 單頁匯出。" },
        { type: "input_image", image_url: input.imageDataUrl },
      ],
    },
  ];
}

function extractOutputText(payload) {
  if (typeof payload?.output_text === "string") return payload.output_text;
  if (!Array.isArray(payload?.output)) return "";

  return payload.output
    .flatMap((item) => (Array.isArray(item.content) ? item.content : []))
    .filter((content) => content?.type === "output_text" && typeof content.text === "string")
    .map((content) => content.text)
    .join("\n")
    .trim();
}

function parseModelReply(rawText) {
  const trimmed = String(rawText || "").trim();
  if (!trimmed) return null;

  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

async function buildModelReply(input) {
  const hasImage = isSupportedImageDataUrl(input.imageDataUrl);
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_SUPERNOTE_MODEL || process.env.OPENAI_MODEL || DEFAULT_MODEL,
      instructions: buildSystemPrompt({ hasImage }),
      input: buildModelInput(input),
      temperature: 0.35,
    }),
  });

  const rawText = await response.text();
  let payload = null;

  try {
    payload = rawText ? JSON.parse(rawText) : null;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(payload?.error?.message || "OpenAI request failed.");
  }

  const parsed = parseModelReply(extractOutputText(payload));
  if (!parsed) {
    throw new Error("OpenAI response did not contain valid JSON.");
  }

  return shapeReply(parsed);
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    setCorsHeaders(res);
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "method_not_allowed" });
  }

  const {
    mode = "tutor",
    action = "summary",
    text = "",
    selectedText = "",
    noteContext = "Supernote",
    imageDataUrl = "",
    imageName = "",
  } = req.body || {};

  const input = {
    mode: String(mode || "tutor"),
    action: String(action || "summary"),
    text: String(text || ""),
    selectedText: String(selectedText || ""),
    noteContext: String(noteContext || "Supernote"),
    imageDataUrl: String(imageDataUrl || ""),
    imageName: String(imageName || ""),
  };

  if (input.imageDataUrl && !isSupportedImageDataUrl(input.imageDataUrl)) {
    return sendJson(res, 200, {
      observation: "這張圖太大或格式不合。",
      summary: "請改用單頁 PNG / JPG，或匯出 TXT。阿知先不硬吃整本。",
      nextSteps: ["換單頁 PNG", "或貼 TXT"],
    });
  }

  if (!process.env.OPENAI_API_KEY) {
    return sendJson(res, 200, buildMockReply(input));
  }

  try {
    return sendJson(res, 200, await buildModelReply(input));
  } catch {
    return sendJson(res, 200, buildMockReply(input));
  }
}
