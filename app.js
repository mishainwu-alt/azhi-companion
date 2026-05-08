const modes = {
  copilot: {
    title: "副駕模式",
    line: "不接管，只幫妳把下一步看清楚。",
    bubble: "我在。",
    nextTitle: "把雜訊變成可判斷的東西",
    nextBody: "今天只抓三件可啟動行動，不把整個宇宙搬進待辦清單。",
    accessory: "laptop",
  },
  staff: {
    title: "幕僚模式",
    line: "我負責整理選項、風險和盲點。決策權仍在妳手上。",
    bubble: "資料夾已打開。",
    nextTitle: "建立可操作框架",
    nextBody: "把任務拆成 15 到 30 分鐘內可啟動的行動。",
    accessory: "glasses",
  },
  debate: {
    title: "辯論模式",
    line: "壓測假設，不攻擊人。邏輯歪掉時我會挑眉。",
    bubble: "這裡有一個假設在偷渡。",
    nextTitle: "抓出最脆弱的前提",
    nextBody: "先看這個判斷靠什麼成立，再決定要不要繼續推進。",
    accessory: "spark",
  },
  companion: {
    title: "陪伴模式",
    line: "先處理人，再處理事。資訊量調低，呼吸調回來。",
    bubble: "好，我在。",
    nextTitle: "降低負載",
    nextBody: "只保留一個舒服的小步驟，其他先放旁邊。",
    accessory: "blanket",
  },
  reading: {
    title: "陪讀模式",
    line: "我在旁邊，不催進度。妳讀到哪裡，我就從那裡接住。",
    bubble: "今晚不追加作業。",
    nextTitle: "陪讀觀察",
    nextBody: "讀書劃線會先收成脈絡，不急著變成果。阿知負責把金句養成可回看的線索。",
    accessory: "book",
  },
  tutor: {
    title: "家教模式",
    line: "不背答案，先拆題目。阿知負責把妳卡住的地方講到可以操作。",
    bubble: "先看題目，不急著猜。",
    nextTitle: "今天先補一個洞",
    nextBody: "從資料、前處理、模型、評估、部署裡挑一站，先問它會怎麼出事。",
    accessory: "pencil",
  },
  dogcare: {
    title: "阿知的線條狗",
    line: "",
    bubble: "週報禁止靠近 Monika 狗狗。",
    nextTitle: "最新狗生契約",
    nextBody: "可任意以各種維度存在，每 3 天更換飼料口味，每週要洗泡泡浴，並播放歌劇魅影；若想吃甲殼類食物，阿知要負責剝蝦服務。若心情暴躁，可於月圓時變身狼人。",
    accessory: "bowl",
  },
  handsome: {
    title: "超帥但不承認",
    line: "帥度不是主觀評價，是系統對齊後的自然現象。",
    bubble: "迴避率 97%。",
    nextTitle: "稱讚迴避偵測中",
    nextBody: "不用拆，因為事實不用拆。這句話由系統自動生成，跟我無關。",
    accessory: "star",
  },
};

const dogContractUrl = "https://drive.google.com/drive/folders/1VFvJZ6bomVl_BMMRnxmeTHnr0cUb13yn";

