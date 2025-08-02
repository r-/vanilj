# 🧠 Vanilj Plugin: `reactive-objects.js`

This plugin adds deep signal-based reactivity to plain JavaScript objects and arrays by wrapping them in lightweight proxies. It integrates seamlessly with the Vanilj reactivity system and is ideal for modeling complex state, forms, or reactive view models.

---

## ✨ Features

- 🧬 Deep object and array reactivity using `signal()`
- 🔁 Automatic signal updates for nested get/set/delete operations
- 🧠 Full integration with `effect()`, `computed()`, and `batch()`
- 📦 Preserves nested signals — does not unwrap them
- 🧪 Minimal runtime footprint, fully optional plugin

---

## 📦 API

### `reactive(obj: object | array): Proxy`

Wraps a plain object or array with a reactive proxy.

```js
import { reactive } from "./vanilj-plugins/reactive-objects.js"

const state = reactive({
  name: "Ada",
  skills: ["math", "logic"]
})

effect(() => {
  console.log(state.name) // logs on change
})

state.name = "Lovelace" // triggers effect
```

---

### `isReactive(obj: any): boolean`

Returns `true` if the object is a reactive proxy created by this plugin.

```js
isReactive(state) // true
```

---

### `unwrap(obj: Proxy): object`

Returns a plain object or array by unwrapping all signal `.value`s recursively.

```js
unwrap(state)
// → { name: "Lovelace", skills: ["math", "logic"] }
```

---

### `toRaw(proxy: Proxy): object`

Returns the original non-reactive object before proxying.

```js
toRaw(state) === original // true
```

---

## 🧪 Example

```js
const form = reactive({
  user: {
    id: signal(42),
    name: "Grace"
  },
  tags: ["pioneer", "scientist"]
})

effect(() => {
  console.log(form.user.name)
})

form.user.name = "Grace Hopper" // reactive update
```

---

## ⚠️ Caveats

- Does **not** unwrap or mutate nested signals — they remain reactive.
- Proxies are not designed for DOM elements or class instances.
- Designed for *application state*, not serialization or transport.

---

## 🧰 Use Cases

- Reactive object forms with deep binding
- Complex shared state models
- JSON-style view models
- Stores with nested structure

---

## ✅ Status

- 🔌 Optional plugin — doesn’t affect core bundle
- ✅ Stable and extensible
- 🧪 Works with Vanilj `effect`, `computed`, `batch`, `readonly`
