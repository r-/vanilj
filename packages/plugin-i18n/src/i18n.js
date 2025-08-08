// /plugins/i18n.js

import { effect } from "@vanilj/core"

/**
 * Initializes i18n bindings for the DOM.
 * - Binds all `[data-i18n-key]` elements to update textContent.
 * - Binds all `[data-i18n-attr]` elements to update attribute values.
 * - Optionally supports `[data-i18n-html]` for innerHTML.
 *
 * @param {Element} root - Root node to bind (usually shadowRoot or document).
 * @param {object} i18nService - Must have .t(key) and .lang signal.
 */
export function initI18n(root, i18nService) {
  if (!root || !i18nService || typeof i18nService.t !== "function") return

  // Text nodes
  const textNodes = root.querySelectorAll("[data-i18n-key]")
  textNodes.forEach(el => {
    const key = el.getAttribute("data-i18n-key")
    if (!key || el.__i18nBound) return
    el.__i18nBound = true

    effect(() => {
      const translation = i18nService.t(key)
      if (translation === undefined) {
        console.warn(`[i18n] Missing key: "${key}"`)
        return
      }
      el.textContent = translation
    })
  })

  // Attribute bindings
  const attrNodes = root.querySelectorAll("[data-i18n-attr]")
  attrNodes.forEach(el => {
    const attrMap = el.getAttribute("data-i18n-attr")
    if (!attrMap || el.__i18nAttrBound) return
    el.__i18nAttrBound = true

    attrMap.split(",").forEach(mapping => {
      const [attr, key] = mapping.split(":").map(s => s.trim())
      if (!attr || !key) return

      effect(() => {
        const translation = i18nService.t(key)
        if (translation === undefined) {
          console.warn(`[i18n] Missing key: "${key}"`)
          return
        }
        el.setAttribute(attr, translation)
      })
    })
  })

  // Optional: innerHTML bindings
  const htmlNodes = root.querySelectorAll("[data-i18n-html]")
  htmlNodes.forEach(el => {
    const key = el.getAttribute("data-i18n-html")
    if (!key || el.__i18nHtmlBound) return
    el.__i18nHtmlBound = true

    effect(() => {
      const translation = i18nService.t(key)
      if (translation === undefined) {
        console.warn(`[i18n] Missing key: "${key}"`)
        return
      }
      el.innerHTML = translation
    })
  })
}
