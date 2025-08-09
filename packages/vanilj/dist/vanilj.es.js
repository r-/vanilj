const W = [];
function q(e) {
  W.push(e);
}
function C(e, t) {
  for (const o of W) o(e, t);
}
let O = [];
function Q(e) {
  const t = [];
  O.push(t);
  try {
    return e();
  } finally {
    O.pop().forEach((i) => i());
  }
}
function R(e) {
  const t = O[O.length - 1];
  t && t.push(e);
}
const E = [];
let V = !1;
const D = /* @__PURE__ */ new Set();
let M = null;
function I(e) {
  let t = e;
  const o = /* @__PURE__ */ new Set();
  function i() {
    E.length && o.add(E[0]);
  }
  function c() {
    C("signal:update", { newValue: t });
    for (const n of o)
      V ? D.add(n) : n();
  }
  const r = {
    get value() {
      return i(), t;
    },
    set value(n) {
      n !== t && (t = n, c());
    },
    peek: () => t,
    subscribe: (n) => (o.add(n), () => o.delete(n)),
    toString: () => `Signal {${t}}`
  };
  return C("signal:create", { signal: r, initialValue: e }), r;
}
function X(e) {
  return {
    get value() {
      return e.value;
    },
    set value(t) {
      throw new Error("[Vanilj] Cannot assign to readonly signal.");
    },
    peek: e.peek,
    subscribe: e.subscribe,
    toString: () => `Readonly {${e.value}}`
  };
}
function Y(e) {
  const t = I();
  g(() => t.value = e());
  const o = {
    get value() {
      return t.value;
    },
    peek: () => t.peek(),
    subscribe: t.subscribe,
    toString: () => `Computed {${t.value}}`
  };
  return C("computed:create", { computed: o }), o;
}
function g(e) {
  const t = [], o = () => {
    t.forEach((c) => c()), t.length = 0, D.delete(i);
  }, i = () => {
    o(), M = t, E.unshift(i);
    try {
      C("effect:run", { fn: e }), e((c) => t.push(c));
    } finally {
      E.shift(), M = null;
    }
  };
  return i(), R(o), o;
}
function Z(e, t) {
  return g(() => {
    var i;
    (i = t.current) != null && i.isConnected && e();
  });
}
function ee(e) {
  M && M.push(e);
}
function te(e) {
  V = !0;
  try {
    e();
  } finally {
    V = !1;
    const t = [...D];
    D.clear(), t.forEach((o) => o());
  }
}
const G = /* @__PURE__ */ new Set([
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
function N(e) {
  return typeof e == "object" && e !== null && "value" in e && typeof e.subscribe == "function";
}
function F(e) {
  return e.flatMap((t) => Array.isArray(t) ? F(t) : t);
}
function x(e) {
  var t;
  if (e instanceof Node) return e;
  if (N(e)) return x(e.value);
  if (typeof e == "function") {
    const o = document.createComment("wrap");
    let i = [];
    return g(() => {
      var c;
      const r = e(), n = x(r), s = Array.isArray(n) ? n : [n];
      for (const l of i)
        l.parentNode && l.parentNode.removeChild(l);
      for (const l of s)
        (c = o.parentNode) == null || c.insertBefore(l, o);
      i = s;
    }), o;
  }
  if (Array.isArray(e)) {
    const o = document.createDocumentFragment();
    for (const i of e) {
      const c = x(i);
      Array.isArray(c) ? c.forEach((r) => o.appendChild(r)) : c && o.appendChild(c);
    }
    return o;
  }
  return document.createTextNode(((t = e == null ? void 0 : e.toString) == null ? void 0 : t.call(e)) ?? "");
}
function J(e, t, ...o) {
  const c = G.has(e) ? document.createElementNS("http://www.w3.org/2000/svg", e) : document.createElement(e);
  for (const [r, n] of Object.entries(t || {}))
    r === "ref" && typeof n == "function" ? n(c) : r.startsWith("on") && typeof n == "function" ? c[r.toLowerCase()] = n : typeof n == "function" ? g(() => {
      if (!c.isConnected) return;
      const s = n();
      typeof s == "boolean" ? s ? c.setAttribute(r, "") : c.removeAttribute(r) : c.setAttribute(r, s);
    }) : r === "value" && N(n) ? g(() => {
      c.isConnected && (c.value = n.value);
    }) : N(n) ? g(() => {
      c.isConnected && c.setAttribute(r, n.value);
    }) : r === "value" ? c.value = n : c.setAttribute(r, n);
  for (const r of F(o)) {
    const n = x(r);
    Array.isArray(n) ? n.forEach((s) => c.appendChild(s)) : n != null && c.appendChild(n);
  }
  return c;
}
const ne = new Proxy({}, {
  get: (e, t) => J.bind(null, t)
});
function oe(e, t) {
  e.appendChild(t);
}
function re(e) {
  e && e.parentNode && e.parentNode.removeChild(e);
}
function se(e, t) {
  const o = t();
  return e && o !== e && e.replaceWith(o), o;
}
function ie(e = null) {
  return { current: e };
}
function z() {
  if (typeof crypto < "u" && crypto.randomUUID)
    try {
      return crypto.randomUUID();
    } catch (e) {
      console.warn("crypto.randomUUID failed, using fallback:", e);
    }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(e) {
    const t = Math.random() * 16 | 0;
    return (e === "x" ? t : t & 3 | 8).toString(16);
  });
}
function ce() {
  return z().slice(0, 8);
}
function ae(e, ...t) {
  var o;
  const i = document.createElement("template");
  let c = "";
  for (let a = 0; a < e.length; a++)
    c += e[a], a < t.length && (c += `<!--::${a}::-->`);
  c = c.replace(/(\s+)<!--::(\d+)::-->\s*>/g, (a, u, d) => `${u}data-vanilj-props="${d}"><!--::${d}::-->`), i.innerHTML = c.trim();
  const r = i.content.cloneNode(!0);
  r.querySelectorAll("[data-vanilj-props]").forEach((a) => {
    const u = a.getAttribute("data-vanilj-props"), d = t[Number(u)];
    if (d && typeof d == "object")
      for (const [p, f] of Object.entries(d))
        j(a, p, f);
    a.removeAttribute("data-vanilj-props");
    const v = document.createTreeWalker(a, NodeFilter.SHOW_COMMENT);
    for (; v.nextNode(); ) {
      const p = v.currentNode;
      if (p.nodeValue === `::${u}::`) {
        p.parentNode.removeChild(p);
        break;
      }
    }
  });
  const s = document.createTreeWalker(r, NodeFilter.SHOW_COMMENT), l = [];
  for (; s.nextNode(); ) {
    const a = s.currentNode, u = (o = a.nodeValue) == null ? void 0 : o.match(/^::(\d+)::$/);
    u && l.push({
      node: a,
      index: Number(u[1]),
      parent: a.parentNode
    });
  }
  l.forEach(({ node: a, index: u, parent: d }) => {
    const v = t[u];
    if (typeof v == "function" || N(v)) {
      const p = document.createComment(`v-start:${u}`), f = document.createComment(`v-end:${u}`);
      d.insertBefore(p, a), d.insertBefore(f, a), g(() => {
        let k = p.nextSibling;
        for (; k && k !== f; ) {
          const m = k.nextSibling;
          k.remove(), k = m;
        }
        const b = x(typeof v == "function" ? v() : v.value);
        Array.isArray(b) ? b.forEach((m) => f.before(m)) : b instanceof Node ? f.before(b) : b != null && f.before(document.createTextNode(String(b)));
      });
    } else {
      const p = x(v);
      Array.isArray(p) ? p.forEach((f) => d.insertBefore(f, a)) : p instanceof Node ? d.insertBefore(p, a) : p != null && d.insertBefore(document.createTextNode(String(p)), a);
    }
    d.removeChild(a);
  });
  const S = r.querySelectorAll("*"), y = /<!--::(\d+)::--/, $ = /(<!--::\d+::-->)/;
  return S.forEach((a) => {
    for (const u of [...a.attributes]) {
      const d = u.name.match(y);
      if (d) {
        const m = Number(d[1]), h = t[m], A = typeof h == "function" ? h() : h;
        if (A && typeof A == "object")
          for (const [H, L] of Object.entries(A))
            j(a, H, L);
        a.removeAttribute(u.name);
        continue;
      }
      if (!u.value.includes("<!--::"))
        continue;
      const f = u.value.split($).filter((m) => m !== "").map((m) => {
        const h = m.match(y);
        if (h) {
          const A = Number(h[1]);
          return t[A];
        }
        return m;
      });
      a.removeAttribute(u.name);
      const k = f.length === 1 && typeof f[0] == "function", b = u.name.startsWith("on");
      if (b && k) {
        j(a, u.name, f[0]);
        continue;
      }
      if (f.length === 1 && !b) {
        j(a, u.name, f[0]);
        continue;
      }
      if (b) {
        j(a, u.name, f[0]);
        continue;
      }
      g(() => {
        const m = f.map(
          (h) => typeof h == "function" ? h() : N(h) ? h.value : h
        ).join("");
        j(a, u.name, m);
      });
    }
  }), r;
}
function j(e, t, o) {
  if (t.startsWith("on") && typeof o == "function") {
    e[t.toLowerCase()] = o;
    return;
  }
  const i = t in e, c = (r) => {
    typeof r == "boolean" ? i ? e[t] = r : r ? e.setAttribute(t, "") : e.removeAttribute(t) : i ? e[t] = r : e.setAttribute(t, r);
  };
  N(o) ? g(() => c(o.value)) : typeof o == "function" ? g(() => c(o())) : c(o);
}
function P(e = {}, t = {}) {
  const o = {}, i = /* @__PURE__ */ new Set();
  for (const s in e)
    o[s] = I(e[s]);
  const c = {};
  for (const s in o)
    Object.defineProperty(c, s, {
      get: () => o[s].value
    });
  const r = () => {
    for (const s of i) s(n);
  }, n = {
    state: c,
    raw: o,
    snapshot: () => Object.fromEntries(Object.entries(o).map(([s, l]) => [s, l.peek()])),
    subscribe(s) {
      return i.add(s), () => i.delete(s);
    },
    set(s, l) {
      o[s] && (o[s].value = l, r());
    },
    update(s) {
      s(n.state), r();
    },
    modules: {},
    inspect: () => console.table(n.snapshot())
  };
  return n;
}
function le(e, { key: t = "vanilj-store", session: o = !1, exclude: i = [] } = {}) {
  const c = o ? sessionStorage : localStorage, r = c.getItem(t);
  if (r)
    try {
      const n = JSON.parse(r);
      for (const [s, l] of Object.entries(n))
        e.raw[s] && !i.includes(s) && (e.raw[s].value = l);
    } catch {
    }
  g(() => {
    const n = {};
    for (const [s, l] of Object.entries(e.raw))
      i.includes(s) || (n[s] = l.value);
    c.setItem(t, JSON.stringify(n));
  });
}
function ue(e, { send: t, onReceive: o }) {
  g(() => {
    const i = e.snapshot();
    t(i);
  }), o((i) => {
    for (const [c, r] of Object.entries(i))
      e.raw[c] && (e.raw[c].value = r);
  });
}
function fe(e, t = "VaniljStore") {
  let o = !1;
  g(() => {
    if (!o) {
      o = !0;
      try {
        const i = {};
        for (const [c, r] of Object.entries(e.raw))
          i[c] = r.value;
        console.group(`[${t}] Update`), console.table(i), console.groupEnd();
      } finally {
        o = !1;
      }
    }
  });
}
function de(e, t = null) {
  const o = [];
  let i = -1;
  const c = () => {
    const n = e.snapshot();
    return t ? Object.fromEntries(t.map((s) => [s, n[s]])) : n;
  }, r = () => {
    o.splice(i + 1), o.push(c()), i++;
  };
  return r(), e.subscribe(r), {
    undo() {
      if (i > 0) {
        i--;
        for (const [n, s] of Object.entries(o[i]))
          e.raw[n] && (e.raw[n].value = s);
      }
    },
    redo() {
      if (i < o.length - 1) {
        i++;
        for (const [n, s] of Object.entries(o[i]))
          e.raw[n] && (e.raw[n].value = s);
      }
    }
  };
}
function pe(e, t) {
  for (const [o, i] of Object.entries(e.raw)) {
    const c = i.set;
    i.set = (r) => {
      const n = i.peek(), s = t(o, r, n);
      c.call(i, s);
    };
  }
}
function ge(e) {
  const t = (o) => {
    typeof o == "function" && o(t, e.state);
  };
  return t;
}
function me(e) {
  const t = P();
  for (const [o, i] of Object.entries(e)) {
    const c = P(i.state || {});
    t.modules[o] = c;
  }
  return t;
}
typeof window < "u" && window.VaniljCore && console.log("Vanilj Store plugin loaded");
function he(e, t) {
  if (!e || !t || typeof t.t != "function") return;
  e.querySelectorAll("[data-i18n-key]").forEach((r) => {
    const n = r.getAttribute("data-i18n-key");
    !n || r.__i18nBound || (r.__i18nBound = !0, g(() => {
      const s = t.t(n);
      if (s === void 0) {
        console.warn(`[i18n] Missing key: "${n}"`);
        return;
      }
      r.textContent = s;
    }));
  }), e.querySelectorAll("[data-i18n-attr]").forEach((r) => {
    const n = r.getAttribute("data-i18n-attr");
    !n || r.__i18nAttrBound || (r.__i18nAttrBound = !0, n.split(",").forEach((s) => {
      const [l, S] = s.split(":").map((y) => y.trim());
      !l || !S || g(() => {
        const y = t.t(S);
        if (y === void 0) {
          console.warn(`[i18n] Missing key: "${S}"`);
          return;
        }
        r.setAttribute(l, y);
      });
    }));
  }), e.querySelectorAll("[data-i18n-html]").forEach((r) => {
    const n = r.getAttribute("data-i18n-html");
    !n || r.__i18nHtmlBound || (r.__i18nHtmlBound = !0, g(() => {
      const s = t.t(n);
      if (s === void 0) {
        console.warn(`[i18n] Missing key: "${n}"`);
        return;
      }
      r.innerHTML = s;
    }));
  });
}
typeof window < "u" && window.VaniljCore && console.log("Vanilj i18n plugin loaded");
const w = [];
let _ = -1;
const B = /* @__PURE__ */ new Set();
let T = {
  logOnly: null
  // e.g. Set of names or IDs
};
function ye({ maxSnapshots: e = 100 } = {}) {
  console.log("%c🛠️ Vanilj DevTools active", "color: #0af"), q((r, n) => {
    if (r === "signal:create") {
      const s = n.signal;
      n.name && (s.__devName = n.name);
      const l = Object.getOwnPropertyDescriptor(s, "value");
      Object.defineProperty(s, "value", {
        get: l.get,
        set(S) {
          const y = l.get.call(s);
          l.set.call(s, S), !s.__skipDevLog && t(s) && o(s, y, S), s.__skipDevSnapshot || i(), B.forEach(($) => $(s, y, S));
        },
        configurable: !0
      });
    }
  });
  function t(r) {
    return T.logOnly ? T.logOnly.has(r.__devName) : !0;
  }
  function o(r, n, s) {
    console.log("📦 %cSignal update", "color: #09f", {
      name: r.__devName ?? "anonymous",
      old: n,
      new: s
    });
  }
  function i() {
    const r = c();
    _ < w.length - 1 && w.splice(_ + 1), w.push(r), w.length > e && w.shift(), _ = w.length - 1;
  }
  function c() {
    const r = {};
    for (const n of Object.values(window.__vaniljSignals ?? {})) {
      const s = n.__devName ?? n.toString();
      r[s] = n.value;
    }
    return structuredClone(r);
  }
  return {
    config(r) {
      r.logOnly && (T.logOnly = new Set(r.logOnly));
    },
    watch(r, n) {
      return B.add(n), () => B.delete(n);
    },
    getHistory() {
      return w.map((r, n) => ({ index: n, snapshot: r }));
    },
    undo() {
      _ > 0 && (_--, U(w[_]));
    },
    redo() {
      _ < w.length - 1 && (_++, U(w[_]));
    }
  };
}
function U(e) {
  for (const [t, o] of Object.entries(e)) {
    const i = K(t);
    i && (i.__skipDevLog = !0, i.__skipDevSnapshot = !0, i.value = o, delete i.__skipDevLog, delete i.__skipDevSnapshot);
  }
}
function K(e) {
  return Object.values(window.__vaniljSignals ?? {}).find((t) => t.__devName === e);
}
function ve(e, t) {
  window.__vaniljSignals = window.__vaniljSignals || {}, window.__vaniljSignals[e] = t, t.__devName = e;
}
typeof window < "u" && window.VaniljCore && console.log("Vanilj DevTools plugin loaded");
export {
  te as batch,
  Y as computed,
  J as createElement,
  me as createModuleStore,
  P as createStore,
  g as effect,
  ce as generateShortUUID,
  z as generateUUID,
  ae as html,
  se as hydrate,
  he as initI18n,
  N as isSignal,
  oe as mount,
  ee as onCleanup,
  X as readonly,
  ie as ref,
  R as registerScopedEffectCleanup,
  ve as registerSignal,
  Q as runWithScopedEffects,
  Z as safeEffect,
  I as signal,
  ne as tags,
  re as unmount,
  pe as useMiddleware,
  le as usePersistedStore,
  fe as useStoreDevtools,
  ue as useSyncedStore,
  ge as useThunkStore,
  de as useUndoRedo,
  ye as useVaniljDevtools,
  q as useVaniljPlugin,
  x as wrap
};
