"use strict";

(() => {
  const app = window.CatalogApp;
  if (!app) return;

  const brandGroups = [
    {
      brands: new Set(["居居加", "居美媞", "妙妙熊", "鉅瑋"]),
      label: "居居加/居美媞/妙妙熊/鉅瑋"
    },
    {
      brands: new Set(["可麗舒", "可立雅"]),
      label: "可麗舒/可立雅"
    }
  ];

  const originalInit = app.init;

  app.init = async () => {
    await originalInit();

    app.state.products = app.state.products.map((product) => {
      const group = brandGroups.find(({ brands }) => brands.has(product.brand));
      return group ? { ...product, brand: group.label } : product;
    });

    [app.el.brand, app.el.category].forEach((select) => {
      while (select.options.length > 1) select.remove(1);
    });

    app.fillFilters();
    app.applyFilters();
    app.updateCartUI();
  };
})();
