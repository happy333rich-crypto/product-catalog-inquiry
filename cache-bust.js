"use strict";

(() => {
  const originalFetch = window.fetch.bind(window);
  const version = "20260706-5";

  const withVersion = (url) => {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}v=${version}`;
  };

  window.fetch = async (input, init = {}) => {
    const rawUrl = typeof input === "string" ? input : input.url;

    if (/^products\.json(?:\?|$)/.test(rawUrl)) {
      const requestOptions = { ...init, cache: "reload" };
      const [productsResponse, wetWipesResponse] = await Promise.all([
        originalFetch(withVersion("products.json"), requestOptions),
        originalFetch(withVersion("wet-wipes.json"), requestOptions)
      ]);

      if (!productsResponse.ok) return productsResponse;

      const products = await productsResponse.json();
      let wetWipes = [];
      if (wetWipesResponse.ok) {
        const data = await wetWipesResponse.json();
        if (Array.isArray(data)) wetWipes = data;
      }

      const seen = new Set();
      const combined = [...(Array.isArray(products) ? products : []), ...wetWipes].filter((product) => {
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

    if (/^(wet-wipes\.json|image-data\/)/.test(rawUrl)) {
      return originalFetch(withVersion(rawUrl), {
        ...init,
        cache: "reload"
      });
    }

    return originalFetch(input, init);
  };
})();
