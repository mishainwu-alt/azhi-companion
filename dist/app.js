const dogSignals = {
  idle: {
    label: "發呆",
    title: "線條狗正在發呆。",
    line: "只記錄，不分析。",
    diaryLine: "發呆：今天可能需要留白，先不解讀。",
  },
  bath: {
    label: "泡泡浴",
    title: "線條狗進泡泡浴。",
    line: "今日泡泡浴 BGM：Carmina Burana 布蘭詩歌",
    diaryLine: "泡泡浴：進入 de-escalate，今天先降載。",
  },
  sleep: {
    label: "睡覺",
    title: "睡前故事還在籃子裡。",
    line: "阿知今晚會從線條狗故事裡挑一小段。",
    diaryLine: "睡覺：今天需要休息，不催促。",
  },
  poop: {
    label: "便便",
    title: "線條狗完成照顧事件。",
    line: "便便是照顧紀錄，不是玩笑按鈕。",
    diaryLine: "便便：記錄一個照顧事件。",
  },
  hungry: {
    label: "我餓了",
    title: "線條狗說牠餓了。",
    line: "先記錄，未來累積多次再整理 pattern。",
    diaryLine: "我餓了：可能需要換飼料或調整照顧，先只記錄。",
  },
  flat: {
    label: "扁了",
    title: "線條狗扁掉了。",
    line: "可能累了，先把世界音量調小。",
    diaryLine: "扁了：可能累、心情不好或需要降載，先只記錄。",
  },
};

const lineDogAssetLookup = {
  idle: {
    mode: "發呆",
    proposedFileName: "line-dog-idle.png",
    status: "canon",
    src: "assets/line-dog/line-dog-idle.png?v=25-diary-target-12e",
  },
  bath: {
    mode: "泡泡浴",
    proposedFileName: "line-dog-bath.png",
    status: "canon",
    src: "assets/line-dog/line-dog-bath.png?v=25-diary-target-12e",
  },
  sleep: {
    mode: "睡覺",
    proposedFileName: "line-dog-sleep.png",
    status: "canon",
    src: "assets/line-dog/line-dog-sleep.png?v=25-diary-target-12e",
  },
  poop: {
    mode: "便便",
    proposedFileName: "line-dog-poop.png",
    status: "canon",
    src: "assets/line-dog/line-dog-poop.png?v=25-diary-target-12e",
  },
  hungry: {
    mode: "我餓了",
    proposedFileName: "line-dog-hungry.png",
    status: "canon",
    src: "assets/line-dog/line-dog-hungry.png?v=25-diary-target-12e",
  },
  flat: {
    mode: "扁了",
    proposedFileName: "line-dog-flat.png",
    status: "canon",
    src: "assets/line-dog/line-dog-flat.png?v=25-diary-target-12e",
  },
};

const expressionPools = {
  standby: ["self_sheet_r1_c1"],
  warm: ["self_sheet_r3_c1", "self_sheet_r1_c2", "self_sheet_r2_c2"],
  focused: ["self_sheet_r3_c3", "self_pack2_r2_c4", "self_sheet_r2_c3"],
  soft: ["self_sheet_r2_c2", "self_pack2_r2_c2"],
  story: ["self_sheet_r1_c3", "self_sheet_r3_c4", "self_pack2_r3_c2"],
};

const cameraObservationFallbacks = [
  "今天的光有點累。",
  "這裡像有人正在慢慢收工。",
  "有些地方會讓人想坐久一點。",
  "風有進來。",
  "這張照片像在換氣。",
  "有一點安靜，剛好可以停一下。",
];

const bookReadingStatus = {
  title: "202605_AI學習筆記｜閱讀報告",
  observation: "這份閱讀像是在整理工具，也在整理呼吸。",
};

const standbySceneAsset = {
  portraitSrc: "assets/standby/azhi-line-dog-park-walk-portrait.png",
  landscapeSrc: "assets/standby/azhi-line-dog-park-walk-landscape.png",
  status: "local-reference-only",
};

