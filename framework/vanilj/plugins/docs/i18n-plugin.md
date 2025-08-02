# 🌐 Vanilj i18n Plugin

This plugin provides **declarative internationalization** for Vanilj apps using custom HTML attributes. It allows UI text and attributes to automatically react to language changes via signals.

---

## ✅ Features

- **`data-i18n-key`** — Binds `textContent` to a translation key  
- **`data-i18n-attr`** — Binds attributes like `title`, `placeholder`, etc.  
- **`data-i18n-html`** — (Optional) Binds `innerHTML` (for trusted HTML)  
- ⚠️ Logs a warning if a translation key is missing  
- 🧠 One-time binding guard per element to prevent duplicate effects

---

## 📦 Installation

Ensure `i18n.js` is located in `/plugins/`, and import it into your component or app setup.

```js
import { initI18n } from "../plugins/i18n.js"
```

---

## 🧪 Usage

### HTML

```html
<h1 data-i18n-key="app.title">Fallback Title</h1>

<input
  data-i18n-attr="placeholder:search.placeholder"
  placeholder="Search..." />

<div data-i18n-html="about.htmlText"></div>
```

### JS Setup

```js
import { initI18n } from "../plugins/i18n.js"
import { i18nService } from "../services/i18nService.js"

initI18n(document, i18nService)
```

---

## 📘 API

### `initI18n(root, i18nService)`

| Param        | Type      | Description                                  |
|--------------|-----------|----------------------------------------------|
| `root`       | `Element` | DOM root (e.g. `document` or `shadowRoot`)   |
| `i18nService`| `Object`  | Must have `.t(key)` and `.lang` signal       |

---

## ⚙️ i18nService Requirements

The plugin expects a service with this minimal shape:

```js
{
  t: (key: string) => string,
  lang: signal("en") // or any reactive signal
}
```

Vanilj includes a basic `i18nService` in `/services/i18nService.js`. You can replace or extend it with your preferred backend or translation logic.

---

## 🛡️ Security Note

Only use `data-i18n-html` with **trusted, sanitized** content. Avoid injecting user-generated HTML.

---

## 🧹 Cleanup

- Uses `__i18nBound` flags to avoid rebinding on rerender  
- Does not auto-unbind (assumes long-lived static DOM or shadow roots)

---

## ✅ Status

Stable, minimal, and efficient for typical i18n use cases in Vanilj.

---
```
