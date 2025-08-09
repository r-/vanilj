import { useVaniljPlugin } from "@vanilj/core";
const snapshots = [];
let currentIndex = -1;
const watchers = /* @__PURE__ */ new Set();
let devtoolsConfig = {
  logOnly: null
  // e.g. Set of names or IDs
};
function useVaniljDevtools({ maxSnapshots = 100 } = {}) {
  console.log("%c🛠️ Vanilj DevTools active", "color: #0af");
  useVaniljPlugin((event, data) => {
    if (event === "signal:create") {
      const signal = data.signal;
      if (data.name) signal.__devName = data.name;
      const orig = Object.getOwnPropertyDescriptor(signal, "value");
      Object.defineProperty(signal, "value", {
        get: orig.get,
        set(newValue) {
          const oldValue = orig.get.call(signal);
          orig.set.call(signal, newValue);
          if (!signal.__skipDevLog && matchFilter(signal)) {
            logMutation(signal, oldValue, newValue);
          }
          if (!signal.__skipDevSnapshot) {
            saveSnapshot();
          }
          watchers.forEach((fn) => fn(signal, oldValue, newValue));
        },
        configurable: true
      });
    }
  });
  function matchFilter(signal) {
    if (!devtoolsConfig.logOnly) return true;
    return devtoolsConfig.logOnly.has(signal.__devName);
  }
  function logMutation(signal, oldVal, newVal) {
    console.log(`📦 %cSignal update`, "color: #09f", {
      name: signal.__devName ?? "anonymous",
      old: oldVal,
      new: newVal
    });
  }
  function saveSnapshot() {
    const state = collectSignalStates();
    if (currentIndex < snapshots.length - 1) {
      snapshots.splice(currentIndex + 1);
    }
    snapshots.push(state);
    if (snapshots.length > maxSnapshots) snapshots.shift();
    currentIndex = snapshots.length - 1;
  }
  function collectSignalStates() {
    const all = {};
    for (const signal of Object.values(window.__vaniljSignals ?? {})) {
      const name = signal.__devName ?? signal.toString();
      all[name] = signal.value;
    }
    return structuredClone(all);
  }
  return {
    config(options) {
      if (options.logOnly) devtoolsConfig.logOnly = new Set(options.logOnly);
    },
    watch(signal, fn) {
      watchers.add(fn);
      return () => watchers.delete(fn);
    },
    getHistory() {
      return snapshots.map((s, i) => ({ index: i, snapshot: s }));
    },
    undo() {
      if (currentIndex > 0) {
        currentIndex--;
        restoreSnapshot(snapshots[currentIndex]);
      }
    },
    redo() {
      if (currentIndex < snapshots.length - 1) {
        currentIndex++;
        restoreSnapshot(snapshots[currentIndex]);
      }
    }
  };
}
function restoreSnapshot(snapshot) {
  for (const [name, value] of Object.entries(snapshot)) {
    const s = findSignalByName(name);
    if (s) {
      s.__skipDevLog = true;
      s.__skipDevSnapshot = true;
      s.value = value;
      delete s.__skipDevLog;
      delete s.__skipDevSnapshot;
    }
  }
}
function findSignalByName(name) {
  return Object.values(window.__vaniljSignals ?? {}).find((s) => s.__devName === name);
}
function registerSignal(name, signal) {
  window.__vaniljSignals = window.__vaniljSignals || {};
  window.__vaniljSignals[name] = signal;
  signal.__devName = name;
}
if (typeof window !== "undefined" && window.VaniljCore) {
  console.log("Vanilj DevTools plugin loaded");
}
export {
  registerSignal,
  useVaniljDevtools
};
//# sourceMappingURL=vanilj-plugin-devtools.min.es.js.map
