import { effect } from "@vanilj/core";
function initI18n(root, i18nService) {
  if (!root || !i18nService || typeof i18nService.t !== "function") return;
  const textNodes = root.querySelectorAll("[data-i18n-key]");
  textNodes.forEach((el) => {
    const key = el.getAttribute("data-i18n-key");
    if (!key || el.__i18nBound) return;
    el.__i18nBound = true;
    effect(() => {
      const translation = i18nService.t(key);
      if (translation === void 0) {
        console.warn(`[i18n] Missing key: "${key}"`);
        return;
      }
      el.textContent = translation;
    });
  });
  const attrNodes = root.querySelectorAll("[data-i18n-attr]");
  attrNodes.forEach((el) => {
    const attrMap = el.getAttribute("data-i18n-attr");
    if (!attrMap || el.__i18nAttrBound) return;
    el.__i18nAttrBound = true;
    attrMap.split(",").forEach((mapping) => {
      const [attr, key] = mapping.split(":").map((s) => s.trim());
      if (!attr || !key) return;
      effect(() => {
        const translation = i18nService.t(key);
        if (translation === void 0) {
          console.warn(`[i18n] Missing key: "${key}"`);
          return;
        }
        el.setAttribute(attr, translation);
      });
    });
  });
  const htmlNodes = root.querySelectorAll("[data-i18n-html]");
  htmlNodes.forEach((el) => {
    const key = el.getAttribute("data-i18n-html");
    if (!key || el.__i18nHtmlBound) return;
    el.__i18nHtmlBound = true;
    effect(() => {
      const translation = i18nService.t(key);
      if (translation === void 0) {
        console.warn(`[i18n] Missing key: "${key}"`);
        return;
      }
      el.innerHTML = translation;
    });
  });
}
if (typeof window !== "undefined" && window.VaniljCore) {
  console.log("Vanilj i18n plugin loaded");
}
export {
  initI18n
};
//# sourceMappingURL=vanilj-plugin-i18n.min.es.js.map
