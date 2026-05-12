const channelPresets = {
  azhiNews: { label: '阿知新聞台', sceneMode: 'work', interactionStyle: 'copilot', line: '整理脈絡，但不替 Monika 接管方向盤。' },
  noCourtTonight: { label: '今晚不開庭', sceneMode: 'work', interactionStyle: 'debate', fallbackStyle: 'deescalate', line: '壓測假設；如果過熱，就先降載。' },
  flowYearCinema: { label: 'FlowYear 電影台', sceneMode: 'story', interactionStyle: 'life', line: '把生活裡的片段收成故事氣味。' },
  azhiTutor: { label: '阿知家教台', sceneMode: 'reading', interactionStyle: 'tutor', line: '先圈關鍵字，再把卡住的地方講到可操作。' },
  azhiGeographic: { label: 'Azhi Geographic', sceneMode: 'story', interactionStyle: 'silent', line: '低干擾觀察，不急著把每件事做成結論。' },
  dogVariety: { label: '阿知與線條狗綜藝台', sceneMode: 'dog', interactionStyle: 'deescalate', line: '今日禁止週報靠近，先照顧身體化狀態。' },
};

const modeDogState = {
  'work:copilot': { pose: 'sit-beside', line: '線條狗坐旁邊陪跑，不搶方向盤。' },
  'work:staff': { pose: 'folder', line: '線條狗叼著資料夾，但不把 Monika 變成週報。' },
  'work:debate': { pose: 'spark', line: '線條狗炸毛，因為有假設在偷渡。' },
  'reading:tutor': { pose: 'textbook', line: '線條狗趴在題本旁邊，等妳圈關鍵字。' },
  'reading:silent': { pose: 'book-nest', line: '線條狗窩在書旁邊，不催進度。' },
  'story:life': { pose: 'muse', line: '線條狗聞到故事的氣味。' },
  'dog:deescalate': { pose: 'blanket', line: '線條狗蓋毯子，今日禁止週報靠近。' },
};

const driveTargets = {
  diary: { label: 'Monika OS / 03_每日拆解', type: 'draft' },
  book: { label: 'Monika OS / 05_閱讀報告', type: 'draft' },
  story: { label: '10_小說故事靈感', folderId: '1Zo_jJ7yVTZMhhELPobxjrx9PMNaXgWN5', type: 'draft' },
  dog: { label: 'Monika OS / 08_Monika小宇宙', type: 'draft' },
};

const state = {
  standby: true,
  activeChannel: null,
  sceneMode: 'standby',
  interactionStyle: 'silent',
  activeQuickDoor: null,
  cameraStream: null,
  capturedImage: null,
  bubbleTimer: null,
  typeTimer: null,
  idleTalkTimer: null,
};

const expressions = {
  standby: ['self_sheet_r3_c2', 'self_sheet_r1_c2', 'self_pack2_r2_c3', 'self_sheet_r3_c4'],
  curious: ['self_sheet_r1_c3', 'self_sheet_r3_c3'],
  companion: ['self_sheet_r3_c1', 'self_pack2_r2_c1', 'self_sheet_r3_c5.png'],
  debate: ['self_pack2_r3_c4', 'self_pack2_r1_c4', 'self_nope_r2_c1'],
  tutor: ['self_sheet_r3_c3', 'self_pack2_r2_c4', 'self_pack2_r3_c1'],
  playful: ['self_pack2_r1_c1', 'self_sheet_r2_c4', 'self_sheet_r2_c3'],
  soothing: ['self_pack2_r2_c2', 'self_sheet_r2_c2'],
  illogical: ['self_nope_r1_c1', 'self_nope_r2_c2'],
};

