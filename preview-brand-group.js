"use strict";

(() => {
  const app = window.CatalogApp;
  if (!app) return;

  const groupedBrands = new Set(["居居加", "居美媞", "妙妙熊", "鉅瑋"]);
  const groupedLabel = "居居加/居美媞/妙妙熊/鉅瑋";
  const originalInit = app.init;

  app.init = async () => {
    await originalInit();

    app.state.products = app.state.products.map((product) =>
      groupedBrands.has(product.brand)
        ? { ...product, brand: groupedLabel }
        : product
    );

    [app.el.brand, app.el.category].forEach((select) => {
      while (select.options.length > 1) select.remove(1);
    });

    app.fillFilters();
    app.applyFilters();
    app.updateCartUI();
  };
})();
