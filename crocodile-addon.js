"use strict";

(() => {
  const app = window.CatalogApp;
  const VERSION = "20260709-1";

  const rebuildCatalog = () => {
    [app.el.brand, app.el.category].forEach((select) => {
      while (select.options.length > 1) select.remove(1);
    });
    app.fillFilters();
    app.applyFilters();
    app.updateCartUI();
  };

  const originalInit = app.init;
  app.init = async () => {
    await originalInit();

    try {
      const response = await fetch(`crocodile-products.json?v=${VERSION}`, { cache: "no-store" });
      if (!response.ok) throw new Error(`鱷魚商品資料讀取失敗（${response.status}）`);

      const additions = await response.json();
      if (!Array.isArray(additions)) throw new Error("crocodile-products.json 格式不是商品清單");

      const merged = new Map(app.state.products.map((product) => [product.id, product]));
      additions
        .filter((product) => product && product.active === true && product.id)
        .forEach((product) => merged.set(product.id, product));

      app.state.products = [...merged.values()];
      rebuildCatalog();
    } catch (error) {
      console.error(error);
      app.showToast("鱷魚商品資料載入失敗");
    }
  };
})();
