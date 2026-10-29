# 來源與授權

## 程式模板（讀過、沒有複製進本 repo 的原始碼）

- Claude Animation Base  
  https://github.com/JohnHeibel/ClaudeAnimationBase  
  作者 John Heibel  
  授權 MIT License  
  本專案吸收其流程（分鏡 → 時間的純函數逐格繪製 → contact sheet 自檢 → ffmpeg），繪圖引擎是另寫的 Python/Pillow，沒有拷貝 `src/core.js`、`p5.brush` 或 Clawd 角色檔。

- 上游音樂錄影帶（背景閱讀，未使用其素材）  
  https://github.com/JohnHeibel/PDoomVideo  
  *I'm Upping My P(doom)*，同樣 MIT。

## 字型

- 文泉驛微米黑（WenQuanYi Micro Hei）  
  `/usr/share/fonts/truetype/wqy/wqy-microhei.ttc`  
  授權：GPL-3.0 **with Font embedding exception**（GNU/Linux 套件 `fonts-wqy-microhei`）。  
  用於課表、鎖屏時間、店招、片尾字卡。

- Droid Sans Fallback  
  備援字型，Apache License 2.0。

## 音樂

本樣本是 **無聲版**。

沒有從 Pixabay 或其他 CC0 庫下載配樂：無法在不依賴帳號／不確定轉分發條款的情況下，有把握地附上一段可賣的配樂。若要上架，建議另外買或使用你自己確認過的 CC0／委託曲，再以：

```bash
ffmpeg -i out/campus.mp4 -i your.wav -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart out/campus_audio.mp4
```

混進去。

## 原創畫面

星空桌布、宿舍書桌、課表文案、手搖「新生杯」、字卡「開學第一週生存模擬器」皆為本專案繪製，不是 Ichigo 燈籠夕陽那支的重製，也沒有使用任何生成式影像模型出圖。
