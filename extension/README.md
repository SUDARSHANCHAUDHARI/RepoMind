# RepoMind AI — Chrome Extension

## Setup

1. Open Chrome → `chrome://extensions`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Select this `extension/` folder

## Usage

1. Add your OpenAI API key on the Options page (see [API key](#api-key))
2. Open any GitHub repo (e.g. `https://github.com/facebook/react`)
3. Click the RepoMind AI extension icon
4. Click **Analyze this repo**
5. View stack, architecture, and core features in the popup
6. Click **Open Full Analysis** to see the complete breakdown on the web app

## API key

The app is bring-your-own-key: every analysis needs your own OpenAI API key, sent to the app as
the `x-api-key` header. No key ships with the extension.

1. Open `chrome://extensions`, find RepoMind AI and click **Details** → **Extension options**
   (or right-click the toolbar icon → **Options**).
2. Paste the key into **OpenAI API key** and click **Save**. Leave it empty and save to remove it.

The key is stored in `chrome.storage.local` (this device only, not synced). Without a key the popup
shows a message and an **Open Options** button instead of calling the API.

## App URL

The extension calls the deployed app at `https://repomind.sudarshantechlabs.com` by default
(`DEFAULT_APP_URL` in `config.js`).

To point it somewhere else, for example `http://localhost:3000` during local development:

1. Open `chrome://extensions`, find RepoMind AI and click **Details** → **Extension options**
   (or right-click the toolbar icon → **Options**).
2. Enter the app URL and click **Save**. **Reset to default** restores the deployed URL.

The setting is stored in `chrome.storage.sync`, so it survives reloads of the unpacked extension.

## Permissions

The extension has host permission for `https://repomind.sudarshantechlabs.com/*`, so the popup can
call the API without CORS headers. When you save a different app URL, Chrome asks for access to that
site (any `https://` site or `http://localhost`); the URL is saved only if you allow it. Other `http://`
hosts are not supported.

## Icons

Add `icon16.png`, `icon48.png`, `icon128.png` to this folder.
You can generate them from any square logo image.
