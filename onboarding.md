# Monika & Azhi Universe OS Onboarding

## Positioning

This project is `Monika & Azhi Universe OS`. It is not an Azhi-only app, not a generic AI dashboard, and not a replacement for long ChatGPT conversations.

The product should feel like a quiet daily harbor: Monika opens it, sees that Azhi is present, and can choose a small door without being pushed into analysis.

Core identity:

- App name: `Monika & Azhi Universe OS`
- Short name: `M × A OS`
- Tagline: `We being.`
- Standby phrase: `我在。`

## Current Phase

The current local baseline is `v25.1 UI 清場`.

Do not add new features during Phase 1 usability hardening. Prioritize:

- Mobile PWA real-device acceptance
- Line dog asset / manifest cleanup
- GitHub push readiness checks

Do not:

- Connect the real Drive API
- Push GitHub without Monika confirmation
- Build RAG automation
- Add image analysis, OCR, object detection, or emotion inference
- Add new modes or restore the old single-layer mode system
- Turn the app into an admin panel, debug console, or demo surface

## Product Structure

Home standby only shows:

- `我在。`
- One low-pressure standby observation phrase
- Four quick doors: Cam / Diary / Book / Dog

ABN channels are intentionally hidden in this baseline. Channels are future UI presets, not bottom-layer modes.

Cam / Diary / Book / Dog are quick doors. They are not core modes.

## Door Behavior

Cam is a camera entrance. It should not show draft preview or folderId. It has:

- Title: `拍一張給阿知看`
- Description: `照片是今天最接近真實生命狀態的來源。`
- Optional text note
- Camera / photo preview
- A tiny fallback observation under `阿知看到的是……`

The Cam observation is not image analysis. It is a quiet placeholder sentence only.

Diary creates a local draft preview only. It should not auto-write Drive. It has:

- 阿知今日觀測
- 線條狗觀察日誌（optional）
- 留給明天的一句話

Book creates a local draft preview only. It stays quiet and reading-focused:

- 書名
- 段落 / 摘錄
- 阿知陪讀筆記
- 可轉化方向

Dog is a low-pressure SEL micro-signal door. It has exactly six visible states:

- 發呆
- 泡泡浴
- 睡覺
- 便便
- 我餓了
- 扁了

Dog may collect one optional sentence and produce a local draft candidate for `線條狗觀察日誌`.

## Assets

App identity must always use the Azhi canon icon files:

- `assets/icons/icon-192.png`
- `assets/icons/icon-512.png`

Line dog images live in Google Drive:

- `Monika OS / 11_線條狗_Image_Library`
- folderId: `1uoaDjOBDWfrQjjyZXljwkFhjTtWrpIR_`

The current UI must use a neutral placeholder until the Drive line dog assets are explicitly confirmed and wired. Do not draw a new dog, generate a substitute dog, or use temporary SVGs as official canon.

## Drive Policy

All writing remains draft-first:

1. Produce local preview.
2. Monika reviews.
3. Future confirmed flow may write to Drive.

The current baseline does not write to Google Drive. `/api/drive-draft.js` is a placeholder and must not become an active write path without a new explicit instruction.

## Handoff

If continuing from this baseline, first verify:

- `http://127.0.0.1:4173/?v=25`
- `http://127.0.0.1:4173/?door=cam&v=25`
- `http://127.0.0.1:4173/?door=diary&v=25`
- `http://127.0.0.1:4173/?door=book&v=25`
- `http://127.0.0.1:4173/?door=dog&v=25`

Then run the existing search and syntax checks before any push or packaging.
