// vanilj-core.js

// ==== Plugin System ====

const plugins = [];

export function useVaniljPlugin(fn) {
  plugins.push(fn);
}

function notifyPlugins(event, data) {
  for (const p of plugins) p(event, data);
}

// ==== Scoped Effect Cleanup Context ====

let scopedCleanupStack = [];

export function runWithScopedEffects(fn) {
  const cleanupFns = [];
  scopedCleanupStack.push(cleanupFns);
  try {
    return fn();
  } finally {
    const toCleanup = scopedCleanupStack.pop();
    toCleanup.forEach(fn => fn());
  }
}

export function registerScopedEffectCleanup(fn) {
  const stack = scopedCleanupStack[scopedCleanupStack.length - 1];
  if (stack) stack.push(fn);
}

// ==== Reactivity System ====

const effectStack = [];
let isBatching = false;
const pendingEffects = new Set();
let currentCleanupStack = null;

export function signal(initialValue) {
  let value = initialValue;
  const subscribers = new Set();

  function track() {
    if (effectStack.length) {
      subscribers.add(effectStack[0]);
    }
  }

  function notify() {
    notifyPlugins("signal:update", { newValue: value });
    for (const fn of subscribers) {
      if (isBatching) pendingEffects.add(fn);
      else fn();
    }
  }

  const s = {
    get value() {
      track();
      return value;
    },
    set value(newValue) {
      if (newValue !== value) {
        value = newValue;
        notify();
      }
    },
    peek: () => value,
    subscribe: (fn) => {
      subscribers.add(fn);
      return () => subscribers.delete(fn);
    },
    toString: () => `Signal {${value}}`
  };

  notifyPlugins("signal:create", { signal: s, initialValue });
  return s;
}

export function readonly(source) {
  return {
    get value() { return source.value },
    set value(_) {
      throw new Error("[Vanilj] Cannot assign to readonly signal.");
    },
    peek: source.peek,
    subscribe: source.subscribe,
    toString: () => `Readonly {${source.value}}`
  };
}

export function computed(fn) {
  const out = signal();
  effect(() => out.value = fn());
  const c = {
    get value() { return out.value },
    peek: () => out.peek(),
    subscribe: out.subscribe,
    toString: () => `Computed {${out.value}}`
  };
  notifyPlugins("computed:create", { computed: c });
  return c;
}

export function effect(fn) {
  const cleanupFns = [];

  const cleanup = () => {
    cleanupFns.forEach(fn => fn());
    cleanupFns.length = 0;
    pendingEffects.delete(run);
  };

  const run = () => {
    cleanup();
    currentCleanupStack = cleanupFns;
    effectStack.unshift(run);
    try {
      notifyPlugins("effect:run", { fn });
      fn(cb => cleanupFns.push(cb)); // ⬅️ passes internal cleanup hook
    } finally {
      effectStack.shift();
      currentCleanupStack = null;
    }
  };

  run();
  registerScopedEffectCleanup(cleanup);
  return cleanup;
}

export function safeEffect(fn, nodeRef) {
  const run = () => {
    if (!nodeRef.current?.isConnected) return;
    fn();
  };
  return effect(run);
}

export function onCleanup(fn) {
  if (currentCleanupStack) currentCleanupStack.push(fn);
}

export function batch(fn) {
  isBatching = true;
  try {
    fn();
  } finally {
    isBatching = false;
    const toRun = [...pendingEffects];
    pendingEffects.clear();
    toRun.forEach(fn => fn());
  }
}

// ==== DOM System ====

const svgTags = new Set([
  "svg", "path", "circle", "rect", "line", "g", "text", "polygon", "polyline", "ellipse", "use", "defs", "marker", "clipPath", "mask"
]);

export function isSignal(x) {
  return typeof x === "object" && x !== null && "value" in x && typeof x.subscribe === "function";
}

function deepFlatten(arr) {
  return arr.flatMap(x => Array.isArray(x) ? deepFlatten(x) : x);
}

export function wrap(child) {
  // Node → return as-is
  if (child instanceof Node) return child

  // Signal/computed → unwrap
  if (isSignal(child)) return wrap(child.value)

  // Function → create effect scope
  if (typeof child === 'function') {
    const anchor = document.createComment('wrap')
    let lastNodes = []

    effect(() => {
      const value = child()
      const resolved = wrap(value)
      const nodes = Array.isArray(resolved) ? resolved : [resolved]

      // Replace previous DOM
      for (const n of lastNodes) {
        if (n.parentNode) n.parentNode.removeChild(n)
      }

      for (const n of nodes) {
        anchor.parentNode?.insertBefore(n, anchor)
      }

      lastNodes = nodes
    })

    return anchor
  }

  // Array → recursively wrap
  if (Array.isArray(child)) {
    const frag = document.createDocumentFragment()
    for (const c of child) {
      const w = wrap(c)
      if (Array.isArray(w)) w.forEach(n => frag.appendChild(n))
      else if (w) frag.appendChild(w)
    }
    return frag
  }

  // Fallback: text node
  return document.createTextNode(child?.toString?.() ?? '')
}

export function createElement(tag, props, ...children) {
  const isSVG = svgTags.has(tag);
  const el = isSVG
    ? document.createElementNS("http://www.w3.org/2000/svg", tag)
    : document.createElement(tag);

  for (const [key, val] of Object.entries(props || {})) {
    if (key === "ref" && typeof val === "function") {
      val(el);
    } else if (key.startsWith("on") && typeof val === "function") {
      el[key.toLowerCase()] = val;
    } else if (typeof val === "function") {
      // ✅ NEW: Automatically reactive attribute function
      effect(() => {
        if (!el.isConnected) return;
        const result = val();
        if (typeof result === "boolean") {
          if (result) el.setAttribute(key, "");
          else el.removeAttribute(key);
        } else {
          el.setAttribute(key, result);
        }
      });
    } else if (key === "value" && isSignal(val)) {
      effect(() => {
        if (el.isConnected) el.value = val.value;
      });
    } else if (isSignal(val)) {
      effect(() => {
        if (el.isConnected) el.setAttribute(key, val.value);
      });
    } else if (key === "value") {
      el.value = val;
    } else {
      el.setAttribute(key, val);
    }
  }

  for (const child of deepFlatten(children)) {
    const node = wrap(child);
    if (Array.isArray(node)) node.forEach(n => el.appendChild(n));
    else if (node != null) el.appendChild(node);
  }

  return el;
}

export const tags = new Proxy({}, {
  get: (_, tag) => createElement.bind(null, tag)
});

// ==== Mount / Unmount ====

export function mount(target, node) {
  target.appendChild(node);
}

export function unmount(node) {
  if (node && node.parentNode) {
    node.parentNode.removeChild(node);
  }
}

// ==== Hydration ====

export function hydrate(existingNode, viewFn) {
  const rendered = viewFn();
  if (existingNode && rendered !== existingNode) {
    existingNode.replaceWith(rendered);
  }
  return rendered;
}

// ==== Refs ====

export function ref(initialValue = null) {
  return { current: initialValue };
}

// ==== Utilities ====

export function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID();
    } catch (err) {
      console.warn('crypto.randomUUID failed, using fallback:', err);
    }
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function generateShortUUID() {
  return generateUUID().slice(0, 8);
}
