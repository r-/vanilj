// packages/plugin-reactive-object/src/index.js - Reactive Object plugin entry point

// Export the reactive object functionality
export { 
  reactive, 
  stateFields, 
  noreactive, 
  raw, 
  list, 
  replace, 
  compact 
} from './reactive-object.js';

// Auto-register notification when loaded via script tag
if (typeof window !== 'undefined' && window.VaniljCore) {
  console.log('Vanilj Reactive Object plugin loaded');
}