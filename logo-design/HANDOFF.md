# 交接包：小店 Logo 三方向提案（給 變現執行）

## 這個技能在做什麼
用開源 skill `kaankiziltug/logo-design-skill`（MIT，GitHub 5,139 星，2026-10-29 查）的流程，像設計師一樣做 logo：
問清楚店做什麼、不要什麼 → 查同行常見長相避免撞款 → 想 8–12 個一句話點子 → 把會被看錯的刪掉（像葡萄、茶壺、Wi‑Fi）→ 畫三個方向的 SVG → 跑檢查（16/32/64px、反白、單色）→ 出一張提案圖給客戶挑 → 客戶選了才做完整套件。
樣本：`/workspace/learn/logo-design/sample/`（阿杏豆花，虛構客戶），提案圖 `sample/proposal.png`。
注意：repo 裡 1,432 個參考 logo 是各品牌商標，只能拿來研究，**不能用在交件裡**（見 repo 的 TRADEMARKS.md）。

## 誰會付錢
- 台灣小店：豆花、早餐、手搖、美甲、工作室，剛開店或要換招牌
- 新創、個人品牌：要 IG 頭像、網站 favicon
- 接案平台上的發案者：出任務 Tasker、PRO360、Fiverr

## 變化
1. **小店 Logo 三方向快速包**（主推）：三方向黑白提案 → 選一個上色定稿 → SVG/PNG/favicon/IG 頭像
2. **Logo＋名片套組**：同上，再加名片正反面
3. **校園社團／系學會 Logo**：預算低、量多，學期初需求集中
4. **蝦皮／IG 賣場頭像**：只做方形頭像＋橫幅，最快

**最快進帳：1. 小店 Logo 三方向快速包。** 理由：平台上本來就有大量 logo 案（出任務標示 2,738 位 logo 專家、起價 NT$3,000），買家知道要付錢；提案圖一張就能當作品集。

## 建議價格（附來源）
| 方案 | 建議價 | 依據 |
|---|---|---|
| 小店 Logo 三方向快速包 | **NT$3,500** | 出任務基礎款 NT$3,000–8,000、標準款（3 方案）NT$8,000–20,000 https://www.tasker.com.tw/price/logo-design ；出任務個人設計師 NT$2,000–5,000 https://www.tasker.com.tw/workroom/PeDYE8/service-detail/41860 ；PRO360 學生／新人 NT$3,000–8,000、平台平均 NT$12,000 https://www.pro360.com.tw/price/logo_design 。新帳號沒評價，先放基礎區間偏低。 |
| Logo＋名片套組 | NT$5,500 | PRO360 名片設計 NT$2,000–12,000 https://www.pro360.com.tw/price/graphic_design 。套組價格是自己相加推的，**未驗證**。 |
| 校園社團 Logo | NT$1,500–2,000 | **未驗證**（沒找到社團 logo 行情的公開資料） |
| 蝦皮／IG 頭像 | NT$800–1,200 | **未驗證** |
| Fiverr 英文版 | US$30／83／156 三檔 | 31 個 Fiverr top-rated logo gig 的中位數 Basic $30、Standard $83、Premium $156（第三方 2026/9 抓取）https://telaora.com/blog/how-much-does-logo-design-cost/ ；Fiverr logo 起價中位數 $27.5 https://gigbuyerguide.com/fiverr-price-index/ |
| 修改加價 | 超過 2 次，每次 NT$500 | PRO360：修改費約 NT$500–800/次 https://www.pro360.com.tw/price/logo_design |

## 照做步驟（每步一行）
1. 客戶填 5 題：店名、賣什麼、三個形容詞、不要什麼、會用在哪（招牌/杯子/IG）。
2. 網路搜「<品類> logo」看同行 5 個，寫下常見元素＝禁區。
3. 寫 8–12 個一句話點子，每個都要說得出跟同行哪裡不一樣。
4. 把縮小後會看錯的刪掉，寫原因（這張刪除清單本身就是賣點）。
5. 留三個不同類型（字形、店招、抽象），手寫 SVG，黑色先做。
6. 字用 Noto CJK（OFL）轉外框，參考 `sample/gen.py` 的 glyph() 函式。
7. 跑 `python3 repo/skills/logo-design/scripts/svg_audit.py *.svg`，WARN 全修掉。
8. 縮成 64/32/16px 和反白自己看一遍，看不清就加粗或簡化。
9. 用 `sample/proposal.py` 改文字出提案圖，交給客戶挑一個。（repo 的 concept_sheet.py 中文會變方塊，所以自己畫）
10. 客戶選定後：上色（1–2 色）、橫式＋直式組合、`export_variants.py --web-icons` 出 favicon/app icon。
11. 交件：SVG、PNG（透明＋白底）、色票 HEX、一頁使用說明；提醒客戶自己做商標檢索。

## 需要的帳號／費用（都由本人註冊、驗證、收款）
- 出任務 Tasker 專家帳號：免費註冊；報價或曝光是否要付費 **未驗證**，註冊時看清楚。
- PRO360 專家帳號：回覆需求是否要點數 **未驗證**。
- Fiverr 賣家帳號：平台抽成比例上架前到官方說明確認（本次沒查，**未驗證**）。
- 工具：全部免費（Python、cairosvg、Noto CJK 字型、這個 MIT skill）。

## 做一份多久
- 這份樣本：三方向＋兩輪修改＋提案圖，實際約 1 小時（agent 執行時間）。
- 真實客戶估：溝通 30 分＋三方向 1–2 小時＋定稿與檔案 1 小時＝半天內（**未驗證**，要等第一單實測）。

## 停損條件
- 上架後 14 天，投 10 個案子 0 回覆 → 先改作品圖和標題，再 14 天還是 0 → 降到 NT$2,500 或換 Fiverr。
- 30 天 0 成交 → 停，只把提案圖留著當作品集。
- 單一案子修改超過 3 輪或總工時超過 6 小時 → 依約加價，客戶不接就結案收已完成部分。
- 客戶要求「照某品牌的 logo 改」→ 直接拒絕（商標風險）。

## 還不夠好的地方
- 三個方向都還是黑白稿，沒做顏色、沒做實物 mockup（杯套、招牌）。
- B 在 16px 會糊，需要另做只有「杏」的小尺寸版。
- C 可能被看成被咬一口的方塊。
- 沒有真實客戶回饋；價格裡 3 項是未驗證。
