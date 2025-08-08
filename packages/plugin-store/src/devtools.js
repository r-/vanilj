// vanilj-plugins/devtools.js

import { useVaniljPlugin } from '../vanilj-core.js'

const snapshots = []
let currentIndex = -1
const watchers = new Set()
const filters = new Set()
let devtoolsConfig = {
  logOnly: null // e.g. Set of names or IDs
}

export function useVaniljDevtools({ maxSnapshots = 100 } = {}) {
  console.log('%c🛠️ Vanilj DevTools active', 'color: #0af')

  // Add plugin hook
  useVaniljPlugin((event, data) => {
    if (event === 'signal:create') {
      const signal = data.signal

      // Optional: Assign name for filtering
      if (data.name) signal.__devName = data.name

      // Patch setter for logging and history
      const orig = Object.getOwnPropertyDescriptor(signal, 'value')
      Object.defineProperty(signal, 'value', {
        get: orig.get,
        set(newValue) {
          const oldValue = orig.get.call(signal)
          orig.set.call(signal, newValue)

          if (!signal.__skipDevLog && matchFilter(signal)) {
            logMutation(signal, oldValue, newValue)
          }

          if (!signal.__skipDevSnapshot) {
            saveSnapshot()
          }

          watchers.forEach(fn => fn(signal, oldValue, newValue))
        },
        configurable: true
      })
    }
  })

  function matchFilter(signal) {
    if (!devtoolsConfig.logOnly) return true
    return devtoolsConfig.logOnly.has(signal.__devName)
  }

  function logMutation(signal, oldVal, newVal) {
    console.log(`📦 %cSignal update`, 'color: #09f', {
      name: signal.__devName ?? 'anonymous',
      old: oldVal,
      new: newVal
    })
  }

  function saveSnapshot() {
    const state = collectSignalStates()
    if (currentIndex < snapshots.length - 1) {
      snapshots.splice(currentIndex + 1)
    }
    snapshots.push(state)
    if (snapshots.length > maxSnapshots) snapshots.shift()
    currentIndex = snapshots.length - 1
  }

  function collectSignalStates() {
    const all = {}
    for (const signal of Object.values(window.__vaniljSignals ?? {})) {
      const name = signal.__devName ?? signal.toString()
      all[name] = signal.value
    }
    return structuredClone(all)
  }

  // === Public API ===

  return {
    config(options) {
      if (options.logOnly) devtoolsConfig.logOnly = new Set(options.logOnly)
    },

    watch(signal, fn) {
      watchers.add(fn)
      return () => watchers.delete(fn)
    },

    getHistory() {
      return snapshots.map((s, i) => ({ index: i, snapshot: s }))
    },

    undo() {
      if (currentIndex > 0) {
        currentIndex--
        restoreSnapshot(snapshots[currentIndex])
      }
    },

    redo() {
      if (currentIndex < snapshots.length - 1) {
        currentIndex++
        restoreSnapshot(snapshots[currentIndex])
      }
    }
  }
}

function restoreSnapshot(snapshot) {
  for (const [name, value] of Object.entries(snapshot)) {
    const s = findSignalByName(name)
    if (s) {
      s.__skipDevLog = true
      s.__skipDevSnapshot = true
      s.value = value
      delete s.__skipDevLog
      delete s.__skipDevSnapshot
    }
  }
}

function findSignalByName(name) {
  return Object.values(window.__vaniljSignals ?? {}).find(s => s.__devName === name)
} 

// Register signal for devtools (optional global registry)
export function registerSignal(name, signal) {
  window.__vaniljSignals = window.__vaniljSignals || {}
  window.__vaniljSignals[name] = signal
  signal.__devName = name
}