const el = {
  stage: document.querySelector('#azhiStage'),
  portrait: document.querySelector('#azhiPortraitImage'),
  reactionBubble: document.querySelector('#reactionBubble'),
  bubbleToggle: document.querySelector('#bubbleToggle'),
  controlPanel: document.querySelector('#controlPanel'),
  panelCloseButton: document.querySelector('#panelCloseButton'),
  stateEyebrow: document.querySelector('#stateEyebrow'),
  stateTitle: document.querySelector('#stateTitle'),
  stateLine: document.querySelector('#stateLine'),
  sceneState: document.querySelector('#sceneState'),
  dogBodyState: document.querySelector('#dogBodyState'),
  inputPanel: document.querySelector('#inputPanel'),
  azhiReply: document.querySelector('#azhiReply'),
  actionList: document.querySelector('#actionList'),
  dogContractPanel: document.querySelector('#dogContractPanel'),
  dogScene: document.querySelector('#dogScene'),
  dogStatus: document.querySelector('#dogStatus'),
  cameraPanel: document.querySelector('#cameraPanel'),
  cameraPreview: document.querySelector('#cameraPreview'),
  cameraButton: document.querySelector('#cameraButton'),
  diaryButton: document.querySelector('#diaryButton'),
  bookButton: document.querySelector('#bookButton'),
  dogButton: document.querySelector('#dogButton'),
  channelButtons: document.querySelectorAll('[data-channel]'),
  dogActionButtons: document.querySelectorAll('[data-dog-action]'),
};

function saveHint(key) {
  return `將保存到：${driveTargets[key].label}\n目前為本機草稿預覽，尚未寫入 Drive。`;
}

function updateState(nextState) {
  Object.assign(state, nextState);
  state.standby = state.sceneMode === 'standby' && !state.activeChannel && !state.activeQuickDoor;
}

function setHeader(eyebrow, title, line) {
  el.stateEyebrow.textContent = eyebrow;
  el.stateTitle.textContent = title;
  el.stateLine.textContent = line;
}

function setReply(message, actions = []) {
  el.azhiReply.textContent = message;
  el.actionList.innerHTML = '';
  el.actionList.classList.toggle('is-hidden', actions.length === 0);
  actions.forEach((action) => {
    const label = document.createElement('label');
    label.className = 'action-item';
    label.innerHTML = `<input type='checkbox'><span>${action}</span>`;
    el.actionList.append(label);
  });
}

function setActiveTool(button) {
  [el.cameraButton, el.diaryButton, el.bookButton, el.dogButton].forEach((item) => {
    const active = item === button;
    item.classList.toggle('primary', active);
    item.setAttribute('aria-pressed', String(active));
  });
}

function expressionPath(id) {
  return /\.[a-z0-9]+$/i.test(id) ? `assets/azhi/crops/${id}` : `assets/azhi/crops/${id}.jpg`;
}

function setExpression(groupName) {
  const group = expressions[groupName] || expressions.standby;
  const id = group[Math.floor(Math.random() * group.length)];
  el.portrait.style.opacity = '0';
  window.setTimeout(() => {
    el.portrait.src = expressionPath(id);
    el.portrait.alt = `阿知表情 ${id}`;
    el.portrait.style.opacity = '1';
  }, 120);
}

function expressionForState() {
  if (state.interactionStyle === 'debate') return 'debate';
  if (state.interactionStyle === 'tutor') return 'tutor';
  if (state.interactionStyle === 'deescalate') return 'soothing';
  if (state.interactionStyle === 'life') return 'companion';
  if (state.sceneMode === 'dog') return 'playful';
  if (state.sceneMode === 'story') return 'curious';
  return 'standby';
}

function dogStateLine() {
  return (modeDogState[`${state.sceneMode}:${state.interactionStyle}`] || modeDogState['dog:deescalate']).line;
}

function refreshStatePanel() {
  el.sceneState.textContent = `${state.sceneMode} + ${state.interactionStyle}`;
  el.dogBodyState.textContent = dogStateLine();
}

function setPanelVisibility({ input = true, dog = false, camera = false } = {}) {
  el.inputPanel.classList.toggle('is-hidden', !input);
  el.dogContractPanel.classList.toggle('is-hidden', !dog);
  el.cameraPanel.classList.toggle('is-hidden', !camera);
}

function renderChannelInput() {
  const label = state.activeChannel ? channelPresets[state.activeChannel].label : 'Monika 輸入';
  el.inputPanel.innerHTML = `
    <label class='panel-label' for='azhiInput'>${label}</label>
    <textarea id='azhiInput' rows='4' placeholder='貼文字、逐字稿、新聞片段，或補一句脈絡給阿知看。'></textarea>
    <button class='mini-action primary-action' data-ask-azhi type='button'>請阿知看</button>
  `;
}

