import { signal, effect } from '@vanilj/core'

export function createStore(initialState = {}, options = {}) {
  const raw = {}
  const subscribers = new Set()

  for (const key in initialState) {
    raw[key] = signal(initialState[key])
  }

  const state = {}
  for (const key in raw) {
    Object.defineProperty(state, key, {
      get: () => raw[key].value
    })
  }

  const notify = () => {
    for (const fn of subscribers) fn(store)
  }

  const store = {
    state: state,
    raw,
    snapshot: () => Object.fromEntries(Object.entries(raw).map(([k, s]) => [k, s.peek()])),
    subscribe(fn) {
      subscribers.add(fn)
      return () => subscribers.delete(fn)
    },
    set(key, value) {
      if (raw[key]) {
        raw[key].value = value
        notify()
      }
    },
    update(fn) {
      fn(store.state)
      notify()
    },
    modules: {},
    inspect: () => console.table(store.snapshot()),
  }

  return store
}

export function usePersistedStore(store, { key = 'vanilj-store', session = false, exclude = [] } = {}) {
  const storage = session ? sessionStorage : localStorage
  const saved = storage.getItem(key)
  if (saved) {
    try {
      const data = JSON.parse(saved)
      for (const [k, v] of Object.entries(data)) {
        // Skip excluded keys during restoration
        if (store.raw[k] && !exclude.includes(k)) {
          store.raw[k].value = v
        }
      }
    } catch {}
  }

  effect(() => {
    // Access the actual signal values to establish reactive dependencies
    const snapshot = {}
    for (const [key, signal] of Object.entries(store.raw)) {
      if (!exclude.includes(key)) {
        snapshot[key] = signal.value // This triggers reactivity tracking
      }
    }
    storage.setItem(key, JSON.stringify(snapshot))
  })
}

export function useSyncedStore(store, { send, onReceive }) {
  effect(() => {
    const data = store.snapshot()
    send(data)
  })

  onReceive((incoming) => {
    for (const [k, v] of Object.entries(incoming)) {
      if (store.raw[k]) store.raw[k].value = v
    }
  })
}

export function useStoreDevtools(store, label = 'VaniljStore') {
  let isLogging = false; // Prevent infinite loops
  
  effect(() => {
    if (isLogging) return; // Guard against re-entry
    
    isLogging = true;
    try {
      // Access signal values to establish reactive dependencies
      const snapshot = {};
      for (const [key, signal] of Object.entries(store.raw)) {
        snapshot[key] = signal.value;
      }
      
      console.group(`[${label}] Update`);
      console.table(snapshot);
      console.groupEnd();
    } finally {
      isLogging = false;
    }
  });
}

export function useUndoRedo(store, fields = null) {
  const history = []
  let pointer = -1

  const snapshot = () => {
    const snap = store.snapshot()
    return fields ? Object.fromEntries(fields.map(f => [f, snap[f]])) : snap
  }

  const record = () => {
    history.splice(pointer + 1)
    history.push(snapshot())
    pointer++
  }

  record()
  store.subscribe(record)

  return {
    undo() {
      if (pointer > 0) {
        pointer--
        for (const [k, v] of Object.entries(history[pointer])) {
          if (store.raw[k]) store.raw[k].value = v
        }
      }
    },
    redo() {
      if (pointer < history.length - 1) {
        pointer++
        for (const [k, v] of Object.entries(history[pointer])) {
          if (store.raw[k]) store.raw[k].value = v
        }
      }
    }
  }
}

export function useMiddleware(store, fn) {
  for (const [k, s] of Object.entries(store.raw)) {
    const original = s.set
    s.set = (v) => {
      const old = s.peek()
      const next = fn(k, v, old)
      original.call(s, next)
    }
  }
}

export function useThunkStore(store) {
  const dispatch = (action) => {
    if (typeof action === 'function') {
      action(dispatch, store.state)
    }
  }
  return dispatch
}

export function createModuleStore(modules) {
  const root = createStore()
  for (const [name, definition] of Object.entries(modules)) {
    const mod = createStore(definition.state || {})
    root.modules[name] = mod
  }
  return root
}
