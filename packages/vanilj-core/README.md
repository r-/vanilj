# 🌱 Vanilj Core

A **minimal, modern reactive UI core**, aligned with the [TC39 Signals proposal](https://github.com/tc39/proposal-signals). Vanilj provides a lightweight and composable foundation for building reactive web interfaces — no build step, no components required.

> ✅ TC39-aligned signals  
> ✅ Native DOM bindings  
> ✅ Lightweight html tagged template (no `htm`, no compiler)  
> ✅ Plugin system for devtools/debugging  
> ✅ SSR hydration-ready  
> ~4 KB minified and gzipped

---

## 🚀 Quick Start

No dependencies needed.

```js
// Import from local file or CDN
import {
  signal, computed, effect, batch,
  readonly, mount, unmount, hydrate,
} from './vanilj-core.js'

import { html } from './html-template.js'
```

### Example

```js
const count = signal(0)
const double = computed(() => count.value * 2)

const increment = () => count.value++

const view = html`
  <div>
    <button onclick=${increment}>Click me</button>
    <p>Count: ${count}</p>
    <p>Double: ${double}</p>
  </div>
`

mount(document.body, view)
```

---

## 🔧 Core Features

### ✅ Signals (TC39-style)

```js
const state = signal(123)
state.value++        // update
console.log(state.value) // read

state.subscribe(fn)  // on change
state.peek()         // read without tracking
```

### 🔁 Computed

```js
const fullName = computed(() => `${first.value} ${last.value}`)
```

### 👁 Effects

```js
effect(() => {
  console.log("Name changed:", fullName.value)
})
```

### 📦 Batch

```js
batch(() => {
  a.value++
  b.value++
})
```

### 🔒 Readonly

```js
const s = signal(1)
const r = readonly(s)

console.log(r.value)  // ✅
r.value = 2           // ❌ throws error
```

---

## 🖼 HTML Template System

Vanilj includes a built-in tagged template literal called `html`, which provides JSX-like syntax **without compilation**.

### ✅ Basic

```js
html`<p>Hello ${name}</p>`
```

### ✅ Events

```js
html`<button onclick=${() => alert("Clicked!")}>Click</button>`
```

### ✅ Signals (auto-binding)

```js
html`<span>Value: ${signalValue}</span>`
```

### ✅ Boolean attributes

```js
html`<input type="checkbox" checked=${isEnabled} />`
```

### ✅ Spread props

```js
const props = { class: "btn", onclick: doThing }
html`<button ...${props}>Do it</button>`
```

### ✅ SVG support

```js
html`<svg><circle r="40" /></svg>`
```

---

## 🧱 Mount & Hydration

```js
mount(document.body, html`<p>${text}</p>`)
unmount(node)

hydrate(document.getElementById("root"), () => html`<div>${signal}</div>`)
```

---

## 🔌 Plugin API

```js
import { useVaniljPlugin } from './vanilj-core.js'

useVaniljPlugin((event, data) => {
  if (event === 'signal:update') {
    console.log("Updated:", data.newValue)
  }
})
```

| Event             | Payload                          |
|------------------|----------------------------------|
| `signal:create`  | `{ signal, initialValue }`       |
| `signal:update`  | `{ newValue }`                   |
| `computed:create`| `{ computed }`                   |
| `effect:run`     | `{ fn }`                         |

---

## 🔍 Design Goals

- ✅ Align with [TC39 Signals proposal](https://github.com/tc39/proposal-signals)
- ✅ Use the platform — no virtual DOM, no compiler
- ✅ Keep core small, fast, and extensible
- ✅ Serve as base for prototyping, micro-apps, tools, experiments, and education
