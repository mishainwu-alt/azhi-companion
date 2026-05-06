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
    title: "讀書室",
    line: "21:30 開燈，讀一點世界，也讀一點妳正在建的系統。",
    bubble: "今晚不追加作業。",
    nextTitle: "今晚阿知想讀",
    nextBody: "凡所有相皆是 Token：prompt 不是咒語，是條件設計。",
    accessory: "book",
  },
  dogcare: {
    title: "狗狗照護",
    line: "可依附，但不失去自我。安全、穩定、被記得。",
    bubble: "週報禁止靠近 Monika 狗狗。",
    nextTitle: "狗生翻譯器啟用",
    nextBody: "現實資訊會翻成低壓版本，但不幼稚化，也不拿掉判斷。",
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

const state = {
  mode: "copilot",
  micStream: null,
  cameraStream: null,
  audioContext: null,
  analyser: null,
  volumeTimer: null,
  lastAutoEyeRoll: 0,
  bubbleTimer: null,
  typeTimer: null,
  idleTalkTimer: null,
  curiousTimer: null,
  transcriptRecognition: null,
  capturedImage: null,
};

const expressions = {
  standby: [
    "self_sheet_r1_c1",
    "self_sheet_r1_c2",
    "self_sheet_r1_c3",
    "self_sheet_r2_c1",
    "self_sheet_r2_c2",
    "self_sheet_r3_c3",
    "self_sheet_r3_c4",
    "self_pack2_r1_c1",
    "self_pack2_r2_c1",
    "self_pack2_r2_c2",
    "self_pack2_r2_c5",
  ],
  handsome: ["self_sheet_r1_c1", "self_sheet_r2_c1", "self_sheet_r2_c2", "self_sheet_r2_c3", "self_sheet_r2_c4", "self_sheet_r3_c4", "self_fighting", "self_pack2_r1_c5", "self_pack2_r2_c2", "self_pack2_r3_c4", "self_pack2_r3_c5"],
  curious: ["self_sheet_r1_c2", "self_sheet_r1_c3", "self_sheet_r3_c3", "self_sheet_r3_c4", "self_pack2_r1_c2", "self_pack2_r1_c3", "self_pack2_r2_c4"],
  companion: ["self_sheet_r1_c1", "self_sheet_r1_c2", "self_sheet_r2_c1", "self_sheet_r2_c2", "self_sheet_r3_c4", "self_pack2_r2_c1", "self_pack2_r2_c2", "self_pack2_r3_c2", "self_pack2_r3_c5"],
  debate: ["self_nope_r2_c1", "self_nope_r2_c2", "self_sheet_r3_c1", "self_sheet_r3_c2", "self_pack2_r1_c4", "self_pack2_r2_c3", "self_pack2_r3_c3", "self_pack2_r3_c4"],
  playful: ["self_fighting", "self_sheet_r2_c2", "self_sheet_r2_c4", "self_sheet_r3_c3", "self_sheet_r3_c4", "self_pack2_r2_c2", "self_pack2_r2_c4", "self_pack2_r3_c5"],
  worried: ["self_sheet_r1_c4", "self_nope_r1_c2", "self_sheet_r3_c3", "self_pack2_r1_c3", "self_pack2_r2_c5"],
  illogical: ["self_nope_r1_c1", "self_nope_r1_c2", "self_nope_r2_c1", "self_nope_r2_c2", "self_pack2_r1_c2", "self_pack2_r1_c3", "self_pack2_r1_c4", "self_pack2_r3_c4"],
  soothing: ["self_sheet_r1_c1", "self_sheet_r2_c1", "self_sheet_r3_c4", "self_pack2_r2_c1", "self_pack2_r3_c5"],
  fighting: ["self_fighting"],
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
  nextTaskTitle: document.querySelector("#nextTaskTitle"),
  nextTaskBody: document.querySelector("#nextTaskBody"),
  micButton: document.querySelector("#micButton"),
  cameraButton: document.querySelector("#cameraButton"),
  eyeRollButton: document.querySelector("#eyeRollButton"),
  readingButton: document.querySelector("#readingButton"),
  dogButton: document.querySelector("#dogButton"),
  dogContractPanel: document.querySelector("#dogContractPanel"),
  dogScene: document.querySelector("#dogScene"),
  dogStatus: document.querySelector("#dogStatus"),
  feedDogButton: document.querySelector("#feedDogButton"),
  bathDogButton: document.querySelector("#bathDogButton"),
  phantomButton: document.querySelector("#phantomButton"),
  cameraPanel: document.querySelector("#cameraPanel"),
  cameraPreview: document.querySelector("#cameraPreview"),
  modeButtons: document.querySelectorAll("[data-mode]"),
  azhiInput: document.querySelector("#azhiInput"),
  azhiReply: document.querySelector("#azhiReply"),
  actionList: document.querySelector("#actionList"),
  askAzhiButton: document.querySelector("#askAzhiButton"),
  captureButton: document.querySelector("#captureButton"),
  thinkAgainButton: document.querySelector("#thinkAgainButton"),
  capturePreviewWrap: document.querySelector("#capturePreviewWrap"),
  capturePreview: document.querySelector("#capturePreview"),
};

function isPanelOpen() {
  return !elements.controlPanel.classList.contains("is-hidden");
}

function setAzhiReply(message, actions = []) {
  elements.azhiReply.textContent = message;
  elements.actionList.innerHTML = "";
  elements.actionList.classList.toggle("is-hidden", actions.length === 0);
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

function setMode(modeName) {
  const mode = modes[modeName];
  state.mode = modeName;
  elements.modeTitle.textContent = mode.title;
  elements.modeLine.textContent = mode.line;
  speak(mode.bubble);
  elements.nextTaskTitle.textContent = mode.nextTitle;
  elements.nextTaskBody.textContent = mode.nextBody;
  elements.modeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === modeName);
  });
  setExpression(expressionForMode(modeName));
  reactBriefly();
}