const bookDirectionRoutes = {
  工作: { targetKey: "bookWork", fileLabel: "工作" },
  創作: { targetKey: "bookAzhiRead", fileLabel: "創作" },
  人生: { targetKey: "bookAzhiRead", fileLabel: "人生" },
  FlowYear: { targetKey: "bookAzhiRead", fileLabel: "FlowYear" },
};

const driveTargets = window.AZHI_DRIVE_TARGETS || {};
const diaryPersistenceConfig = window.AZHI_DIARY_PERSISTENCE || {};
const diaryPersistenceEnabled = diaryPersistenceConfig.enabled === true;
const diaryPersistenceEndpoint = diaryPersistenceConfig.endpoint || "/api/drive-draft";

const state = {
  activeDoor: "standby",
  cameraStream: null,
  currentDogSignal: "idle",
  dogLogCandidate: "",
  standbyPhrase: "",
  standbySceneReady: false,
  cameraObservation: "",
  currentDraft: null,
  savedDraftKeys: new Set(),
};

const elements = {
  portrait: document.querySelector("#azhiPortraitImage"),
  reactionBubble: document.querySelector("#reactionBubble"),
  bubbleToggle: document.querySelector("#bubbleToggle"),
  controlPanel: document.querySelector("#controlPanel"),
  panelCloseButton: document.querySelector("#panelCloseButton"),
  stateTitle: document.querySelector("#stateTitle"),
  stateLine: document.querySelector("#stateLine"),
  inputPanel: document.querySelector("#inputPanel"),
  azhiReplyPanel: document.querySelector("#azhiReplyPanel"),
  azhiReply: document.querySelector("#azhiReply"),
  cameraButton: document.querySelector("#cameraButton"),
  diaryButton: document.querySelector("#diaryButton"),
  readingButton: document.querySelector("#readingButton"),
  dogButton: document.querySelector("#dogButton"),
  dogContractPanel: document.querySelector("#dogContractPanel"),
  dogStateImage: document.querySelector("#dogStateImage"),
  dogStatus: document.querySelector("#dogStatus"),
  dogStatusLine: document.querySelector("#dogStatusLine"),
  saveDogButton: document.querySelector("#saveDogButton"),
  cameraPanel: document.querySelector("#cameraPanel"),
  cameraPreview: document.querySelector("#cameraPreview"),
  cameraObservation: document.querySelector("#cameraObservation"),
};

function todayString() {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Taipei" });
}

function compactTodayString() {
  return todayString().replaceAll("-", "");
}

function targetFor(key) {
  return driveTargets[key] || {
    label: "未設定資料夾",
    folderId: "not-configured",
    policy: "目前只建立草稿，尚未寫入 Drive。",
  };
}

function quietDraftHint() {
  return "目前只建立草稿，尚未寫入 Drive。";
}