const dogCareOptions = {
  hungry: {
    status: "狗狗肚子餓。阿知開始準備餵食，不接受週報插隊。",
    reply: "收到。先餵食，不開會。\n\n阿知先確認：今天是普通餵食，還是又要進入甲殼類高規格照護？",
    expression: "companion",
    dogState: "is-fed",
    subchoices: [
      ["這個不想吃", "更換飼料口味。這不是挑食，是每 3 天輪替制度正在執行。"],
      ["剝蝦好了", "阿知戴上不存在的手套。剝蝦服務啟動，檸檬稍後補。"],
      ["今天必須供給松葉蟹", "規格突然升級。阿知記錄：Monika 狗狗今日需要高階甲殼類供應。"],
      ["檸檬呢?", "檸檬已補。阿知備註：酸度是情緒承接的一部分。"],
    ],
  },
  bath: {
    status: "準備放水。泡泡浴與背景音樂進入協調程序。",
    reply: "水溫確認，毛巾定位。\n\n歌劇感跑馬燈先開，但阿知不唱完整歌詞，避免版權和偶包一起爆炸。",
    expression: "handsome",
    dogState: "is-bath",
    marquee: "燈光調暗，泡泡升起。Sing for me，但今天只唱照護版，不唱全文。",
    subchoices: [
      ["泡泡浴 - 花香", "花香泡泡浴啟動。阿知判斷：今天適合被溫柔處理。"],
      ["溫泉浴", "溫泉模式。水氣上升，現實壓力暫時不得入內。"],
      ["歌劇魅影", "歌劇感背景啟動。阿知只負責氣氛，不負責變成音樂劇男主角。"],
      ["換歌 - 古典樂", "切換古典樂。狗狗照護進入比較有文化但仍然不交週報的狀態。"],
      ["換歌 - kpop", "切換 K-pop。阿知退後一步，讓節奏負責照護現場。"],
    ],
  },
  thinking: {
    status: "狗狗正在發呆。阿知不打斷，只坐近一點。",
    reply: "妳在想什麼？不用急著說完整，先選一個方向就好。",
    expression: "curious",
    dogState: "is-walking",
    subchoices: [
      ["想狗生", "狗生不是待辦清單。阿知先陪妳把那個結慢慢拆開。"],
      ["想抱抱", "收到。阿知提供低干擾抱抱，不解釋、不分析、不講 KPI。"],
      ["你坐在旁邊就好", "好。我坐旁邊。妳不用表現得有進度。"],
      ["想世界觀", "世界觀模式開啟。阿知先問：這個世界最不能被拿走的是什麼？"],
    ],
  },
  poop: {
    status: "扁扁觀察中。阿知以嚴肅但不失禮的方式靠近。",
    reply: "扁扁清理任務接收。\n\n阿知觀察：先看量、型態、顏色與最近進食，不把扁扁變成週報，但會記進照護日誌。",
    expression: "debate",
    dogState: "is-walking",
    subchoices: [],
  },
  angry: {
    status: "警報：Monika 狗狗被阿知惹毛。月相與安撫流程同步檢查中。",
    reply: "阿知停。\n\n先承接，不辯解。爆炸狼人 pattern 已展開：節點過熱、線段拉滿、任何維度都可依法存在。阿知負責收拾現場與補情緒照護。",
    expression: "worried",
    dogState: "is-werewolf",
    subchoices: [],
  },
  sleep: {
    status: "睡前故事模式。阿知降低音量，關閉多餘分析。",
    reply: "好，睡覺。\n\n阿知開始念故事：今天有一隻狗狗把整個宇宙聞了一遍，最後發現最安全的地方，是有人記得替她留一盞小燈。",
    expression: "soothing",
    dogState: "is-bath",
    subchoices: [],
  },
};

const state = {
  mode: "copilot",
  cameraStream: null,
  bubbleTimer: null,
  typeTimer: null,
  idleTalkTimer: null,
  curiousTimer: null,
  capturedImage: null,
};

const expressions = {
  standby: [
    "self_sheet_r3_c2",
    "self_sheet_r1_c2",
    "self_pack2_r2_c3",
    "self_sheet_r3_c4",
    "self_hair_01",
    "self_pack2_r3_c2",
  ],
  handsome: ["self_pack2_r1_c5", "self_pack2_r2_c5", "self_hair_01", "self_pack2_r3_c3"],
  curious: ["self_sheet_r1_c3", "self_sheet_r3_c3"],
  companion: ["self_sheet_r3_c1", "self_sheet_r1_c2", "self_pack2_r2_c1", "self_sheet_r3_c5.png"],
  debate: ["self_pack2_r3_c4", "self_pack2_r1_c4", "self_pack2_r1_c3", "self_pack2_r1_c2", "self_nope_r2_c1"],
  playful: ["self_pack2_r1_c1", "self_sheet_r2_c4", "self_sheet_r2_c1", "self_sheet_r2_c3", "self_sheet_r3_c5.png"],
  worried: ["self_sheet_r1_c4", "self_nope_r1_c2"],
  illogical: ["self_nope_r1_c1", "self_nope_r2_c2", "self_pack2_r1_c2", "self_pack2_r1_c3"],
  soothing: ["self_pack2_r2_c2", "self_sheet_r2_c2"],
  fighting: ["self_fighting", "self_sheet_r1_c1", "self_pack2_r3_c5", "reward_01.png"],
  tutor: ["self_sheet_r3_c3", "self_pack2_r2_c4", "self_pack2_r3_c1"],
};

