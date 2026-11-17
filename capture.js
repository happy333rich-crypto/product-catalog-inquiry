"use strict";

/* V2.1 列表存圖：不更動既有產品資料及詢價流程。 */
(() => {
  const by = (selector) => document.querySelector(selector);
  const trigger = by("[data-capture-button]");
  const modal = by("[data-capture-modal]");
  if (!trigger || !modal) return;

  const imagePreview = by("[data-capture-preview]");
  const help = by("[data-capture-help]");
  const saveButton = by("[data-capture-save]");
  const shareButton = by("[data-capture-share]");
  const closeButton = by("[data-capture-close]");
  const size = { width: 1000, padding: 36, gap: 24, cardHeight: 640, top: 124, bottom: 46 };
  let currentBlob = null;
  let currentUrl = "";
  let previousFocus = null;

  function notify(message) {
    if (window.CatalogApp && typeof window.CatalogApp.showToast === "function") {
      window.CatalogApp.showToast(message);
    } else {
      help.textContent = message;
    }
  }

  function selectedCards() {
    const cards = Array.from(document.querySelectorAll("[data-product-grid] .product-card"));
    if (!cards.length) return [];
    const topLimit = 76;
    const bottomLimit = window.innerHeight - 82;
    let first = cards.findIndex((card) => {
      const rect = card.getBoundingClientRect();
      return Math.min(rect.bottom, bottomLimit) - Math.max(rect.top, topLimit) > 65;
    });
    if (first < 0) first = 0;
    const columnCount = window.matchMedia("(max-width: 359px)").matches ? 1 : 2;
    const start = Math.floor(first / columnCount) * columnCount;
    return cards.slice(start, start + 4);
  }

  function wrapText(ctx, value, maxWidth) {
    const chars = Array.from(String(value || ""));
    const lines = [];
    let line = "";
    for (const char of chars) {
      if (line && ctx.measureText(line + char).width > maxWidth) {
        lines.push(line);
        line = char;
      } else {
        line += char;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  function title(ctx, text, x, y, maxWidth) {
    let font = 30;
    let lines = [];
    do {
      ctx.font = "700 " + font + "px sans-serif";
      lines = wrapText(ctx, text, maxWidth);
      if (lines.length <= 3) break;
      font -= 2;
    } while (font >= 20);
    ctx.fillStyle = "#1f2a24";
    lines.slice(0, 4).forEach((line, index) => ctx.fillText(line, x, y + index * (font + 8)));
  }

  async function usableImage(card) {
    const img = card.querySelector(".product-image");
    if (!img || !img.getAttribute("src")) return null;
    const src = img.currentSrc || img.src;
    try {
      const url = new URL(src, location.href);
      if (url.protocol !== "data:" && url.origin !== location.origin) return null;
      img.loading = "eager";
      if (typeof img.decode === "function") await img.decode();
      return img.naturalWidth > 0 && img.naturalHeight > 0 ? img : null;
    } catch (error) {
      return null;
    }
  }

  function drawCover(ctx) {
    ctx.fillStyle = "#faf8f2";
    ctx.fillRect(0, 0, size.width, ctx.canvas.height);
    ctx.fillStyle = "#244333";
    ctx.font = "bold 39px sans-serif";
    ctx.fillText("商品型錄", size.padding, 63);
    ctx.font = "23px sans-serif";
    ctx.fillStyle = "#657269";
    ctx.fillText("商品圖片・規格・商品編號", size.padding, 99);
  }

  function card(ctx, item, x, y, w) {
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#dce3de";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, y, w, size.cardHeight, 18);
    ctx.fill();
    ctx.stroke();

    const pad = 24;
    const photoX = x + pad;
    const photoY = y + pad;
    const photoW = w - pad * 2;
    const photoH = 355;
    ctx.fillStyle = "#f6f6f3";
    ctx.fillRect(photoX, photoY, photoW, photoH);
    if (item.image) {
      const scale = Math.min((photoW - 25) / item.image.naturalWidth, (photoH - 25) / item.image.naturalHeight);
      const iw = item.image.naturalWidth * scale;
      const ih = item.image.naturalHeight * scale;
      try {
        ctx.drawImage(item.image, photoX + (photoW - iw) / 2, photoY + (photoH - ih) / 2, iw, ih);
      } catch (error) {
        ctx.fillStyle = "#657269";
        ctx.font = "22px sans-serif";
        ctx.fillText("商品圖片待補", photoX + 40, photoY + 175);
      }
    } else {
      ctx.fillStyle = "#657269";
      ctx.font = "22px sans-serif";
      ctx.fillText("商品圖片待補", photoX + 40, photoY + 175);
    }

    const sx = x + pad;
    const tx = y + 417;
    const maxWidth = w - pad * 2;
    title(ctx, item.name, sx, tx, maxWidth);
    ctx.font = "700 26px sans-serif";
    ctx.fillStyle = "#355b45";
    ctx.fillText("SKU：" + item.sku, sx, y + 542, maxWidth);
    ctx.font = "24px sans-serif";
    ctx.fillStyle = "#46534b";
    ctx.fillText("規格：" + item.spec, sx, y + 582, maxWidth);
    ctx.fillText("箱入：" + item.pack, sx, y + 618, maxWidth);
  }

  function blobFromCanvas(canvas) {
    return new Promise((resolve, reject) => {
      try {
        canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("圖片輸出失敗")), "image/png");
      } catch (error) {
        reject(error);
      }
    });
  }

  async function createImage(cards) {
    const items = await Promise.all(cards.map(async (cardNode) => ({
      name: cardNode.querySelector(".product-name")?.textContent || "商品",
      sku: (cardNode.querySelector(".product-sku")?.textContent || "").replace(/^SKU：/, "") || cardNode.dataset.productId || "",
      spec: (cardNode.querySelector(".product-spec")?.textContent || "").replace(/^規格：/, "") || "待確認",
      pack: (cardNode.querySelector(".product-case-pack")?.textContent || "").replace(/^箱入：/, "") || "待確認",
      image: await usableImage(cardNode)
    })));
    const count = Math.max(1, items.length);
    const rows = Math.ceil(count / 2);
    const canvas = document.createElement("canvas");
    canvas.width = size.width;
    canvas.height = size.top + rows * size.cardHeight + (rows - 1) * size.gap + size.bottom;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("瀏覽器不支援圖片製作");
    drawCover(ctx);
    const cardWidth = (size.width - 2 * size.padding - size.gap) / 2;
    items.forEach((item, index) => {
      card(ctx, item,
        size.padding + (index % 2) * (cardWidth + size.gap),
        size.top + Math.floor(index / 2) * (size.cardHeight + size.gap),
        cardWidth);
    });
    return blobFromCanvas(canvas);
  }

  function close() {
    modal.hidden = true;
    document.body.classList.remove("capture-open");
    imagePreview.removeAttribute("src");
    if (currentUrl) URL.revokeObjectURL(currentUrl);
    currentUrl = "";
    currentBlob = null;
    previousFocus?.focus?.();
  }

  trigger.addEventListener("click", async () => {
    const cards = selectedCards();
    if (!cards.length) return notify("請先選擇要查看的商品");
    trigger.disabled = true;
    const oldText = trigger.textContent;
    trigger.textContent = "正在製作圖片…";
    try {
      const blob = await createImage(cards);
      if (currentUrl) URL.revokeObjectURL(currentUrl);
      currentBlob = blob;
      currentUrl = URL.createObjectURL(blob);
      imagePreview.src = currentUrl;
      help.textContent = "已製作此位置的 " + cards.length + " 項商品。可儲存圖片或傳給 LINE；手機也能長按圖片儲存。";
      previousFocus = document.activeElement;
      modal.hidden = false;
      document.body.classList.add("capture-open");
      closeButton.focus();
    } catch (error) {
      console.error("商品列表存圖失敗", error);
      notify("圖片製作失敗，請改用手機截圖");
    } finally {
      trigger.disabled = false;
      trigger.textContent = oldText;
    }
  });

  saveButton.addEventListener("click", () => {
    if (!currentUrl) return;
    const link = document.createElement("a");
    link.href = currentUrl;
    link.download = "商品型錄截圖.png";
    document.body.appendChild(link);
    link.click();
    link.remove();
    help.textContent = "若手機沒有直接存到相簿，請長按上方圖片選擇儲存。";
  });

  shareButton.addEventListener("click", async () => {
    if (!currentBlob) return;
    const file = new File([currentBlob], "商品型錄截圖.png", { type: "image/png" });
    const payload = { files: [file], title: "商品型錄截圖" };
    if (!navigator.share || (navigator.canShare && !navigator.canShare(payload))) {
      help.textContent = "此瀏覽器不支援直接分享圖片，請長按上方圖片儲存，再傳 LINE。";
      return;
    }
    try {
      await navigator.share(payload);
    } catch (error) {
      if (error?.name !== "AbortError") help.textContent = "無法直接分享，請長按圖片儲存，再傳 LINE。";
    }
  });

  closeButton.addEventListener("click", close);
  modal.addEventListener("click", (event) => { if (event.target === modal) close(); });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) close();
  });
})();