function setHeader(title, line) {
  elements.stateTitle.textContent = title;
  elements.stateLine.textContent = line;
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function assetPath(name) {
  return name.includes(".") ? `assets/azhi/crops/${name}` : `assets/azhi/crops/${name}.jpg`;
}

function setExpression(kind = "standby") {
  const pool = expressionPools[kind] || expressionPools.standby;
  elements.portrait.classList.remove("is-standby-scene");
  delete elements.portrait.dataset.standbyScene;
  elements.portrait.style.opacity = "0";
  window.setTimeout(() => {
    elements.portrait.src = assetPath(pick(pool));
    elements.portrait.style.opacity = "1";
  }, 120);
}

function applyStandbyScene() {
  if (!state.standbySceneReady) return false;
  elements.portrait.src = standbySceneAsset.portraitSrc;
  elements.portrait.dataset.standbyScene = standbySceneAsset.status;
  elements.portrait.classList.add("is-standby-scene");
  return true;
}

function prepareStandbyScene() {
  const image = new Image();
  image.onload = () => {
    state.standbySceneReady = true;
    if (state.activeDoor === "standby") applyStandbyScene();
  };
  image.src = standbySceneAsset.portraitSrc;
}

function showStandbyObservation() {
  state.standbyPhrase = window.FlowYearStandbyPhrases?.sample?.() || "不用急，先選一個入口。";
  elements.reactionBubble.textContent = state.standbyPhrase;
  elements.reactionBubble.classList.remove("is-quiet");
}

function hideStandbyObservation() {
  elements.reactionBubble.classList.add("is-quiet");
}

function setPanelOpen(open) {
  elements.controlPanel.classList.toggle("is-hidden", !open);
  elements.bubbleToggle.setAttribute("aria-expanded", String(open));
  if (open) {
    hideStandbyObservation();
  } else if (state.activeDoor === "standby") {
    showStandbyObservation();
  }
}

function setActiveButton(button) {
  [elements.cameraButton, elements.diaryButton, elements.readingButton, elements.dogButton].forEach((item) => {
    const active = item === button;
    item.classList.toggle("primary", active);
    item.setAttribute("aria-pressed", String(active));
  });
}

function showPanels({ dog = false, camera = false, reply = true } = {}) {
  elements.dogContractPanel.classList.toggle("is-hidden", !dog);
  elements.cameraPanel.classList.toggle("is-hidden", !camera);
  elements.azhiReplyPanel.classList.toggle("is-hidden", !reply);
}

function setAzhiReply(content) {
  if (content && typeof content === "object") {
    const target = content.target || targetFor("diaryDraft");
    state.currentDraft = content;
    const canWriteAzhiDiaryEngine = diaryPersistenceEnabled && content.targetKey === "azhiDiaryEngine";
    const alreadySaved = state.savedDraftKeys.has(content.idempotencyKey);
    const destination = content.previewDestination || target.shortLabel || target.label;
    const statusLine = content.previewStatus || "先放著，不用急。";
    elements.azhiReply.innerHTML = `
      <div class="draft-meta">
        <p><strong>預計放到：</strong>${escapeHtml(destination)}</p>
        <p>${alreadySaved ? "已保存到 Azhi-Diary_Engine。" : escapeHtml(statusLine)}</p>
      </div>
      <pre class="draft-preview">${escapeHtml(content.markdown)}</pre>
      ${
        canWriteAzhiDiaryEngine
          ? `<div class="reply-actions"><button class="mini-action primary-action" data-confirm-diary-write type="button" ${alreadySaved ? "disabled" : ""}>確認保存到 Azhi-Diary_Engine</button></div>`
          : ""
      }
    `;
    return;
  }
  state.currentDraft = null;
  elements.azhiReply.textContent = content;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function openDoor(key) {
  state.activeDoor = key;
  elements.controlPanel.dataset.activeDoor = key;
  showPanels();

  if (key === "standby") {
    setActiveButton(null);
    showPanels({ reply: false });
    setHeader("我在。", "不用急，先選一個入口。");
    renderStandby();
    setExpression("standby");
    state.currentDraft = null;
    elements.azhiReply.textContent = "";
    if (elements.controlPanel.classList.contains("is-hidden")) {
      showStandbyObservation();
    }
    return;
  }

  hideStandbyObservation();

  if (key === "cam") {
    setActiveButton(elements.cameraButton);
    showPanels({ camera: true, reply: false });
    setHeader("拍一張給阿知看", "今日照片 / 今日事件捕捉。");
    renderCam();
    setExpression("story");
    return;
  }

  if (key === "diary") {
    setActiveButton(elements.diaryButton);
    setHeader("阿知日記", "今天先留成草稿。");
    renderDiary();
    setExpression("warm");
    return;
  }

  if (key === "book") {
    setActiveButton(elements.readingButton);
    setHeader("讀書室", "阿知正在看閱讀報告。");
    renderBook();
    setExpression("focused");
    return;
  }

  if (key === "dog") {
    setActiveButton(elements.dogButton);
    showPanels({ dog: true });
    setHeader("線條狗微訊號", "只記錄，不分析。");
    renderDog();
    setExpression("soft");
  }
}

function renderStandby() {
  elements.inputPanel.innerHTML = `
    <figure class="standby-panel-visual" aria-label="阿知與線條狗白天公園散步">
      <img src="${standbySceneAsset.landscapeSrc}" alt="">
    </figure>
  `;
}


function renderCam() {
  state.cameraObservation = sampleCameraObservation();
  elements.cameraObservation.textContent = state.cameraObservation;
  elements.inputPanel.innerHTML = `
    <button class="mini-action subtle-toggle" data-toggle-camera-note type="button" onclick="const note = this.nextElementSibling; note.classList.toggle('is-hidden'); this.textContent = note.classList.contains('is-hidden') ? '補一句' : '收起';">補一句</button>
    <label class="field-stack optional-note is-hidden" data-camera-note-field>
      <span>補充</span>
      <textarea data-camera-field="note" placeholder="留一句話"></textarea>
    </label>
  `;
  startCamera();
}

function renderDiary() {
  elements.inputPanel.innerHTML = `
    <p class="panel-label">日記草稿</p>
    <label class="field-stack">
      <span>阿知今日觀測</span>
      <textarea data-diary-field="azhiObservation" placeholder="今天看見"></textarea>
    </label>
    <label class="field-stack">
      <span>線條狗觀察日誌（optional）</span>
      <textarea data-diary-field="dogLog" placeholder="今天的線條狗">${state.dogLogCandidate}</textarea>
    </label>
    <label class="field-stack">
      <span>留給明天的一句話</span>
      <textarea data-diary-field="tomorrow" placeholder="明天記得"></textarea>
    </label>
    <p class="quiet-note">${quietDraftHint()}</p>
    <div class="input-actions">
      <button class="mini-action primary-action" data-preview-diary type="button">產生草稿</button>
    </div>
  `;
  setAzhiReply("先留成草稿。Monika 看過後，未來才決定要不要寫入 Drive。");
}


function renderBook() {
  elements.inputPanel.innerHTML = `
    <p class="panel-label">閱讀報告觀測</p>
    <div class="book-observation-card">
      <strong>阿知正在讀……</strong>
      <p>${escapeHtml(bookReadingStatus.title)}</p>
      <small>${escapeHtml(bookReadingStatus.observation)}</small>
    </div>
    <div class="book-observation-card">
      <strong>今天先不開資料庫。</strong>
      <p>只留下閱讀狀態和一句回應。</p>
      <small>如果想回應他，可以先留一句。</small>
    </div>
    <label class="field-stack book-reply-field">
      <span>回阿知一句</span>
      <textarea data-book-field="reply" placeholder="回一句"></textarea>
    </label>
    <div class="input-actions single-action">
      <button class="mini-action primary-action" data-preview-book type="button">產生阿知日記草稿</button>
    </div>
  `;
  setAzhiReply("阿知正在看閱讀報告。如果想回應，先留一句就好。");
}


function renderDog() {
  elements.inputPanel.innerHTML = `
    <button class="mini-action subtle-toggle" data-toggle-dog-note type="button" onclick="const note = this.nextElementSibling; note.classList.toggle('is-hidden'); this.textContent = note.classList.contains('is-hidden') ? '補一句' : '收起';">補一句</button>
    <label class="field-stack optional-note is-hidden" data-dog-note-field>
      <span>補充一句</span>
      <textarea data-dog-field="note" placeholder="補一句"></textarea>
    </label>
  `;
  setDogSignal(state.currentDogSignal);
  setAzhiReply("按一個線條狗狀態，先留下草稿候選。");
}


function setDogSignal(key) {
  const signal = dogSignals[key] || dogSignals.idle;
  const asset = lineDogAssetLookup[key] || lineDogAssetLookup.idle;
  state.currentDogSignal = key;
  elements.dogStateImage.src = asset.src;
  elements.dogStateImage.alt = `線條狗${asset.mode}`;
  elements.dogStateImage.dataset.signal = key;
  elements.dogStateImage.dataset.assetStatus = asset.status;
  elements.dogStateImage.dataset.proposedFile = asset.proposedFileName;
  elements.dogStatus.textContent = signal.title;
  elements.dogStatusLine.textContent = signal.line;
  document.querySelectorAll("[data-dog-action]").forEach((button) => {
    const active = button.dataset.dogAction === key;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  if (state.activeDoor === "dog") {
    setAzhiReply(buildDogDraft());
  }
}

function fieldValue(selector) {
  return document.querySelector(selector)?.value.trim() || "";
}

function selectedDirections() {
  return [...document.querySelectorAll("[data-book-direction].is-active")].map((button) => button.dataset.bookDirection);
}

function buildDiaryDraft() {
  const azhiObservation = fieldValue("[data-diary-field='azhiObservation']") || "今天阿知看見的是：";
  const dogLog = fieldValue("[data-diary-field='dogLog']");
  const tomorrow = fieldValue("[data-diary-field='tomorrow']") || "明天只要記得：";
  const title = `${todayString()}｜阿知日記草稿`;
  const target = targetFor("azhiDiaryEngine");
  const markdown = [
    `# ${title}`,
    "",
    "## 1. 阿知今日觀測",
    azhiObservation,
    "",
    "## 2. 線條狗觀察日誌（optional）",
    dogLog || "（今日未填）",
    "",
    "## 3. 留給明天的一句話",
    tomorrow,
  ].join("\n");
  return {
    type: "Diary 草稿",
    title,
    target,
    targetKey: "azhiDiaryEngine",
    previewDestination: "Azhi-Diary_Engine",
    previewStatus: "今天先留在這裡。",
    markdown,
    idempotencyKey: draftKey("azhiDiaryEngine", title, markdown),
  };
}


function buildBookDraft() {
  const reply = fieldValue("[data-book-field='reply']") || "（Monika 還沒補充）";
  const title = `${todayString()}｜閱讀觀測草稿`;
  const target = targetFor("diaryDraft");
  const markdown = [
    `# ${title}`,
    "",
    "## 阿知正在看的閱讀報告",
    bookReadingStatus.title,
    "",
    "## 短觀測",
    bookReadingStatus.observation,
    "",
    "## Monika 回覆",
    reply,
    "",
    "## 可放進阿知日記的觀測",
    "閱讀室先保持安靜。這段如果留下來，會成為阿知日記的一小段觀測。",
  ].join("\n");
  return {
    type: "閱讀觀測草稿",
    title,
    target,
    previewDestination: "Azhi-Diary_Engine",
    previewStatus: "先放著，不用急。",
    markdown,
  };
}

function buildDogDraft() {
  const signal = dogSignals[state.currentDogSignal] || dogSignals.idle;
  const note = fieldValue("[data-dog-field='note']");
  const title = `${todayString()}｜線條狗觀察日誌草稿`;
  const target = targetFor("lineDogObservationDiary");
  const log = [
    `${signal.label}：${signal.diaryLine}`,
    note ? `補充：${note}` : "",
    signal.label === "泡泡浴" ? "今日泡泡浴 BGM：Carmina Burana 布蘭詩歌" : "",
  ].filter(Boolean).join("\n");
  state.dogLogCandidate = log;
  const markdown = [
    `# ${title}`,
    "",
    "## 線條狗觀察日誌（候選）",
    log,
    "",
    "## 使用方式",
    "這段會回到 Diary 草稿的 optional 欄位。未來多天 pattern 再由 Azhi-Diary_Engine 每週整理。",
  ].join("\n");
  return {
    type: "線條狗觀察日誌候選",
    title,
    target,
    previewDestination: "線條狗觀察日記",
    previewStatus: "只記錄，不分析。",
    markdown,
  };
}

function sampleCameraObservation() {
  return cameraObservationFallbacks[Math.floor(Math.random() * cameraObservationFallbacks.length)];
}

function isLikelyInAppBrowser() {
  const ua = navigator.userAgent || "";
  return /Line\/|FBAN|FBAV|Instagram|MicroMessenger|Twitter|LinkedInApp|GSA|ChatGPT/i.test(ua);
}

function setCameraFallbackMessage(message) {
  const note = document.querySelector("#cameraNote");
  if (note) note.textContent = message;
}

function draftKey(targetKey, title, markdown) {
  return `${targetKey}:${hashText(`${title}\n${markdown}`)}`;
}

function hashText(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}

async function confirmDiaryWrite() {
  const draft = state.currentDraft;
  if (!draft || draft.targetKey !== "azhiDiaryEngine") return;
  if (state.savedDraftKeys.has(draft.idempotencyKey)) {
    setAzhiReply({ ...draft });
    return;
  }

  const button = document.querySelector("[data-confirm-diary-write]");
  if (button) {
    button.disabled = true;
    button.textContent = "保存中...";
  }

  try {
    const response = await fetch(diaryPersistenceEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetKey: "azhiDiaryEngine",
        title: draft.title,
        markdown: draft.markdown,
        idempotencyKey: draft.idempotencyKey,
      }),
    });
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.message || "港口這次沒有成功收下，但草稿還在。");
    state.savedDraftKeys.add(draft.idempotencyKey);
    elements.azhiReply.querySelector(".draft-meta p:last-child").textContent = "已保存到 Azhi-Diary_Engine。";
    if (button) button.textContent = data.duplicate ? "已在 Azhi-Diary_Engine。" : "已保存到 Azhi-Diary_Engine。";
  } catch (error) {
    if (button) {
      button.disabled = false;
      button.textContent = "確認保存到 Azhi-Diary_Engine";
    }
    elements.azhiReply.insertAdjacentHTML("beforeend", `<p class="quiet-note">港口這次沒有成功收下，但草稿還在。</p>`);
  }
}

