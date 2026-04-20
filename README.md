# Blanq — Bulk Chat Cleaner for ChatGPT

A Chrome extension to bulk-delete, unarchive, and unpin ChatGPT conversations. Because ChatGPT's web UI only lets you delete chats one by one or all at once.

## Features

- Lists all your conversations (active + archived) with multi-select checkboxes
- Scope chips: All / Active / Archived / Pinned
- Title search
- Preset quick-selects: Today, This week, Older than 30/90/180/365 days, Untitled, Short titles, Duplicates, All archived, All unpinned, Unarchived & unpinned, Invert
- Bulk actions: Delete, Unarchive, Unpin
- Preloads conversations when the page opens, so clicking the panel feels instant
- Throttled deletes (200ms) to avoid rate limits
- Light/dark theme matches ChatGPT

## Install (developer mode)

1. Open `chrome://extensions`
2. Enable **Developer mode** (top-right)
3. Click **Load unpacked** and select the `extension/` folder
4. Open [chatgpt.com](https://chatgpt.com) — click the floating button bottom-right

## Project layout

```
extension/   Chrome extension source — point "Load unpacked" here
docs/        GitHub Pages site (index.html, privacy.html)
```

Enable GitHub Pages in repo settings → **Deploy from branch** → `main` / `/docs`.

## How it works

Uses ChatGPT's internal `/backend-api/conversations` endpoints with the access token from `/api/auth/session`. Everything runs client-side in your logged-in browser session — no external servers, no telemetry.

## Caveats

- OpenAI may change their internal API at any time, breaking this extension
- Deleting is permanent (same as the regular UI)
- Very large histories (10k+ chats) take a few seconds to load initially

## Disclaimer

Unofficial. Not affiliated with, endorsed by, or sponsored by OpenAI. "ChatGPT" and "GPT" are trademarks of OpenAI.

## Author

Made by **Lavkush Gupta**.
