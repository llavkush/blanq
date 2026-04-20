# Privacy Policy for Blanq

**Effective date:** April 17, 2026
**Last updated:** April 17, 2026

This Privacy Policy describes how the **Blanq** browser extension ("Blanq", "the extension", "we") handles information when you use it. Blanq is an unofficial third-party tool and is not affiliated with, endorsed by, or sponsored by OpenAI.

## Summary

**Blanq does not collect, store, transmit, sell, or share any personal data.** All activity happens locally in your browser, within your existing ChatGPT session. No data is sent to the extension's developer or any third party other than ChatGPT itself (which you are already using).

## 1. Information we collect

**We do not collect any information.** Specifically, Blanq does not collect, receive, store, or transmit:

- Personally identifiable information (name, email, address, phone, etc.)
- Authentication information (passwords, tokens, cookies, credentials)
- Personal communications (the content of your ChatGPT conversations, messages, or prompts)
- Financial or payment information
- Health information
- Location information
- Web history or browsing activity
- User activity (clicks, keystrokes, mouse movements, scrolling)
- Website content outside of chatgpt.com
- Any analytics, telemetry, crash reports, or usage metrics

## 2. How the extension works

Blanq runs entirely inside your browser tab on `chatgpt.com` (and `chat.openai.com`). When you use it:

1. It reads a list of your own conversations by calling ChatGPT's own API endpoints (for example, `chatgpt.com/backend-api/conversations`) using the session you are already logged into.
2. It displays that list in a panel overlaid on the ChatGPT page.
3. When you select conversations and click Delete / Unarchive / Unpin, it calls ChatGPT's own API to perform that action on those conversations.

All of these network requests go directly from your browser to `chatgpt.com`. None of them pass through any server controlled by Blanq's developer — because there is no such server.

## 3. Data storage

Blanq does not use `chrome.storage`, `localStorage`, `IndexedDB`, or cookies to persist any data. Your conversation list is held only in the memory of the open tab and is discarded when the tab is closed or reloaded.

## 4. Permissions we request and why

Blanq requests the minimum permissions needed to function:

- **Host permission for `https://chatgpt.com/*` and `https://chat.openai.com/*`** — required to inject the management UI into the ChatGPT website and to call ChatGPT's conversation API endpoints on your behalf using your existing logged-in session. Without this permission the extension cannot function.

Blanq does **not** request any of the following permissions:

- `tabs`, `history`, `bookmarks`, `cookies`, `webRequest`, `downloads`, `management`, `storage`, `identity`, `geolocation`, `notifications`, or any host permission for any website other than ChatGPT.

## 5. Third-party services

Blanq does not integrate with any third-party analytics, advertising, crash-reporting, error-tracking, or data-processing services. It does not load code from remote servers. All extension code is bundled inside the extension package that Chrome Web Store reviews and installs.

The only service Blanq interacts with is ChatGPT itself (operated by OpenAI), which you are already using. Your use of ChatGPT is governed by OpenAI's own Terms of Use and Privacy Policy: <https://openai.com/policies/privacy-policy>.

## 6. Remote code

Blanq does not download, fetch, or execute any remote code, script, WASM module, or eval'd content. The extension's JavaScript is entirely contained within the extension bundle and is reviewable in the Chrome Web Store listing.

## 7. Children's privacy

Blanq does not knowingly collect information from anyone, including children under 13. Since Blanq collects no information at all, this policy's effect is the same for all users regardless of age.

## 8. Data sale and sharing

We do not sell, rent, trade, or share any user data, because we do not collect any user data. We do not use any information for purposes unrelated to the extension's single purpose (bulk managing the user's own ChatGPT conversations).

We do not use any information to:

- Determine creditworthiness or for lending purposes
- Build advertising profiles
- Train machine-learning models
- Provide to data brokers or third parties for marketing

## 9. Security

Because Blanq does not collect or transmit data, there is no user data in our possession that could be breached. All actions taken by the extension are executed in your browser and authenticated by your own ChatGPT session, which is protected by OpenAI's security controls.

## 10. Your choices

You can stop all processing at any time by:

- Clicking the **×** button to close the Blanq panel
- Removing the extension from `chrome://extensions`

Uninstalling the extension completely removes its code from your browser.

## 11. Changes to this policy

If this policy changes in the future, we will update the "Last updated" date at the top and publish the new version at the same URL as this one. Material changes will also be reflected in the extension's Chrome Web Store listing description.

## 12. Contact

For questions about this policy or the extension, please open an issue on the extension's public repository. Because Blanq does not collect personal data, there is no data-subject access, deletion, or portability request to file — there is no stored data to access, delete, or export.

## 13. Disclaimer

Blanq is an independent, unofficial tool. "ChatGPT" and "GPT" are trademarks of OpenAI. This extension is not affiliated with, endorsed by, or sponsored by OpenAI. Your use of ChatGPT through Blanq remains subject to OpenAI's terms.
