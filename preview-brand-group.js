"use strict";

(() => {
  const app = window.CatalogApp;
  if (!app) return;

  const brandGroups = [
    {
      brands: new Set(["居居加", "居美媞", "妙妙熊", "鉅瑋"]),
      label: "居居加/居美媞/妙妙熊/鉅瑋"
    },
    {
      brands: new Set(["可麗舒", "可立雅"]),
      label: "可麗舒/可立雅"
    }
  ];

  const fixedBrandOrder = [
    "舒潔",
    "可麗舒/可立雅",
    "春風",
    "蒲公英",
    "原萃",
    "靠得住",
    "居居加/居美媞/妙妙熊/鉅瑋",
    "好奇",
    "白蘭",
    "南僑",
    "鱷魚/必安住",
    "優品",
    "清檜",
    "優生"
  ];
  const fixedBrandRank = new Map(fixedBrandOrder.map((brand, index) => [brand, index]));

  const normalize = (value) => String(value || "").replace(/\s+/g, "").toLowerCase();
  const containsAny = (text, keywords) => keywords.some((keyword) => text.includes(keyword));

  const paperKeywords = [
    "抽取衛生紙", "抽衛", "平板衛生紙", "平版衛生紙", "廚房紙巾", "廚紙",
    "捲筒衛生紙", "捲衛", "擦手紙", "袖珍面紙", "旅行包", "面紙", "衛生紙"
  ];
  const beautyKeywords = ["洗臉巾", "卸妝棉", "潔顏巾", "旅行毛巾", "旅行浴巾", "毛巾", "浴巾"];

  const workflowGroup = (product) => {
    const brand = normalize(product.brand);
    const category = normalize(product.category);
    const name = normalize(product.name);
    const text = `${brand} ${category} ${name}`;

    if (containsAny(text, paperKeywords)) return 1;
    if (brand.includes("靠得住") || brand.includes("護得住")) return 2;
    if (containsAny(text, beautyKeywords) || brand.includes("居居加") || brand.includes("居美媞") || brand.includes("妙妙熊") || brand.includes("鉅瑋")) return 3;
    if (brand.includes("好奇")) return 4;
    if (brand.includes("白蘭") || name.includes("熊寶貝") || name.includes("麗仕")) return 5;
    if (brand.includes("南僑")) return 6;
    if (brand.includes("鱷魚") || brand.includes("必安住") || name.includes("紅恐龍") || name.includes("蟑愛呷") || name.includes("蟻愛呷") || name.includes("家能淨")) return 7;
    if (brand.includes("優品")) return 8;
    if (brand.includes("清檜")) return 9;
    if (brand.includes("優生")) return 10;
    return 99;
  };

  const paperTypeRank = (product) => {
    const text = normalize(`${product.category} ${product.name}`);
    if (containsAny(text, ["抽取衛生紙", "抽衛"])) return 1;
    if (containsAny(text, ["平板衛生紙", "平版衛生紙"])) return 2;
    if (containsAny(text, ["廚房紙巾", "廚紙"])) return 3;
    if (containsAny(text, ["捲筒衛生紙", "捲衛"])) return 4;
    if (text.includes("擦手紙")) return 5;
    if (containsAny(text, ["袖珍面紙", "旅行包", "面紙"])) return 6;
    return 9;
  };

  const categoryRank = (product) => {
    const group = workflowGroup(product);
    const text = normalize(`${product.category} ${product.name}`);

    if (group === 1) return paperTypeRank(product);
    if (group === 2) {
      if (text.includes("衛生棉") || containsAny(text, ["日用", "夜用", "草本", "茶樹", "超薄"])) return 1;
      if (text.includes("護墊")) return 2;
      if (containsAny(text, ["好眠褲", "懶人褲", "絲棉褲", "褲型"])) return 3;
      if (text.includes("棉條")) return 4;
      return 5;
    }
    if (group === 5) {
      if (text.includes("洗衣粉")) return 1;
      if (text.includes("洗衣精")) return 2;
      if (text.includes("護衣精")) return 3;
      if (text.includes("漂白")) return 4;
      if (text.includes("洗碗精")) return 5;
      if (text.includes("香皂")) return 6;
      return 9;
    }
    if (group === 6) {
      if (text.includes("肥皂")) return 1;
      if (text.includes("洗衣液體皂")) return 2;
      return 9;
    }
    if (group === 7 || group === 8 || group === 9) {
      if (containsAny(text, ["殺蟲", "蟑螂", "螞蟻", "白蟻", "除蟲"])) return 1;
      if (containsAny(text, ["蚊香", "防蚊", "驅蚊", "電蚊香"])) return 2;
      if (containsAny(text, ["捕鼠", "鼠"])) return 3;
      if (containsAny(text, ["除霉", "防霉", "清潔劑", "清潔"])) return 4;
      return 9;
    }
    return 9;
  };

  const brandRank = (brand) => fixedBrandRank.has(brand) ? fixedBrandRank.get(brand) : 999;

  const productComparator = (a, b) => {
    const groupDifference = workflowGroup(a) - workflowGroup(b);
    if (groupDifference) return groupDifference;

    const brandDifference = brandRank(a.brand) - brandRank(b.brand);
    if (brandDifference) return brandDifference;

    const categoryDifference = categoryRank(a) - categoryRank(b);
    if (categoryDifference) return categoryDifference;

    const nameDifference = String(a.name).localeCompare(String(b.name), "zh-Hant", { numeric: true });
    if (nameDifference) return nameDifference;

    return String(a.spec).localeCompare(String(b.spec), "zh-Hant", { numeric: true });
  };

  const refillFilters = () => {
    const brands = [...new Set(app.state.products.map((product) => product.brand))]
      .sort((a, b) => {
        const rankDifference = brandRank(a) - brandRank(b);
        return rankDifference || a.localeCompare(b, "zh-Hant");
      });

    const categoryOrder = new Map();
    app.state.products.forEach((product, index) => {
      if (!categoryOrder.has(product.category)) categoryOrder.set(product.category, index);
    });
    const categories = [...new Set(app.state.products.map((product) => product.category))]
      .sort((a, b) => (categoryOrder.get(a) - categoryOrder.get(b)) || a.localeCompare(b, "zh-Hant"));

    [
      [app.el.brand, brands],
      [app.el.category, categories]
    ].forEach(([select, values]) => {
      while (select.options.length > 1) select.remove(1);
      values.forEach((value) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    });
  };

  const originalInit = app.init;

  app.init = async () => {
    await originalInit();

    app.state.products = app.state.products
      .map((product) => {
        const group = brandGroups.find(({ brands }) => brands.has(product.brand));
        return group ? { ...product, brand: group.label } : product;
      })
      .sort(productComparator);

    refillFilters();
    app.applyFilters();
    app.updateCartUI();
  };
})();
