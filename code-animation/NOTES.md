# 用程式碼逐格畫卡通：筆記

本專案走的是 **「讀過 Claude Animation Base，再依同一套流程自建 Python 渲染器」** 這條路。

## 找到的 repo

- 網址：https://github.com/JohnHeibel/ClaudeAnimationBase
- 授權：MIT License（Copyright John Heibel）
- 語言／繪圖：JavaScript，**p5.js + p5.brush**（水彩填色 + 墨線），不是 Python/PIL、不是 Cairo、不是 SVG。
- 畫布：預設 **1920×1080 橫式**，WEBGL 畫布上包一層 2D 合成。
- 時間模型：每一格是 `t` 的純函數。禁止跨幀狀態、`Math.random()`、積分物理。穩定隨機用 `hash(i)`，線條「沸騰」用 12fps 的 `boilSeed`。
- 鏡頭：`camBegin(cx, cy, zoom, rot)`，世界點對準畫面中心。
- 渲染成影片：`render.mjs` 用 **headless Chrome（puppeteer-core）** 對 `studio.html` 逐格 `renderAt(t)`，JPEG pipe 進 **ffmpeg**，`libx264` + `yuv420p` + `+faststart`。
- 縮圖自檢：同一支 `render.mjs`
  - `--sheet=0.5,1,1.5,...` contact sheet
  - `--strip=a:b` 連續每一格（查跳格、沸騰）
  - `--crop` / `--crop-at` 滿解析度局部（臉、手、接觸點）
  模型自己看圖，抓全白格、死畫面、穿幫，修兩輪再人工收尾。
- 工作流（ANIMATION_GUIDE.md）：先寫分鏡 → 一鏡一鏡畫 → 看 sheet/strip/crop → 修 → `--clip` 出片。規則：手繪介質、不要字幕、每鏡要有事件、轉場接縫、時間以觀眾讀懂為準。

為什麼樣本不直接跑那套引擎：

1. 規格是直式 1080×1920，原版是橫式 1920×1080。
2. 畫風指定扁平手繪、米白／磚紅、紙紋；原版主力是 p5.brush 水彩，無 GPU 時一格可到數秒。
3. 片尾要中文字卡、課表是劇情道具；原版指南幾乎禁止字幕。
4. 本機有 Chrome 也有 ffmpeg，但水彩填色在這台雲端機上不划算，也對不準「不要紫藍漸層、不要霓虹」的樣本需求。

所以：**原理照它，畫筆換成 Pillow 多邊形 + 沸騰墨線 + 紙紋乘算，ffmpeg 合成，contact sheet 自檢。** 角色系統（Clawd、31 種表情）沒有搬過來。

## 照做步驟（每步一行）

1. 讀 ClaudeAnimationBase 的 README、ANIMATION_GUIDE.md、`render.mjs`、`src/core.js`。
2. 先寫 `STORYBOARD.md`：logline、世界、母題、每鏡的 reads。
3. 寫純函數引擎：鏡頭、easing、keyframes、12fps boil、紙紋、grain。
4. 世界座標畫整張書桌；鏡頭從手機桌布裡拉出來，不要切鏡頭。
5. 預覽關鍵靜幀（0、1.8、5.4、7.2、11、15.8 秒），用人眼看。
6. 修第一輪：開頭漏出日期／鎖頭、夜空硬邊多邊形、課表標題被裁、識別證拉太長。
7. 24fps 出 JPEG，ffmpeg 編成 H.264 yuv420p +faststart。
8. 每 0.5 秒抽一張拼 `contact_sheet.jpg`，用平均亮度抓空白格、用相鄰 MAE 抓跳格。
9. 修第二輪：中段 zoom 拉太快，木桌在 0.5 秒內灌進來；把 pull 的 key 拉長。
10. 同一套 `Pen` + `boba()`，換 `scenes/drink.py` 做 7.2 秒商品廣告。

## 這次實際數字

| 項目 | 數字 |
|---|---|
| 校園片 | 16.0s · 384 格 · 1080×1920 · 24fps · H.264 High yuv420p · faststart |
| 飲料片 | 7.2s · 173 格 · 同上 |
| 校園渲格 | 約 10.9 秒（4 worker，約 28 ms/格） |
| 校園編碼 | 約 7 秒 |
| 飲料渲格 | 約 4.1 秒（約 24 ms/格） |
| 從讀 repo 到兩支出片 | 一次完整實作 + 兩輪目視／sheet 修正（不是原作那種 45 分鐘水彩長片） |

做一支「能看的樣本」：寫分鏡與場景函式是大頭；渲染本身在這台機器上 **十幾秒** 就結束。若改回 p5.brush 水彩，原作者警告無獨顯時是 **每格數秒**，16 秒片子可能要十幾分鐘以上。

## 自檢修了什麼

第一輪（看關鍵靜幀）：

- 開頭相機對太高，鎖屏日期「9月7日」、鎖頭圖示直接穿幫。改成對準月亮，UI 放到螢幕頂端。
- 夜空用少邊數 blob，出現一條硬對角線，很 AI。改成在 clip layer 上先鋪滿夜色。
- 「08:17」的冒號被字型畫成中點。改成兩顆手繪點。
- 課表標題被裁成「年級課表」；NTU 識別證壓在課表上。課表右移，識別證改掛窗簾。
- 檯燈臂穿過整張桌子，看起來像一根杆。改成短鵝頸。
- 字卡棕櫚樹壓在「擬」字上。樹改到標題下方。
- 桌面木紋畫成橫線筆記本。改成短、彎、不拉滿的木紋。

第二輪（看 contact sheet）：

- 無空白格（luma 開頭約 36，字卡約 231，門檻 245 才算白）。
- 7.5s 被標 JUMP：那是木桌湧進畫面的反轉，不是壞格。把 zoom key 從 7.8s 收到 1.0 改成 8.6→11.6 緩降。
- 15.0s JUMP：紙張擦過轉字卡，是設計內轉場。

## 限制（哪裡還不夠好）

- 月亮、珍珠仍看得出多邊形切面，離「筆刷」還有一段。要更像原作，得把 outline 改成可變寬 ribbon，或真的接 p5.brush。
- 字卡用文泉驛微米黑，不是一筆一畫寫出來的字。
- 書桌 hold（約 9–14.5 秒）事件偏少：蒸氣、沸騰線有，但觀眾可能覺得停住。原作規則「每格都在動」這裡只做到中等。
- 無聲。沒有把握從 Pixabay 抓到可轉分發的 CC0 檔，所以不加。
- 沒有角色表演。這支是鏡頭 gag，不是 Clawd 那種表情戲。
- 手機桌布與窗外椰林母題有呼應，但傅鐘剪影偏小，台灣大學的可讀性主要靠課表、NTU 識別證、椰林，不是地標特寫。
- Pillow 沒有原作那種 pigment 混合；暗部乘上 grain 之後有時發悶。
- 廣告變體的暖簾白色橢圓還是有點「貼紙感」，側杯陰影不夠貼桌。

## 怎麼重跑

```bash
python3 -m pip install pillow numpy
sudo apt-get install -y ffmpeg fonts-wqy-microhei   # 若本機還沒有
python3 render.py campus --clip --sheet
python3 render.py drink --clip
```

成品在 `out/campus.mp4`、`out/drink.mp4`、`out/contact_sheet.jpg`。
