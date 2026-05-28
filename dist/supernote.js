(function () {
  const noteText = document.getElementById("noteText");
  const noteFile = document.getElementById("noteFile");
  const fileStatus = document.getElementById("fileStatus");
  const observationText = document.getElementById("observationText");
  const summaryText = document.getElementById("summaryText");
  const nextStepsList = document.getElementById("nextStepsList");
  const copyReplyButton = document.getElementById("copyReplyButton");
  const clearReplyButton = document.getElementById("clearReplyButton");

  const endpoint = window.SUPERNOTE_API_ENDPOINT || getDefaultEndpoint();
  let latestReply = null;
  let selectedPage = null;

  function getDefaultEndpoint() {
    if (location.protocol === "file:" || location.hostname.includes("github.io")) {
      return "https://azhi-companion.vercel.app/api/supernote";
    }
    return "/api/supernote";
  }

  function renderNextSteps(steps) {
    nextStepsList.innerHTML = "";
    const safeSteps = Array.isArray(steps) && steps.length ? steps.slice(0, 5) : [];
    safeSteps.forEach((step) => {
      const item = document.createElement("li");
      item.textContent = String(step).slice(0, 24);
      nextStepsList.appendChild(item);
    });
  }

  function setLoading() {
    observationText.textContent = "阿知看一下。";
    summaryText.textContent = "";
    renderNextSteps([]);
  }

  function renderReply(reply) {
    latestReply = {
      observation: reply.observation || "先放著。",
      summary: reply.summary || "",
      nextSteps: Array.isArray(reply.nextSteps) ? reply.nextSteps.slice(0, 5) : [],
    };

    observationText.textContent = latestReply.observation;
    summaryText.textContent = latestReply.summary;
    renderNextSteps(latestReply.nextSteps);
  }

  function fallbackReply(action) {
    const text = noteText.value.trim();
    const firstLine = text.split(/\n+/).find(Boolean) || "";
    const hasImage = selectedPage && selectedPage.kind === "image";
    const pageSource = hasImage ? "這頁先以圖像交給阿知看。" : firstLine ? `我先看見這句：${firstLine.slice(0, 90)}` : "選一張 PNG，或貼一段文字。";

    const observations = {
      summary: "這頁先整理成回看版。",
      selection: "Supernote 暫不支援圈選。",
      observation: "這頁的狀態先靠岸。",
      next: "先走一個小動作。",
    };
    const summaries = {
      summary: `${pageSource}\n\n1. 這頁主要在談什麼：先保留頁面主題。\n2. 核心觀點：等模型水管通時再壓縮。\n3. 已形成的結論：先不硬補。`,
      selection: "Supernote 目前無法取得圈選區域內容，因此這版不做局部段落分析。",
      observation: `${pageSource}\n\n書寫狀態：先不判定。\n內容狀態：等待模型觀測。\n可能卡點：資訊仍在頁面裡。\n最小修正建議：先圈出最想看的地方。`,
      next: `${pageSource}\n\n1. 現在最小下一步：先標一個主線。\n2. 交付前整理：補上對方需要知道的背景。`,
    };
    const steps = {
      summary: ["抓主題", "收核心", "留結論"],
      selection: ["改用整頁", "或貼文字"],
      observation: ["看密度", "找跳接", "補一格"],
      next: ["做一小步", "整理給人"],
    };

    return {
      observation: observations[action] || "先放著。",
      summary: summaries[action] || pageSource,
      nextSteps: steps[action] || ["留一句", "先停一下"],
    };
  }

  function diagnosticReply(action, error, payload) {
    const fallback = fallbackReply(action);
    const imageKb = payload.imageDataUrl
      ? Math.round(payload.imageDataUrl.length / 1024)
      : 0;
    const reason = error && error.message ? error.message : "unknown_error";
    return {
      observation: "水管還沒接上。",
      summary: [
        fallback.summary,
        "",
        `診斷：${reason}`,
        `endpoint: ${endpoint}`,
        imageKb ? `image payload: ${imageKb} KB` : "image payload: none",
      ].join("\n"),
      nextSteps: ["看診斷", "換小圖", "再按一次"],
    };
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(reader.error || new Error("file_read_failed"));
      reader.readAsDataURL(file);
    });
  }

  function fileToText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(reader.error || new Error("file_read_failed"));
      reader.readAsText(file, "utf-8");
    });
  }

  async function readSelectedFile() {
    const file = noteFile.files && noteFile.files[0];
    selectedPage = null;
    if (!file) return;

    const type = file.type || "";
    const lowerName = file.name.toLowerCase();
    const isImage = type.startsWith("image/") || /\.(png|jpe?g)$/.test(lowerName);
    const isText = type.startsWith("text/") || /\.(txt|md)$/.test(lowerName);

    try {
      if (isImage) {
        selectedPage = {
          kind: "image",
          name: file.name,
          mimeType: type || (lowerName.endsWith(".png") ? "image/png" : "image/jpeg"),
          dataUrl: await fileToDataUrl(file),
        };
        fileStatus.textContent = `已選：${file.name}。阿知會看這一頁。`;
        renderReply({
          observation: "這頁已經遞過來了。",
          summary: "PNG / JPG 會送去看整頁：字、箭頭、留白、位置感。",
          nextSteps: ["按整頁摘要", "或只要觀測語"],
        });
        return;
      }

      if (isText) {
        const text = await fileToText(file);
        selectedPage = { kind: "text", name: file.name };
        noteText.value = text.trim();
        fileStatus.textContent = `已讀：${file.name}。阿知會讀文字。`;
        renderReply({
          observation: "文字已經靠岸。",
          summary: "TXT 會直接送去讀，適合長文和作文。",
          nextSteps: ["按整頁摘要", "或看下一步"],
        });
        return;
      }

      fileStatus.textContent = "DOCX 先保留給下一版。這版請用 PNG 或 TXT。";
      renderReply({
        observation: "這份格式先放旁邊。",
        summary: "目前先吃 PNG / JPG / TXT。DOCX 之後交給 server 解析。",
        nextSteps: ["改匯出 PNG", "或匯出 TXT"],
      });
    } catch (error) {
      fileStatus.textContent = "這份檔案暫時讀不到。";
      renderReply({
        observation: "這頁還沒靠岸。",
        summary: "可以改用 Supernote 單頁 PNG，或匯出 TXT 再試一次。",
        nextSteps: ["確認格式", "重新選檔"],
      });
    }
  }

  async function askAzhi(action) {
    if (action === "selection") {
      renderReply(fallbackReply(action));
      return;
    }

    const text = noteText.value.trim();
    if (!text && !selectedPage) {
      renderReply(fallbackReply(action));
      return;
    }

    setLoading();

    const payload = {
      mode: "tutor",
      action,
      text,
      selectedText: action === "selection" ? text : "",
      noteContext: selectedPage?.kind === "image" ? "Supernote PNG" : "Supernote Text",
    };

    if (selectedPage?.kind === "image") {
      payload.imageDataUrl = selectedPage.dataUrl;
      payload.imageName = selectedPage.name;
      payload.imageMimeType = selectedPage.mimeType;
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => {
        throw new Error("response_json_failed");
      });
      if (!response.ok) throw new Error(data.error || response.statusText);
      renderReply(data);
    } catch (error) {
      renderReply(diagnosticReply(action, error, payload));
    }
  }

  function serializeReply() {
    const reply = latestReply || fallbackReply("summary");
    return [
      reply.observation,
      reply.summary,
      ...reply.nextSteps.map((step) => `- ${step}`),
    ]
      .filter(Boolean)
      .join("\n");
  }

  async function copyReply() {
    const text = serializeReply();
    try {
      await navigator.clipboard.writeText(text);
      showCopied();
    } catch (error) {
      if (window.AzhiBridge && typeof window.AzhiBridge.copyText === "function") {
        window.AzhiBridge.copyText(text);
        showCopied();
        return;
      }
      copyReplyButton.textContent = "未複製";
      window.setTimeout(() => {
        copyReplyButton.textContent = "複製";
      }, 1200);
    }
  }

  function showCopied() {
    copyReplyButton.textContent = "已複製";
    window.setTimeout(() => {
      copyReplyButton.textContent = "複製";
    }, 1200);
  }

  function clearReply() {
    latestReply = null;
    selectedPage = null;
    noteFile.value = "";
    noteText.value = "";
    fileStatus.textContent = "PNG 看頁面，TXT 讀文字。";
    observationText.textContent = "阿知回覆留在這裡，不進主筆記區。";
    summaryText.textContent = "";
    renderNextSteps([]);
  }

  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => askAzhi(button.dataset.action));
  });

  noteFile.addEventListener("change", readSelectedFile);
  copyReplyButton.addEventListener("click", copyReply);
  clearReplyButton.addEventListener("click", clearReply);
})();
