import { signal, effect } from "@vanilj/core";
function createStore(initialState = {}, options = {}) {
  const raw = {};
  const subscribers = /* @__PURE__ */ new Set();
  for (const key in initialState) {
    raw[key] = signal(initialState[key]);
  }
  const state = {};
  for (const key in raw) {
    Object.defineProperty(state, key, {
      get: () => raw[key].value
    });
  }
  const notify = () => {
    for (const fn of subscribers) fn(store);
  };
  const store = {
    state,
    raw,
    snapshot: () => Object.fromEntries(Object.entries(raw).map(([k, s]) => [k, s.peek()])),
    subscribe(fn) {
      subscribers.add(fn);
      return () => subscribers.delete(fn);
    },
    set(key, value) {
      if (raw[key]) {
        raw[key].value = value;
        notify();
      }
    },
    update(fn) {
      fn(store.state);
      notify();
    },
    modules: {},
    inspect: () => console.table(store.snapshot())
  };
  return store;
}
function usePersistedStore(store, { key = "vanilj-store", session = false, exclude = [] } = {}) {
  const storage = session ? sessionStorage : localStorage;
  const saved = storage.getItem(key);
  if (saved) {
    try {
      const data = JSON.parse(saved);
      for (const [k, v] of Object.entries(data)) {
        if (store.raw[k] && !exclude.includes(k)) {
          store.raw[k].value = v;
        }
      }
    } catch {
    }
  }
  effect(() => {
    const snapshot = {};
    for (const [key2, signal2] of Object.entries(store.raw)) {
      if (!exclude.includes(key2)) {
        snapshot[key2] = signal2.value;
      }
    }
    storage.setItem(key, JSON.stringify(snapshot));
  });
}
function useSyncedStore(store, { send, onReceive }) {
  effect(() => {
    const data = store.snapshot();
    send(data);
  });
  onReceive((incoming) => {
    for (const [k, v] of Object.entries(incoming)) {
      if (store.raw[k]) store.raw[k].value = v;
    }
  });
}
function useStoreDevtools(store, label = "VaniljStore") {
  let isLogging = false;
  effect(() => {
    if (isLogging) return;
    isLogging = true;
    try {
      const snapshot = {};
      for (const [key, signal2] of Object.entries(store.raw)) {
        snapshot[key] = signal2.value;
      }
      console.group(`[${label}] Update`);
      console.table(snapshot);
      console.groupEnd();
    } finally {
      isLogging = false;
    }
  });
}
function useUndoRedo(store, fields = null) {
  const history = [];
  let pointer = -1;
  const snapshot = () => {
    const snap = store.snapshot();
    return fields ? Object.fromEntries(fields.map((f) => [f, snap[f]])) : snap;
  };
  const record = () => {
    history.splice(pointer + 1);
    history.push(snapshot());
    pointer++;
  };
  record();
  store.subscribe(record);
  return {
    undo() {
      if (pointer > 0) {
        pointer--;
        for (const [k, v] of Object.entries(history[pointer])) {
          if (store.raw[k]) store.raw[k].value = v;
        }
      }
    },
    redo() {
      if (pointer < history.length - 1) {
        pointer++;
        for (const [k, v] of Object.entries(history[pointer])) {
          if (store.raw[k]) store.raw[k].value = v;
        }
      }
    }
  };
}
function useMiddleware(store, fn) {
  for (const [k, s] of Object.entries(store.raw)) {
    const original = s.set;
    s.set = (v) => {
      const old = s.peek();
      const next = fn(k, v, old);
      original.call(s, next);
    };
  }
}
function useThunkStore(store) {
  const dispatch = (action) => {
    if (typeof action === "function") {
      action(dispatch, store.state);
    }
  };
  return dispatch;
}
function createModuleStore(modules) {
  const root = createStore();
  for (const [name, definition] of Object.entries(modules)) {
    const mod = createStore(definition.state || {});
    root.modules[name] = mod;
  }
  return root;
}
if (typeof window !== "undefined" && window.VaniljCore) {
  console.log("Vanilj Store plugin loaded");
}
export {
  createModuleStore,
  createStore,
  useMiddleware,
  usePersistedStore,
  useStoreDevtools,
  useSyncedStore,
  useThunkStore,
  useUndoRedo
};
//# sourceMappingURL=vanilj-plugin-store.min.es.js.map
