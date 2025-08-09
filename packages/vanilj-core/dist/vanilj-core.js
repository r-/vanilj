const plugins = [];
function useVaniljPlugin(fn) {
  plugins.push(fn);
}
function notifyPlugins(event, data) {
  for (const p of plugins) p(event, data);
}
let scopedCleanupStack = [];
function runWithScopedEffects(fn) {
  const cleanupFns = [];
  scopedCleanupStack.push(cleanupFns);
  try {
    return fn();
  } finally {
    const toCleanup = scopedCleanupStack.pop();
    toCleanup.forEach((fn2) => fn2());
  }
}
function registerScopedEffectCleanup(fn) {
  const stack = scopedCleanupStack[scopedCleanupStack.length - 1];
  if (stack) stack.push(fn);
}
const effectStack = [];
let isBatching = false;
const pendingEffects = /* @__PURE__ */ new Set();
let currentCleanupStack = null;
function signal(initialValue) {
  let value = initialValue;
  const subscribers = /* @__PURE__ */ new Set();
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
function readonly(source) {
  return {
    get value() {
      return source.value;
    },
    set value(_) {
      throw new Error("[Vanilj] Cannot assign to readonly signal.");
    },
    peek: source.peek,
    subscribe: source.subscribe,
    toString: () => `Readonly {${source.value}}`
  };
}
function computed(fn) {
  const out = signal();
  effect(() => out.value = fn());
  const c = {
    get value() {
      return out.value;
    },
    peek: () => out.peek(),
    subscribe: out.subscribe,
    toString: () => `Computed {${out.value}}`
  };
  notifyPlugins("computed:create", { computed: c });
  return c;
}
function effect(fn) {
  const cleanupFns = [];
  const cleanup = () => {
    cleanupFns.forEach((fn2) => fn2());
    cleanupFns.length = 0;
    pendingEffects.delete(run);
  };
  const run = () => {
    cleanup();
    currentCleanupStack = cleanupFns;
    effectStack.unshift(run);
    try {
      notifyPlugins("effect:run", { fn });
      fn((cb) => cleanupFns.push(cb));
    } finally {
      effectStack.shift();
      currentCleanupStack = null;
    }
  };
  run();
  registerScopedEffectCleanup(cleanup);
  return cleanup;
}
function safeEffect(fn, nodeRef) {
  const run = () => {
    var _a;
    if (!((_a = nodeRef.current) == null ? void 0 : _a.isConnected)) return;
    fn();
  };
  return effect(run);
}
function onCleanup(fn) {
  if (currentCleanupStack) currentCleanupStack.push(fn);
}
function batch(fn) {
  isBatching = true;
  try {
    fn();
  } finally {
    isBatching = false;
    const toRun = [...pendingEffects];
    pendingEffects.clear();
    toRun.forEach((fn2) => fn2());
  }
}
const svgTags = /* @__PURE__ */ new Set([
  "svg",
  "path",
  "circle",
  "rect",
  "line",
  "g",
  "text",
  "polygon",
  "polyline",
  "ellipse",
  "use",
  "defs",
  "marker",
  "clipPath",
  "mask"
]);
function isSignal(x) {
  return typeof x === "object" && x !== null && "value" in x && typeof x.subscribe === "function";
}
function deepFlatten(arr) {
  return arr.flatMap((x) => Array.isArray(x) ? deepFlatten(x) : x);
}
function wrap(child) {
  var _a;
  if (child instanceof Node) return child;
  if (isSignal(child)) return wrap(child.value);
  if (typeof child === "function") {
    const anchor = document.createComment("wrap");
    let lastNodes = [];
    effect(() => {
      var _a2;
      const value = child();
      const resolved = wrap(value);
      const nodes = Array.isArray(resolved) ? resolved : [resolved];
      for (const n of lastNodes) {
        if (n.parentNode) n.parentNode.removeChild(n);
      }
      for (const n of nodes) {
        (_a2 = anchor.parentNode) == null ? void 0 : _a2.insertBefore(n, anchor);
      }
      lastNodes = nodes;
    });
    return anchor;
  }
  if (Array.isArray(child)) {
    const frag = document.createDocumentFragment();
    for (const c of child) {
      const w = wrap(c);
      if (Array.isArray(w)) w.forEach((n) => frag.appendChild(n));
      else if (w) frag.appendChild(w);
    }
    return frag;
  }
  return document.createTextNode(((_a = child == null ? void 0 : child.toString) == null ? void 0 : _a.call(child)) ?? "");
}
function createElement(tag, props, ...children) {
  const isSVG = svgTags.has(tag);
  const el = isSVG ? document.createElementNS("http://www.w3.org/2000/svg", tag) : document.createElement(tag);
  for (const [key, val] of Object.entries(props || {})) {
    if (key === "ref" && typeof val === "function") {
      val(el);
    } else if (key.startsWith("on") && typeof val === "function") {
      el[key.toLowerCase()] = val;
    } else if (typeof val === "function") {
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
    if (Array.isArray(node)) node.forEach((n) => el.appendChild(n));
    else if (node != null) el.appendChild(node);
  }
  return el;
}
const tags = new Proxy({}, {
  get: (_, tag) => createElement.bind(null, tag)
});
function mount(target, node) {
  target.appendChild(node);
}
function unmount(node) {
  if (node && node.parentNode) {
    node.parentNode.removeChild(node);
  }
}
function hydrate(existingNode, viewFn) {
  const rendered = viewFn();
  if (existingNode && rendered !== existingNode) {
    existingNode.replaceWith(rendered);
  }
  return rendered;
}
function ref(initialValue = null) {
  return { current: initialValue };
}
function generateUUID() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    try {
      return crypto.randomUUID();
    } catch (err) {
      console.warn("crypto.randomUUID failed, using fallback:", err);
    }
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : r & 3 | 8;
    return v.toString(16);
  });
}
function generateShortUUID() {
  return generateUUID().slice(0, 8);
}
function html(strings, ...values) {
  var _a;
  const template = document.createElement("template");
  let markup = "";
  for (let i = 0; i < strings.length; i++) {
    markup += strings[i];
    if (i < values.length) {
      markup += `<!--::${i}::-->`;
    }
  }
  markup = markup.replace(/(\s+)<!--::(\d+)::-->\s*>/g, (match, whitespace, index) => {
    return `${whitespace}data-vanilj-props="${index}"><!--::${index}::-->`;
  });
  template.innerHTML = markup.trim();
  const content = template.content.cloneNode(true);
  const elementsWithProps = content.querySelectorAll("[data-vanilj-props]");
  elementsWithProps.forEach((el) => {
    const propsIndex = el.getAttribute("data-vanilj-props");
    const value = values[Number(propsIndex)];
    if (value && typeof value === "object") {
      for (const [key, val] of Object.entries(value)) {
        bindAttribute(el, key, val);
      }
    }
    el.removeAttribute("data-vanilj-props");
    const walker2 = document.createTreeWalker(el, NodeFilter.SHOW_COMMENT);
    while (walker2.nextNode()) {
      const node = walker2.currentNode;
      if (node.nodeValue === `::${propsIndex}::`) {
        node.parentNode.removeChild(node);
        break;
      }
    }
  });
  const walker = document.createTreeWalker(content, NodeFilter.SHOW_COMMENT);
  const placeholderNodes = [];
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const match = (_a = node.nodeValue) == null ? void 0 : _a.match(/^::(\d+)::$/);
    if (match) {
      placeholderNodes.push({
        node,
        index: Number(match[1]),
        parent: node.parentNode
      });
    }
  }
  placeholderNodes.forEach(({ node, index, parent }) => {
    const value = values[index];
    if (typeof value === "function" || isSignal(value)) {
      const start = document.createComment(`v-start:${index}`);
      const end = document.createComment(`v-end:${index}`);
      parent.insertBefore(start, node);
      parent.insertBefore(end, node);
      effect(() => {
        let cur = start.nextSibling;
        while (cur && cur !== end) {
          const next = cur.nextSibling;
          cur.remove();
          cur = next;
        }
        const resolved = wrap(typeof value === "function" ? value() : value.value);
        if (Array.isArray(resolved)) {
          resolved.forEach((n) => end.before(n));
        } else if (resolved instanceof Node) {
          end.before(resolved);
        } else if (resolved != null) {
          end.before(document.createTextNode(String(resolved)));
        }
      });
    } else {
      const resolved = wrap(value);
      if (Array.isArray(resolved)) {
        resolved.forEach((n) => parent.insertBefore(n, node));
      } else if (resolved instanceof Node) {
        parent.insertBefore(resolved, node);
      } else if (resolved != null) {
        parent.insertBefore(document.createTextNode(String(resolved)), node);
      }
    }
    parent.removeChild(node);
  });
  const elements = content.querySelectorAll("*");
  const placeholderRegex = /<!--::(\d+)::--/;
  const placeholderSplitRegex = /(<!--::\d+::-->)/;
  elements.forEach((el) => {
    for (const attr of [...el.attributes]) {
      const spreadMatch = attr.name.match(placeholderRegex);
      if (spreadMatch) {
        const i = Number(spreadMatch[1]);
        const value = values[i];
        const entries = typeof value === "function" ? value() : value;
        if (entries && typeof entries === "object") {
          for (const [k, v] of Object.entries(entries)) {
            bindAttribute(el, k, v);
          }
        }
        el.removeAttribute(attr.name);
        continue;
      }
      if (!attr.value.includes("<!--::")) {
        continue;
      }
      const raw = attr.value;
      const parts = raw.split(placeholderSplitRegex).filter((part) => part !== "");
      const dynamicParts = parts.map((part) => {
        const match = part.match(placeholderRegex);
        if (match) {
          const i = Number(match[1]);
          return values[i];
        }
        return part;
      });
      el.removeAttribute(attr.name);
      const isSingleFunction = dynamicParts.length === 1 && typeof dynamicParts[0] === "function";
      const isEventHandler = attr.name.startsWith("on");
      if (isEventHandler && isSingleFunction) {
        bindAttribute(el, attr.name, dynamicParts[0]);
        continue;
      }
      if (dynamicParts.length === 1 && !isEventHandler) {
        bindAttribute(el, attr.name, dynamicParts[0]);
        continue;
      }
      if (isEventHandler) {
        bindAttribute(el, attr.name, dynamicParts[0]);
        continue;
      }
      effect(() => {
        const result = dynamicParts.map(
          (p) => typeof p === "function" ? p() : isSignal(p) ? p.value : p
        ).join("");
        bindAttribute(el, attr.name, result);
      });
    }
  });
  return content;
}
function bindAttribute(el, name, value) {
  if (name.startsWith("on") && typeof value === "function") {
    el[name.toLowerCase()] = value;
    return;
  }
  const isDOMProp = name in el;
  const apply = (v) => {
    if (typeof v === "boolean") {
      if (isDOMProp) el[name] = v;
      else v ? el.setAttribute(name, "") : el.removeAttribute(name);
    } else {
      if (isDOMProp) el[name] = v;
      else el.setAttribute(name, v);
    }
  };
  if (isSignal(value)) {
    effect(() => apply(value.value));
  } else if (typeof value === "function") {
    effect(() => apply(value()));
  } else {
    apply(value);
  }
}
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
export {
  batch,
  computed,
  createElement,
  VaniljCore as default,
  effect,
  generateShortUUID,
  generateUUID,
  html,
  hydrate,
  isSignal,
  mount,
  onCleanup,
  readonly,
  ref,
  registerScopedEffectCleanup,
  runWithScopedEffects,
  safeEffect,
  signal,
  tags,
  unmount,
  useVaniljPlugin,
  wrap
};
//# sourceMappingURL=vanilj-core.es.js.map