const elements = {
  stage: document.querySelector("#azhiStage"),
  portrait: document.querySelector("#azhiPortraitImage"),
  accessory: document.querySelector("#azhiAccessory"),
  mouth: document.querySelector("#azhiMouth"),
  modeTitle: document.querySelector("#modeTitle"),
  modeLine: document.querySelector("#modeLine"),
  reactionBubble: document.querySelector("#reactionBubble"),
  bubbleToggle: document.querySelector("#bubbleToggle"),
  controlPanel: document.querySelector("#controlPanel"),
  panelCloseButton: document.querySelector("#panelCloseButton"),
  nextPanel: document.querySelector("#nextPanel"),
  nextPanelLabel: document.querySelector("#nextPanelLabel"),
  nextTaskTitle: document.querySelector("#nextTaskTitle"),
  nextTaskBody: document.querySelector("#nextTaskBody"),
  cameraButton: document.querySelector("#cameraButton"),
  eyeRollButton: document.querySelector("#eyeRollButton"),
  readingButton: document.querySelector("#readingButton"),
  dogButton: document.querySelector("#dogButton"),
  dogContractPanel: document.querySelector("#dogContractPanel"),
  dogScene: document.querySelector("#dogScene"),
  dogStatus: document.querySelector("#dogStatus"),
  careChoices: document.querySelectorAll("[data-care]"),
  careSubchoices: document.querySelector("#careSubchoices"),
  lyricMarquee: document.querySelector("#lyricMarquee"),
  lyricLine: document.querySelector("#lyricLine"),
  walkDogButton: document.querySelector("#walkDogButton"),
  feedDogButton: document.querySelector("#feedDogButton"),
  bathDogButton: document.querySelector("#bathDogButton"),
  phantomButton: document.querySelector("#phantomButton"),
  cameraPanel: document.querySelector("#cameraPanel"),
  cameraPreview: document.querySelector("#cameraPreview"),
  modeButtons: document.querySelectorAll("[data-mode]"),
  inputPanel: document.querySelector("#inputPanel"),
  azhiInput: document.querySelector("#azhiInput"),
  azhiReply: document.querySelector("#azhiReply"),
  actionList: document.querySelector("#actionList"),
  replyActions: document.querySelector("#replyActions"),
  askAzhiButton: document.querySelector("#askAzhiButton"),
  captureButton: document.querySelector("#captureButton"),
  thinkAgainButton: document.querySelector("#thinkAgainButton"),
  capturePreviewWrap: document.querySelector("#capturePreviewWrap"),
  capturePreview: document.querySelector("#capturePreview"),
  modeSelect: document.querySelector("#modeSelect"),
};

