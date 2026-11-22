"use strict";

/* V2.1 列表存圖：不更動既有產品資料及詢價流程。 */
(() => {
  const by = (selector) => document.querySelector(selector);
  const grid = by("[data-product-grid]");
  const modal = by("[data-capture-modal]");
  if (!grid || !modal) return;

  const imagePreview = by("[data-capture-preview]");
  const help = by("[data-capture-help]");
  const saveButton = by("[data-capture-save]");
  const shareButton = by("[data-capture-share]");
  const closeButton = by("[data-capture-close]");
  const size = { width: 700, padding: 36, top: 124, bottom: 46 };
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

  function card(ctx, item, x, y, w, lines, height) {
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#dce3de";
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (typeof ctx.roundRect === "function") {
      ctx.roundRect(x, y, w, height, 18);
    } else {
      ctx.rect(x, y, w, height);
    }
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

    let baseline = y + 417;
    lines.forEach((line) => {
      ctx.font = line.font;
      ctx.fillStyle = line.color;
      ctx.fillText(line.text, x + pad, baseline);
      baseline += line.height;
    });
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

  async function createImage(cardNode) {
    const item = {
      name: cardNode.querySelector(".product-name")?.textContent || "商品",
      sku: (cardNode.querySelector(".product-sku")?.textContent || "").replace(/^SKU：/, "") || cardNode.dataset.productId || "",
      spec: (cardNode.querySelector(".product-spec")?.textContent || "").replace(/^規格：/, "") || "待確認",
      pack: (cardNode.querySelector(".product-case-pack")?.textContent || "").replace(/^箱入：/, "") || "待確認",
      image: await usableImage(cardNode)
    };
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("瀏覽器不支援圖片製作");
    const cardWidth = size.width - 2 * size.padding;
    const lines = [];
    [
      [item.name, "700 30px sans-serif", "#1f2a24", 40],
      ["SKU：" + item.sku, "700 26px sans-serif", "#355b45", 38],
      ["規格：" + item.spec, "24px sans-serif", "#46534b", 36],
      ["箱入：" + item.pack, "24px sans-serif", "#46534b", 36]
    ].forEach(([text, font, color, height]) => {
      ctx.font = font;
      wrapText(ctx, text, cardWidth - 48).forEach(text => lines.push({ text, font, color, height }));
    });
    const height = 417 + lines.reduce((sum, line) => sum + line.height, 0) + 12;
    canvas.width = size.width;
    canvas.height = size.top + height + size.bottom;
    drawCover(ctx);
    card(ctx, item, size.padding, size.top, cardWidth, lines, height);
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

  grid.addEventListener("keydown", (event) => {
    if (event.target.closest("[data-capture-button]") && (event.key === "Enter" || event.key === " ")) event.stopPropagation();
  }, true);

  grid.addEventListener("click", async (event) => {
    const trigger = event.target.closest("[data-capture-button]");
    if (!trigger) return;
    event.preventDefault();
    event.stopPropagation();
    const cardNode = trigger.closest(".product-card");
    if (!cardNode || trigger.disabled) return;
    trigger.disabled = true;
    const oldContent = trigger.innerHTML;
    trigger.textContent = "…";
    try {
      const blob = await createImage(cardNode);
      if (currentUrl) URL.revokeObjectURL(currentUrl);
      currentBlob = blob;
      currentUrl = URL.createObjectURL(blob);
      imagePreview.src = currentUrl;
      help.textContent = "已製作此商品圖片。可儲存、截圖或分享；手機也能長按圖片儲存。";
      previousFocus = trigger;
      modal.hidden = false;
      document.body.classList.add("capture-open");
      closeButton.focus();
    } catch (error) {
      console.error("商品列表存圖失敗", error);
      notify("圖片製作失敗，請改用手機截圖");
    } finally {
      trigger.disabled = false;
      trigger.innerHTML = oldContent;
    }
  }, true);

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