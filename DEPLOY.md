# 阿知手機陪伴版部署

## Recommended

Use Cloudflare Pages, Vercel, Netlify, or GitHub Pages with the contents of `dist/` as the site root.

## Why HTTPS

Camera and microphone access on mobile browsers requires a secure origin. `localhost` works on the development machine, but phone and iPad need an HTTPS URL for reliable permission prompts.

## What To Publish

Publish only:

- `index.html`
- `styles.css`
- `app.js`
- `sw.js`
- `manifest.webmanifest`
- `icon.svg`
- `assets/`

Do not publish the seed `.md` files unless you intentionally want them public.

## Vercel API env

Use these environment variables on the Vercel project that hosts `/api/azhi`
and `/api/supernote`:

```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-5-mini
OPENAI_SUPERNOTE_MODEL=gpt-4.1-mini
```

`OPENAI_MODEL` is for the phone companion UI. `OPENAI_SUPERNOTE_MODEL` is for
the Supernote tutoring and SEL note-review route.
