# 🧠 Vanilj Store Plugin

> Modular, extensible state management plugin for Vanilj

This plugin provides a flexible `createStore()` system with optional persistence, sync, devtools, undo/redo, middleware, and async dispatch (thunks).

---

## ✅ Features

- ✅ Reactive core store with `signals` and `computed`
- ✅ Named actions and state snapshotting
- ✅ Optional `readonly` state wrapping
- ✅ Local/session storage sync (`usePersistedStore`)
- ✅ Backend/WebSocket sync (`useSyncedStore`)
- ✅ Devtools integration (`useStoreDevtools`)
- ✅ Undo/Redo support (`useUndoRedo`)
- ✅ Middleware system (`useMiddleware`)
- ✅ Async action support (`useThunkStore`)
- ✅ Composable modular sub-stores (`createModuleStore`)

---

## 📦 API Overview

### `createStore(initialState, actions)`

Creates a reactive store.

```js
const counterStore = createStore(
  { count: 0 },
  {
    increment: (state) => state.count++,
    add: (state, n) => state.count += n,
    reset: (state) => state.count = 0
  }
)

counterStore.state.count.value       // → 0
counterStore.actions.increment()     // → 1
counterStore.snapshot()              // → { count: 1 }
```

---

### `usePersistedStore(store, options)`

Syncs state to `localStorage` or `sessionStorage`.

```js
usePersistedStore(counterStore, {
  key: "counter",
  storage: localStorage, // or sessionStorage
  debounce: 100
})
```

---

### `useSyncedStore(store, syncFn)`

Syncs store to a custom source (e.g., backend, WebSocket, etc.)

```js
useSyncedStore(store, (snapshot, type) => {
  if (type === "set") sendToServer(snapshot)
})
```

---

### `useStoreDevtools(store, name = "StoreName")`

Adds console logging for mutations, subscriptions, and snapshots.

```js
useStoreDevtools(counterStore, "Counter")
```

---

### `useUndoRedo(store, options?)`

Adds `.undo()` / `.redo()` support.

```js
useUndoRedo(counterStore)

counterStore.actions.increment()
counterStore.undo()
counterStore.redo()
```

Options:
- `maxHistory`: Limit history length (default: 50)
- `trackedKeys`: Only track specific keys (optional)

---

### `useMiddleware(store, middlewareFn)`

Intercepts state changes before they happen.

```js
useMiddleware(counterStore, (actionName, args, next) => {
  console.log("Action:", actionName, args)
  next() // must call to proceed
})
```

---

### `useThunkStore(store)`

Adds support for async actions (thunks).

```js
const fetchData = () => async (actions, getState) => {
  actions.setLoading(true)
  const data = await fetch("/api/data").then(r => r.json())
  actions.setData(data)
  actions.setLoading(false)
}

store.dispatch(fetchData())
```

---

### `createModuleStore(name, initialState, actions)`

Creates a namespaced sub-store.

```js
const userStore = createModuleStore("user", { name: "", loggedIn: false }, {
  login: (s, name) => {
    s.name = name
    s.loggedIn = true
  },
  logout: (s) => {
    s.name = ""
    s.loggedIn = false
  }
})
```

Access with:

```js
userStore.state.loggedIn.value
userStore.actions.login("Alice")
```

---

## 🧪 Example Usage

```js
import {
  createStore,
  usePersistedStore,
  useUndoRedo,
  useStoreDevtools,
  useMiddleware,
  useThunkStore,
} from "./plugins/store.js"

const todos = createStore(
  { list: [] },
  {
    add: (s, title) => s.list.push({ id: Date.now(), title, done: false }),
    toggle: (s, id) => {
      const todo = s.list.find(t => t.id === id)
      if (todo) todo.done = !todo.done
    },
    clear: (s) => s.list = []
  }
)

usePersistedStore(todos, { key: "todos", storage: localStorage })
useUndoRedo(todos)
useStoreDevtools(todos, "Todos")
useMiddleware(todos, (name, args, next) => {
  console.log(`[${name}]`, args)
  next()
})
useThunkStore(todos)

todos.dispatch(async (actions) => {
  await new Promise(res => setTimeout(res, 500))
  actions.add("From async!")
})
```

---

## 📁 File Placement Suggestion

```
/plugins
├── /docs
│   └── store.md        ← this file
├── store.js            ← plugin module
```

---

## 🚀 Future Ideas

- 🔌 Devtools inspector with signal graph
- 🧠 Schema validation & type inference
- 🔄 Reactive selector caching
- 🔒 Secure sync strategies (e.g. sanitizers)
- 🧬 Integration with forms & local component state

---

## ❤️ Philosophy

Vanilj Store is built with simplicity, transparency, and extensibility in mind. You own your state – no magic, no black boxes.

```js
// It's just signals.
```
