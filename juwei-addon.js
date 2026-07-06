"use strict";

(() => {
  const app = window.CatalogApp;
  const VERSION = "20260706-11";
  const CELL_SIZE = 120;
  const DIRECT_IMAGE_IDS = new Set([
    "E80650", "E80660", "E80670", "E80740", "E80760", "E80770",
    "E80790", "E80855", "E80870", "E80880", "E80950", "E80960"
  ]);
  const IMAGE_FILE_ID_MAP = {
    E80650: "E80870",
    E80660: "E80880",
    E80670: "E80855",
    E80740: "E80660",
    E80760: "E80760",
    E80770: "E80770",
    E80790: "E80670",
    E80855: "E80960",
    E80870: "E80650",
    E80880: "E80790",
    E80950: "E80950",
    E80960: "E80740"
  };
  const MAP = {
    E80500: [0, 0], E80510: [1, 0], E80560: [2, 0], E80580: [3, 0]
  };
  const spriteState = { image: null, cache: new Map() };

  const originalReadStoredImageData = app.readStoredImageData;
  app.readStoredImageData = (productId) =>
    originalReadStoredImageData(IMAGE_FILE_ID_MAP[String(productId)] || productId);

  const loadJuweiSprite = async () => {
    const response = await fetch(`image-data/juwei-sprite.txt?v=${VERSION}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`鉅瑋圖片讀取失敗（${response.status}）`);

    const base64 = (await response.text()).replace(/\s+/g, "");
    const image = new Image();
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = () => reject(new Error("鉅瑋圖片解碼失敗"));
      image.src = `data:image/webp;base64,${base64}`;
    });
    spriteState.image = image;
  };

  const originalGetSpriteProductImage = app.getSpriteProductImage;
  app.getSpriteProductImage = (productId) => {
    const id = String(productId);
    if (DIRECT_IMAGE_IDS.has(id)) return "";

    const original = originalGetSpriteProductImage(productId);
    if (original) return original;
    if (spriteState.cache.has(id)) return spriteState.cache.get(id);

    const position = MAP[id];
    if (!position || !spriteState.image) return "";

    const canvas = document.createElement("canvas");
    canvas.width = 320;
    canvas.height = 240;
    const context = canvas.getContext("2d");
    if (!context) return "";

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    const targetSize = 220;
    context.drawImage(
      spriteState.image,
      position[0] * CELL_SIZE,
      position[1] * CELL_SIZE,
      CELL_SIZE,
      CELL_SIZE,
      (canvas.width - targetSize) / 2,
      (canvas.height - targetSize) / 2,
      targetSize,
      targetSize
    );

    const source = canvas.toDataURL("image/webp", 0.86);
    spriteState.cache.set(id, source);
    return source;
  };

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
      const productsResponse = await fetch(`juwei-products.json?v=${VERSION}`, { cache: "no-store" });
      if (!productsResponse.ok) throw new Error(`鉅瑋商品資料讀取失敗（${productsResponse.status}）`);

      const additions = await productsResponse.json();
      if (!Array.isArray(additions)) throw new Error("juwei-products.json 格式不正確");

      const merged = new Map(app.state.products.map((product) => [product.id, product]));
      additions
        .filter((product) => product && product.active === true && product.id)
        .forEach((product) => merged.set(product.id, product));

      app.state.products = [...merged.values()];
      rebuildCatalog();
    } catch (error) {
      console.error(error);
      app.showToast("鉅瑋商品暫時無法載入");
      return;
    }

    try {
      await loadJuweiSprite();
      app.applyFilters();
    } catch (error) {
      console.warn("鉅瑋舊圖庫未載入，已改用個別圖片", error);
    }
  };
})();
