// packages/plugin-store/src/index.js - Store plugin entry point

// Export the store functionality
export { 
  createStore, 
  usePersistedStore, 
  useSyncedStore, 
  useStoreDevtools, 
  useUndoRedo, 
  useMiddleware, 
  useThunkStore, 
  createModuleStore 
} from './store.js';

// Auto-register notification when loaded via script tag
if (typeof window !== 'undefined' && window.VaniljCore) {
  console.log('Vanilj Store plugin loaded');
}