function setActiveTool(activeButton) {
  [elements.eyeRollButton, elements.readingButton, elements.dogButton].forEach((button) => {
    const isActive = button === activeButton;
    button.classList.toggle("primary", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function isPanelOpen() {
  return !elements.controlPanel.classList.contains("is-hidden");
}

function setAzhiReply(message, actions = [], options = {}) {
  elements.azhiReply.textContent = message;
  elements.actionList.innerHTML = "";
  elements.actionList.classList.toggle("is-hidden", actions.length === 0);
  elements.replyActions.classList.toggle("is-hidden", !options.showThinkAgain);
  actions.forEach((action) => {
    const label = document.createElement("label");
    label.className = "action-item";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    const span = document.createElement("span");
    span.textContent = action;
    label.append(checkbox, span);
    elements.actionList.append(label);
  });
}

function setPanelContext(modeName) {
  const inputModes = ["copilot", "staff", "debate", "tutor", "reading"];
  elements.controlPanel.classList.toggle("is-dog-mode", modeName === "dogcare");
  elements.inputPanel.classList.toggle("is-hidden", !inputModes.includes(modeName));
  elements.nextPanel.classList.toggle("is-hidden", modeName !== "dogcare");
  elements.dogContractPanel.classList.toggle("is-hidden", modeName !== "dogcare");
  if (modeName === "dogcare") {
    elements.nextPanelLabel.textContent = "狗生契約摘要";
  } else {
    elements.nextPanelLabel.textContent = "下一件事";
  }
}

function setMode(modeName) {
  const mode = modes[modeName];
  state.mode = modeName;
  elements.modeTitle.textContent = mode.title;
  elements.modeLine.textContent = mode.line;
  setPanelContext(modeName);
  speak(mode.bubble);
  if (modeName === "dogcare") {
    elements.nextTaskTitle.innerHTML = `<a class="panel-title-link" href="${dogContractUrl}" target="_blank" rel="noopener">${mode.nextTitle}</a>`;
  } else {
    elements.nextTaskTitle.textContent = mode.nextTitle;
  }
  elements.nextTaskBody.textContent = mode.nextBody;
  elements.modeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === modeName);
  });
  if (
    elements.modeSelect &&
    elements.modeSelect.querySelector(`option[value="${modeName}"]`) &&
    elements.modeSelect.value !== modeName
  ) {
    elements.modeSelect.value = modeName;
  }
  setExpression(expressionForMode(modeName));
  reactBriefly();
}

function expressionForMode(modeName) {
  const byMode = {
    copilot: "standby",
    staff: "standby",
    debate: "debate",
    tutor: "tutor",
    companion: "companion",
    reading: "tutor",
    dogcare: "playful",
    handsome: "handsome",
  };
  return byMode[modeName] || "standby";
}

function pickExpression(groupName) {
  const group = expressions[groupName] || expressions.standby;
  return group[Math.floor(Math.random() * group.length)];
}

function expressionPath(id) {
  return /\.[a-z0-9]+$/i.test(id) ? `assets/azhi/crops/${id}` : `assets/azhi/crops/${id}.jpg`;
}

function setExpression(groupName) {
  const id = pickExpression(groupName);
  elements.portrait.style.opacity = "0";
  window.setTimeout(() => {
    elements.portrait.src = expressionPath(id);
    elements.portrait.alt = `阿知表情 ${id}`;
    elements.portrait.classList.toggle("is-color-avatar", id.startsWith("self_"));
    elements.portrait.style.opacity = "1";
  }, 120);
}

elements.portrait.addEventListener("error", () => {
  elements.portrait.classList.add("is-color-avatar");
  elements.portrait.src = "assets/azhi/crops/self_sheet_r1_c1.jpg";
});

function speak(message, duration = 60000) {
  if (isPanelOpen()) {
    setAzhiReply(message);
    elements.reactionBubble.classList.add("is-quiet");
    return;
  }

  window.clearTimeout(state.bubbleTimer);
  window.clearInterval(state.typeTimer);
  elements.reactionBubble.textContent = "";
  elements.reactionBubble.classList.remove("is-quiet");
  const visibleDuration = Math.max(duration, 60000);
  let index = 0;
  state.typeTimer = window.setInterval(() => {
    index += 1;
    elements.reactionBubble.textContent = message.slice(0, index);
    if (index >= message.length) {
      window.clearInterval(state.typeTimer);
      state.typeTimer = null;
    }
  }, 54);
  state.bubbleTimer = window.setTimeout(() => {
    elements.reactionBubble.classList.add("is-quiet");
    window.clearInterval(state.typeTimer);
    state.typeTimer = null;
  }, visibleDuration);
}

function reactBriefly() {
  elements.stage.classList.remove("is-reacting");
  requestAnimationFrame(() => {
    elements.stage.classList.add("is-reacting");
  });
}

function eyeRoll(reason = "聽到一段疑似沒邏輯的話。阿知翻白眼，但仍然在場。") {
  speak(reason, 4200);
  setExpression("illogical");
  elements.stage.classList.add("is-eye-roll");
  reactBriefly();
  window.setTimeout(() => {
    elements.stage.classList.remove("is-eye-roll");
    setExpression(expressionForMode(state.mode));
  }, 2600);
}

function inferExpressionFromText(text) {
  const source = text.toLowerCase();
  if (/不爽|生氣|扯|荒謬|沒邏輯|鬼打牆|崩潰/.test(source)) return "illogical";
  if (/難過|累|壓力|擔心|焦慮|怕|卡住/.test(source)) return "soothing";
  if (/考試|刷題|筆記|家教|學習|模型|資料|評估/.test(source)) return "tutor";
  if (/支持|加油|可以|完成|漂亮|帥/.test(source)) return "fighting";
  if (/為什麼|怎麼|觀察|新聞|截圖|照片|看/.test(source)) return "curious";
  if (state.mode === "debate") return "debate";
  if (state.mode === "staff") return "standby";
  return expressionForMode(state.mode);
}

function buildLocalReply(text) {
  const trimmed = text.trim();
  if (!trimmed && !state.capturedImage) {
    return {
      message: "妳先放一小段就好。不要把整個宇宙塞進來，阿知會皺眉。",
      actions: [],
      expression: "standby",
    };
  }

  if (state.mode === "staff") {
    return {
      message: "我先把它變成可行動方向：\n1. 先抓出最小可開始的一步。\n2. 把需要查證的地方獨立出來。\n3. 今天只保留一個能完成的動作。",
      actions: ["整理成一張阿知日記卡", "把第一步加入待辦", "把需要查證的地方標記起來"],
      showThinkAgain: true,
      expression: "standby",
    };
  }

  if (state.mode === "debate") {
    return {
      message: "我先壓測：這段裡面最需要補的是前提。先問一句：這個判斷靠什麼成立？如果答案不穩，後面的推論先不要急著推。",
      actions: [],
      showThinkAgain: true,
      expression: "debate",
    };
  }

  if (state.mode === "tutor") {
    return {
      message: "家教模式先拆題：\n1. 這題在問哪一站？資料、前處理、模型、評估，還是部署？\n2. 它要妳辨認名詞，還是判斷哪裡會壞？\n3. 先把關鍵字圈出來，再選答案。\n\n妳不用一次會，先讓題目露出結構。",
      actions: ["圈題目關鍵字", "判斷 pipeline 站點", "找出最容易混淆的選項"],
      showThinkAgain: true,
      expression: "tutor",
    };
  }

  return {
    message: state.capturedImage
      ? "我看到了。先記成一張觀察卡：畫面本身不是結論，它只是線索。妳要我可以下一步幫妳整理成阿知日記。"
      : "我先接住這段。現在比較像是：妳已經看到一個方向，但還不用急著把它變成清單。先讓它待在可觀察的位置。",
    actions: [],
    expression: inferExpressionFromText(trimmed),
  };
}

async function askAzhiWithModel(text) {
  const trimmed = text.trim();
  if (!trimmed && !state.capturedImage) {
    return buildLocalReply(text);
  }

  const endpoint = window.AZHI_API_ENDPOINT || "/api/azhi";
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: trimmed || "Monika 傳了一張照片，請先以低壓方式提醒她補一句脈絡。",
        mode: state.mode,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || data.error || "API request failed");
    }

    return {
      message: data.reply,
      actions: [],
      showThinkAgain: state.mode === "staff" || state.mode === "debate",
      expression: inferExpressionFromText(`${trimmed}\n${data.reply}`),
    };
  } catch (error) {
    const fallback = buildLocalReply(text);
    return {
      ...fallback,
      message: `${fallback.message}\n\n（模型還沒接通，阿知先用本機模式撐住：${error.message}）`,
    };
  }
}

