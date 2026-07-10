"use strict";

(() => {
  const app = window.CatalogApp;
  if (!app) return;

  const VERSION = "20260710-preview-4";
  const CELL_SIZE = 96;
  const COLUMNS = 4;
  const imageMap = {
    N01820: [0, 0],
    N01830: [1, 0],
    N01840: [2, 0],
    N01850: [3, 0],
    N01860: [0, 1],
    N01870: [1, 1],
    N31090: [2, 1],
    N31100: [3, 1]
  };

  const spriteState = {
    image: null,
    cache: new Map()
  };

  const loadSprite = async () => {
    const response = await fetch(`image-data/white-lan-preview-sprite.txt?v=${VERSION}`, {
      cache: "no-store"
    });
    if (!response.ok) throw new Error("白蘭商品圖片讀取失敗");

    const base64 = (await response.text()).replace(/\s+/g, "");
    const image = new Image();
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = () => reject(new Error("白蘭商品圖片解碼失敗"));
      image.src = `data:image/webp;base64,${base64}`;
    });
    spriteState.image = image;
  };

  const originalGetSpriteProductImage = app.getSpriteProductImage;
  app.getSpriteProductImage = (productId) => {
    const original = originalGetSpriteProductImage(productId);
    if (original) return original;

    const id = String(productId);
    if (spriteState.cache.has(id)) return spriteState.cache.get(id);

    const position = imageMap[id];
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

    const source = canvas.toDataURL("image/webp", 0.88);
    spriteState.cache.set(id, source);
    return source;
  };

  const originalInit = app.init;
  app.init = async () => {
    await originalInit();
    try {
      await loadSprite();
      app.applyFilters();
    } catch (error) {
      console.error(error);
      app.showToast("白蘭商品已載入，部分圖片稍後補上");
    }
  };
})();