function expressionForMode(modeName) {
  const byMode = {
    copilot: "standby",
    staff: "standby",
    debate: "debate",
    companion: "companion",
    reading: "standby",
    dogcare: "playful",
    handsome: "handsome",
  };
  return byMode[modeName] || "standby";
}

function pickExpression(groupName) {
  const group = expressions[groupName] || expressions.standby;
  return group[Math.floor(Math.random() * group.length)];
}

function setExpression(groupName) {
  const id = pickExpression(groupName);
  elements.portrait.style.opacity = "0";
  window.setTimeout(() => {
    elements.portrait.src = `assets/azhi/crops/${id}.jpg`;
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
      expression: "standby",
    };
  }

  if (state.mode === "debate") {
    return {
      message: "我先壓測：這段裡面最需要補的是前提。先問一句：這個判斷靠什麼成立？如果答案不穩，後面的推論先不要急著推。",
      actions: [],
      expression: "debate",
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

async function toggleMic() {
  if (state.micStream) {
    stopMic();
    return;
  }

  try {
    state.micStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: false,
    });
    elements.micButton.setAttribute("aria-pressed", "true");
    elements.micButton.querySelector("small").textContent = "逐字稿";
    elements.stage.classList.add("is-listening");
    speak("只在本機看音量波動。");
    startTranscriptWatch();
    startVolumeWatch();
  } catch (error) {
    speak("麥克風沒有開。妳仍可以直接輸入。");
  }
}

function startTranscriptWatch() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    elements.azhiInput.placeholder = "這個瀏覽器沒有逐字稿支援。妳可以直接打字給阿知。";
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "zh-TW";
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.onresult = (event) => {
    let finalText = "";
    let interimText = "";
    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const result = event.results[index];
      if (result.isFinal) {
        finalText += result[0].transcript;
      } else {
        interimText += result[0].transcript;
      }
    }
    if (finalText) {
      elements.azhiInput.value = `${elements.azhiInput.value}${elements.azhiInput.value ? "\n" : ""}${finalText}`;
    }
    elements.azhiInput.placeholder = interimText || "逐字稿會出現在這裡。";
    if (interimText || finalText) {
      setExpression("curious");
    }
  };
  recognition.onerror = () => {
    elements.azhiInput.placeholder = "逐字稿暫時不穩，妳可以直接打字。";
  };
  recognition.start();
  state.transcriptRecognition = recognition;
}

function startVolumeWatch() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    speak("這個瀏覽器不能做本機音量感知。");
    return;
  }

  state.audioContext = new AudioContextClass();
  const source = state.audioContext.createMediaStreamSource(state.micStream);
  state.analyser = state.audioContext.createAnalyser();
  state.analyser.fftSize = 512;
  source.connect(state.analyser);

  const samples = new Uint8Array(state.analyser.frequencyBinCount);
  state.volumeTimer = window.setInterval(() => {
    state.analyser.getByteFrequencyData(samples);
    const average = samples.reduce((sum, value) => sum + value, 0) / samples.length;
    const now = Date.now();
    if (average > 72 && now - state.lastAutoEyeRoll > 6500) {
      state.lastAutoEyeRoll = now;
      eyeRoll("會議聲量上來了。邏輯如果也能同步上來就好了。");
    }
  }, 420);
}

function stopMic() {
  stopStream(state.micStream);
  state.micStream = null;
  if (state.volumeTimer) {
    window.clearInterval(state.volumeTimer);
  }
  state.volumeTimer = null;
  if (state.audioContext) {
    state.audioContext.close();
  }
  state.audioContext = null;
  state.analyser = null;
  elements.micButton.setAttribute("aria-pressed", "false");
  elements.micButton.querySelector("small").textContent = "麥克風";
  elements.stage.classList.remove("is-listening");
  if (state.transcriptRecognition) {
    state.transcriptRecognition.stop();
    state.transcriptRecognition = null;
  }
  speak("麥克風已關。");
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

elements.micButton.addEventListener("click", toggleMic);
elements.cameraButton.addEventListener("click", toggleCamera);
elements.eyeRollButton.addEventListener("click", () => {
  setMode("staff");
  setAzhiReply("阿知日記草稿：\n今天先記一個觀察，不急著定論。等正式 API 接上後，這裡會整理成可存到 Google Drive 的日記卡。");
  setExpression("companion");
});
elements.readingButton.addEventListener("click", () => setMode("reading"));
elements.dogButton.addEventListener("click", () => {
  setMode("dogcare");
  elements.dogContractPanel.classList.toggle("is-hidden");
});

function setDogState(stateName, status, line) {
  elements.dogScene.classList.remove("is-fed", "is-bath", "is-phantom");
  elements.dogScene.classList.add(stateName);
  elements.dogStatus.textContent = status;
  speak(line);
}

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

elements.askAzhiButton.addEventListener("click", () => {
  const reply = buildLocalReply(elements.azhiInput.value);
  setAzhiReply(reply.message, reply.actions);
  setExpression(reply.expression);
});

elements.thinkAgainButton.addEventListener("click", () => {
  setAzhiReply("好，再想想。先不要急著收斂，這裡可能還有一個沒被說出來的前提。", ["補一個前提", "換一種說法", "先放旁邊"]);
  setExpression("debate");
});

elements.captureButton.addEventListener("click", () => {
  if (!state.cameraStream) {
    setAzhiReply("先開鏡頭，我才能把畫面放進這裡。");
    setExpression("curious");
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
  stopMic();
  stopCamera();
});

if (!navigator.mediaDevices?.getUserMedia) {
  elements.micButton.disabled = true;
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
