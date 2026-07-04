"use strict";

window.CatalogApp = {
  keys: {
    cart: "productCatalogInquiry.cart.v1",
    customer: "productCatalogInquiry.customer.v1"
  },
  state: {
    products: [],
    filtered: [],
    cart: {},
    filters: { search: "", brand: "", category: "" }
  },
  el: {},
  toastTimer: null,
  lastFocus: null
};

(() => {
  const app = window.CatalogApp;

  app.loadJSON = (key, fallback) => {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      console.warn(`無法讀取 ${key}`, error);
      return fallback;
    }
  };

  app.saveJSON = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`無法儲存 ${key}`, error);
      return false;
    }
  };

  app.showToast = (message) => {
    clearTimeout(app.toastTimer);
    app.el.toast.textContent = message;
    app.el.toast.classList.add("show");
    app.toastTimer = setTimeout(() => app.el.toast.classList.remove("show"), 2600);
  };

  app.cacheElements = () => {
    app.el = {
      grid: document.querySelector("[data-product-grid]"),
      productTemplate: document.querySelector("#product-card-template"),
      cartTemplate: document.querySelector("#cart-item-template"),
      loading: document.querySelector("[data-loading-status]"),
      empty: document.querySelector("[data-empty-state]"),
      resultCount: document.querySelector("[data-result-count]"),
      search: document.querySelector("[data-search]"),
      brand: document.querySelector("[data-brand-filter]"),
      category: document.querySelector("[data-category-filter]"),
      drawer: document.querySelector("[data-cart-drawer]"),
      backdrop: document.querySelector("[data-cart-backdrop]"),
      cartItems: document.querySelector("[data-cart-items]"),
      cartEmpty: document.querySelector("[data-cart-empty]"),
      cartCounts: document.querySelectorAll("[data-cart-count]"),
      clearCart: document.querySelector("[data-clear-cart]"),
      form: document.querySelector("[data-customer-form]"),
      generatedSection: document.querySelector("[data-generated-section]"),
      generatedText: document.querySelector("[data-generated-text]"),
      toast: document.querySelector("[data-toast]")
    };
  };

  app.init = async () => {
    app.cacheElements();
    app.state.cart = app.loadJSON(app.keys.cart, {});
    app.bindCatalogEvents();
    app.bindCartEvents();
    app.bindInquiryEvents();
    app.restoreCustomer();
    app.updateCartUI();

    try {
      const response = await fetch("products.json", { cache: "no-store" });
      if (!response.ok) throw new Error(`商品資料讀取失敗（${response.status}）`);
      const products = await response.json();
      if (!Array.isArray(products)) throw new Error("products.json 格式不正確");

      app.state.products = products.filter((p) =>
        p && p.active === true && p.id && p.brand && p.category && p.name && p.spec
      );
      app.fillFilters();
      app.applyFilters();
      app.updateCartUI();
    } catch (error) {
      console.error(error);
      app.showLoadError();
    }
  };

  app.bindCatalogEvents = () => {
    app.el.search.addEventListener("input", (event) => {
      app.state.filters.search = event.target.value.trim().toLowerCase();
      app.applyFilters();
    });
    app.el.brand.addEventListener("change", (event) => {
      app.state.filters.brand = event.target.value;
      app.applyFilters();
    });
    app.el.category.addEventListener("change", (event) => {
      app.state.filters.category = event.target.value;
      app.applyFilters();
    });
    document.querySelectorAll("[data-reset-filters], [data-empty-reset]").forEach((button) => {
      button.addEventListener("click", app.resetFilters);
    });
  };

  app.fillFilters = () => {
    const unique = (key) => [...new Set(app.state.products.map((p) => p[key]))]
      .sort((a, b) => a.localeCompare(b, "zh-Hant"));
    [[app.el.brand, unique("brand")], [app.el.category, unique("category")]].forEach(([select, values]) => {
      values.forEach((value) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    });
  };

  app.applyFilters = () => {
    const { search, brand, category } = app.state.filters;
    app.state.filtered = app.state.products.filter((product) => {
      const haystack = `${product.name} ${product.sku} ${product.barcode}`.toLowerCase();
      return (!search || haystack.includes(search)) &&
        (!brand || product.brand === brand) &&
        (!category || product.category === category);
    });
    app.el.loading.hidden = true;
    app.el.empty.hidden = app.state.filtered.length > 0;
    app.el.resultCount.textContent = String(app.state.filtered.length);
    app.renderProducts();
  };

  app.renderProducts = () => {
    const fragment = document.createDocumentFragment();
    app.state.filtered.forEach((product) => {
      const card = app.el.productTemplate.content.firstElementChild.cloneNode(true);
      const image = card.querySelector(".product-image");
      const placeholder = card.querySelector(".image-placeholder");
      const button = card.querySelector(".add-button");

      card.dataset.productId = product.id;
      card.querySelector(".brand-pill").textContent = product.brand;
      card.querySelector(".product-category").textContent = product.category;
      card.querySelector(".product-name").textContent = product.name;
      card.querySelector(".product-spec").textContent = product.spec;
      card.querySelector(".product-case-pack").textContent = String(product.casePack);
      card.querySelector(".product-sku").textContent = product.sku;

      if (product.image) {
        image.src = product.image;
        image.alt = `${product.name}商品圖片`;
        image.hidden = false;
        placeholder.hidden = true;
        image.addEventListener("error", () => {
          image.hidden = true;
          placeholder.hidden = false;
        }, { once: true });
      }

      app.updateAddButton(button, product.id);
      button.addEventListener("click", () => app.addToCart(product.id));
      fragment.appendChild(card);
    });
    app.el.grid.replaceChildren(fragment);
  };

  app.resetFilters = () => {
    app.state.filters = { search: "", brand: "", category: "" };
    app.el.search.value = "";
    app.el.brand.value = "";
    app.el.category.value = "";
    app.applyFilters();
    app.el.search.focus();
  };

  app.getProduct = (id) => app.state.products.find((product) => product.id === id);

  app.showLoadError = () => {
    app.el.loading.replaceChildren();
    const title = document.createElement("strong");
    const text = document.createElement("span");
    title.textContent = "商品資料暫時無法載入";
    text.textContent = "請重新整理頁面；若是直接開啟 index.html，請改用網站網址。";
    app.el.loading.append(title, text);
    app.el.resultCount.textContent = "0";
  };
})();
