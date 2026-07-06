"use strict";

(() => {
  const app = window.CatalogApp;
  if (!app || typeof app.init !== "function") return;

  const originalInit = app.init;
  app.init = async () => {
    await originalInit();

    try {
      const response = await fetch("wet-wipes.json?v=20260706-3", { cache: "no-store" });
      if (!response.ok) throw new Error(`濕巾資料讀取失敗（${response.status}）`);

      const additions = await response.json();
      if (!Array.isArray(additions)) throw new Error("wet-wipes.json 格式不正確");

      const merged = new Map(app.state.products.map((product) => [product.id, product]));
      additions
        .filter((product) => product && product.active === true && product.id)
        .forEach((product) => merged.set(product.id, product));

      app.state.products = [...merged.values()];

      [app.el.brand, app.el.category].forEach((select) => {
        while (select.options.length > 1) select.remove(1);
      });

      app.fillFilters();
      app.applyFilters();
      app.updateCartUI();
    } catch (error) {
      console.error(error);
      app.showToast("濕巾資料暫時無法載入");
    }
  };
})();
