"use strict";

(() => {
  const originalFetch = window.fetch.bind(window);
  const version = "20260710-preview-1";

  const withVersion = (url) => {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}v=${version}`;
  };

  window.fetch = async (input, init = {}) => {
    const rawUrl = typeof input === "string" ? input : input.url;

    if (/^products\.json(?:\?|$)/.test(rawUrl)) {
      const requestOptions = { ...init, cache: "reload" };
      const [productsResponse, wetWipesResponse, guoshaoResponse, crocodileResponse, previewResponse] = await Promise.all([
        originalFetch(withVersion("products.json"), requestOptions),
        originalFetch(withVersion("wet-wipes.json"), requestOptions),
        originalFetch(withVersion("guoshao-products.json"), requestOptions),
        originalFetch(withVersion("crocodile-products.json"), requestOptions),
        originalFetch(withVersion("preview-products.json"), requestOptions)
      ]);

      if (!productsResponse.ok) return productsResponse;

      const products = await productsResponse.json();
      const additions = [];

      for (const response of [wetWipesResponse, guoshaoResponse, crocodileResponse, previewResponse]) {
        if (!response.ok) continue;
        const data = await response.json();
        if (Array.isArray(data)) additions.push(...data);
      }

      const seen = new Set();
      const combined = [
        ...(Array.isArray(products) ? products : []),
        ...additions
      ].filter((product) => {
        const id = product && product.id ? String(product.id) : "";
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
      });

      return new Response(JSON.stringify(combined), {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-store"
        }
      });
    }

    if (/^(wet-wipes\.json|guoshao-products\.json|crocodile-products\.json|preview-products\.json|image-data\/)/.test(rawUrl)) {
      return originalFetch(withVersion(rawUrl), {
        ...init,
        cache: "reload"
      });
    }

    return originalFetch(input, init);
  };
})();
