"use strict";

window.CatalogApp = {
  keys: {
    cart: "productCatalogInquiry.cart.v1",
    customer: "productCatalogInquiry.customer.v1",
    view: "productCatalogInquiry.catalogView.v1"
  },
  state: {
    products: [],
    filtered: [],
    cart: {},
    filters: { search: "", brand: "", websiteCategory: "", websiteSubcategory: "" },
    view: { filterMode: "brand", scrollY: 0, activeProductId: "" },
    sprite: { map: {}, image: null, cache: new Map() }
  },
  el: {},
  toastTimer: null,
  lastFocus: null
};

(() => {
  const app = window.CatalogApp;
  const BUILD_VERSION = "20260731-1";
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
  const WEBSITE_CATEGORY_MAP = {
    "抽取衛生紙": ["紙品", "抽取衛生紙"],
    "捲筒衛生紙": ["紙品", "捲筒衛生紙"],
    "平版衛生紙": ["紙品", "平版衛生紙"],
    "盒裝面紙": ["紙品", "盒裝面紙"],
    "袖珍面紙": ["紙品", "袖珍面紙"],
    "旅行包面紙": ["紙品", "旅行包面紙"],
    "隨行紙巾": ["紙品", "隨行紙巾"],
    "摺疊紙巾": ["紙品", "摺疊紙巾"],
    "廚房紙巾": ["紙品", "廚房紙巾"],
    "擦手紙": ["紙品", "擦手紙"],
    "家用紙": ["紙品", "家用紙"],
    "面紙": ["紙品", "面紙"],
    "濕巾": ["濕巾與個人衛生", "濕巾"],
    "濕紙巾": ["濕巾與個人衛生", "濕紙巾"],
    "濕式衛生紙": ["濕巾與個人衛生", "濕式衛生紙"],
    "清潔濕巾": ["濕巾與個人衛生", "清潔濕巾"],
    "化妝棉": ["濕巾與個人衛生", "化妝棉"],
    "洗臉巾": ["濕巾與個人衛生", "洗臉巾"],
    "潔顏巾": ["濕巾與個人衛生", "潔顏巾"],
    "口罩": ["濕巾與個人衛生", "口罩"],
    "酒精／消毒用品": ["濕巾與個人衛生", "酒精／消毒用品"],
    "衛生棉": ["濕巾與個人衛生", "衛生棉"],
    "護墊": ["濕巾與個人衛生", "護墊"],
    "生理褲": ["濕巾與個人衛生", "生理褲"],
    "衛生棉條": ["濕巾與個人衛生", "衛生棉條"],
    "洗衣清潔": ["洗衣用品", "洗衣清潔"],
    "家庭清潔": ["居家清潔", "家庭清潔"],
    "浴廁清潔": ["居家清潔", "浴廁清潔"],
    "廚房清潔": ["居家清潔", "廚房清潔"],
    "清潔布／擦拭布": ["居家清潔", "清潔布／擦拭布"],
    "清潔用品": ["居家清潔", "清潔用品"],
    "清潔袋": ["居家清潔", "清潔袋"],
    "家具保養": ["居家清潔", "家具保養"],
    "香皂洗手": ["洗手與沐浴", "香皂洗手"],
    "洗髮沐浴": ["洗手與沐浴", "洗髮沐浴"],
    "母嬰用品": ["母嬰用品", "母嬰用品"],
    "產婦用品": ["母嬰用品", "產婦用品"],
    "吸水用品": ["成人照護", "吸水用品"],
    "防蚊驅蟲": ["防蚊與除蟲", "防蚊驅蟲"],
    "居家除蟲": ["防蚊與除蟲", "居家除蟲"],
    "園藝驅蟲": ["防蚊與除蟲", "園藝驅蟲"],
    "防霉抑菌": ["防蚊與除蟲", "防霉抑菌"],
    "捕鼠用品": ["防蚊與除蟲", "捕鼠用品"],
    "寵物用品": ["寵物用品", "寵物用品"],
    "瓦斯用品": ["居家生活與五金", "瓦斯用品"],
    "瓦斯爐具": ["居家生活與五金", "瓦斯爐具"],
    "打火機": ["居家生活與五金", "打火機"],
    "點火槍": ["居家生活與五金", "點火槍"],
    "毛巾／浴巾": ["居家生活與五金", "毛巾／浴巾"],
    "免洗餐具": ["居家生活與五金", "免洗餐具"],
    "烤肉用品": ["居家生活與五金", "烤肉用品"],
    "保鮮袋": ["居家生活與五金", "保鮮袋"]
  };
  const WEBSITE_CATEGORY_ORDER = [
    "紙品",
    "濕巾與個人衛生",
    "衛生棉",
    "洗衣用品",
    "居家清潔",
    "洗手與沐浴",
    "母嬰用品",
    "成人照護",
    "防蚊與除蟲",
    "寵物用品",
    "居家生活與五金",
    "食品與其他"
  ];
  const BRAND_GROUP_ORDER = [
    ["舒潔"],
    ["可麗舒", "可立雅"],
    ["春風"],
    ["蒲公英"],
    ["原萃"],
    ["靠得住", "護得住"],
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
    ["金字塔"],
    ["汪汪寶貝"],
    ["唐鑫"]
  ];
  const BRAND_GROUP_LABELS = new Map([
    ["靠得住|護得住", "靠得住／護得住"]
  ]);
  const BRAND_DISPLAY_ALIASES = new Map([
    ["六禾", "金字塔"]
  ]);

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

  app.restoreCatalogViewState = () => {
    try {
      const stored = JSON.parse(sessionStorage.getItem(app.keys.view) || "null");
      if (!stored || typeof stored !== "object") return;
      app.state.filters = {
        search: String(stored.filters?.search || ""),
        brand: String(stored.filters?.brand || ""),
        websiteCategory: String(stored.filters?.websiteCategory || ""),
        websiteSubcategory: String(stored.filters?.websiteSubcategory || "")
      };
      app.state.view.filterMode = stored.filterMode === "category" ? "category" : "brand";
      app.state.view.scrollY = Number.isFinite(Number(stored.scrollY)) ? Number(stored.scrollY) : 0;
    } catch (error) {
      console.warn("無法還原型錄瀏覽狀態", error);
    }
  };

  app.persistCatalogViewState = () => {
    try {
      sessionStorage.setItem(app.keys.view, JSON.stringify({
        filters: app.state.filters,
        filterMode: app.state.view.filterMode,
        scrollY: app.state.view.scrollY
      }));
    } catch (error) {
      console.warn("無法保存型錄瀏覽狀態", error);
    }
  };

  app.getProductIdFromHash = () => {
    const match = window.location.hash.match(/^#product=(.+)$/);
    return match ? decodeURIComponent(match[1]) : "";
  };

  app.prepareCatalogHistory = () => {
    app.initialDetailId = app.getProductIdFromHash();
    const baseUrl = `${window.location.pathname}${window.location.search}`;
    window.history.replaceState({ catalogBase: true }, "", baseUrl);
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

  app.getDisplayBrand = (brand) => BRAND_DISPLAY_ALIASES.get(brand) || brand;

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

  app.brandGroupLabel = (group) => BRAND_GROUP_LABELS.get(group.join("|")) || "";

  app.getBrandFilterOptions = (brands) => {
    const available = new Set(brands);
    const groupedBrands = new Set();
    const groupLabels = [];

    BRAND_GROUP_ORDER.forEach((group) => {
      const label = app.brandGroupLabel(group);
      const members = group.filter((brand) => available.has(brand));
      if (!label || members.length === 0) return;
      groupLabels.push(label);
      members.forEach((brand) => groupedBrands.add(brand));
    });

    return app.sortBrands([
      ...brands.filter((brand) => !groupedBrands.has(brand)),
      ...groupLabels
    ]);
  };

  app.getBrandFilterMembers = (value) => {
    const group = BRAND_GROUP_ORDER.find((members) => app.brandGroupLabel(members) === value);
    return group || [value];
  };

  app.getWebsiteClassification = (product) => {
    const mapped = WEBSITE_CATEGORY_MAP[product.category];
    return {
      websiteCategory: mapped ? mapped[0] : "食品與其他",
      websiteSubcategory: mapped ? mapped[1] : "其他"
    };
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
      websiteCategory: document.querySelector("[data-website-category-filter]"),
      websiteSubcategory: document.querySelector("[data-website-subcategory-filter]"),
      // 保留既有 addon 對 category 篩選器的存取，相容於新細分類選單。
      category: document.querySelector("[data-website-subcategory-filter]"),
      brandChips: document.querySelector("[data-brand-chips]"),
      categoryChips: document.querySelector("[data-category-chips]"),
      subcategoryChips: document.querySelector("[data-subcategory-chips]"),
      filterModeButtons: document.querySelectorAll("[data-filter-mode]"),
      filterPanels: document.querySelectorAll("[data-filter-panel]"),
      detail: document.querySelector("[data-product-detail]"),
      detailImage: document.querySelector("[data-detail-image]"),
      detailImagePlaceholder: document.querySelector("[data-detail-image-placeholder]"),
      detailBrand: document.querySelector("[data-detail-brand]"),
      detailCategory: document.querySelector("[data-detail-category]"),
      detailName: document.querySelector("[data-detail-name]"),
      detailSpec: document.querySelector("[data-detail-spec]"),
      detailCasePack: document.querySelector("[data-detail-case-pack]"),
      detailFeatures: document.querySelector("[data-detail-features]"),
      detailFeatureList: document.querySelector("[data-detail-feature-list]"),
      detailMore: document.querySelector("[data-detail-more]"),
      detailBarcode: document.querySelector("[data-detail-barcode]"),
      detailSku: document.querySelector("[data-detail-sku]"),
      detailAdd: document.querySelector("[data-detail-add]"),
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
    app.restoreCatalogViewState();
    app.prepareCatalogHistory();
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
          sourceBrand: product.sourceBrand || product.brand,
          brand: app.getDisplayBrand(product.brand),
          name: PRODUCT_NAME_OVERRIDES[product.id] || product.name,
          ...app.getWebsiteClassification(product)
        }));
      app.fillFilters();
      app.applyFilters();
      app.updateCartUI();
      if (app.initialDetailId && app.getProduct(app.initialDetailId)) {
        app.openProductDetail(app.initialDetailId, { pushHistory: true, preserveScroll: false });
      } else if (app.state.view.scrollY > 0) {
        requestAnimationFrame(() => window.scrollTo({ top: app.state.view.scrollY, behavior: "auto" }));
      }
    } catch (error) {
      console.error(error);
      app.showLoadError();
    }
  };

  app.bindCatalogEvents = () => {
    app.el.search.addEventListener("input", (event) => {
      app.state.filters.search = event.target.value;
      app.applyFilters();
    });
    app.el.brand.addEventListener("change", (event) => {
      app.state.filters.brand = event.target.value;
      app.fillCategoryFilter();
      app.applyFilters();
    });
    app.el.websiteCategory.addEventListener("change", (event) => {
      app.state.filters.websiteCategory = event.target.value;
      app.state.filters.websiteSubcategory = "";
      app.fillSubcategoryFilter();
      app.applyFilters();
    });
    app.el.websiteSubcategory.addEventListener("change", (event) => {
      app.state.filters.websiteSubcategory = event.target.value;
      app.applyFilters();
    });
    document.querySelector("[data-focus-search]")?.addEventListener("click", () => {
      app.el.search.scrollIntoView({ block: "center", behavior: "smooth" });
      app.el.search.focus({ preventScroll: true });
    });
    app.el.filterModeButtons.forEach((button) => {
      button.addEventListener("click", () => app.setFilterMode(button.dataset.filterMode));
    });
    app.el.brandChips?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-filter-value]");
      if (!button) return;
      app.state.filters.brand = button.dataset.filterValue || "";
      app.fillCategoryFilter();
      app.applyFilters();
    });
    app.el.categoryChips?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-filter-value]");
      if (!button) return;
      app.state.filters.websiteCategory = button.dataset.filterValue || "";
      app.state.filters.websiteSubcategory = "";
      app.fillSubcategoryFilter();
      app.applyFilters();
    });
    app.el.subcategoryChips?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-filter-value]");
      if (!button) return;
      app.state.filters.websiteSubcategory = button.dataset.filterValue || "";
      app.applyFilters();
    });
    document.querySelector("[data-close-product-detail]")?.addEventListener("click", () => app.closeProductDetail());
    app.el.detailAdd?.addEventListener("click", () => {
      const productId = app.el.detailAdd.dataset.productId;
      if (!productId) return;
      app.addToCart(productId);
      app.updateAddButton(app.el.detailAdd, productId);
    });
    window.addEventListener("popstate", (event) => {
      const productId = event.state?.catalogProductId || "";
      if (productId && app.getProduct(productId)) {
        app.openProductDetail(productId, { pushHistory: false, preserveScroll: false });
      } else {
        app.hideProductDetail({ restoreScroll: true });
      }
    });
    window.addEventListener("pagehide", () => {
      if (!document.body.classList.contains("detail-open")) app.state.view.scrollY = window.scrollY;
      app.persistCatalogViewState();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && document.body.classList.contains("detail-open") && !app.el.drawer.classList.contains("open")) {
        app.closeProductDetail();
      }
    });
    document.querySelectorAll("[data-reset-filters], [data-empty-reset]").forEach((button) => {
      button.addEventListener("click", app.resetFilters);
    });
  };

  app.fillFilters = () => {
    app.state.products = app.state.products.map((product) => (
      product.websiteCategory && product.websiteSubcategory
        ? product
        : { ...product, ...app.getWebsiteClassification(product) }
    ));
    const unique = (key) => {
      const values = [...new Set(app.state.products.map((p) => p[key]).filter(Boolean))];
      return key === "brand" ? app.sortBrands(values) : values.sort((a, b) => a.localeCompare(b, "zh-Hant"));
    };
    const brandOptions = app.getBrandFilterOptions(unique("brand"));
    app.replaceSelectOptions(app.el.brand, "全部品牌", brandOptions);
    if (app.state.filters.brand && !brandOptions.includes(app.state.filters.brand)) {
      app.state.filters.brand = "";
      app.state.filters.websiteCategory = "";
      app.state.filters.websiteSubcategory = "";
    }
    app.fillCategoryFilter();
    app.syncFilterControls();
    app.renderFilterChips();
  };

  app.replaceSelectOptions = (select, placeholderText, values) => {
    const fragment = document.createDocumentFragment();
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = placeholderText;
    fragment.appendChild(placeholder);
    values.forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      fragment.appendChild(option);
    });
    select.replaceChildren(fragment);
  };

  app.getProductsForSelectedBrand = () => {
    const selectedBrand = app.state.filters.brand;
    if (!selectedBrand) return app.state.products;
    const members = new Set(app.getBrandFilterMembers(selectedBrand));
    return app.state.products.filter((product) => members.has(product.brand));
  };

  app.sortWebsiteCategories = (values) => values.sort((a, b) => {
    const aIndex = WEBSITE_CATEGORY_ORDER.indexOf(a);
    const bIndex = WEBSITE_CATEGORY_ORDER.indexOf(b);
    const normalizedA = aIndex === -1 ? WEBSITE_CATEGORY_ORDER.length : aIndex;
    const normalizedB = bIndex === -1 ? WEBSITE_CATEGORY_ORDER.length : bIndex;
    return normalizedA - normalizedB || a.localeCompare(b, "zh-Hant");
  });

  app.fillCategoryFilter = () => {
    const values = app.sortWebsiteCategories([...new Set(app.getProductsForSelectedBrand()
      .map((product) => product.websiteCategory)
      .filter(Boolean))]);
    if (app.state.filters.websiteCategory && !values.includes(app.state.filters.websiteCategory)) {
      app.state.filters.websiteCategory = "";
      app.state.filters.websiteSubcategory = "";
    }
    app.replaceSelectOptions(app.el.websiteCategory, "全部大分類", values);
    app.fillSubcategoryFilter();
  };

  app.fillSubcategoryFilter = () => {
    const selectedCategory = app.state.filters.websiteCategory;
    const values = [...new Set(app.getProductsForSelectedBrand()
      .filter((product) => !selectedCategory || product.websiteCategory === selectedCategory)
      .map((product) => product.websiteSubcategory)
      .filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, "zh-Hant"));
    if (app.state.filters.websiteSubcategory && !values.includes(app.state.filters.websiteSubcategory)) {
      app.state.filters.websiteSubcategory = "";
    }
    app.replaceSelectOptions(app.el.websiteSubcategory, "全部細分類", values);
    app.el.websiteSubcategory.value = app.state.filters.websiteSubcategory;
  };

  app.setFilterMode = (mode) => {
    app.state.view.filterMode = mode === "category" ? "category" : "brand";
    app.el.filterModeButtons.forEach((button) => {
      const active = button.dataset.filterMode === app.state.view.filterMode;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", String(active));
    });
    app.el.filterPanels.forEach((panel) => {
      panel.hidden = panel.dataset.filterPanel !== app.state.view.filterMode;
    });
    app.persistCatalogViewState();
  };

  app.createFilterChip = (value, label, selected) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "filter-chip";
    button.dataset.filterValue = value;
    button.textContent = label;
    button.classList.toggle("is-active", value === selected);
    button.setAttribute("aria-pressed", String(value === selected));
    return button;
  };

  app.renderFilterChips = () => {
    const renderFromSelect = (select, container, selected) => {
      if (!select || !container) return;
      const fragment = document.createDocumentFragment();
      [...select.options].forEach((option) => {
        fragment.appendChild(app.createFilterChip(option.value, option.textContent, selected));
      });
      container.replaceChildren(fragment);
    };
    renderFromSelect(app.el.brand, app.el.brandChips, app.state.filters.brand);
    renderFromSelect(app.el.websiteCategory, app.el.categoryChips, app.state.filters.websiteCategory);
    renderFromSelect(app.el.websiteSubcategory, app.el.subcategoryChips, app.state.filters.websiteSubcategory);
    if (app.el.subcategoryChips) app.el.subcategoryChips.hidden = !app.state.filters.websiteCategory;
    app.setFilterMode(app.state.view.filterMode);
  };

  app.syncFilterControls = () => {
    app.el.search.value = app.state.filters.search;
    [
      [app.el.brand, app.state.filters.brand],
      [app.el.websiteCategory, app.state.filters.websiteCategory],
      [app.el.websiteSubcategory, app.state.filters.websiteSubcategory]
    ].forEach(([select, value]) => {
      if (!select) return;
      select.value = [...select.options].some((option) => option.value === value) ? value : "";
    });
  };

  app.applyFilters = () => {
    const { search, brand, websiteCategory, websiteSubcategory } = app.state.filters;
    const normalizedSearch = app.normalizeText(search);
    const selectedBrands = new Set(app.getBrandFilterMembers(brand));
    app.state.filtered = app.state.products.filter((product) => {
      const haystack = app.normalizeText([
        product.id,
        product.sku,
        product.barcode,
        product.brand,
        product.sourceBrand,
        product.category,
        product.websiteCategory,
        product.websiteSubcategory,
        product.name,
        product.spec
      ].join(" "));
      return (!normalizedSearch || haystack.includes(normalizedSearch)) &&
        (!brand || selectedBrands.has(product.brand)) &&
        (!websiteCategory || product.websiteCategory === websiteCategory) &&
        (!websiteSubcategory || product.websiteSubcategory === websiteSubcategory);
    });
    app.el.loading.hidden = true;
    app.el.empty.hidden = app.state.filtered.length > 0;
    app.el.resultCount.textContent = String(app.state.filtered.length);
    app.renderProducts();
    app.syncFilterControls();
    app.renderFilterChips();
    app.persistCatalogViewState();
  };

  app.showProductImage = (product, image, placeholder, source) => {
    image.onerror = null;
    image.src = source;
    image.alt = `${product.name}商品圖片`;
    image.hidden = false;
    placeholder.hidden = true;
    image.onerror = () => {
      image.hidden = true;
      placeholder.hidden = false;
    };
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

      card.dataset.productId = product.id;
      card.setAttribute("aria-label", `查看 ${product.name}`);
      card.querySelector(".product-name").textContent = product.name;
      card.querySelector(".product-spec").textContent = product.spec;

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

      card.addEventListener("click", () => app.openProductDetail(product.id, { trigger: card }));
      card.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        app.openProductDetail(product.id, { trigger: card });
      });
      fragment.appendChild(card);
    });
    app.el.grid.replaceChildren(fragment);
  };

  app.getProductFeatures = (product) => {
    const value = product.features ?? product.productFeatures ?? product.feature ?? product.description ?? "";
    if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
    const text = String(value).trim();
    return text ? [text] : [];
  };

  app.renderProductImage = (product, image, placeholder) => {
    image.hidden = true;
    image.removeAttribute("src");
    placeholder.hidden = false;
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
  };

  app.renderProductDetail = (product) => {
    app.el.detailBrand.textContent = product.brand;
    app.el.detailCategory.textContent = product.category;
    app.el.detailName.textContent = product.name;
    app.el.detailSpec.textContent = product.spec || "待確認";
    app.el.detailCasePack.textContent = product.casePack ? String(product.casePack) : "待確認";
    app.el.detailBarcode.textContent = product.barcode || "未提供";
    app.el.detailSku.textContent = product.sku || product.id;
    app.el.detailMore.open = false;
    const features = app.getProductFeatures(product);
    app.el.detailFeatures.hidden = features.length === 0;
    app.el.detailFeatureList.replaceChildren();
    if (features.length === 1) {
      const paragraph = document.createElement("p");
      paragraph.textContent = features[0];
      app.el.detailFeatureList.appendChild(paragraph);
    } else if (features.length > 1) {
      const list = document.createElement("ul");
      features.forEach((feature) => {
        const item = document.createElement("li");
        item.textContent = feature;
        list.appendChild(item);
      });
      app.el.detailFeatureList.appendChild(list);
    }
    app.el.detailAdd.dataset.productId = product.id;
    app.updateAddButton(app.el.detailAdd, product.id);
    app.renderProductImage(product, app.el.detailImage, app.el.detailImagePlaceholder);
  };

  app.openProductDetail = (id, options = {}) => {
    const product = app.getProduct(id);
    if (!product) return;
    const { pushHistory = true, preserveScroll = true, trigger = null } = options;
    if (preserveScroll && !document.body.classList.contains("detail-open")) {
      app.state.view.scrollY = window.scrollY;
      app.persistCatalogViewState();
    }
    app.lastProductTrigger = trigger || app.lastProductTrigger;
    app.state.view.activeProductId = product.id;
    app.renderProductDetail(product);
    app.el.detail.hidden = false;
    app.el.detail.setAttribute("aria-hidden", "false");
    app.el.detail.scrollTop = 0;
    document.body.classList.add("detail-open");
    if (pushHistory) {
      const url = new URL(window.location.href);
      url.hash = `product=${encodeURIComponent(product.id)}`;
      window.history.pushState({ catalogProductId: product.id }, "", url);
    }
    document.querySelector("[data-close-product-detail]")?.focus();
  };

  app.hideProductDetail = ({ restoreScroll = true } = {}) => {
    if (!app.el.detail || app.el.detail.hidden) return;
    app.el.detail.hidden = true;
    app.el.detail.setAttribute("aria-hidden", "true");
    document.body.classList.remove("detail-open");
    app.state.view.activeProductId = "";
    if (restoreScroll) requestAnimationFrame(() => window.scrollTo({ top: app.state.view.scrollY, behavior: "auto" }));
    app.lastProductTrigger?.focus?.({ preventScroll: true });
  };

  app.closeProductDetail = () => {
    if (window.history.state?.catalogProductId) {
      window.history.back();
    } else {
      app.hideProductDetail({ restoreScroll: true });
    }
  };

  app.resetFilters = () => {
    app.state.filters = { search: "", brand: "", websiteCategory: "", websiteSubcategory: "" };
    app.el.search.value = "";
    app.el.brand.value = "";
    app.fillCategoryFilter();
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
