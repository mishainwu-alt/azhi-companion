# RAG Update Plan (Mock)

本輪只建立設計，不排程、不掃描、不大量寫入 Google Drive。

## Purpose

每週掃描 Google Drive，更新 Azhi Companion 的 context index，讓阿知能跟上 Monika 的最新狀態。

## Memory Weight

照片 > 日記 > 線條狗 > 私人專案 > 閱讀 > 新聞 > repo

越接近 Monika 當天真實生命狀態，權重越高。越偏外部資訊或工程狀態，權重越低。

## Mock Flow

1. 讀取 `drive-targets.config.js` 的資料夾 map。
2. 依 `memory-weight.config.js` 排定掃描優先序。
3. 產生本週 context summary 草稿。
4. 草稿預計放到 `13_Azhi_exchange_diary / Azhi-Diary_Engine`。
5. Monika 確認後，未來才允許寫入 Drive。

## Not In This Round

- 不建立 cron / automation。
- 不讀取大量 Drive 內容。
- 不寫入 Drive。
- 不建立 embedding / vector DB。
- 不把 repo 更新當成高權重記憶。