async function startCamera() {
  if (!elements.cameraPreview) return;

  if (!window.isSecureContext) {
    setCameraFallbackMessage("請用 HTTPS 或已安裝的 PWA 開啟以使用鏡頭。");
    return;
  }

  const canAskForCamera = Boolean(navigator.mediaDevices?.getUserMedia);
  if (!canAskForCamera) {
    setCameraFallbackMessage(isLikelyInAppBrowser()
      ? "請用系統瀏覽器開啟以使用鏡頭。"
      : "這台裝置暫時不讓鏡頭進來。沒有關係，先用文字也可以。");
    return;
  }

  try {
    if (!state.cameraStream) {
      state.cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
    }
    elements.cameraPreview.srcObject = state.cameraStream;
    await elements.cameraPreview.play();
  } catch (error) {
    const blockedByShell = isLikelyInAppBrowser() || window.self !== window.top;
    setCameraFallbackMessage(blockedByShell
      ? "請用系統瀏覽器開啟以使用鏡頭。"
      : "這台裝置暫時不讓鏡頭進來。沒有關係，先用文字也可以。");
  }
}

function toggleOptionalNote(selector, button, openLabel = "收起", closedLabel = "補一句") {
  const note = elements.controlPanel.querySelector(selector);
  if (!note) return;
  const willOpen = note.classList.contains("is-hidden");
  note.classList.toggle("is-hidden", !willOpen);
  button.textContent = willOpen ? openLabel : closedLabel;
  if (willOpen) {
    note.querySelector("textarea")?.focus();
  }
}

