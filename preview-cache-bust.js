"use strict";

(() => {
  const originalFetch = window.fetch.bind(window);
  const version = "20260710-preview-8";

  const withVersion = (url) => {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}v=${version}`;
  };

  window.fetch = async (input, init = {}) => {
    const rawUrl = typeof input === "string" ? input : input.url;

    if (/^products\.json(?:\?|$)/.test(rawUrl)) {
      const requestOptions = { ...init, cache: "reload" };
      const [
        productsResponse,
        wetWipesResponse,
        guoshaoResponse,
        crocodileResponse,
        previewResponse,
        unileverExtraResponse,
        nankiaoResponse,
        yushengResponse
      ] = await Promise.all([
        originalFetch(withVersion("products.json"), requestOptions),
        originalFetch(withVersion("wet-wipes.json"), requestOptions),
        originalFetch(withVersion("guoshao-products.json"), requestOptions),
        originalFetch(withVersion("crocodile-products.json"), requestOptions),
        originalFetch(withVersion("preview-products.json"), requestOptions),
        originalFetch(withVersion("unilever-extra-preview.json"), requestOptions),
        originalFetch(withVersion("nankiao-preview.json"), requestOptions),
        originalFetch(withVersion("yusheng-preview.json"), requestOptions)
      ]);

      if (!productsResponse.ok) return productsResponse;

      const products = await productsResponse.json();
      const additions = [];

      if (wetWipesResponse.ok) {
        const data = await wetWipesResponse.json();
        if (Array.isArray(data)) additions.push(...data);
      }

      if (guoshaoResponse.ok) {
        const data = await guoshaoResponse.json();
        if (Array.isArray(data)) additions.push(...data);
      }

      if (crocodileResponse.ok) {
        const data = await crocodileResponse.json();
        if (Array.isArray(data)) {
          additions.push(...data.map((product) => ({
            ...product,
            brand: "鱷魚/必安住"
          })));
        }
      }

      for (const response of [previewResponse, unileverExtraResponse, nankiaoResponse, yushengResponse]) {
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

    if (/^(wet-wipes\.json|guoshao-products\.json|crocodile-products\.json|preview-products\.json|unilever-extra-preview\.json|nankiao-preview\.json|yusheng-preview\.json|image-data\/)/.test(rawUrl)) {
      return originalFetch(withVersion(rawUrl), {
        ...init,
        cache: "reload"
      });
    }

    return originalFetch(input, init);
  };
})();
