"use strict";

(() => {
  const app = window.CatalogApp;
  if (!app) return;

  // 圖片必須逐 SKU 精確核對：貨號／條碼／尺寸／片數皆一致才可加入。
  // Google Drive 公開圖改用 thumbnail 端點，避免 uc?export=view 在 GitHub Pages 無法穩定顯示。
  const imageOverrides = {
    "160040": "https://drive.google.com/thumbnail?id=1u4AG9AQ8eLNuBot5zsdJjXlqqHF_IrmB&sz=w1000",
    "750140": "https://drive.google.com/thumbnail?id=1_kTrl0rvyjGhct0kGE8xdoxhnrPab2hn&sz=w1000",
    "852800": "https://drive.google.com/thumbnail?id=1Jsrl8St6CViSPI9vCkuR-hsg4iki9WZG&sz=w1000",
    "882280": "https://drive.google.com/thumbnail?id=1pMGmvEH1Y6vbw_iSlLPSgVummQ1KhWqP&sz=w1000"
  };
  const verifiedStoredImageIds = new Set([
    "811700"
  ]);

  const removedProductIds = new Set([
    "843070", // 舒潔 ufufy 濕式面紙
    "890180", // 舒潔食品級摺疊紙巾 150張×2入
    "841870"  // 舒潔淨99抗菌濕巾
  ]);

  const productNameOverrides = {
    "811700": "舒潔雲絨舒適抽取衛生紙"
  };

  const originalInit = app.init;
  app.init = async () => {
    await originalInit();

    const storedImages = new Map();
    await Promise.all([...verifiedStoredImageIds].map(async (id) => {
      try {
        const base64 = await app.readStoredImageData(id);
        if (base64) storedImages.set(id, `data:image/webp;base64,${base64}`);
      } catch (error) {
        console.warn(`商品 ${id} 的精確圖片載入失敗`, error);
      }
    }));

    app.state.products = app.state.products
      .filter((product) => !removedProductIds.has(product.id))
      .map((product) => ({
        ...product,
        name: productNameOverrides[product.id] || product.name,
        image: storedImages.get(product.id) || imageOverrides[product.id] || product.image
      }));

    app.applyFilters();
    app.updateCartUI();
  };
})();