# Chrome Web Store listing copy — Blanq

Use these fields verbatim when filling out the developer dashboard.

## Name (45 char max)
Blanq — Bulk Chat Cleaner for ChatGPT

## Summary / short description (132 char max)
Bulk select, filter, and delete your ChatGPT conversations. Unofficial — not affiliated with OpenAI.

## Category
Productivity

## Single purpose
Let users bulk manage (delete, archive, pin) their own ChatGPT conversations directly from the ChatGPT website.

## Detailed description
Blanq clears the clutter from your ChatGPT history. ChatGPT only lets you delete conversations one at a time or all at once — Blanq adds a clean floating panel with multi-select, filters, and bulk actions so you can sweep through your chat history in seconds.

**Features:**
- Bulk delete, unarchive, and unpin your own conversations
- Scope filters: Active / Archived / Pinned / All
- Title search
- Quick-select presets: Today, This week, Older than 30/90/180/365 days, Untitled, Duplicates, and more
- Preloads on page open — no waiting when you open the panel
- Light and dark themes that match ChatGPT

**Privacy:**
- No tracking, no analytics, no external servers
- No data ever leaves your browser
- All actions use ChatGPT's own API via your logged-in session

**Disclaimer:** Blanq is an unofficial third-party tool. It is not affiliated with, endorsed by, or sponsored by OpenAI. "ChatGPT" and "GPT" are trademarks of OpenAI. Because Blanq relies on ChatGPT's internal web endpoints, it may break if OpenAI changes them.

## Permission justifications

**Host permission (chatgpt.com, chat.openai.com):**
Required to inject the management UI into the ChatGPT website and to call the user's own ChatGPT API endpoints (list/delete/update conversations) using their existing session cookie. Without this access, the extension cannot function.

**Remote code:** None. All code is bundled in the extension package.

**Data collection / usage:**
None. Blanq does not collect, store, transmit, or share any user data.

## Privacy policy URL
Host `PRIVACY.md` on a public URL (GitHub Pages, your website, etc.) and paste the link here.
