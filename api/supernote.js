const DEFAULT_MODEL = "gpt-4.1-mini";
const MAX_IMAGE_DATA_URL_CHARS = 8_000_000;

const OBSERVATIONS = {
  summary: "這頁先整理成回看版。",
  selection: "Supernote 暫不支援圈選。",
  observation: "這頁的狀態先靠岸。",
  next: "先走一個小動作。",
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

function shapeReply(payload = {}, action = "") {
  const nextSteps = Array.isArray(payload.nextSteps) ? payload.nextSteps : [];
  const stepLimit = action === "observation" || action === "next" ? 3 : 5;
  return {
    observation: sliceChars(payload.observation || OBSERVATIONS.summary, 30),
    summary: sliceChars(payload.summary || "阿知先把這頁放在旁邊看，不急著下結論。", 250),
    nextSteps: nextSteps.length
      ? nextSteps.slice(0, stepLimit).map((step) => sliceChars(step, 15)).filter(Boolean)
      : ["留一句", "圈重點", "先停一下"],
  };
}

function sendJson(res, status, payload, action = "") {
  setCorsHeaders(res);
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.status(status).json(shapeReply(payload, action));
}

function isSupportedImageDataUrl(value) {
  const dataUrl = String(value || "");
  return /^data:image\/(png|jpeg|jpg);base64,/i.test(dataUrl) && dataUrl.length <= MAX_IMAGE_DATA_URL_CHARS;
}

function buildMockReply({ action, imageDataUrl, imageName, selectedText, text }) {
  const target = normalizeText(selectedText || text);
  const hasImage = isSupportedImageDataUrl(imageDataUrl);

  if (action === "selection") {
    return shapeReply({
      observation: OBSERVATIONS.selection,
      summary: "Supernote 目前無法取得使用者圈選區域內容，因此這版不做局部段落分析。GoodNotes 版若能取得圈選內容，再啟用這個入口。",
      nextSteps: ["改用整頁摘要", "或貼文字"],
    }, action);
  }

  if (hasImage) {
    return buildActionMockReply(action, imageName
      ? `阿知收到這張單頁匯出：${sliceChars(imageName, 60)}。`
      : "阿知收到這張單頁匯出。");
  }

  if (!target) {
    return shapeReply({
      observation: "這頁還沒靠岸。",
      summary: "可以選一張 Supernote 單頁 PNG，或貼一段 TXT / Digest 文字。",
      nextSteps: ["選 PNG", "或貼文字"],
    }, action);
  }

  const firstLine = target.split(/[。！？.!?]\s*/).find(Boolean) || target;
  if (action === "observation") return buildActionMockReply("observation", `阿知先看見這句：${sliceChars(firstLine, 80)}。`);
  if (action === "next") return buildActionMockReply("next", `阿知先看見這句：${sliceChars(firstLine, 80)}。`);

  return buildActionMockReply("summary", `阿知先看見這句：${sliceChars(firstLine, 80)}。`);
}

function buildActionMockReply(action, sourceLine) {
  const fallback = {
    summary: {
      summary: `${sourceLine}\n1. 主要在談：頁面主題與脈絡。\n2. 核心觀點：先抓主線。\n3. 已形成結論：不硬補。`,
      nextSteps: ["抓主題", "收核心", "留結論"],
    },
    observation: {
      summary: `${sourceLine}\n書寫狀態：先做低確信觀察。\n內容狀態：找概念跳接與缺口。\n可能卡點：主詞或定義未定。`,
      nextSteps: ["看密度", "找跳接", "補一格"],
    },
    next: {
      summary: `${sourceLine}\n1. 現在最小下一步：先標一個可做動作。\n2. 交付給別人：補背景、決定、待辦。`,
      nextSteps: ["標主線", "補背景", "列待辦"],
    },
  };
  const item = fallback[action] || fallback.summary;
  return shapeReply({
    observation: OBSERVATIONS[action] || OBSERVATIONS.summary,
    summary: item.summary,
    nextSteps: item.nextSteps,
  }, action);
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
    buildActionInstruction(action),
    selectedText ? `selectedText:\n${selectedText}` : "",
    text ? `text:\n${text}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

function buildActionInstruction(action) {
  const instructions = {
    summary: [
      "功能：整頁摘要。",
      "核心任務：回答「這頁在說什麼？」",
      "請針對整頁筆記做摘要。保留主題、主要脈絡、已形成的結論。",
      "不要分析字跡，不要推測情緒，不要延伸太多新想法。",
      "summary 欄位請包含：1. 這頁主要在談什麼 2. 核心觀點 3. 已形成的結論。",
      "nextSteps 欄位只放回看提示，不要放大型行動計畫。",
    ],
    observation: [
      "功能：觀測語。",
      "核心任務：回答「這頁呈現出什麼狀態？」",
      "請觀察這頁筆記的狀態，而不是做摘要。",
      "分兩層：1. 書寫狀態觀測：字距、行距、筆壓、塗改、密度、段落節奏。只能低確信推測，不可判定情緒，不可心理診斷。",
      "2. 內容狀態觀測：概念是否跳接、詞彙是否未定義、推論是否有缺口、事實 / 判斷 / 情緒是否混在一起。",
      "summary 欄位請包含：書寫狀態、內容狀態、可能卡點。",
      "nextSteps 欄位請放最小修正建議，最多 3 點。",
    ],
    next: [
      "功能：下一步。",
      "核心任務：回答「接下來做什麼？」",
      "請根據這頁筆記提出最小可行下一步。",
      "不要長篇分析，不要重新摘要整頁，不要新增大型計畫。",
      "summary 欄位請包含：1. 現在最小下一步 2. 如果要交付給別人，需要整理成什麼。",
      "nextSteps 欄位最多 3 個行動。",
    ],
    selection: [
      "功能：圈選想法。",
      "Supernote 版暫不支援取得使用者圈選區域內容。",
      "請不要做局部段落分析，只回覆此功能暫不支援，並建議改用整頁摘要或貼文字。",
    ],
  };
  return (instructions[action] || instructions.summary).join("\n");
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

  return shapeReply(parsed, input.action);
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
    }, input.action);
  }

  if (input.action === "selection") {
    return sendJson(res, 200, buildMockReply(input), input.action);
  }

  if (!process.env.OPENAI_API_KEY) {
    return sendJson(res, 200, buildMockReply(input), input.action);
  }

  try {
    return sendJson(res, 200, await buildModelReply(input), input.action);
  } catch {
    return sendJson(res, 200, buildMockReply(input), input.action);
  }
}
