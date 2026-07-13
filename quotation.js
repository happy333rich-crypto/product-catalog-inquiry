"use strict";

(() => {
  const state = {
    products: [],
    filtered: [],
    quoteItems: JSON.parse(localStorage.getItem("quotation.items.v1") || "[]"),
    info: JSON.parse(localStorage.getItem("quotation.info.v1") || "{}")
  };

  const $ = (selector) => document.querySelector(selector);
  const moneyValue = (value) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
  };
  const editablePriceValue = (value) => {
    if (value === "" || value === null || value === undefined) return null;
    const numeric = Number(value);
    return Number.isFinite(numeric) && numeric >= 0 ? numeric : null;
  };
  const moneyLabel = (value) => {
    const numeric = moneyValue(value);
    return numeric === null ? "待確認" : `$${numeric}`;
  };
  const editableMoneyLabel = (value) => {
    const numeric = editablePriceValue(value);
    return numeric === null ? "待確認" : `$${numeric}`;
  };
  const clampQuantity = (value) => {
    const numeric = Number.parseInt(value, 10);
    return Number.isFinite(numeric) ? Math.max(1, Math.min(9999, numeric)) : 1;
  };
  const normalizeText = (value) => String(value ?? "").normalize("NFKC").replace(/\s+/g, "").toLowerCase();
  const save = () => {
    localStorage.setItem("quotation.items.v1", JSON.stringify(state.quoteItems));
    localStorage.setItem("quotation.info.v1", JSON.stringify(readInfo()));
  };
  const readInfo = () => ({
    customerName: $("#customerName").value.trim(),
    quoteDate: $("#quoteDate").value,
    salesName: $("#salesName").value.trim(),
    note: $("#note").value.trim()
  });

  const hydrateInfo = () => {
    $("#customerName").value = state.info.customerName || "";
    $("#quoteDate").value = state.info.quoteDate || new Date().toISOString().slice(0, 10);
    $("#salesName").value = state.info.salesName || "";
    $("#note").value = state.info.note || "";
  };

  const productById = (id) => state.products.find((product) => product.id === id);
  const getQuoteProduct = (item) => productById(item.productId) || item.snapshot;

  const addItem = (product) => {
    const existing = state.quoteItems.find((item) => item.productId === product.id);
    if (existing) {
      existing.quantity = clampQuantity(existing.quantity + 1);
    } else {
      state.quoteItems.push({
        productId: product.id,
        quantity: 1,
        unitPrice: moneyValue(product.taxPrice),
        snapshot: product
      });
    }
    save();
    renderQuote();
  };

  const removeItem = (productId) => {
    state.quoteItems = state.quoteItems.filter((item) => item.productId !== productId);
    save();
    renderQuote();
  };

  const filterProducts = () => {
    const keyword = normalizeText($("#quoteSearch").value);
    state.filtered = state.products.filter((product) => {
      const haystack = normalizeText([product.sku, product.id, product.name, product.brand, product.category, product.spec, product.barcode].join(" "));
      return !keyword || haystack.includes(keyword);
    }).slice(0, 40);
    renderResults();
  };

  const renderResults = () => {
    const list = $("#searchResults");
    list.replaceChildren();
    state.filtered.forEach((product) => {
      const row = document.createElement("button");
      row.type = "button";
      row.className = "result-row";
      row.innerHTML = `<strong>${product.sku || product.id}</strong><span>${product.brand}｜${product.name}</span><small>${product.spec || ""}｜單價 ${moneyLabel(product.taxPrice)}</small>`;
      row.addEventListener("click", () => addItem(product));
      list.appendChild(row);
    });
  };

  const updateQuoteTotals = () => {
    const tbody = $("#quoteBody");
    let total = 0;
    let hasUnknown = false;

    state.quoteItems.forEach((item) => {
      const quantity = clampQuantity(item.quantity);
      const unitPrice = editablePriceValue(item.unitPrice);
      const subtotal = unitPrice === null ? null : unitPrice * quantity;
      item.quantity = quantity;
      item.unitPrice = unitPrice;

      if (subtotal === null) hasUnknown = true;
      else total += subtotal;

      const row = Array.from(tbody.querySelectorAll("tr[data-product-id]")).find((node) => node.dataset.productId === item.productId);
      if (!row) return;
      row.querySelector("[data-line-subtotal]").textContent = subtotal === null ? "待確認" : `$${subtotal}`;
    });

    $("#quoteTotal").textContent = hasUnknown ? `$${total}（部分品項價格待確認）` : `$${total}`;
  };

  const renderQuote = () => {
    const tbody = $("#quoteBody");
    tbody.replaceChildren();

    state.quoteItems.forEach((item) => {
      const product = getQuoteProduct(item);
      const unitPrice = editablePriceValue(item.unitPrice);
      const quantity = clampQuantity(item.quantity);
      const subtotal = unitPrice === null ? null : unitPrice * quantity;
      item.quantity = quantity;
      item.unitPrice = unitPrice;

      const tr = document.createElement("tr");
      tr.dataset.productId = item.productId;
      tr.innerHTML = `
        <td>${product.sku || product.id}</td>
        <td>${product.name}</td>
        <td>${product.casePack || "待確認"}</td>
        <td><input type="number" min="1" value="${quantity}" data-qty="${item.productId}"></td>
        <td><input type="number" min="0" value="${unitPrice ?? ""}" placeholder="待確認" data-price="${item.productId}"></td>
        <td>${moneyLabel(product.suggestedPrice)}</td>
        <td data-line-subtotal>${subtotal === null ? "待確認" : `$${subtotal}`}</td>
        <td class="no-print"><button type="button" data-remove="${item.productId}">刪除</button></td>
      `;
      tbody.appendChild(tr);
    });

    updateQuoteTotals();

    tbody.querySelectorAll("[data-qty]").forEach((input) => {
      const updateQuantity = () => {
        const item = state.quoteItems.find((entry) => entry.productId === input.dataset.qty);
        if (!item) return;
        item.quantity = clampQuantity(input.value);
        input.value = String(item.quantity);
        save();
        updateQuoteTotals();
      };
      input.addEventListener("input", updateQuantity);
      input.addEventListener("change", updateQuantity);
    });
    tbody.querySelectorAll("[data-price]").forEach((input) => {
      const updatePrice = () => {
        const item = state.quoteItems.find((entry) => entry.productId === input.dataset.price);
        if (!item) return;
        item.unitPrice = editablePriceValue(input.value);
        save();
        updateQuoteTotals();
      };
      input.addEventListener("input", updatePrice);
      input.addEventListener("change", () => {
        updatePrice();
        const item = state.quoteItems.find((entry) => entry.productId === input.dataset.price);
        input.value = item?.unitPrice === null || item?.unitPrice === undefined ? "" : String(item.unitPrice);
      });
    });
    tbody.querySelectorAll("[data-remove]").forEach((button) => {
      button.addEventListener("click", () => removeItem(button.dataset.remove));
    });
  };

  const init = async () => {
    hydrateInfo();
    document.querySelectorAll(".quote-info input, .quote-info textarea").forEach((field) => {
      field.addEventListener("input", save);
    });
    $("#quoteSearch").addEventListener("input", filterProducts);
    $("#printQuote").addEventListener("click", () => window.print());
    $("#clearQuote").addEventListener("click", () => {
      if (!state.quoteItems.length || !window.confirm("確定清空報價商品？")) return;
      state.quoteItems = [];
      save();
      renderQuote();
    });

    const response = await fetch("products.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`商品資料讀取失敗：${response.status}`);
    const products = await response.json();
    state.products = Array.isArray(products) ? products.filter((product) => product && product.active === true) : [];
    state.filtered = state.products.slice(0, 40);
    renderResults();
    renderQuote();
  };

  init().catch((error) => {
    console.error(error);
    $("#searchResults").textContent = "商品資料暫時無法載入，請重新整理。";
  });
})();