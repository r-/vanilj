// packages/plugin-i18n/src/index.js - i18n plugin entry point

// Export the i18n functionality
export { initI18n } from './i18n.js';

// Auto-register notification when loaded via script tag
if (typeof window !== 'undefined' && window.VaniljCore) {
  console.log('Vanilj i18n plugin loaded');
}