# 🛠️ Vanilj DevTools Plugin

A developer utility plugin for the Vanilj framework that adds powerful inspection, logging, undo/redo, and snapshot features to signals and state management.

---

## ✅ Features

- 🔍 **Signal Watcher**: Observe individual signal changes in real time.
- 🧠 **Snapshot History**: Automatically store snapshots of all signal values.
- ↩️ **Undo / Redo**: Step through past snapshots with simple undo/redo logic.
- 🧾 **Filtered Mutation Logging**: Limit console logs to specific signals.
- 📦 **Signal Registry**: Track named signals in a global registry for inspection.

---

## 🧪 Installation

Place the plugin in your `vanilj-plugins/` folder and import it where needed:

```js
import { useVaniljDevtools, registerSignal } from '../../vanilj-plugins/devtools.js'
```

Initialize once:

```js
const devtools = useVaniljDevtools({ maxSnapshots: 100 })
```

---

## 🧰 Usage

### 🔄 Watch Signal Changes

```js
devtools.watch(mySignal, (s, oldVal, newVal) => {
  console.log('Signal changed:', s.__devName, oldVal, '→', newVal)
})
```

### 📸 View History

```js
const history = devtools.getHistory()
console.table(history)
```

### ↩️ Undo / Redo

```js
devtools.undo()
devtools.redo()
```

### 🎯 Filter Logs

```js
devtools.config({
  logOnly: ['user.name', 'theme']
})
```

---

## 🆔 Signal Naming

For better DevTools support, register your signals with names:

```js
registerSignal('user.name', userNameSignal)
registerSignal('theme', themeSignal)
```

This enables:

- Better logs
- Named snapshots
- Easier filtering

---

## 🧠 How It Works

- Signals are patched at creation time (`signal:create`) to intercept `.value` updates.
- Mutations are logged if matched by the filter set.
- Snapshots store a deep clone of all registered signals.
- Undo/redo restores from snapshot history.

---

## 🔐 Advanced Notes

- `__vaniljSignals` is a global object used only in development.
- Signal patches include flags to avoid recursive devtools activity (`__skipDevLog`, `__skipDevSnapshot`).
- Works best with `registerSignal()` for accurate naming and logging.

---

## 🧼 Cleanup

To disable watchers:

```js
const unwatch = devtools.watch(...)
unwatch()
```

---

## 🔮 Future Ideas

- Time travel playback
- Visual devtools panel
- Export/import snapshot states
- Integration with browser extension or remote logger

---

## 📦 File: `plugins/devtools.js`