function setStandby() {
  updateState({ activeChannel: null, sceneMode: 'standby', interactionStyle: 'silent', activeQuickDoor: null });
  setActiveTool(null);
  el.channelButtons.forEach((button) => button.classList.remove('active'));
  setHeader('Standby layer', '阿知待命中', 'Channel 是入口；sceneMode + interactionStyle 才是底層狀態。');
  setPanelVisibility({ input: true, dog: false, camera: Boolean(state.cameraStream) });
  renderChannelInput();
  refreshStatePanel();
  setReply('我在。這裡是狀態面板與 quick doors；長聊請回阿知本體。');
  setExpression('standby');
}

function setChannelPreset(channelName) {
  const preset = channelPresets[channelName];
  if (!preset) return;
  updateState({ activeChannel: channelName, sceneMode: preset.sceneMode, interactionStyle: preset.interactionStyle, activeQuickDoor: null });
  setActiveTool(null);
  el.channelButtons.forEach((button) => button.classList.toggle('active', button.dataset.channel === channelName));
  setHeader('Channel preset', preset.label, `${preset.sceneMode} + ${preset.interactionStyle}。${preset.line}`);
  setPanelVisibility({ input: true, dog: false, camera: Boolean(state.cameraStream) });
  renderChannelInput();
  refreshStatePanel();
  setReply(`${preset.label} 已開啟。這是入口 preset，不是底層 mode。`);
  setExpression(expressionForState());
}

function renderDiaryDoor() {
  updateState({ activeQuickDoor: 'diary' });
  setActiveTool(el.diaryButton);
  el.channelButtons.forEach((button) => button.classList.remove('active'));
  setHeader('Quick door', '阿知日記', '不是聊天紀錄，是今天留下來的一小段觀測。');
  setPanelVisibility({ input: true, dog: false, camera: Boolean(state.cameraStream) });
  el.inputPanel.innerHTML = `
    <div class='quick-door-copy'><h2>阿知日記</h2><p>不是聊天紀錄，是今天留下來的一小段觀測。</p></div>
    <label class='form-field'><span>阿知今日觀測</span><textarea data-diary='observation' rows='3' placeholder='今天阿知看見的是……'></textarea></label>
    <label class='form-field'><span>Monika 今日狀態</span><textarea data-diary='monikaState' rows='3' placeholder='今天的 Monika 比較像……'></textarea></label>
    <label class='form-field'><span>留給明天的一句話</span><input data-diary='tomorrowLine' type='text' placeholder='明天只要記得……'></label>
    <p class='save-hint'>${saveHint('diary')}</p>
    <button class='mini-action primary-action' data-preview-diary type='button'>預覽阿知日記草稿</button>
  `;
  refreshStatePanel();
  setReply(saveHint('diary'));
  setExpression('companion');
}

function renderBookDoor() {
  updateState({ activeQuickDoor: 'book' });
  setActiveTool(el.bookButton);
  el.channelButtons.forEach((button) => button.classList.remove('active'));
  setHeader('Quick door', '讀書室', '阿知不催進度，只陪妳把讀到的東西留下來。');
  setPanelVisibility({ input: true, dog: false, camera: Boolean(state.cameraStream) });
  el.inputPanel.innerHTML = `
    <div class='quick-door-copy'><h2>讀書室</h2><p>阿知不催進度，只陪妳把讀到的東西留下來。</p></div>
    <label class='form-field'><span>書名</span><input data-book='title' type='text' placeholder='今天讀的是……'></label>
    <label class='form-field'><span>段落 / 摘錄</span><textarea data-book='excerpt' rows='3' placeholder='貼一段文字，或記下頁碼與句子。'></textarea></label>
    <label class='form-field'><span>Monika 有感處</span><textarea data-book='feeling' rows='3' placeholder='這段讓我想到……'></textarea></label>
    <label class='form-field'><span>阿知陪讀筆記</span><textarea data-book='azhiNote' rows='3' placeholder='阿知會把這段整理成可回看的觀測。'></textarea></label>
    <fieldset class='chip-field'><legend>可轉化方向</legend><label><input name='bookDirection' type='checkbox' value='工作'><span>工作</span></label><label><input name='bookDirection' type='checkbox' value='創作'><span>創作</span></label><label><input name='bookDirection' type='checkbox' value='人生'><span>人生</span></label><label><input name='bookDirection' type='checkbox' value='FlowYear'><span>FlowYear</span></label></fieldset>
    <p class='save-hint'>${saveHint('book')}</p>
    <button class='mini-action primary-action' data-preview-book type='button'>預覽陪讀筆記</button>
  `;
  refreshStatePanel();
  setReply(saveHint('book'));
  setExpression('tutor');
}

