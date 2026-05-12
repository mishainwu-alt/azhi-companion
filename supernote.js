(function () {
  const canvas = document.getElementById("inkCanvas");
  const context = canvas.getContext("2d");
  const noteDate = document.getElementById("noteDate");
  const noteTopic = document.getElementById("noteTopic");
  const cueText = document.getElementById("cueText");
  const noteText = document.getElementById("noteText");
  const selectedText = document.getElementById("selectedText");
  const modeSelect = document.getElementById("modeSelect");
  const replyText = document.getElementById("replyText");
  const selPrompt = document.getElementById("selPrompt");
  const selPromptText = document.getElementById("selPromptText");
  const calendarPrompt = document.getElementById("calendarPrompt");
  const calendarPromptText = document.getElementById("calendarPromptText");

  const endpoint = window.SUPERNOTE_API_ENDPOINT || getDefaultEndpoint();
  let drawing = false;
  let lastPoint = null;

  function getDefaultEndpoint() {
    if (location.hostname.includes("github.io")) {
      return "https://azhi-companion.vercel.app/api/supernote";
    }
    return "/api/supernote";
  }

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function resizeCanvasForDisplay() {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const snapshot = document.createElement("canvas");
    snapshot.width = canvas.width;
    snapshot.height = canvas.height;
    snapshot.getContext("2d").drawImage(canvas, 0, 0);

    canvas.width = Math.max(Math.floor(rect.width * ratio), 1);
    canvas.height = Math.max(Math.floor(rect.height * ratio), 1);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.lineWidth = 2.4;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = "#171717";
    context.drawImage(snapshot, 0, 0, rect.width, rect.height);
  }

  function pointFromEvent(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  function startDrawing(event) {
    drawing = true;
    lastPoint = pointFromEvent(event);
    canvas.setPointerCapture(event.pointerId);
  }

  function draw(event) {
    if (!drawing || !lastPoint) return;
    const next = pointFromEvent(event);
    context.beginPath();
    context.moveTo(lastPoint.x, lastPoint.y);
    context.lineTo(next.x, next.y);
    context.stroke();
    lastPoint = next;
  }

  function stopDrawing() {
    drawing = false;
    lastPoint = null;
  }

  function clearInk() {
    const rect = canvas.getBoundingClientRect();
    context.clearRect(0, 0, rect.width, rect.height);
  }

  function combinedText() {
    return [noteTopic.value, cueText.value, noteText.value, selectedText.value]
      .filter(Boolean)
      .join("\n");
  }

  function detectLocalSelPrompt(text) {
    const rules = [
      [/供三小|聽不懂|看不懂|到底|離譜|爆炸|煩|卡住|無力|想走|不想開會/, "這段裡有壓力訊號。妳現在比較像是在忍耐，還是在判斷？"],
      [/[!?！？]{2,}|蛤|蛤？|乾|救命/, "妳現在是否感覺到焦躁，還是只是覺得荒謬？"],
      [/待辦|deadline|決策|會議|主管|客戶|衝突|風險|卡關/, "要不要先把這段標記成會議壓力點？"],
    ];
    const match = rules.find(([pattern]) => pattern.test(text));
    return match ? match[1] : "";
  }

  function detectLocalCalendar(text) {
    const match = text.match(/(\d{1,2}[\/.-]\d{1,2}|\d{4}[\/.-]\d{1,2}[\/.-]\d{1,2}|明天|後天|下週[一二三四五六日]?|週[一二三四五六日])(.{0,36})/);
    if (!match) return "";
    return `可能是行事曆事件：${match[0].trim()}。要不要之後接 Google Calendar？`;
  }

  function updateLocalPrompts() {
    const text = combinedText();
    const sel = detectLocalSelPrompt(text);
    const calendar = detectLocalCalendar(text);
    selPrompt.hidden = !sel;
    selPromptText.textContent = sel;
    calendarPrompt.hidden = !calendar;
    calendarPromptText.textContent = calendar;
  }

  function fallbackReply() {
    const focus = selectedText.value.trim() || noteText.value.trim() || cueText.value.trim();
    if (!focus) {
      return "先把妳圈起來的句子貼上來。阿知不會假裝看懂空白。";
    }
    if (modeSelect.value === "review") {
      return "我會先幫妳抓考點：這段要分成定義、例子、容易混淆處。先不要急著背，先確認它在流程哪一站。";
    }
    if (modeSelect.value === "meeting") {
      return "這段可以先標成：事實、判斷、待確認。不要把別人的混亂直接搬進妳的待辦。";
    }
    return "我先看這裡：妳圈的是核心，不是旁枝。下一步可以問自己：它屬於資料、前處理、模型、評估，還是部署？";
  }

  async function askAzhi() {
    updateLocalPrompts();
    replyText.textContent = "阿知正在看筆記。先不要把整頁宇宙塞進來。";

    const payload = {
      mode: modeSelect.value,
      date: noteDate.value,
      topic: noteTopic.value,
      cues: cueText.value,
      text: noteText.value,
      selectedText: selectedText.value,
    };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const raw = await response.text();
      const data = raw ? JSON.parse(raw) : {};
      if (!response.ok) {
        throw new Error(data.error || data.detail || response.statusText);
      }
      replyText.textContent = data.reply || data.text || fallbackReply();
      if (data.selPrompt) {
        selPrompt.hidden = false;
        selPromptText.textContent = data.selPrompt;
      }
      if (data.calendarCandidate) {
        calendarPrompt.hidden = false;
        calendarPromptText.textContent = data.calendarCandidate;
      }
    } catch (error) {
      replyText.textContent = `${fallbackReply()}\n\n（模型還沒接通，先用本機家教模式撐住：${error.message}）`;
    }
  }

  function copyNoteToSelected() {
    selectedText.value = noteText.value.trim();
    selectedText.focus();
    updateLocalPrompts();
  }

  function copyCalendarText() {
    const text = calendarPromptText.textContent.trim();
    if (!text) return;
    navigator.clipboard?.writeText(text);
  }

  noteDate.value = today();
  resizeCanvasForDisplay();

  canvas.addEventListener("pointerdown", startDrawing);
  canvas.addEventListener("pointermove", draw);
  canvas.addEventListener("pointerup", stopDrawing);
  canvas.addEventListener("pointercancel", stopDrawing);
  window.addEventListener("resize", resizeCanvasForDisplay);

  document.getElementById("clearInkButton").addEventListener("click", clearInk);
  document.getElementById("copyNoteButton").addEventListener("click", copyNoteToSelected);
  document.getElementById("selButton").addEventListener("click", updateLocalPrompts);
  document.getElementById("askAzhiButton").addEventListener("click", askAzhi);
  document.getElementById("calendarCopyButton").addEventListener("click", copyCalendarText);

  [noteTopic, cueText, noteText, selectedText].forEach((field) => {
    field.addEventListener("input", updateLocalPrompts);
  });
})();