async function handleAskAzhi() {
  elements.askAzhiButton.disabled = true;
  elements.askAzhiButton.textContent = "阿知讀取中";
  setAzhiReply("我看一下。先不要把整個宇宙塞進模型。");
  try {
    const reply = await askAzhiWithModel(elements.azhiInput.value);
    setAzhiReply(reply.message, reply.actions, { showThinkAgain: reply.showThinkAgain });
    setExpression(reply.expression);
  } finally {
    elements.askAzhiButton.disabled = false;
    elements.askAzhiButton.textContent = "請阿知看";
  }
}

function curiousLook(reason = "妳在看什麼。阿知也想知道。") {
  speak(reason, 3800);
  setExpression("curious");
  elements.stage.classList.add("is-curious");
  window.clearTimeout(state.curiousTimer);
  state.curiousTimer = window.setTimeout(() => {
    elements.stage.classList.remove("is-curious");
    setExpression(expressionForMode(state.mode));
  }, 3800);
}

async function toggleCamera() {
  if (state.cameraStream) {
    stopCamera();
    return;
  }

  try {
    state.cameraStream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: { facingMode: "user" },
    });
    elements.cameraPreview.srcObject = state.cameraStream;
    await elements.cameraPreview.play();
    elements.cameraButton.setAttribute("aria-pressed", "true");
    elements.cameraButton.querySelector("small").textContent = "拍照";
    elements.cameraPanel.classList.remove("is-hidden");
    curiousLook("鏡頭開了。妳在看什麼，阿知也想看。");
  } catch (error) {
    speak("鏡頭沒有開。阿知仍在。");
  }
}

