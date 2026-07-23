"use strict";

(() => {
  const originalFetch = window.fetch.bind(window);
const version = "20260724-1";
  const removedProductIds = new Set([
    "843070", // 舒潔 ufufy 濕式面紙
    "890180", // 舒潔食品級摺疊紙巾 150張×2入
    "841870"  // 舒潔淨99抗菌濕巾
  ]);
const withVersion = (url) => {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}v=${version}`;
  };

  window.fetch = async (input, init = {}) => {
    const rawUrl = typeof input === "string" ? input : input.url;

    if (/^products\.json(?:\?|$)/.test(rawUrl)) {
      const requestOptions = { ...init, cache: "reload" };
      const [productsResponse, yushengResponse, savlonResponse, unileverResponse, liuheResponse, wangwangResponse, namchowResponse, qinghuiResponse, wetWipesResponse, guoshaoResponse, crocodileResponse] = await Promise.all([
        originalFetch(withVersion("products.json"), requestOptions),
        originalFetch(withVersion("yusheng-products.json"), requestOptions),
        originalFetch(withVersion("savlon-products.json"), requestOptions),
        originalFetch(withVersion("unilever-products.json"), requestOptions),
        originalFetch(withVersion("liuhe-products.json"), requestOptions),
        originalFetch(withVersion("wangwang-products.json"), requestOptions),
        originalFetch(withVersion("namchow-products.json"), requestOptions),
        originalFetch(withVersion("qinghui-products.json"), requestOptions),
        originalFetch(withVersion("wet-wipes.json"), requestOptions),
        originalFetch(withVersion("guoshao-products.json"), requestOptions),
        originalFetch(withVersion("crocodile-products.json"), requestOptions)
      ]);

      if (!productsResponse.ok) return productsResponse;

      const products = await productsResponse.json();
      let yusheng = [];
      let savlon = [];
      let unilever = [];
      let liuhe = [];
      let wangwang = [];
      let namchow = [];
      let qinghui = [];
      let wetWipes = [];
      let guoshao = [];
      let crocodile = [];

      if (yushengResponse.ok) {
        const data = await yushengResponse.json();
        if (Array.isArray(data)) yusheng = data;
      }

      if (savlonResponse.ok) {
        const data = await savlonResponse.json();
        if (Array.isArray(data)) savlon = data;
      }

      if (unileverResponse.ok) {
        const data = await unileverResponse.json();
        if (Array.isArray(data)) unilever = data;
      }

      if (liuheResponse.ok) {
        const data = await liuheResponse.json();
        if (Array.isArray(data)) liuhe = data;
      }

      if (wangwangResponse.ok) {
        const data = await wangwangResponse.json();
        if (Array.isArray(data)) wangwang = data;
      }

      if (namchowResponse.ok) {
        const data = await namchowResponse.json();
        if (Array.isArray(data)) namchow = data;
      }

      if (qinghuiResponse.ok) {
        const data = await qinghuiResponse.json();
        if (Array.isArray(data)) qinghui = data;
      }

      if (wetWipesResponse.ok) {
        const data = await wetWipesResponse.json();
        if (Array.isArray(data)) wetWipes = data;
      }

      if (guoshaoResponse.ok) {
        const data = await guoshaoResponse.json();
        if (Array.isArray(data)) guoshao = data;
      }

      if (crocodileResponse.ok) {
        const data = await crocodileResponse.json();
        if (Array.isArray(data)) crocodile = data;
      }

      const seen = new Set();
      const combined = [
        ...(Array.isArray(products) ? products : []),
        ...yusheng,
        ...savlon,
        ...unilever,
        ...liuhe,
        ...wangwang,
        ...namchow,
        ...qinghui,
        ...wetWipes,
        ...guoshao,
        ...crocodile
      ]
        .filter((product) => {
          const id = product && product.id ? String(product.id) : "";
          if (!id || seen.has(id) || removedProductIds.has(id)) return false;
          seen.add(id);
          return true;
        })
        .map((product) => ({
          ...product,
          name: product.name
        }));

      return new Response(JSON.stringify(combined), {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-store"
        }
      });
    }

    if (/^(yusheng-products\.json|savlon-products\.json|unilever-products\.json|liuhe-products\.json|wangwang-products\.json|namchow-products\.json|qinghui-products\.json|wet-wipes\.json|guoshao-products\.json|crocodile-products\.json|image-data\/)/.test(rawUrl)) {
      return originalFetch(withVersion(rawUrl), {
        ...init,
        cache: "reload"
      });
    }

    return originalFetch(input, init);
  };
})();
