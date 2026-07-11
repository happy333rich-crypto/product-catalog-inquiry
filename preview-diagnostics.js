"use strict";

(() => {
  const showFailure = (message) => {
    const panel = document.querySelector("[data-loading-status]");
    if (!panel) return;
    panel.hidden = false;
    panel.innerHTML = `<strong>測試頁載入失敗</strong><br><span>${message}</span>`;
    panel.style.color = "#8a2d2d";
    panel.style.background = "#fff2f2";
    panel.style.borderColor = "#e8bcbc";
  };

  window.addEventListener("error", (event) => {
    const source = event.filename ? event.filename.split("/").pop() : "頁面程式";
    showFailure(`${source} 發生錯誤，已停止交付此版本。`);
  });

  window.addEventListener("unhandledrejection", () => {
    showFailure("商品資料或圖片載入失敗，已停止交付此版本。");
  });

  window.setTimeout(() => {
    const count = Number(document.querySelector("[data-result-count]")?.textContent || 0);
    const cards = document.querySelectorAll(".product-card").length;
    const brandOptions = document.querySelectorAll("[data-brand-filter] option").length;

    if (!window.CatalogApp) {
      showFailure("主程式沒有成功啟動。");
      return;
    }
    if (count < 1 || cards < 1) {
      showFailure("商品資料沒有成功載入。");
      return;
    }
    if (brandOptions < 2) {
      showFailure("品牌下拉選單沒有成功建立。");
      return;
    }

    document.documentElement.dataset.previewReady = "true";
  }, 10000);
})();
