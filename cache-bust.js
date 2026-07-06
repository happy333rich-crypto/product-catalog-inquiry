"use strict";

(() => {
  const originalFetch = window.fetch.bind(window);
  const version = "20260706-6";

  const withVersion = (url) => {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}v=${version}`;
  };

  window.fetch = async (input, init = {}) => {
    const rawUrl = typeof input === "string" ? input : input.url;

    if (/^products\.json(?:\?|$)/.test(rawUrl)) {
      const requestOptions = { ...init, cache: "reload" };
      const [productsResponse, wetWipesResponse, guoshaoResponse] = await Promise.all([
        originalFetch(withVersion("products.json"), requestOptions),
        originalFetch(withVersion("wet-wipes.json"), requestOptions),
        originalFetch(withVersion("guoshao-products.json"), requestOptions)
      ]);

      if (!productsResponse.ok) return productsResponse;

      const products = await productsResponse.json();
      let wetWipes = [];
      let guoshao = [];

      if (wetWipesResponse.ok) {
        const data = await wetWipesResponse.json();
        if (Array.isArray(data)) wetWipes = data;
      }

      if (guoshaoResponse.ok) {
        const data = await guoshaoResponse.json();
        if (Array.isArray(data)) guoshao = data;
      }

      const seen = new Set();
      const combined = [
        ...(Array.isArray(products) ? products : []),
        ...wetWipes,
        ...guoshao
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

    if (/^(wet-wipes\.json|guoshao-products\.json|image-data\/)/.test(rawUrl)) {
      return originalFetch(withVersion(rawUrl), {
        ...init,
        cache: "reload"
      });
    }

    return originalFetch(input, init);
  };
})();