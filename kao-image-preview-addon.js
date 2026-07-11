"use strict";

(() => {
  const app = window.CatalogApp;
  if (!app) return;

  // 圖片必須逐 SKU 精確核對：貨號／條碼／尺寸／片數皆一致才可加入。
  // 目前先撤下先前共用系列圖的錯誤配圖，避免不同尺寸顯示同一包裝。
  const imageOverrides = {};

  const originalInit = app.init;
  app.init = async () => {
    await originalInit();

    app.state.products = app.state.products.map((product) =>
      imageOverrides[product.id]
        ? { ...product, image: imageOverrides[product.id] }
        : product
    );

    app.applyFilters();
    app.updateCartUI();
  };
})();