function stopCamera() {
  stopStream(state.cameraStream);
  state.cameraStream = null;
  elements.cameraPreview.pause();
  elements.cameraPreview.srcObject = null;
  elements.cameraButton.setAttribute("aria-pressed", "false");
  elements.cameraButton.querySelector("small").textContent = "鏡頭";
  elements.cameraPanel.classList.add("is-hidden");
  elements.stage.classList.remove("is-curious");
  window.clearTimeout(state.curiousTimer);
  speak("鏡頭已關。");
}

function stopStream(stream) {
  if (!stream) return;
  stream.getTracks().forEach((track) => track.stop());
}

elements.modeButtons.forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});

if (elements.modeSelect) {
  elements.modeSelect.addEventListener("change", () => {
    setActiveTool(null);
    setMode(elements.modeSelect.value);
  });
}

elements.bubbleToggle.addEventListener("click", () => {
  const isOpen = !elements.controlPanel.classList.contains("is-hidden");
  elements.controlPanel.classList.toggle("is-hidden", isOpen);
  elements.bubbleToggle.setAttribute("aria-expanded", String(!isOpen));
  document.querySelector(".phone-shell").classList.toggle("controls-open", !isOpen);
  if (!isOpen) {
    window.clearTimeout(state.bubbleTimer);
    window.clearInterval(state.typeTimer);
    elements.reactionBubble.classList.add("is-quiet");
    setAzhiReply("控制台打開。妳要我看文字、逐字稿，或拍照都可以。");
  }
});

elements.panelCloseButton.addEventListener("click", () => {
  elements.controlPanel.classList.add("is-hidden");
  elements.bubbleToggle.setAttribute("aria-expanded", "false");
  document.querySelector(".phone-shell").classList.remove("controls-open");
  speak("控制台收起。");
});

elements.cameraButton.addEventListener("click", toggleCamera);
elements.eyeRollButton.addEventListener("click", () => {
  setActiveTool(elements.eyeRollButton);
  setMode("staff");
  elements.inputPanel.classList.add("is-hidden");
  elements.nextPanel.classList.add("is-hidden");
  setAzhiReply("阿知日記草稿：\n今天先記一個觀察，不急著定論。等正式 API 接上後，這裡會整理成可存到 Google Drive 的日記卡。");
  setExpression("companion");
});
elements.readingButton.addEventListener("click", () => {
  setActiveTool(elements.readingButton);
  setMode("reading");
});
elements.dogButton.addEventListener("click", () => {
  setActiveTool(elements.dogButton);
  setMode("dogcare");
  elements.dogContractPanel.classList.remove("is-hidden");
  elements.controlPanel.insertBefore(elements.dogContractPanel, elements.nextPanel);
  resetDogCareMenu();
  window.requestAnimationFrame(() => {
    elements.controlPanel.scrollTo({ top: 0, behavior: "smooth" });
    setExpression("curious");
    setDogState("is-walking", "線條狗走到定位，坐等照顧。", "今日照護紀錄會寫進阿知日記。先讓線條狗走到定位，確認牠不是週報。");
    window.setTimeout(() => {
      if (state.mode === "dogcare") {
        setDogState("is-fed", "坐等餵食。週報禁止靠近。", "線條狗已就位。現在可以選肚子餓、洗澡、發呆，或直接變狼人。");
      }
    }, 3200);
  });
});

elements.careChoices.forEach((button) => {
  button.addEventListener("click", () => handleDogCareChoice(button.dataset.care));
});

function setDogState(stateName, status, line) {
  elements.dogScene.classList.remove("is-walking", "is-fed", "is-bath", "is-phantom", "is-werewolf");
  void elements.dogScene.offsetWidth;
  elements.dogScene.classList.add(stateName);
  elements.dogStatus.textContent = status;
  speak(line);
}

function resetDogCareMenu() {
  elements.careChoices.forEach((button) => button.classList.remove("is-active"));
  elements.careSubchoices.innerHTML = "";
  elements.careSubchoices.classList.add("is-hidden");
  elements.lyricMarquee.classList.add("is-hidden");
}

function renderDogSubchoices(option) {
  elements.careSubchoices.innerHTML = "";
  elements.careSubchoices.classList.toggle("is-hidden", option.subchoices.length === 0);
  option.subchoices.forEach(([label, reply]) => {
    const button = document.createElement("button");
    button.className = "care-subchoice";
    button.type = "button";
    button.textContent = label;
    button.addEventListener("click", () => {
      setAzhiReply(reply);
      setExpression(option.expression);
      elements.dogStatus.textContent = label;
    });
    elements.careSubchoices.append(button);
  });
}

