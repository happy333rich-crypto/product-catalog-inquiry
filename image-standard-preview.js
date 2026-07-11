"use strict";

(() => {
  const updatePlaceholders = () => {
    document.querySelectorAll(".image-placeholder").forEach((placeholder) => {
      const title = placeholder.querySelector("span");
      const note = placeholder.querySelector("small");
      if (title) title.textContent = "圖片整理中";
      if (note) note.textContent = "尚未完成配圖";
    });
  };

  const observer = new MutationObserver(updatePlaceholders);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener("DOMContentLoaded", updatePlaceholders, { once: true });
  updatePlaceholders();
})();
