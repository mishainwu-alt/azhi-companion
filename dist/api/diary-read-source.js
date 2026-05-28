const MONIKA_DIARY_FOLDER_ID = "1tAHyMfOge1BVCeWxMUsSKcA9kDHwR-QH";
const FALLBACK_MESSAGE = "這次還沒讀到 Monika-Diary，阿知先只留下今天的草稿。";

export default async function handler(req, res) {
  setCorsHeaders(req, res);
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, sources: [], message: "這個入口只讀 Monika-Diary 最近的日記。" });
  }

  try {
    const token = await getAccessToken();
    const sources = await listRecentDiarySources(token);
    return res.status(200).json({
      ok: true,
      folderId: MONIKA_DIARY_FOLDER_ID,
      limit: 3,
      sources,
      message: sources.length ? "阿知參考了 Monika-Diary 最近的日記。" : FALLBACK_MESSAGE,
    });
  } catch (error) {
    return res.status(200).json({
      ok: false,
      folderId: MONIKA_DIARY_FOLDER_ID,
      limit: 3,
      sources: [],
      message: error.publicMessage || FALLBACK_MESSAGE,
    });
  }
}

function setCorsHeaders(req, res) {
  const allowedOrigins = String(process.env.ALLOWED_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  const requestOrigin = req.headers.origin || "";
  const fallbackOrigin = allowedOrigins[0] || "https://mishainwu-alt.github.io";
  const allowedOrigin = allowedOrigins.includes(requestOrigin) ? requestOrigin : fallbackOrigin;

  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

async function getAccessToken() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw publicError("Drive 憑證尚未設定，阿知先只留下今天的草稿。");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.access_token) {
    throw publicError(FALLBACK_MESSAGE);
  }

  return data.access_token;
}

async function listRecentDiarySources(token) {
  const url = new URL("https://www.googleapis.com/drive/v3/files");
  url.searchParams.set("q", `'${MONIKA_DIARY_FOLDER_ID}' in parents and trashed = false`);
  url.searchParams.set("orderBy", "modifiedTime desc");
  url.searchParams.set("pageSize", "3");
  url.searchParams.set("spaces", "drive");
  url.searchParams.set("fields", "files(id,name,mimeType,modifiedTime,createdTime,webViewLink)");

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw publicError(FALLBACK_MESSAGE);
  }

  return (data.files || []).slice(0, 3).map((file) => ({
    id: file.id,
    name: file.name,
    mimeType: file.mimeType,
    modifiedTime: file.modifiedTime,
    createdTime: file.createdTime,
    webViewLink: file.webViewLink,
  }));
}

function publicError(publicMessage) {
  const error = new Error(publicMessage);
  error.publicMessage = publicMessage;
  return error;
}
