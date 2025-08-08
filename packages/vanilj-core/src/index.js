// packages/vanilj-core/src/index.js - Core framework entry point

// Import everything from vanilj-core
import {
  useVaniljPlugin,
  runWithScopedEffects,
  registerScopedEffectCleanup,
  signal,
  readonly,
  computed,
  effect,
  safeEffect,
  onCleanup,
  batch,
  isSignal,
  wrap,
  createElement,
  tags,
  mount,
  unmount,
  hydrate,
  ref,
  generateUUID,
  generateShortUUID
} from './vanilj-core.js';

// Import HTML template system
import { html } from './html-template.js';

// Re-export everything as named exports
export {
  // Plugin system
  useVaniljPlugin,
  
  // Scoped effects
  runWithScopedEffects,
  registerScopedEffectCleanup,
  
  // Reactivity system
  signal,
  readonly,
  computed,
  effect,
  safeEffect,
  onCleanup,
  batch,
  
  // DOM system
  isSignal,
  wrap,
  createElement,
  tags,
  
  // Mount/unmount
  mount,
  unmount,
  hydrate,
  
  // Refs
  ref,
  
  // Utilities
  generateUUID,
  generateShortUUID,
  
  // HTML template system
  html
};

// Default export - core vanilj object
const VaniljCore = {
  // Core reactivity
  signal,
  readonly,
  computed,
  effect,
  batch,
  
  // DOM
  createElement,
  tags,
  mount,
  unmount,
  
  // Template
  html,
  
  // Utilities
  ref,
  generateUUID,
  generateShortUUID
};

export default VaniljCore;