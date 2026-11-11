# 鱷魚／中台興型錄缺圖核對 — 2026-11-09

**目前狀態：已補2張確證原廠圖並部署原正式網站；49項／43圖／6項待確認。下方原始核對表保留作追溯，本次結果與驗收見文末。**

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

原始核對備註：此表建立時尚未更新網站；目前執行結果見文末。

## 2026-11-09 本次逐項查證與修復

已先備份 script.js、index.html、crocodile-products.json 與 Wrangler 本機快取，備份位置：
`F:\project\product-catalog-ui-redesign-v1-backups\before-photo-repair-20261109-221936`。
安全快轉同步至 `a97f97e8d0fef39d8180f275ef19d5ae81279d53`。備份與程式檔 SHA-256 一致。

本次僅新增 **2 張原廠照片**，僅修改以下兩個 image 欄位；49 筆商品維持不變，圖片由 41 增至 **43**，仍缺 **6** 項。原廠圖片原檔保存，未使用通路浮水印圖片，也未改圖、猜配或熱連。

| SKU | 本次結果與證據 |
| --- | --- |
| G10401 | 已補 `images/crocodile/G10401.jpg`。原廠 CSWP3001／300ml／箱12，照片標示「鱷魚」「不快害虫」「居家、園藝型」「水性」「300ml」，亮綠罐及延伸噴管；[振宇五金竹東店商品索引](https://www.ubereats.com/tw/store/%E6%8C%AF%E5%AE%87%E4%BA%94%E9%87%91-%E7%AB%B9%E6%9D%B1%E5%BA%97/hldVSz8SV56XqlH6qRBVxA) 列「不快害蟲除蟲劑 300ml#4710312012498」，對應型錄條碼。採用上表原廠主圖，已目視核對包裝文字。 |
| G10410 | 已補 `images/crocodile/G10410.jpg`。原廠 CSNE2501／250ml／箱12；[愛買樂天](https://www.rakuten.com.tw/shop/amart/product/883328/) 明列 EAN 4710312013013；[九元同條碼商品](https://www.9u.com.tw/detail.asp?pd_type=375&product_id=22193&product_no=4710312013013&page=1&pdid=) 的白色扳機瓶、綠色標籤、品名與250ml包裝和原廠主圖相符。採用上表原廠主圖。 |
| G10270 | 仍留空。型錄600g、條碼4710312011200，原廠IS60為600ml；未取得同條碼包裝佐證。未改規格。 |
| G10341 | 仍留空。[九元同條碼4710312011347](https://www.9u.com.tw/detail.asp?pd_type=375&product_id=20979&product_no=4710312011347&page=1&pdid=) 為紅色「鱷魚A／白蟻」25g盒；原廠IX025最新候選圖為綠色「13種」25g盒，原廠頁未提供條碼，不能直接認定同品或包裝改版。 |
| G10344 | 仍留空。[小北康定店索引](https://www.foodpanda.com.tw/shop/q4lg/xiao-bei-bai-huo-kang-ding-dian) 列4710312011378為鱷魚水蒸式蟻蟑蹣藥25g；未建立此條碼與原廠包裝圖片的確定對應，不挪用G10341或鱷王照片。 |
| G10360 | 仍留空。8入／12入衝突未解除，保留原3g×12入及條碼4710312030287。 |
| G10372 | 仍留空。原廠APA021照片為安德生蟻愛呷黃色「全巢除蟻／2枚入」盒，原廠頁列3g×2入／箱12；未找到條碼4710312160021的獨立對應證據。 |
| G10400 | 仍留空。原廠CSND3001照片及[官方商城](https://www.cts-shop.com/products/csnd3001) 已確認「水性／300ml」，但尚未核實條碼4710312012481，不能僅因名稱相似即配圖。 |

以上候選與通路核對圖僅保存在專案外備份目錄；未確認的圖片沒有放入網站。商品貨號、條碼、名稱、規格、箱入、品牌、排序、其餘41張既有圖片及網站程式皆未修改。
### 本機驗收（390×844）

- 資料逐欄比較通過：49筆只變更G10401、G10410的image；其餘值與順序相同，script.js及index.html與備份SHA-256一致。
- 43張有設定路徑的圖片皆可在本機解碼，未確認6項仍空白。
- 實際瀏覽器品牌篩選顯示49項；貨號G10401、條碼4710312013013搜尋各回傳正確商品。
- 兩張新圖的手機商品卡及詳情載入成功，品名、容量、箱入與條碼正確，無橫向溢出。
- 加入兩項詢價，G10401增至2箱、G10410為1箱，產生詢價文字正確；未對外傳送。
- 無JavaScript error；仍有原本鉅瑋舊圖庫解碼warning，已由既有個別圖片備援處理，本次未更動此功能。
### 正式站驗收與部署

- 既有專案：product-catalog-ui-redesign-preview；既有Production分支標記main。Git工作分支仍為feature/catalog-ui-redesign-v1，沒有建立新站或部署GitHub Pages。
- 部署ID：`b1353568-9c46-4d4c-a40f-bea84f56318f`。
- 原正式網址：https://product-catalog-ui-redesign-preview.pages.dev/
- 部署固定網址：https://b1353568.product-catalog-ui-redesign-preview.pages.dev/
- 依本文件要求先部署驗收再Commit/Push；Wrangler來源標示同步基準a97f97e加本機變更（commit-dirty=true）。部署後只追加本驗收紀錄，網站程式、JSON與圖片沒有再更動。
- 原正式網址讀回：49項、43張圖片、6項留空；crocodile-products.json、兩張新圖、script.js與index.html全部HTTP200且SHA-256與本機驗證版本一致。
- 實際瀏覽器390×844檢查：鱷魚品牌49張卡片；G10401貨號搜尋、G10410條碼搜尋均正確，兩張圖於卡片與明細皆complete且naturalWidth大於0；手機畫面品名、300ml/250ml、箱12、條碼與SKU正確，沒有水平溢出。
- 正式站兩商品加入詢價成功，G10401調整至2箱、G10410為1箱，清單資訊正確；測試項目已透過介面刪除，未傳送任何詢價訊息。
- 6個待確認SKU的DOM圖片均hidden且沒有src，保留「圖片整理中」；G10360顯示原3g×12入。
- 優品U20130圖片載入正常；正式資料U20130為1筆、U20110為0筆。
- 無新增JavaScript error；保留既有鉅瑋舊圖庫warning與個別圖片備援。驗收中有瀏覽器控制工具逾時，重新使用既有分頁複查成功，未修改網站程式。