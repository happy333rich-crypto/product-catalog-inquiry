"use strict";

(() => {
  const app = window.CatalogApp;

  app.clampQuantity = (value) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? Math.min(999, Math.max(1, parsed)) : 1;
  };

  app.getCartEntries = () => Object.values(app.state.cart)
    .map((entry) => ({ product: app.getProduct(entry.productId), quantity: app.clampQuantity(entry.quantity) }))
    .filter((entry) => entry.product);

  app.persistCart = () => {
    if (!app.saveJSON(app.keys.cart, app.state.cart)) app.showToast("這個瀏覽器無法保存詢價清單");
  };

  app.bindCartEvents = () => {
    document.querySelectorAll("[data-open-cart]").forEach((button) => button.addEventListener("click", app.openCart));
    document.querySelector("[data-close-cart]").addEventListener("click", app.closeCart);
    document.querySelector("[data-browse-products]").addEventListener("click", app.closeCart);
    app.el.backdrop.addEventListener("click", app.closeCart);
    app.el.clearCart.addEventListener("click", app.clearCart);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && app.el.drawer.classList.contains("open")) app.closeCart();
    });
  };

  app.openCart = (event) => {
    app.lastFocus = event?.currentTarget || document.activeElement;
    app.el.backdrop.hidden = false;
    app.el.drawer.classList.add("open");
    app.el.drawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("drawer-open");
    document.querySelector("[data-close-cart]").focus();
  };

  app.closeCart = () => {
    app.el.drawer.classList.remove("open");
    app.el.drawer.setAttribute("aria-hidden", "true");
    app.el.backdrop.hidden = true;
    document.body.classList.remove("drawer-open");
    app.lastFocus?.focus?.();
  };

  app.addToCart = (id) => {
    const product = app.getProduct(id);
    if (!product) return;
    const existed = Boolean(app.state.cart[id]);
    app.state.cart[id] = {
      productId: id,
      quantity: app.clampQuantity((app.state.cart[id]?.quantity || 0) + 1)
    };
    app.persistCart();
    app.updateCartUI();
    app.showToast(existed ? `${product.name} 已增加為 ${app.state.cart[id].quantity} 箱` : `${product.name} 已加入詢價清單`);
  };

  app.setQuantity = (id, value) => {
    if (!app.state.cart[id]) return;
    app.state.cart[id].quantity = app.clampQuantity(value);
    app.persistCart();
    app.updateCartUI();
  };

  app.removeFromCart = (id) => {
    const product = app.getProduct(id);
    delete app.state.cart[id];
    app.persistCart();
    app.updateCartUI();
    app.showToast(product ? `${product.name} 已移除` : "商品已移除");
  };

  app.clearCart = () => {
    if (!app.getCartEntries().length || !window.confirm("確定要清空全部詢價商品嗎？")) return;
    app.state.cart = {};
    app.persistCart();
    app.updateCartUI();
    app.showToast("詢價清單已清空");
  };

  app.updateCartUI = () => {
    const entries = app.getCartEntries();
    const count = entries.length;
    app.el.cartCounts.forEach((node) => { node.textContent = String(count); });
    app.el.cartEmpty.hidden = count > 0;
    app.el.cartItems.hidden = count === 0;
    app.el.clearCart.disabled = count === 0;
    document.querySelector("[data-generate-inquiry]").disabled = count === 0;
    app.renderCart(entries);
    document.querySelectorAll(".product-card").forEach((card) => {
      app.updateAddButton(card.querySelector(".add-button"), card.dataset.productId);
    });
    app.el.generatedSection.hidden = true;
  };

  app.updateAddButton = (button, id) => {
    if (!button) return;
    const quantity = app.state.cart[id]?.quantity;
    button.classList.toggle("added", Boolean(quantity));
    button.textContent = quantity ? `已加入・${quantity} 箱` : "加入詢價";
  };

  app.renderCart = (entries) => {
    const fragment = document.createDocumentFragment();
    entries.forEach(({ product, quantity }) => {
      const item = app.el.cartTemplate.content.firstElementChild.cloneNode(true);
      const input = item.querySelector(".quantity-input");
      const subtotal = app.lineSubtotal(product, quantity);
      item.querySelector(".cart-item-brand").textContent = product.brand;
      item.querySelector(".cart-item-name").textContent = product.name;
      item.querySelector(".cart-item-spec").textContent = [
        `SKU ${product.sku || product.id}`,
        product.spec,
        `單價 ${app.priceLabel(product.taxPrice)}`,
        `建議售價 ${app.priceLabel(product.suggestedPrice)}`,
        `箱入數 ${product.casePack || "待確認"}`,
        `小計 ${subtotal === null ? "待確認" : `$${subtotal}`}`
      ].join("｜");
      input.value = String(quantity);
      item.querySelector(".minus-button").addEventListener("click", () => app.setQuantity(product.id, quantity - 1));
      item.querySelector(".plus-button").addEventListener("click", () => app.setQuantity(product.id, quantity + 1));
      item.querySelector(".remove-button").addEventListener("click", () => app.removeFromCart(product.id));
      input.addEventListener("change", () => app.setQuantity(product.id, input.value));
      fragment.appendChild(item);
    });
    app.el.cartItems.replaceChildren(fragment);
  };
})();