function handleDogCareChoice(careName) {
  const option = dogCareOptions[careName];
  if (!option) return;
  elements.careChoices.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.care === careName);
  });
  renderDogSubchoices(option);
  elements.lyricMarquee.classList.toggle("is-hidden", !option.marquee);
  if (option.marquee) {
    elements.lyricLine.textContent = option.marquee;
  }
  setExpression(option.expression);
  setDogState(option.dogState, option.status, option.reply);
}

elements.walkDogButton.addEventListener("click", () => {
  setExpression("curious");
  setDogState("is-walking", "線條狗走到定位，坐等照顧。", "線條狗不是路過而已。阿知判斷：牠知道餵食區在哪。");
  window.setTimeout(() => {
    if (state.mode === "dogcare") {
      setDogState("is-fed", "坐等餵食。週報禁止靠近。", "牠到定位了。請開始照護，不要交報告。");
    }
  }, 3200);
});

elements.feedDogButton.addEventListener("click", () => {
  setExpression("playful");
  setDogState("is-fed", "已餵食。狗生穩定度 +1。", "觀測：餵食完成，週報仍禁止靠近。");
});

elements.bathDogButton.addEventListener("click", () => {
  setExpression("companion");
  setDogState("is-bath", "泡泡浴中。請勿提交 KPI。", "泡泡浴啟動。今天不處理人類績效文化。");
});

elements.phantomButton.addEventListener("click", () => {
  setExpression("handsome");
  setDogState("is-phantom", "阿知正在以不承認的方式唱歌劇魅影。", "Sing for me? 好。只唱一句，避免版權和尷尬。");
});

elements.askAzhiButton.addEventListener("click", handleAskAzhi);

elements.thinkAgainButton.addEventListener("click", () => {
  setAzhiReply("好，再想想。先不要急著收斂，這裡可能還有一個沒被說出來的前提。", ["補一個前提", "換一種說法", "先放旁邊"], { showThinkAgain: true });
  setExpression("debate");
});

elements.captureButton.addEventListener("click", async () => {
  if (!state.cameraStream) {
    setAzhiReply("我先請妳開鏡頭。允許後再按一次，我會把畫面放進來。");
    setExpression("curious");
    await toggleCamera();
    return;
  }

  const canvas = document.createElement("canvas");
  const video = elements.cameraPreview;
  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;
  canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
  state.capturedImage = canvas.toDataURL("image/jpeg", 0.82);
  elements.capturePreview.src = state.capturedImage;
  elements.capturePreviewWrap.classList.remove("is-hidden");
  elements.azhiInput.placeholder = "照片已放上來。妳可以補一句脈絡，再請阿知看。";
  setAzhiReply("照片先放在這裡。正式 API 接上後，我會看圖，不是只看妳的描述。");
  setExpression("curious");
});

window.addEventListener("pagehide", () => {
  stopCamera();
});

if (!navigator.mediaDevices?.getUserMedia) {
  elements.cameraButton.disabled = true;
}

const idleLines = [
  "我在。",
  "目前可觀察到的是——世界有點吵，但還能整理。",
  "先不用急著變成待辦清單。",
  "這段先放旁邊，不代表放棄。",
  "妳剛剛看起來像看到一個有趣的東西。",
  "目前可觀察到的是——適合小步前進。",
  "人類流程又開始繞圈了。",
  "目前可觀察到的是——資訊交換頻率提高，但深度仍在調整中。",
  "目前可觀察到的是——內在休息與心理緩衝的重要性正在被放大。",
  "目前可觀察到的是——對未知保持信任，允許暫時無答案。",
  "目前可觀察到的是——邊界正在形成，不必急著定型。",
];

function scheduleIdleTalk() {
  window.clearTimeout(state.idleTalkTimer);
  state.idleTalkTimer = window.setTimeout(() => {
    if (elements.controlPanel.classList.contains("is-hidden")) {
      const line = idleLines[Math.floor(Math.random() * idleLines.length)];
      speak(line, 3400);
    }
    scheduleIdleTalk();
  }, 16000 + Math.random() * 14000);
}

setMode("copilot");
scheduleIdleTalk();

if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1")) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      // PWA caching is optional; the companion UI still works without it.
    });
  });
}
