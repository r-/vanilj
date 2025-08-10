# Vanilj Framework

[![npm version](https://img.shields.io/npm/v/vanilj?color=brightgreen&label=npm%20(full))](https://www.npmjs.com/package/vanilj)
[![npm version core](https://img.shields.io/npm/v/@vanilj/core?color=brightgreen&label=npm%20(core))](https://www.npmjs.com/package/@vanilj/core)
[![License MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A lightweight **reactive framework for vanilla JavaScript** with a modular plugin architecture.  
Built for **speed, simplicity, and flexibility** — works in the browser or with modern bundlers.

**🌐 Main site & documentation:** [vanilj.org](https://vanilj.org)

---

##  Purpose

Vanilj is designed primarily for **extremely fast prototyping** and **educational use**.  
It enables creating interactive web experiences in minutes, even without a build setup.  

That said—if you're building large-scale production apps, consider more **mature and battle-tested frameworks** like Vue, React, or Solid.

---

##  Features

- **Reactive Signals** — minimal reactive primitives for state  
- **Computed Values** — derived state updates automatically  
- **DOM Binding** — efficient updates via `effect()`  
- **Plugin Architecture** — pick only the features you need  
- **Tree-Shakeable** — ESM for bundlers, UMD for browsers  
- **CDN Ready** — load directly via script tags  
- **TypeScript Support** — No, VanilJ is Vanilla! :)

---

##  Packages

This monorepo includes:

### Core
- **[`@vanilj/core`](https://www.npmjs.com/package/@vanilj/core)** — signals, computed, effect, and DOM utilities.

### Plugins
- **[`@vanilj/plugin-store`](https://www.npmjs.com/package/@vanilj/plugin-store)** — state management with persistence  
- **[`@vanilj/plugin-devtools`](https://www.npmjs.com/package/@vanilj/plugin-devtools)** — debugging tools, signal tracking  
- **[`@vanilj/plugin-reactive-object`](https://www.npmjs.com/package/@vanilj/plugin-reactive-object)** — deep-reactive objects & arrays  
- **[`@vanilj/plugin-i18n`](https://www.npmjs.com/package/@vanilj/plugin-i18n)** — reactive internationalization

### Full Bundle
- **[`vanilj`](https://www.npmjs.com/package/vanilj)** — core + all official plugins, bundled as a single package.

---

##  Installation

### Option 1 — Full Bundle (Core + Plugins)
```bash
npm install vanilj
```
```js
import { signal, computed, effect, createStore } from 'vanilj'
```

### Option 2 — Modular Install
```bash
# Core
npm install @vanilj/core

# Optional plugins
npm install @vanilj/plugin-store
npm install @vanilj/plugin-devtools
npm install @vanilj/plugin-reactive-object
npm install @vanilj/plugin-i18n
```
```js
import { signal, computed, effect } from '@vanilj/core'
import { createStore } from '@vanilj/plugin-store'
```

### ESM (for bundlers)
```js
// Full bundle usage
import { signal, computed, effect } from 'vanilj'

// Modular usage
import { signal, computed, effect } from '@vanilj/core'
import { createStore } from '@vanilj/plugin-store'
```

---

##  CDN Usage

### From npm (unpkg)
```html
<!-- Full bundle -->
<script src="https://unpkg.com/vanilj/dist/vanilj.min.umd.js"></script>

<!-- Core only -->
<script src="https://unpkg.com/@vanilj/core/dist/vanilj-core.min.umd.js"></script>

<!-- Plugins -->
<script src="https://unpkg.com/@vanilj/plugin-store/dist/vanilj-plugin-store.min.umd.js"></script>
<script src="https://unpkg.com/@vanilj/plugin-devtools/dist/vanilj-plugin-devtools.min.umd.js"></script>
<script src="https://unpkg.com/@vanilj/plugin-reactive-object/dist/vanilj-plugin-reactive-object.min.umd.js"></script>
<script src="https://unpkg.com/@vanilj/plugin-i18n/dist/vanilj-plugin-i18n.min.umd.js"></script>
```

### From GitHub (jsDelivr) — version-pinned (recommended)
```html
<!-- Core (v1.0.1) -->
<script src="https://cdn.jsdelivr.net/gh/r-/vanilj@v1.0.1/dist/vanilj-core.umd.js"></script>

<!-- Full bundle (v1.0.1) -->
<script src="https://cdn.jsdelivr.net/gh/r-/vanilj@v1.0.1/dist/vanilj.umd.js"></script>
```

> **Tip:** Pin CDN versions to avoid breaking changes:
> - unpkg: `https://unpkg.com/@vanilj/core@1.0.1/dist/vanilj-core.min.umd.js`  
> - jsDelivr: `https://cdn.jsdelivr.net/gh/r-/vanilj@1.0.1/dist/vanilj-core.umd.js`

### Browser globals
```html
<!-- Full bundle → window.Vanilj -->
<script src="https://unpkg.com/vanilj/dist/vanilj.min.umd.js"></script>
<script>
  const { signal, effect } = window.Vanilj
  const count = signal(0)
  effect(() => console.log('Count:', count.value))
</script>

<!-- Core UMD → window.VaniljCore -->
<script src="https://unpkg.com/@vanilj/core/dist/vanilj-core.min.umd.js"></script>
<script>
  const { signal } = window.VaniljCore
</script>
```

---

##  Quick Start

**Core example:**
```js
import { signal, computed, effect } from '@vanilj/core'

const count = signal(0)
const doubled = computed(() => count.value * 2)

effect(() => {
  console.log(`Count: ${count.value}, Doubled: ${doubled.value}`)
})

count.value++ // → "Count: 1, Doubled: 2"
```

**With plugins:**
```js
import { signal } from '@vanilj/core'
import { createStore } from '@vanilj/plugin-store'
import { useVaniljDevtools } from '@vanilj/plugin-devtools'

const devtools = useVaniljDevtools()
const store = createStore({ todos: [] })

store.subscribe(() => console.log('Store updated!'))
```

---

##  Basic DOM Example

While Vanilj's core is pure reactivity, it includes a powerful `html` template system for rendering. Here is a simple counter component:

**HTML:**
```html
<div id="app"></div>
```

**JavaScript:**
```js
import { signal, html, mount } from 'vanilj';

// A component is a function that returns a DOM node
function CounterComponent() {
  const count = signal(0);
  
  const increment = () => {
    count.value++;
  };

  // The html template is reactive to signals
  return html`
    <div>
      <h1>Simple Counter</h1>
      <p>The current count is: ${count}</p>
      <button onclick="${increment}">Increment</button>
    </div>
  `;
}

// Mount the component to an element on your page
mount(document.getElementById('app'), CounterComponent());
```

This example shows how `signal` and `html` work together to create reactive user interfaces with minimal code.

---

##  Examples

- [Basic Counter](examples/browser-demo.html) — core only   
- [Monorepo Demo](examples/monorepo-demo.html) — all packages together  
- More guides & docs: [vanilj.org/docs/get-started](https://vanilj.org/docs/get-started)

---

##  Development

**Prerequisites:**
- Node.js 16+
- npm 7+ (for workspace support)

```bash
# Clone repository
git clone https://github.com/r-/vanilj.git
cd vanilj

# Install dependencies
npm install

# Build all packages
npm run build

# Build only core
npm run build:core

# Build only plugins
npm run build:plugins
```

**Project structure:**
```
vanilj/
├── packages/
│   ├── vanilj-core/
│   ├── plugin-devtools/
│   ├── plugin-store/
│   ├── plugin-reactive-object/
│   └── plugin-i18n/
├── dist/        # UMD builds for GitHub CDN (jsDelivr)
├── examples/
└── package.json
```

### Development notes
- The root `dist/` includes UMD builds for **GitHub CDN** (jsDelivr), enabling use without a build step.
- `packages/*/dist` includes builds for **npm publishing** (currently committed, planned to automate later).
- To come: build automation via **GitHub Actions** — keeping `dist/` out of the development branch and only building on release tags.

---

##  Build System

Built with Vite — each package outputs:
- ES Modules (`*.es.js`)
- UMD builds (`*.umd.js`)
- Minified builds (`*.min.js`)
- Source maps (`*.map`)

---

##  Compatibility

- Modern browsers (ES2018+)
- Node.js 16+
- Supports both ESM and UMD

---

##  Contributing

1. Fork the repo  
2. Create a branch (`git checkout -b feature/my-feature`)  
3. Commit your changes  
4. Push (`git push origin feature/my-feature`)  
5. Open a Pull Request

---

##  License

Vanilj is released under the **MIT License**. See [LICENSE](LICENSE) for details.

---

##  Acknowledgments

Inspired by **Vue 3**, **Solid.js**, **Preact Signals**, the **TC39 Signals proposal**, **VanJS**, and **htm**.  
Built with **Vite** for fast builds.  
Managed with **npm workspaces**.
