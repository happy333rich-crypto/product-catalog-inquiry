"use strict";

(() => {
  const originalFetch = window.fetch.bind(window);
  const version = "20260706-2";

  window.fetch = (input, init = {}) => {
    const rawUrl = typeof input === "string" ? input : input.url;
    if (/^(products\.json|image-data\/)/.test(rawUrl)) {
      const separator = rawUrl.includes("?") ? "&" : "?";
      return originalFetch(`${rawUrl}${separator}v=${version}`, {
        ...init,
        cache: "reload"
      });
    }
    return originalFetch(input, init);
  };
})();
