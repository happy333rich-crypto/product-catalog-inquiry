"use strict";

(() => {
  const app = window.CatalogApp;

  app.bindInquiryEvents = () => {
    document.querySelector("[data-generate-inquiry]").addEventListener("click", app.generateInquiry);
    document.querySelector("[data-copy-inquiry]").addEventListener("click", app.copyInquiry);
    app.el.form.addEventListener("input", () => {
      app.clearErrors();
      app.persistCustomer();
      app.el.generatedSection.hidden = true;
    });
  };

  app.customerData = () => {
    const data = new FormData(app.el.form);
    return {
      storeName: String(data.get("storeName") || "").trim(),
      contactName: String(data.get("contactName") || "").trim(),
      phone: String(data.get("phone") || "").trim(),
      area: String(data.get("area") || "").trim(),
      note: String(data.get("note") || "").trim()
    };
  };

  app.persistCustomer = () => app.saveJSON(app.keys.customer, app.customerData());

  app.restoreCustomer = () => {
    const customer = app.loadJSON(app.keys.customer, {});
    Object.entries(customer).forEach(([name, value]) => {
      const field = app.el.form.elements[name];
      if (field) field.value = value;
    });
  };

  app.clearErrors = () => {
    app.el.form.querySelectorAll(".has-error").forEach((field) => field.classList.remove("has-error"));
    app.el.form.querySelectorAll(".field-error").forEach((node) => { node.textContent = ""; });
  };

  app.validateCustomer = (customer) => {
    app.clearErrors();
    const messages = {
      storeName: "請填寫店家名稱",
      contactName: "請填寫聯絡人",
      phone: "請填寫聯絡電話"
    };
    let valid = true;
    Object.entries(messages).forEach(([name, message]) => {
      if (customer[name]) return;
      valid = false;
      const field = app.el.form.elements[name];
      field.classList.add("has-error");
      app.el.form.querySelector(`[data-error-for="${name}"]`).textContent = message;
    });
    return valid;
  };

  app.generateInquiry = () => {
    const entries = app.getCartEntries();
    if (!entries.length) return app.showToast("請先加入至少一項商品");

    const customer = app.customerData();
    if (!app.validateCustomer(customer)) {
      app.showToast("請先填完店家名稱、聯絡人與電話");
      app.el.form.querySelector(".has-error")?.focus();
      return;
    }

    const lines = entries.map(({ product, quantity }, index) =>
      `${index + 1}. ${product.name}｜${product.spec}｜數量 ${quantity} 箱`
    );
    app.el.generatedText.value = [
      "【產品詢價】",
      `店家名稱：${customer.storeName}`,
      `聯絡人：${customer.contactName}`,
      `聯絡電話：${customer.phone}`,
      `地區：${customer.area || "未填寫"}`,
      "",
      "詢價商品：",
      ...lines,
      "",
      `備註：${customer.note || "無"}`
    ].join("\n");

    app.el.generatedSection.hidden = false;
    app.el.generatedSection.scrollIntoView({ behavior: "smooth", block: "start" });
    app.persistCustomer();
    app.showToast("詢價內容已產生");
  };

  app.copyInquiry = async () => {
    const text = app.el.generatedText.value;
    if (!text) return app.showToast("請先產生詢價內容");
    try {
      await navigator.clipboard.writeText(text);
      app.showToast("已複製，可以貼到 LINE");
    } catch (error) {
      console.error(error);
      app.el.generatedText.focus();
      app.el.generatedText.select();
      app.showToast("無法自動複製，文字已全選，請長按複製");
    }
  };

  const originalInit = app.init;
  app.init = async () => {
    await originalInit();

    try {
      const response = await fetch("wet-wipes.json?v=20260706-3", { cache: "no-store" });
      if (!response.ok) throw new Error(`濕巾資料讀取失敗（${response.status}）`);

      const additions = await response.json();
      if (!Array.isArray(additions)) throw new Error("wet-wipes.json 格式不正確");

      const merged = new Map(app.state.products.map((product) => [product.id, product]));
      additions
        .filter((product) => product && product.active === true && product.id)
        .forEach((product) => merged.set(product.id, product));

      app.state.products = [...merged.values()];

      [app.el.brand, app.el.category].forEach((select) => {
        while (select.options.length > 1) select.remove(1);
      });

      app.fillFilters();
      app.applyFilters();
      app.updateCartUI();
    } catch (error) {
      console.error(error);
      app.showToast("濕巾資料暫時無法載入");
    }
  };

  app.init();
})();
