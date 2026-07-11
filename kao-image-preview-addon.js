"use strict";

(() => {
  const app = window.CatalogApp;
  if (!app) return;

  const imageOverrides = {
    "608350": "https://www.kotex.com.tw/-/media/feature/kotex/apac/tw/product/pdp-page/_teatree/_teatreesuper_image1_1572_1152.jpg?rev=-1",
    "608360": "https://www.kotex.com.tw/-/media/feature/kotex/apac/tw/product/pdp-page/_teatree/_teatreesuper_image1_1572_1152.jpg?rev=-1",
    "608521": "https://www.kotex.com.tw/-/media/feature/kotex/apac/tw/product/pdp-page/_soft/kotex__soft_image1_1572_1152.jpg?rev=-1",
    "608541": "https://www.kotex.com.tw/-/media/feature/kotex/apac/tw/product/pdp-page/_soft/kotex__soft_image1_1572_1152.jpg?rev=-1",
    "608561": "https://www.kotex.com.tw/-/media/feature/kotex/apac/tw/product/pdp-page/_soft/kotex__soft_image1_1572_1152.jpg?rev=-1"
  };

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