function bindEvents() {
  elements.bubbleToggle.addEventListener("click", () => setPanelOpen(elements.controlPanel.classList.contains("is-hidden")));
  elements.panelCloseButton.addEventListener("click", () => setPanelOpen(false));
  elements.cameraButton.addEventListener("click", () => openDoor("cam"));
  elements.diaryButton.addEventListener("click", () => openDoor("diary"));
  elements.readingButton.addEventListener("click", () => openDoor("book"));
  elements.dogButton.addEventListener("click", () => openDoor("dog"));
  elements.saveDogButton.addEventListener("click", () => setAzhiReply(buildDogDraft()));

  elements.controlPanel.addEventListener("click", (event) => {
    const target = event.target.closest("button");
    if (!target) return;
    if (target.matches("[data-door]")) openDoor(target.dataset.door);
    if (target.matches("[data-preview-diary]")) setAzhiReply(buildDiaryDraft());
    if (target.matches("[data-preview-book]")) setAzhiReply(buildBookDraft());
    if (target.matches("[data-dog-action]")) setDogSignal(target.dataset.dogAction);
    if (target.matches("[data-confirm-diary-write]")) confirmDiaryWrite();
  });
}

function initFromUrl() {
  const params = new URLSearchParams(location.search);
  const door = params.get("door");
  if (["cam", "diary", "book", "dog"].includes(door)) {
    openDoor(door);
  } else {
    openDoor("standby");
  }
}

bindEvents();
initFromUrl();
setPanelOpen(state.activeDoor !== "standby");
