import { signal, computed } from "@vanilj/core";
const statesSym = Symbol("__vanilj_states__");
const bindingsSym = Symbol("__vanilj_bindings__");
const keysGenSym = Symbol("__vanilj_keysgen__");
const keyToChildSym = Symbol("__vanilj_keytochild__");
const noreactiveSym = Symbol("__vanilj_noreactive__");
const stateProto = Object.getPrototypeOf(signal());
const isObject = (x) => x && typeof x === "object" && !Array.isArray(x) && !(x instanceof Function) && !x[noreactiveSym];
function toSignalValue(v) {
  if ((v == null ? void 0 : v.__isComputed) || (v == null ? void 0 : v.subscribe)) return v;
  if (typeof v === "function") return computed(v);
  return signal(isObject(v) ? reactive(v) : v);
}
function buildStates(src) {
  const base = Array.isArray(src) ? [] : {};
  for (const [k, v] of Object.entries(src)) base[k] = toSignalValue(v);
  base[bindingsSym] = [];
  base[keysGenSym] = signal(1);
  return base;
}
const reactiveHandler = {
  get(states, prop, proxy) {
    if (prop === statesSym) return states;
    if (prop === Symbol.toStringTag) return "Reactive";
    if (prop in states) {
      const val = states[prop];
      if (Object.getPrototypeOf(val) === stateProto) {
        if (Array.isArray(states) && prop === "length") {
          states[keysGenSym].value;
        }
        return val.value;
      }
    }
    return Reflect.get(states, prop, proxy);
  },
  set(states, prop, value, proxy) {
    if (prop in states && Object.getPrototypeOf(states[prop]) === stateProto) {
      states[prop].value = isObject(value) ? reactive(value) : value;
      return true;
    }
    states[prop] = toSignalValue(value);
    states[keysGenSym].value++;
    return true;
  },
  deleteProperty(states, prop) {
    delete states[prop];
    states[keysGenSym].value++;
    return true;
  },
  ownKeys(states) {
    states[keysGenSym].value;
    return Reflect.ownKeys(states).filter((k) => ![bindingsSym, keysGenSym].includes(k));
  }
};
function reactive(obj) {
  if (!isObject(obj) || obj[statesSym]) return obj;
  return new Proxy(buildStates(obj), reactiveHandler);
}
function stateFields(proxyObj) {
  return (proxyObj == null ? void 0 : proxyObj[statesSym]) || {};
}
function noreactive(obj) {
  obj[noreactiveSym] = true;
  return obj;
}
function raw(obj) {
  if (!(obj == null ? void 0 : obj[statesSym])) return obj;
  const out = {};
  for (const [k, signal2] of Object.entries(obj[statesSym])) {
    if (Object.getPrototypeOf(signal2) === stateProto) {
      out[k] = signal2.value;
    }
  }
  return out;
}
function list(container, reactiveObj, renderFn) {
  const parent = typeof container === "function" ? container() : container;
  parent[keyToChildSym] = {};
  const states = stateFields(reactiveObj);
  for (const [key, val] of Object.entries(states)) {
    if (Object.getPrototypeOf(val) !== stateProto) continue;
    const child = renderFn(reactiveObj[key], () => delete reactiveObj[key], key);
    parent.appendChild(child);
    parent[keyToChildSym][key] = child;
  }
  return parent;
}
function replace(target, next) {
  const keys = Object.keys({ ...target, ...next });
  for (const k of keys) {
    if (!(k in next)) delete target[k];
    else target[k] = next[k];
  }
  return target;
}
function compact(obj) {
  if (Array.isArray(obj)) return obj.filter(Boolean).map(compact);
  if (!isObject(obj)) return obj;
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v != null) out[k] = compact(v);
  }
  return out;
}
if (typeof window !== "undefined" && window.VaniljCore) {
  console.log("Vanilj Reactive Object plugin loaded");
}
export {
  compact,
  list,
  noreactive,
  raw,
  reactive,
  replace,
  stateFields
};
//# sourceMappingURL=vanilj-plugin-reactive-object.min.es.js.map
