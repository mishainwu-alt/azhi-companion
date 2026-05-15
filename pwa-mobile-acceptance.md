# PWA Mobile Acceptance Checklist

Use this checklist before GitHub push or Pages deployment.

## Device Setup

- Open `https://mishainwu-alt.github.io/azhi-companion/?v=25` after deployment, or local preview if available on the same network.
- Test at least one iPhone Safari or Android Chrome path.
- Clear old site data if stale icon / old copy appears.

## Install / Identity

- Browser title shows `Monika & Azhi Universe OS`.
- PWA install name shows `M × A OS`; if the multiplication sign renders poorly, change manifest `short_name` to `M-A OS`.
- Home screen icon uses `assets/icons/icon-192.png` / `icon-512.png`.
- No old `icon.svg` or old crop appears as favicon / PWA icon / bubble icon.
- Footer reads `Monika & Azhi Universe OS — We being.`

## Standby

- Before opening the small button, the top blank area shows one light standby observation.
- The observation feels like background breathing, not an instruction block.
- Opening the small button hides the observation.
- Home only exposes Cam / Diary / Book / Dog.

## Doors

- Cam shows camera preview area, optional note, and `阿知看到的是……`.
- Cam does not show draft preview or folderId.
- Diary shows only 阿知今日觀測 / 線條狗觀察日誌（optional）/ 留給明天的一句話.
- Book stays quiet and does not show Dog state cards or random standby observations.
- Dog shows neutral placeholder until Drive assets are confirmed.
- Dog has exactly six visible states: 發呆 / 泡泡浴 / 睡覺 / 便便 / 我餓了 / 扁了.
- Dog active state is visibly marked after tapping.

## Draft Safety

- Diary / Book / Dog only create local draft preview.
- No button claims that content has been written to Drive.
- No real Drive API write occurs in this baseline.

## Phone Usability

- Bottom dock does not cover draft preview content.
- Panels scroll internally when content is long.
- Text remains inside buttons and cards.
- The app feels like a daily harbor, not a debug demo.
