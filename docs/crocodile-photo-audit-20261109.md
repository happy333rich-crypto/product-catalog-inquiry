# 鱷魚／中台興型錄缺圖核對 — 2026-11-09

**狀態：研究／修復準備，尚未替換或部署正式網站。**

目標站：https://product-catalog-ui-redesign-preview.pages.dev/
原始碼分支：`feature/catalog-ui-redesign-v1`，起始基準 `f5279a25a9b321886d7be0a80ef6908c12a13807`。
`crocodile-products.json` 共 49 筆，其中 41 筆既有圖片；以下 8 筆 `image: ""` 尚待正確圖。
查過用戶 Google Drive 的「11507-鱷魚必安住全品項商品圖」47 張，這 8 項沒有足以無歧義直接使用的相同型號與包裝照片（不要將「鱷王」錯當「鱷魚」）。

| SKU | 型錄條碼 | 現有品名／規格 | 可用來源或阻礙 | 處置 |
| --- | --- | --- | --- | --- |
| G10270 | 4710312011200 | 鱷魚快速殺螨滅蟑劑／600g | 原廠 `https://www.crocoil.com/product/201/IS60` 為「快速殺蹣滅蟑劑 600ml」，箱入24，首圖 `https://www.crocoil.com/upload/IS60_1140901.jpg`；注意克/毫升差異及是否同一條碼 | 確認實際包裝、條碼、容量後用原廠圖 |
| G10341 | 4710312011347 | 鱷魚水蒸式殺蹣滅蟑劑／25g | 同條碼商品見 `https://www.9u.com.tw/product.asp?pd_type=375`；中台興官方有 `https://www.crocoil.com/product/cockroach/IX025` 的 25g/12 產品頁，但尚未確定是否相同條碼與外盒 | 對照外盒與原廠圖，不能再借用 G10340 的必安住15g |
| G10344 | 4710312011378 | 鱷魚水蒸式殺蟲劑／25g | 小北透過 foodpanda 列此條碼為「鱷魚水蒸式蟻蟑蹣藥 25g」，如 `https://www.foodpanda.com.tw/shop/g794/xiao-bei-bai-huo-jian-xing-dian`；尚未找同條碼原廠商品圖 | 以條碼確認包裝後補，不能用「鱷王」25g |
| G10360 | 4710312030287 | 鱷魚加強殺蟑餌劑／3g×12入 | **重要衝突**：與來源表不同，`https://www.rakuten.com.tw/shop/amart/product/238096/` 及 `https://proliping.com.tw/product/鱷魚無蟑道殺蟑餌劑3g-366.html` 列相同條碼為 **8入**；小北 foodpanda 亦列8入 | **暫停補圖與規格修改**，先確認內部報價單 / ERP、實體外盒及 barcode 是否曾改版 |
| G10372 | 4710312160021 | 蟻愛呷除蟻特攻／2入 | 原廠 `https://www.crocoil.com/product/167/APA021` 為 3g×2入／箱12；首圖 `https://www.crocoil.com/upload/APA021_01.jpg` | 核對外盒及條碼後可用原廠圖 |
| G10400 | 4710312012481 | 鱷魚除蟲菊水性殺蟲噴霧／300ml | 原廠 `https://www.crocoil.com/product/insecticide/CSND3001` 名稱「天然除蟲菊殺蟲噴霧」300ml／箱12；首圖 `https://www.crocoil.com/upload/CSND3001_1140901.jpg` | 檢查「水性」是否同 SKU／同條碼，再補 |
| G10401 | 4710312012498 | 鱷魚不快害蟲園藝型除蟲噴霧／300ml | 原廠 `https://www.crocoil.com/product/fly/CSWP3001` 「不快害虫除蟲劑」300ml／箱12；首圖 `https://www.crocoil.com/upload/CSWP3001_1140901.jpg`；通路搜尋也見此條碼 | 確認條碼與包裝後可用原廠圖 |
| G10410 | 4710312013013 | 鱷魚廚餘消臭防果蠅噴劑／250ml | 原廠 `https://www.crocoil.com/product/fruit-fly/CSNE2501` 250ml／箱12；首圖 `https://www.crocoil.com/upload/CSNE2501_1入.jpg`；樂天通路可獨立核實條碼 | 確認包裝後可用原廠圖 |

## 修復要求

1. **安全同步**本分支，但必須先保留本機未提交的 `script.js`、`index.html` 等修復，**不可覆蓋本機**。
2. 根據每項 SKU、條碼、品名、規格、外盒照片逐項核對來源。不自行推定型號相同；疑點留空並回報。請優先用 Google Drive 已授權圖片及中台興原廠圖，不用有浮水印的電商圖。引用原廠素材前確認可供本公司的電子型錄使用。
3. **下載圖片到專案本機** `images/crocodile/Gxxxxx.jpg`（必要時正確轉檔），不要直接熱連原廠網站；保持其他商品資料與功能不變。
4. 更改 `crocodile-products.json` 只針對核實的 SKU 的 `image` 欄位，不隨意改條碼或規格，尤其不要擅改 G10360 的 8/12入衝突。
5. 本機實際測試圖片與 49 項商品，再部署至原 Cloudflare Pages 專案 `product-catalog-ui-redesign-preview`，於正式站 390×844 手機尺寸驗收搜尋、商品詳情、詢價與新圖；失敗應保持原正式版。驗收成功後 Commit/Push 到此分支，並回報圖片數與待補明細。

備註：此文件僅為帶來源的待辦核對，不代表網站已更新。
