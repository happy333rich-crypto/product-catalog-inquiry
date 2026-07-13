"use strict";

(() => {
  const app = window.CatalogApp;
  const VERSION = "20260706-3";
  const CELL_SIZE = 96;
  const COLUMNS = 6;
  const SPRITE_PARTS = [
    "you-pin-sprite-1.txt",
    "you-pin-sprite-2.txt",
    "you-pin-sprite-3a.txt",
    "you-pin-sprite-3b.txt",
    "you-pin-sprite-3c.txt",
    "you-pin-sprite-3d.txt"
  ];

  const spriteState = {
    map: {},
    image: null,
    cache: new Map()
  };

  const loadYouPinSprite = async () => {
    const mapRequest = fetch(`image-data/you-pin-map.json?v=${VERSION}`, { cache: "no-store" });
    const partRequests = SPRITE_PARTS.map((file) =>
      fetch(`image-data/${file}?v=${VERSION}`, { cache: "no-store" })
    );

    const [mapResponse, ...partResponses] = await Promise.all([mapRequest, ...partRequests]);

    if (!mapResponse.ok || partResponses.some((response) => !response.ok)) {
      throw new Error("優品商品圖片讀取失敗");
    }

    spriteState.map = await mapResponse.json();
    const parts = await Promise.all(partResponses.map((response) => response.text()));
    const base64 = parts.join("").replace(/\s+/g, "");
    const image = new Image();

    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = () => reject(new Error("優品商品圖片解碼失敗"));
      image.src = `data:image/webp;base64,${base64}`;
    });

    if (image.naturalWidth !== COLUMNS * CELL_SIZE) {
      console.warn("優品商品圖片尺寸與預期不同", image.naturalWidth, image.naturalHeight);
    }

    spriteState.image = image;
  };

  const originalGetSpriteProductImage = app.getSpriteProductImage;
  app.getSpriteProductImage = (productId) => {
    const original = originalGetSpriteProductImage(productId);
    if (original) return original;

    const id = String(productId);
    if (spriteState.cache.has(id)) return spriteState.cache.get(id);

    const position = spriteState.map[id];
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
      const productsResponse = await fetch(`you-pin-products.json?v=${VERSION}`, { cache: "no-store" });
      if (!productsResponse.ok) {
        throw new Error(`優品商品資料讀取失敗（${productsResponse.status}）`);
      }

      const additions = await productsResponse.json();
      if (!Array.isArray(additions)) throw new Error("you-pin-products.json 格式不正確");

      const merged = new Map(app.state.products.map((product) => [product.id, product]));
      additions
        .filter((product) => product && product.active === true && product.id)
        .forEach((product) => merged.set(product.id, product));

      app.state.products = [...merged.values()];
      rebuildCatalog();
    } catch (error) {
      console.error(error);
      app.showToast("優品商品暫時無法載入");
      return;
    }

    try {
      await loadYouPinSprite();
      app.applyFilters();
    } catch (error) {
      console.warn("優品商品圖片暫時無法載入", error);
      app.showToast("優品商品已載入，部分圖片稍後補上");
    }
  };
})();
