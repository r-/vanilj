// packages/plugin-devtools/src/index.js - DevTools plugin entry point

import { useVaniljPlugin } from '@vanilj/core';

// Import the devtools functionality
export { 
  useVaniljDevtools, 
  registerSignal 
} from './devtools.js';

// Auto-register the plugin when loaded via script tag
if (typeof window !== 'undefined' && window.VaniljCore) {
  // Plugin will be available but not auto-activated
  // Users need to call useVaniljDevtools() explicitly
  console.log('Vanilj DevTools plugin loaded');
}