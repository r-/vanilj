// framework/vanilj/html-template.js

import { wrap, isSignal, effect } from './vanilj-core.js'

export function html(strings, ...values) {
  const template = document.createElement('template')

  // 1. Inject placeholders
  let markup = ''
  for (let i = 0; i < strings.length; i++) {
    markup += strings[i]
    if (i < values.length) {
      markup += `<!--::${i}::-->`
    }
  }

  // 2. ROBUST FIX: Pre-process markup to handle attribute spreading properly
  // Replace problematic patterns where comment placeholders appear as attribute names
  markup = markup.replace(/(\s+)<!--::(\d+)::-->\s*>/g, (match, whitespace, index) => {
    // This handles cases like: <div ${props}> where the comment becomes an attribute name
    // We'll move the placeholder to be a child instead
    return `${whitespace}data-vanilj-props="${index}"><!--::${index}::-->`
  })

  template.innerHTML = markup.trim()
  const content = template.content.cloneNode(true)

  // 3. Handle special data-vanilj-props attributes (our fix for attribute spreading)
  const elementsWithProps = content.querySelectorAll('[data-vanilj-props]')
  elementsWithProps.forEach(el => {
    const propsIndex = el.getAttribute('data-vanilj-props')
    const value = values[Number(propsIndex)]
    
    if (value && typeof value === 'object') {
      // Apply the props object to the element
      for (const [key, val] of Object.entries(value)) {
        bindAttribute(el, key, val)
      }
    }
    
    // Remove the temporary attribute
    el.removeAttribute('data-vanilj-props')
    
    // Remove the corresponding comment placeholder
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_COMMENT)
    while (walker.nextNode()) {
      const node = walker.currentNode
      if (node.nodeValue === `::${propsIndex}::`) {
        node.parentNode.removeChild(node)
        break
      }
    }
  })

  // 4. Replace comment placeholders with reactive DOM children
  const walker = document.createTreeWalker(content, NodeFilter.SHOW_COMMENT)
  const placeholderNodes = []
  
  while (walker.nextNode()) {
    const node = walker.currentNode
    const match = node.nodeValue?.match(/^::(\d+)::$/)
    if (match) {
      placeholderNodes.push({
        node,
        index: Number(match[1]),
        parent: node.parentNode
      })
    }
  }
  
  // Now process all placeholders
  placeholderNodes.forEach(({ node, index, parent }) => {
    const value = values[index]

    if (typeof value === 'function' || isSignal(value)) {
      const start = document.createComment(`v-start:${index}`)
      const end = document.createComment(`v-end:${index}`)
      parent.insertBefore(start, node)
      parent.insertBefore(end, node)

      effect(() => {
        let cur = start.nextSibling
        while (cur && cur !== end) {
          const next = cur.nextSibling
          cur.remove()
          cur = next
        }

        const resolved = wrap(typeof value === 'function' ? value() : value.value)
        if (Array.isArray(resolved)) {
          resolved.forEach(n => end.before(n))
        } else if (resolved instanceof Node) {
          end.before(resolved)
        } else if (resolved != null) {
          end.before(document.createTextNode(String(resolved)))
        }
      })
    } else {
      const resolved = wrap(value)
      if (Array.isArray(resolved)) {
        resolved.forEach(n => parent.insertBefore(n, node))
      } else if (resolved instanceof Node) {
        parent.insertBefore(resolved, node)
      } else if (resolved != null) {
        parent.insertBefore(document.createTextNode(String(resolved)), node)
      }
    }

    parent.removeChild(node)
  })

  // 5. Replace attribute placeholders
  const elements = content.querySelectorAll('*');
  const placeholderRegex = /<!--::(\d+)::--/; // For matching (note: no closing > due to browser parsing)
  const placeholderSplitRegex = /(<!--::\d+::-->)/; // For splitting

  elements.forEach(el => {
    for (const attr of [...el.attributes]) {
      // Case 1: Check if the attribute NAME is a placeholder (for prop spreads like ${props})
      // The browser parses <!--::2::--> as <!--::2::-- (truncates at >)
      const spreadMatch = attr.name.match(placeholderRegex);
      if (spreadMatch) {
        const i = Number(spreadMatch[1]);
        const value = values[i];
        // The value here should be an object of attributes
        const entries = typeof value === 'function' ? value() : value;

        if (entries && typeof entries === 'object') {
          for (const [k, v] of Object.entries(entries)) {
            bindAttribute(el, k, v);
          }
        }
        el.removeAttribute(attr.name); // Remove the placeholder attribute
        continue; // Move to the next attribute on the element
      }

      // Case 2: Check if the attribute VALUE contains a placeholder
      if (!attr.value.includes('<!--::')) {
        continue; // No placeholders in this attribute's value, skip it
      }

      const raw = attr.value;
      const parts = raw.split(placeholderSplitRegex).filter(part => part !== '');

      const dynamicParts = parts.map(part => {
        const match = part.match(placeholderRegex);
        if (match) {
          const i = Number(match[1]);
          return values[i];
        }
        return part;
      });

      el.removeAttribute(attr.name);

      // ✅ FIX: Prevent calling event handler functions
      // Check if this is an event handler with a single function
      const isSingleFunction = dynamicParts.length === 1 && typeof dynamicParts[0] === 'function';
      const isEventHandler = attr.name.startsWith('on');
      
      if (isEventHandler && isSingleFunction) {
        bindAttribute(el, attr.name, dynamicParts[0]);
        continue;
      }

      // Optimize: static or single dynamic (non-event handlers)
      if (dynamicParts.length === 1 && !isEventHandler) {
        bindAttribute(el, attr.name, dynamicParts[0]);
        continue;
      }
      
      // For event handlers that aren't single functions, avoid reactive effects
      if (isEventHandler) {
        // Just bind the first dynamic part directly for event handlers
        bindAttribute(el, attr.name, dynamicParts[0]);
        continue;
      }

      // Reactive merged string
      effect(() => {
        const result = dynamicParts.map(p =>
          typeof p === 'function' ? p() :
          isSignal(p) ? p.value :
          p
        ).join('');
        bindAttribute(el, attr.name, result);
      });
    }
  });

  return content
}

// === Attribute Binding Logic ===
function bindAttribute(el, name, value) {
  if (name.startsWith('on') && typeof value === 'function') {
    el[name.toLowerCase()] = value
    return
  }

  const isDOMProp = name in el

  const apply = v => {
    if (typeof v === 'boolean') {
      if (isDOMProp) el[name] = v
      else v ? el.setAttribute(name, '') : el.removeAttribute(name)
    } else {
      if (isDOMProp) el[name] = v
      else el.setAttribute(name, v)
    }
  }

  if (isSignal(value)) {
    effect(() => apply(value.value))
  } else if (typeof value === 'function') {
    effect(() => apply(value()))
  } else {
    apply(value)
  }
}

/**
 * VanilJ HTML Template Engine (Fixed)
 * ------------------------------------
 * ✅ Robust handling of attribute spreading
 * ✅ Pre-processes markup to avoid browser parsing issues
 * ✅ Maintains full reactivity support
 * ✅ Supports:
 *    - Reactive children via ${signal} or ${() => ...}
 *    - Object spread for attributes: ${props}
 *    - Static + dynamic string merge: class="a ${b} c"
 *    - Safe event handler binding: oninput="${fn}"
 *
 * 🧠 Fix Strategy:
 *    - Detects problematic ${props}> patterns
 *    - Converts them to data-vanilj-props attributes
 *    - Processes props objects before browser parsing
 *    - Maintains compatibility with existing components
 */
