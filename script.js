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
    filters: { search: "", brand: "", category: "" },
    sprite: { map: {}, image: null, cache: new Map() }
  },
  el: {},
  toastTimer: null,
  lastFocus: null
};

(() => {
  const app = window.CatalogApp;
  const BUILD_VERSION = "20260706-2";
  const SPRITE_CELL_SIZE = 80;
  const SPRITE_COLUMNS = 8;
  const SPRITE_PARTS = [
    "sprite80-1.txt",
    "sprite80-2.txt",
    "sprite80-3a.txt",
    "sprite80-3b.txt",
    "sprite80-3c1.txt",
    "sprite80-3c2.txt",
    "sprite80-3c3.txt",
    "sprite80-3c4.txt",
    "sprite80-3d1.txt",
    "sprite80-3d2.txt",
    "sprite80-3d3.txt",
    "sprite80-3d4.txt"
  ];
  const STORED_IMAGE_PRIORITY = new Set(["818360"]);
  const PRODUCT_NAME_OVERRIDES = {
    E14094: "春風三層絲嵐抽取衛生紙"
  };
  const BRAND_GROUP_ORDER = [
    ["舒潔"],
    ["可麗舒", "可立雅"],
    ["春風"],
    ["蒲公英"],
    ["原萃"],
    ["靠得住"],
    ["好奇"],
    ["力可潔"],
    ["居居加", "居美媞", "妙妙熊", "鉅瑋", "居美媞/居居加/妙妙熊/鉅瑋"],
    ["白蘭", "熊寶貝", "麗仕"],
    ["南僑"],
    ["鱷魚", "必安住"],
    ["優品"],
    ["清檜"],
    ["優生"],
    ["沙威隆"],
    ["六禾"],
    ["汪汪寶貝"],
    ["唐鑫"]
  ];

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

  app.initTutorialCard = () => {
    const { tutorialCard, tutorialContent, tutorialToggle } = app.el;
    if (!tutorialCard || !tutorialContent || !tutorialToggle) return;

    const storageKey = "productCatalogInquiry.tutorialCollapsed.v1";
    const setCollapsed = (collapsed, save = false) => {
      tutorialCard.classList.toggle("is-collapsed", collapsed);
      tutorialContent.hidden = collapsed;
      tutorialToggle.setAttribute("aria-expanded", String(!collapsed));
      tutorialToggle.textContent = collapsed ? "查看使用方式" : "收合教學";

      if (!save) return;
      try {
        localStorage.setItem(storageKey, collapsed ? "true" : "false");
      } catch (error) {
        console.warn("無法儲存教學卡狀態", error);
      }
    };

    let collapsed = false;
    try {
      collapsed = localStorage.getItem(storageKey) === "true";
    } catch (error) {
      console.warn("無法讀取教學卡狀態", error);
    }
    setCollapsed(collapsed);

    tutorialToggle.addEventListener("click", () => {
      setCollapsed(!tutorialCard.classList.contains("is-collapsed"), true);
    });
  };

  app.showToast = (message) => {
    clearTimeout(app.toastTimer);
    app.el.toast.textContent = message;
    app.el.toast.classList.add("show");
    app.toastTimer = setTimeout(() => app.el.toast.classList.remove("show"), 2600);
  };

  app.normalizeText = (value) => String(value ?? "")
    .normalize("NFKC")
    .replace(/\s+/g, "")
    .toLowerCase();

  app.moneyValue = (value) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
  };

  app.priceLabel = (value) => {
    const numeric = app.moneyValue(value);
    return numeric === null ? "待確認" : `$${numeric}`;
  };

  app.lineSubtotal = (product, quantity) => {
    const price = app.moneyValue(product?.taxPrice);
    return price === null ? null : price * app.clampQuantity(quantity);
  };

  app.brandOrderIndex = (brand) => {
    const normalized = app.normalizeText(brand);
    const index = BRAND_GROUP_ORDER.findIndex((group) =>
      group.some((item) => normalized.includes(app.normalizeText(item)))
    );
    return index === -1 ? 999 : index;
  };

  app.sortBrands = (brands) => brands.sort((a, b) => {
    const orderDiff = app.brandOrderIndex(a) - app.brandOrderIndex(b);
    return orderDiff || a.localeCompare(b, "zh-Hant");
  });

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
      tutorialCard: document.querySelector("[data-tutorial-card]"),
      tutorialContent: document.querySelector("[data-tutorial-content]"),
      tutorialToggle: document.querySelector("[data-tutorial-toggle]"),
      toast: document.querySelector("[data-toast]")
    };
  };

  app.loadSpriteCatalog = async () => {
    const mapRequest = fetch(`image-data/catalog-map.json?v=${BUILD_VERSION}`, { cache: "no-store" });
    const partRequests = SPRITE_PARTS.map((file) =>
      fetch(`image-data/${file}?v=${BUILD_VERSION}`, { cache: "no-store" })
    );
    const [mapResponse, ...partResponses] = await Promise.all([mapRequest, ...partRequests]);

    if (!mapResponse.ok || partResponses.some((response) => !response.ok)) {
      throw new Error("商品圖片圖庫讀取失敗");
    }

    const map = await mapResponse.json();
    const parts = await Promise.all(partResponses.map((response) => response.text()));
    const base64 = parts.join("").replace(/\s+/g, "");
    const sprite = new Image();

    await new Promise((resolve, reject) => {
      sprite.onload = resolve;
      sprite.onerror = () => reject(new Error("商品圖片圖庫解碼失敗"));
      sprite.src = `data:image/webp;base64,${base64}`;
    });

    if (sprite.naturalWidth !== SPRITE_COLUMNS * SPRITE_CELL_SIZE) {
      console.warn("商品圖片圖庫尺寸與預期不同", sprite.naturalWidth, sprite.naturalHeight);
    }

    app.state.sprite.map = map;
    app.state.sprite.image = sprite;
  };

  app.init = async () => {
    app.cacheElements();
    app.initTutorialCard();
    app.state.cart = app.loadJSON(app.keys.cart, {});
    app.bindCatalogEvents();
    app.bindCartEvents();
    app.bindInquiryEvents();
    app.restoreCustomer();
    app.updateCartUI();

    try {
      await app.loadSpriteCatalog().catch((error) => {
        console.warn("商品圖片圖庫暫時無法載入，改用個別圖片", error);
      });

      const response = await fetch(`products.json?v=${BUILD_VERSION}`, { cache: "no-store" });
      if (!response.ok) throw new Error(`商品資料讀取失敗（${response.status}）`);
      const products = await response.json();
      if (!Array.isArray(products)) throw new Error("products.json 格式不正確");

      app.state.products = products
        .filter((p) => p && p.active === true && p.id && p.brand && p.category && p.name && p.spec)
        .map((product) => ({
          ...product,
          name: PRODUCT_NAME_OVERRIDES[product.id] || product.name
        }));
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
      app.state.filters.search = app.normalizeText(event.target.value);
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
    const unique = (key) => {
      const values = [...new Set(app.state.products.map((p) => p[key]).filter(Boolean))];
      return key === "brand" ? app.sortBrands(values) : values.sort((a, b) => a.localeCompare(b, "zh-Hant"));
    };
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
      const haystack = app.normalizeText([
        product.id,
        product.sku,
        product.barcode,
        product.brand,
        product.category,
        product.name,
        product.spec
      ].join(" "));
      return (!search || haystack.includes(search)) &&
        (!brand || product.brand === brand) &&
        (!category || product.category === category);
    });
    app.el.loading.hidden = true;
    app.el.empty.hidden = app.state.filtered.length > 0;
    app.el.resultCount.textContent = String(app.state.filtered.length);
    app.renderProducts();
  };

  app.showProductImage = (product, image, placeholder, source) => {
    image.src = source;
    image.alt = `${product.name}商品圖片`;
    image.hidden = false;
    placeholder.hidden = true;
    image.addEventListener("error", () => {
      image.hidden = true;
      placeholder.hidden = false;
    }, { once: true });
  };

  app.readStoredImageData = async (productId) => {
    const encodedId = encodeURIComponent(productId);
    const single = await fetch(`image-data/${encodedId}.txt?v=${BUILD_VERSION}`, { cache: "no-store" });
    if (single.ok) return (await single.text()).trim();

    const parts = [];
    for (let part = 1; part <= 3; part += 1) {
      const response = await fetch(`image-data/${encodedId}-${part}.txt?v=${BUILD_VERSION}`, { cache: "no-store" });
      if (!response.ok) break;
      parts.push((await response.text()).trim());
    }
    return parts.join("");
  };

  app.loadStoredProductImage = async (product, image, placeholder, fallbackSource = "") => {
    try {
      const base64 = await app.readStoredImageData(product.id);
      if (base64) {
        app.showProductImage(product, image, placeholder, `data:image/webp;base64,${base64}`);
        return;
      }
      if (fallbackSource) app.showProductImage(product, image, placeholder, fallbackSource);
    } catch (error) {
      if (fallbackSource) {
        app.showProductImage(product, image, placeholder, fallbackSource);
      } else {
        console.warn(`商品 ${product.id} 圖片暫時無法載入`, error);
      }
    }
  };

  app.getSpriteProductImage = (productId) => {
    const id = String(productId);
    if (app.state.sprite.cache.has(id)) return app.state.sprite.cache.get(id);

    const position = app.state.sprite.map[id];
    const sprite = app.state.sprite.image;
    if (!position || !sprite) return "";

    const [column, row] = position;
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
    const targetX = (canvas.width - targetSize) / 2;
    const targetY = (canvas.height - targetSize) / 2;
    context.drawImage(
      sprite,
      column * SPRITE_CELL_SIZE,
      row * SPRITE_CELL_SIZE,
      SPRITE_CELL_SIZE,
      SPRITE_CELL_SIZE,
      targetX,
      targetY,
      targetSize,
      targetSize
    );

    const source = canvas.toDataURL("image/webp", 0.82);
    app.state.sprite.cache.set(id, source);
    return source;
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

      const spriteSource = app.getSpriteProductImage(product.id);
      if (product.image) {
        app.showProductImage(product, image, placeholder, product.image);
      } else if (STORED_IMAGE_PRIORITY.has(product.id)) {
        app.loadStoredProductImage(product, image, placeholder, spriteSource);
      } else if (spriteSource) {
        app.showProductImage(product, image, placeholder, spriteSource);
      } else {
        app.loadStoredProductImage(product, image, placeholder);
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