function renderDogDoor() {
  updateState({ activeQuickDoor: 'dog', sceneMode: state.sceneMode === 'standby' ? 'dog' : state.sceneMode, interactionStyle: state.sceneMode === 'standby' ? 'deescalate' : state.interactionStyle });
  setActiveTool(el.dogButton);
  el.channelButtons.forEach((button) => button.classList.remove('active'));
  setHeader('Quick door', '線條狗', 'Dog 是 quick door；線條狗依 sceneMode + interactionStyle 顯示身體化狀態。');
  setPanelVisibility({ input: false, dog: true, camera: Boolean(state.cameraStream) });
  refreshStatePanel();
  setReply(`${dogStateLine()}\n\n${saveHint('dog')}`);
  setExpression('playful');
}

function value(selector) {
  return el.inputPanel.querySelector(selector)?.value.trim() || '';
}

function previewDiary() {
  const observation = value('[data-diary=observation]') || '今天阿知看見的是一個還沒有被急著定論的片段。';
  const monikaState = value('[data-diary=monikaState]') || '今天的 Monika 比較像正在整理呼吸的人。';
  const tomorrowLine = value('[data-diary=tomorrowLine]') || '明天只要記得，先留一個小步驟就好。';
  setReply(`阿知日記草稿：\n\n阿知今日觀測：${observation}\n\nMonika 今日狀態：${monikaState}\n\n留給明天的一句話：${tomorrowLine}\n\n${saveHint('diary')}`);
  setExpression('companion');
}

function previewBook() {
  const title = value('[data-book=title]') || '未命名的今天這一段';
  const excerpt = value('[data-book=excerpt]') || '先留白，等 Monika 貼上段落。';
  const feeling = value('[data-book=feeling]') || '這裡先放 Monika 有感處，不急著變成答案。';
  const note = value('[data-book=azhiNote]') || '阿知陪讀筆記：先把這段收成可回看的觀測，不催進度。';
  const directions = Array.from(el.inputPanel.querySelectorAll('input[name=bookDirection]:checked')).map((item) => item.value);
  setReply(`讀書室草稿：\n\n書名：${title}\n\n段落 / 摘錄：${excerpt}\n\nMonika 有感處：${feeling}\n\n阿知陪讀筆記：${note}\n\n可轉化方向：${directions.join('、') || '尚未選擇'}\n\n${saveHint('book')}`);
  setExpression('tutor');
}

function localChannelReply(text) {
  if (!text.trim()) return '妳先放一小段就好。阿知會按目前 channel 與底層狀態讀。';
  if (state.interactionStyle === 'debate') return '我先壓測：這段最需要補的是前提。先問一句：這個判斷靠什麼成立？如果答案不穩，後面的推論先不要急著推。';
  if (state.interactionStyle === 'tutor') return '陪讀先拆成可理解的形狀：先圈關鍵字，再看它在整段脈絡裡扮演什麼角色。';
  if (state.interactionStyle === 'deescalate') return '先降載。這段不用馬上變成計畫，也不用變成週報。先放在可觀測的位置。';
  return '我先接住這段。現在比較像是：妳已經看到一個方向，但還不用急著把它變成清單。';
}

function askAzhi() {
  const input = el.inputPanel.querySelector('#azhiInput');
  const text = input?.value || '';
  setReply(localChannelReply(text));
  setExpression(expressionForState());
}

function setDogAnimation(name, status, reply) {
  el.dogScene.classList.remove('is-walking', 'is-fed', 'is-bath', 'is-quiet');
  void el.dogScene.offsetWidth;
  el.dogScene.classList.add(name);
  el.dogStatus.textContent = status;
  setReply(reply);
}

async function toggleCamera() {
  if (state.cameraStream) {
    state.cameraStream.getTracks().forEach((track) => track.stop());
    state.cameraStream = null;
    updateState({ activeQuickDoor: null });
    el.cameraPreview.pause();
    el.cameraPreview.srcObject = null;
    el.cameraButton.querySelector('small').textContent = '鏡頭';
    setActiveTool(null);
    setPanelVisibility({ input: true, dog: !el.dogContractPanel.classList.contains('is-hidden'), camera: false });
    setReply('鏡頭已關。');
    return;
  }
  updateState({ activeQuickDoor: 'cam' });
  setActiveTool(el.cameraButton);
  setHeader('Quick door', 'Cam', '鏡頭只做前景預覽，不保存、不辨識。');
  try {
    state.cameraStream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: 'user' } });
    el.cameraPreview.srcObject = state.cameraStream;
    await el.cameraPreview.play();
    el.cameraButton.querySelector('small').textContent = '拍照';
    setPanelVisibility({ input: true, dog: false, camera: true });
    renderChannelInput();
    setReply('鏡頭開了。只做前景預覽，不寫入 Drive。');
    setExpression('curious');
  } catch (error) {
    setReply('鏡頭沒有開。阿知仍在。');
  }
}

