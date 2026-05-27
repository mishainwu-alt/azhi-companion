const AZHI_DIARY_ENGINE_FOLDER_ID = "19NYQSlVPUz5ACLpzWZOVLjdZ0jFgHMYL";
const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";

export default async function handler(req, res) {
  setCorsHeaders(req, res);
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "這個入口只收 Diary 草稿。" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const draft = sanitizeDraft(body);
    const token = await getAccessToken();
    const existing = await findExistingDraft(token, draft.idempotencyKey);

    if (existing) {
      return res.status(200).json({
        ok: true,
        duplicate: true,
        fileId: existing.id,
        fileName: existing.name,
        message: "已保存到 Azhi-Diary_Engine。",
      });
    }

    const created = await createMarkdownFile(token, draft);
    return res.status(200).json({
      ok: true,
      duplicate: false,
      fileId: created.id,
      fileName: created.name,
      message: "已保存到 Azhi-Diary_Engine。",
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      ok: false,
      message: error.publicMessage || "港口這次沒有成功收下，但草稿還在。",
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
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function sanitizeDraft(body) {
  if (body.targetKey !== "azhiDiaryEngine") {
    throw httpError(400, "Unsupported target.", "這條水管目前只通往 Azhi-Diary_Engine。");
  }

  const title = cleanFileName(body.title || "");
  const markdown = String(body.markdown || "").trim();
  const idempotencyKey = String(body.idempotencyKey || "").trim();

  if (!title || !markdown || !idempotencyKey) {
    throw httpError(400, "Missing draft fields.", "草稿還缺一點資料，先不要送出。");
  }

  return {
    title,
    markdown,
    idempotencyKey,
    folderId: AZHI_DIARY_ENGINE_FOLDER_ID,
  };
}

function cleanFileName(value) {
  return String(value)
    .replace(/[\\/:*?"<>|]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 140);
}

async function getAccessToken() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw httpError(500, "Missing OAuth credentials.", "Drive 憑證尚未設定，草稿還沒寫入。");
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
    throw httpError(response.status || 500, "Google token exchange failed.", "港口這次沒有成功收下，但草稿還在。");
  }

  return data.access_token;
}

async function findExistingDraft(token, idempotencyKey) {
  const query = [
    `'${AZHI_DIARY_ENGINE_FOLDER_ID}' in parents`,
    "trashed = false",
    `appProperties has { key='azhiDraftId' and value='${escapeDriveQueryValue(idempotencyKey)}' }`,
  ].join(" and ");
  const url = new URL("https://www.googleapis.com/drive/v3/files");
  url.searchParams.set("q", query);
  url.searchParams.set("fields", "files(id,name)");
  url.searchParams.set("pageSize", "1");
  url.searchParams.set("spaces", "drive");

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw httpError(response.status, "Drive duplicate lookup failed.", "港口這次沒有成功收下，但草稿還在。");
  }
  return data.files?.[0] || null;
}

async function createMarkdownFile(token, draft) {
  const metadata = {
    name: `${draft.title}.md`,
    mimeType: "text/markdown",
    parents: [draft.folderId],
    appProperties: {
      azhiDraftId: draft.idempotencyKey,
      azhiTarget: "azhiDiaryEngine",
      azhiScope: DRIVE_SCOPE,
    },
  };
  const boundary = `azhi_${Date.now()}`;
  const body = [
    `--${boundary}`,
    "Content-Type: application/json; charset=UTF-8",
    "",
    JSON.stringify(metadata),
    `--${boundary}`,
    "Content-Type: text/markdown; charset=UTF-8",
    "",
    draft.markdown,
    `--${boundary}--`,
    "",
  ].join("\r\n");

  const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": `multipart/related; boundary=${boundary}`,
    },
    body,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw httpError(response.status, "Drive upload failed.", "港口這次沒有成功收下，但草稿還在。");
  }
  return data;
}

function escapeDriveQueryValue(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function httpError(statusCode, message, publicMessage) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.publicMessage = publicMessage;
  return error;
}
