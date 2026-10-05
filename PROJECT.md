# 商品型錄系統｜正式開發規格

## 專案目的
建立可供客戶查閱與詢價的商品型錄網站，並在後續製作獨立的自動報價 MVP。

## Current Production / Source of Truth
- 現行商品型錄: `https://product-catalog-ui-redesign-preview.pages.dev/`
- 本機 Source: `F:\project\product-catalog-ui-redesign-v1`
- Branch: `feature/catalog-ui-redesign-v1`
- Cloudflare Pages project: `product-catalog-ui-redesign-preview`
- Repository: `happy333rich-crypto/product-catalog-inquiry`

新商品、商品圖片、分類與 UI 維護，一律以此 V2 Cloudflare source 為準。在任何 Commit、Push 或 Deploy 前，必須先確認部署目標為 `product-catalog-ui-redesign-preview`。

## Legacy
- 舊 GitHub Pages: `https://happy333rich-crypto.github.io/product-catalog-inquiry/`
- 狀態: `LEGACY / DO NOT DEPLOY`

不得再將日常商品更新部署到舊 GitHub Pages。不得因舊文件、`main` branch 或 GitHub Pages 自動部署設定，而將舊站誤判為現行站。舊站資料保留，但不再作為日常維護與部署目標。

## 已完成
- 品牌整併
- 品牌排序固定
- 商品分類整理
- 商品資料整理
- 停產品移除
- 圖片顯示框架建立

## 固定品牌順序
1. 舒潔
2. 可麗舒/可立雅
3. 春風
4. 蒲公英
5. 原萃
6. 靠得住
7. 好奇
8. 力可潔
9. 居居加/居美媞/妙妙熊/鉅瑋
10. 白蘭（含熊寶貝、麗仕）
11. 南僑
12. 鱷魚/必安住
13. 優品
14. 清檜
15. 優生

排序原則不是字母順序，而是依照使用者實際工作詢價頻率與商品情境。

## 品牌整併規則
- 可麗舒、可立雅 → `可麗舒/可立雅`
- 鱷魚、必安住與中台興相關商品 → `鱷魚/必安住`
- 居居加、居美媞、妙妙熊、鉅瑋 → `居居加/居美媞/妙妙熊/鉅瑋`
- 熊寶貝、麗仕 → 歸入 `白蘭`
- 立可潔／力可潔 → 統一為 `力可潔`

## 已確認停產／刪除
- 水晶肥皂單顆
- 水晶肥皂 200g 三入組
- 靠得住無感軟Q棉系列

## 圖片規則（最高優先）
每個 SKU 必須使用自己的正確商品圖，不可共用系列主視覺。

每張圖片都必須逐一核對：
- 貨號
- 條碼
- 尺寸
- 片數／抽數／包數
- 包裝文字
- 新版／舊版包裝

只要有一項對不上，就維持「圖片整理中」，不可硬套圖。

圖片視覺規格：
- 白底或乾淨底色
- 1:1 方形畫布
- 商品完整、不裁切包裝
- 留白一致
- 主體比例一致
- 避免模糊、浮水印與錯版包裝

## 目前工作優先順序
### 第一階段：家用紙逐 SKU 配圖
依序：
1. 舒潔
2. 可麗舒/可立雅
3. 春風
4. 蒲公英
5. 原萃

### 第二階段
- 靠得住
- 好奇

### 第三階段
- 力可潔
- 居居加/居美媞/妙妙熊/鉅瑋
- 白蘭
- 南僑
- 鱷魚/必安住
- 優品
- 清檜
- 優生

### 第四階段：自動報價 MVP
先完成最小可用版本：
- 選取商品
- 自動帶入品名、貨號、條碼、箱入數
- 輸入數量與單價
- 自動計算
- 匯出 PDF
- 匯出 Excel

暫不優先：
- LINE 自動回覆
- Gmail 自動寄送
- Google Drive 自動儲存
- JPG 匯出
- AI 推薦商品

## 開發規則
- 不重新規劃已完成的品牌、分類或資料結構。
- 不再新增多個臨時測試頁。
- V2 Cloudflare source 與 `feature/catalog-ui-redesign-v1` 為唯一真實來源。
- 找不到精確圖片就不放。
- 每次變更後必須確認公開頁可開、商品能載入、品牌下拉可操作，再提供網址。
- 除非有資料缺失、刪除風險或新版／舊版需要決策，否則不反覆要求使用者確認。

## 新對話／Codex 接手指令
開始工作前先讀取 `PROJECT.md`，確認 Source 為 `F:\project\product-catalog-ui-redesign-v1`、Branch 為 `feature/catalog-ui-redesign-v1`，且部署目標為 `product-catalog-ui-redesign-preview`。不要把舊 `main` 或 GitHub Pages 當成現行站。
