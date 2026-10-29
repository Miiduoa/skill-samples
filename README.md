# skill-samples

看 IG 短片學新技能時順手做的練習樣本。每個資料夾是一個技能，裡面放成品和產生它的程式。

先講清楚：
- 這些是**學習樣本**，不是接過的案子。
- 裡面的店名、品牌、學校（阿杏豆花、斗六制服所、榕園大學、巷口咖啡、斗六 22 坪公寓…）**全部是虛構的**。
- 原片影片、原片截圖、別人的參考圖都沒有放進來，只放我們自己做的東西。

## 技能一覽

| 資料夾 | 技能 | 成品 | 主要工具 |
|---|---|---|---|
| [logo-design](logo-design/) | 小店 logo 三方向提案 | [proposal.png](logo-design/sample/proposal.png) | Python、fontTools、手寫 SVG |
| [autocad-ai](autocad-ai/) | 程式畫 CAD 平面圖（DXF）＋門窗表、算量表 | [plan_color.png](autocad-ai/plan_color.png)、[dl22_plan.dxf](autocad-ai/dl22_plan.dxf) | ezdxf、matplotlib |
| [clothing-rack](clothing-rack/) | 衣架拖曳商品輪播（Shopify 區塊） | [demo.mp4](clothing-rack/demo.mp4) | React、Vite、Liquid |
| [code-animation](code-animation/) | 用程式逐格畫直式短動畫 | [campus_reveal_v2](code-animation/campus_reveal_v2_1080x1920.mp4)、[drink_ad_v2](code-animation/drink_ad_v2_1080x1920.mp4) | Python、Pillow、ffmpeg |
| [threejs-scene](threejs-scene/) | 可走動的 3D 校門口場景 | [walkthrough.mp4](threejs-scene/media/walkthrough.mp4) | three.js、Vite |
| [wan-i2v](wan-i2v/) | 一張照片變 5 秒動態短片 | [final_1080x1920_caption.mp4](wan-i2v/final_1080x1920_caption.mp4) | Wan 2.2 I2V、ffmpeg |
| [concat-whisper-subtitles](concat-whisper-subtitles/) | 中文影片自動上字幕（Concat MCP + whisper.cpp） | 只有筆記和腳本 | whisper.cpp、Concat MCP |

## 授權

- 我們自己寫的程式碼：MIT，見 [LICENSE](LICENSE)。
- 成品圖、影片：學習樣本，可以參考，商用前請先問。

## 第三方資產與授權

| 東西 | 用在哪 | 授權 |
|---|---|---|
| Noto Sans / Serif CJK | logo 字形轉外框、CAD 出圖文字 | SIL OFL 1.1 |
| 文泉驛微米黑 WenQuanYi Micro Hei（`threejs-scene/public/fonts/wqy-microhei.ttc`） | 3D 場景招牌字、程式動畫字卡 | Apache 2.0 或 GPL-3.0（含字型嵌入例外）雙授權 |
| Droid Sans Fallback | 程式動畫備援字型 | Apache 2.0 |
| three.js | 3D 場景 | MIT |
| ezdxf | CAD 平面圖 | MIT |
| Wan 2.2 I2V（經 Hugging Face Space 執行） | 照片轉影片 | Apache 2.0 |
| whisper.cpp / ggml 模型（未放進 repo） | 字幕聽寫 | MIT |
| kaankiziltug/logo-design-skill（只參考流程，沒有複製它的參考 logo） | logo 流程 | MIT |
| JohnHeibel/ClaudeAnimationBase（只參考流程，沒有複製原始碼） | 程式動畫流程 | MIT |

各資料夾的 NOTES.md、sources.md 有更細的來源紀錄。