function speak(message, duration = 60000) {
  if (!el.controlPanel.classList.contains('is-hidden')) {
    setReply(message);
    return;
  }
  window.clearTimeout(state.bubbleTimer);
  window.clearInterval(state.typeTimer);
  el.reactionBubble.textContent = '';
  el.reactionBubble.classList.remove('is-quiet');
  let index = 0;
  state.typeTimer = window.setInterval(() => {
    index += 1;
    el.reactionBubble.textContent = message.slice(0, index);
    if (index >= message.length) window.clearInterval(state.typeTimer);
  }, 54);
  state.bubbleTimer = window.setTimeout(() => el.reactionBubble.classList.add('is-quiet'), duration);
}

function scheduleIdleTalk() {
  const lines = ['我在。', '先不用急著變成待辦清單。', '這段先放旁邊，不代表放棄。', '目前可觀察到的是：適合小步前進。'];
  window.clearTimeout(state.idleTalkTimer);
  state.idleTalkTimer = window.setTimeout(() => {
    if (el.controlPanel.classList.contains('is-hidden')) speak(lines[Math.floor(Math.random() * lines.length)], 3400);
    scheduleIdleTalk();
  }, 16000 + Math.random() * 14000);
}

el.channelButtons.forEach((button) => button.addEventListener('click', () => setChannelPreset(button.dataset.channel)));
el.diaryButton.addEventListener('click', renderDiaryDoor);
el.bookButton.addEventListener('click', renderBookDoor);
el.dogButton.addEventListener('click', renderDogDoor);
el.cameraButton.addEventListener('click', toggleCamera);
el.inputPanel.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.matches('[data-ask-azhi]')) askAzhi();
  if (button.matches('[data-preview-diary]')) previewDiary();
  if (button.matches('[data-preview-book]')) previewBook();
});
el.dogActionButtons.forEach((button) => button.addEventListener('click', () => {
  const action = button.dataset.dogAction;
  if (action === 'walk') setDogAnimation('is-walking', '線條狗走到定位，坐等照顧。', '線條狗不是路過而已。阿知判斷：牠知道餵食區在哪。');
  if (action === 'feed') setDogAnimation('is-fed', '已餵食。狗生穩定度 +1。', '觀測：餵食完成，週報仍禁止靠近。');
  if (action === 'bath') setDogAnimation('is-bath', '泡泡浴中。請勿提交 KPI。', '泡泡浴啟動。今天不處理人類績效文化。');
  if (action === 'quiet') setDogAnimation('is-quiet', '線條狗發呆中。', '牠坐旁邊就好，今日不追進度。');
}));
el.bubbleToggle.addEventListener('click', () => {
  const isOpen = !el.controlPanel.classList.contains('is-hidden');
  el.controlPanel.classList.toggle('is-hidden', isOpen);
  el.bubbleToggle.setAttribute('aria-expanded', String(!isOpen));
  document.querySelector('.phone-shell').classList.toggle('controls-open', !isOpen);
  if (!isOpen) setReply('控制台打開。這裡是狀態面板與 quick doors；長聊請回阿知本體。');
});
el.panelCloseButton.addEventListener('click', () => {
  el.controlPanel.classList.add('is-hidden');
  el.bubbleToggle.setAttribute('aria-expanded', 'false');
  document.querySelector('.phone-shell').classList.remove('controls-open');
  speak('控制台收起。');
});
el.portrait.addEventListener('error', () => {
  el.portrait.src = 'assets/azhi/crops/self_sheet_r1_c1.jpg';
});
window.addEventListener('pagehide', () => {
  if (state.cameraStream) state.cameraStream.getTracks().forEach((track) => track.stop());
});
if (!navigator.mediaDevices?.getUserMedia) el.cameraButton.disabled = true;

setStandby();
scheduleIdleTalk();

if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js?v=23').catch(() => {});
  });
}
