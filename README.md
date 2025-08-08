# Vanilj Framework

A lightweight reactive framework for vanilla JavaScript with a modular plugin architecture.

## 🚀 Features

- **Reactive Signals**: Lightweight reactive primitives for state management
- **Computed Values**: Automatically derived state that updates when dependencies change
- **DOM Binding**: Simple and efficient DOM updates with `effect()`
- **Plugin Architecture**: Modular design with separate packages for different functionality
- **TypeScript Ready**: Full TypeScript support (coming soon)
- **CDN Ready**: UMD builds for direct browser usage
- **Tree Shakeable**: ES modules for modern bundlers

## 📦 Packages

This is a monorepo containing the following packages:

### Core Framework
- **[@vanilj/core](packages/vanilj-core/)** - Core reactive framework with signals, computed values, and effects

### Plugins
- **[@vanilj/plugin-devtools](packages/plugin-devtools/)** - Development tools with signal tracking and time-travel debugging
- **[@vanilj/plugin-store](packages/plugin-store/)** - Global state management with persistence and middleware support
- **[@vanilj/plugin-reactive-object](packages/plugin-reactive-object/)** - Deep reactive objects and arrays
- **[@vanilj/plugin-i18n](packages/plugin-i18n/)** - Internationalization support with reactive language switching

## 🏗️ Installation

### NPM (Recommended)
```bash
# Install core framework
npm install @vanilj/core

# Install plugins as needed
npm install @vanilj/plugin-store
npm install @vanilj/plugin-devtools
npm install @vanilj/plugin-reactive-object
npm install @vanilj/plugin-i18n
```

### CDN Usage
```html
<!-- Core Framework -->
<script src="https://unpkg.com/@vanilj/core/dist/vanilj-core.min.umd.js"></script>

<!-- Plugins (optional) -->
<script src="https://unpkg.com/@vanilj/plugin-store/dist/vanilj-plugin-store.min.umd.js"></script>
<script src="https://unpkg.com/@vanilj/plugin-devtools/dist/vanilj-plugin-devtools.min.umd.js"></script>
```

## 🎯 Quick Start

### Basic Usage
```javascript
import { signal, computed, effect } from '@vanilj/core';

// Create reactive state
const count = signal(0);
const doubled = computed(() => count.value * 2);

// React to changes
effect(() => {
  console.log(`Count: ${count.value}, Doubled: ${doubled.value}`);
});

// Update state
count.value++; // Logs: "Count: 1, Doubled: 2"
```

### With Plugins
```javascript
import { signal } from '@vanilj/core';
import { createStore } from '@vanilj/plugin-store';
import { useVaniljDevtools } from '@vanilj/plugin-devtools';

// Enable DevTools
const devtools = useVaniljDevtools();

// Create a store
const store = createStore({
  user: { name: 'John', theme: 'dark' },
  todos: []
});

// Use reactive state
const count = signal(0);
store.subscribe(() => console.log('Store updated!'));
```

## 📚 Examples

Check out the [examples](examples/) directory for complete working examples:

- **[Monorepo Demo](examples/monorepo-demo.html)** - Comprehensive demo showing all packages working together
- **[Basic Counter](examples/basic-counter.html)** - Simple counter using core framework
- **[Todo App](examples/todo-app.html)** - Todo application with store and reactive objects

## 🛠️ Development

### Prerequisites
- Node.js 16+ 
- npm 7+ (for workspaces support)

### Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/vanilj-framework.git
cd vanilj-framework

# Install dependencies
npm install

# Build all packages
npm run build

# Build only core
npm run build:core

# Build only plugins
npm run build:plugins
```

### Project Structure
```
vanilj-framework/
├── packages/
│   ├── vanilj-core/          # Core framework
│   ├── plugin-devtools/      # DevTools plugin
│   ├── plugin-store/         # Store plugin
│   ├── plugin-reactive-object/ # Reactive objects plugin
│   └── plugin-i18n/          # i18n plugin
├── examples/                 # Example applications
├── package.json              # Root workspace config
└── README.md
```

## 🔧 Build System

Each package is built with Vite and produces:
- **ES Modules** (`*.es.js`) - For modern bundlers
- **UMD Builds** (`*.umd.js`) - For direct browser usage
- **Minified versions** (`*.min.js`) - For production
- **Source maps** (`*.map`) - For debugging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by modern reactive frameworks like Vue 3, Solid.js, and Preact Signals
- Built with Vite for fast development and optimized builds
- Uses NPM workspaces for monorepo management
