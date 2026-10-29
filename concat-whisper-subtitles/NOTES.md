# Concat 0.2.8 headless 測試筆記（2026-10-29，台北時間）

測試素材：`/workspace/learn/_inbox/De6ytqsAPQp.mp4`（1080x1920、107.3 秒、中文口說，原片已有燒進去的字幕）
機器：這台 box，Debian 13 x86_64、8 核、沒有 GPU（Concat 匯出時用 llvmpipe 軟體繪圖）

## 結論先講
- **裝得起來**：.deb 直接 `apt install` 成功，下載 3 秒、安裝 3 秒。
- **MCP headless 能剪片、上字幕、匯出**：建 9:16 專案、匯入、填滿畫面、`captions_add` 上字幕、`preview_frame` 截圖、`export_start` 匯出，全部不用開視窗就能跑。
- **但 MCP 沒有「自動聽寫字幕」**：Concat 內建 Whisper（whisper.cpp），可是只有視窗版的 Captions 面板叫得到。42 個 MCP 工具裡沒有 transcribe，`edit_apply` 的指令裡也沒有。GitHub issue #471（2026-10-21 開的）也在要求把 SRT 和字幕功能開放給 API，目前還沒做。
- 所以我改用**跟 Concat 同一份模型檔**自己跑 Whisper：從 Concat 預設的 huggingface 網址抓 `ggml-small.bin` 和 `ggml-base.bin`，SHA256 跟 Concat 執行檔內寫死的值完全一樣（small `1be3a9b2…987b`、base `60ed5bc3…2efe`）。引擎用的是 whisper.cpp（pywhispercpp 1.5.1），再把結果丟給 Concat 的 `captions_add`。**這不是 Concat 自己的轉錄流程**，它內部的參數（語言、切句方式）我測不到。
- **速度**：Concat 匯出比 ffmpeg 直接燒字幕慢很多，見下面。

## 照做步驟（每步一行）
1. `curl -LO https://github.com/jub0t/Concat/releases/download/v0.2.8/Concat-0.2.8-linux-x86_64.deb`，用 SHA256SUMS 驗過。
2. `sudo apt-get install -y ./Concat-0.2.8-linux-x86_64.deb`，裝到 `/opt/concat`，指令是 `/usr/bin/concat`。
3. `concat --mcp headless` 走 stdio、一行一個 JSON-RPC；先跑 `initialize`，再送 `notifications/initialized`。
4. 環境變數設 `CONCAT_MCP_ROOTS=/workspace/learn/concat-test`；沒設的話只能寫在家目錄 `/home/box` 底下。
5. `ffmpeg -i 影片 -ar 16000 -ac 1 audio16k.wav` 抽出音訊。
6. `python work/transcribe.py small` 用 whisper.cpp 跑 small 模型、指定 zh，結果寫成 `work/whisper_small.json`。
7. `python run_concat.py work/whisper_small.json` 依序呼叫 project_create → media_import → clip_add → clip_frame(fill) → captions_add → project_save → preview_frame → export_start/export_wait。
8. 匯出完成，輸出 `concat_export_1080x1920.mp4`。

## MCP 指令範例（JSON-RPC，stdio）
```json
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"box-test","version":"0.1"}}}
{"jsonrpc":"2.0","method":"notifications/initialized"}
{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"project_create","arguments":{"location":"/workspace/learn/concat-test/work/projects","name":"nuni_concat_test","video":{"width":1080,"height":1920,"rateNum":30,"rateDen":1}}}}
{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"media_import","arguments":{"path":".../nuni_concat_test","file":"/workspace/learn/_inbox/De6ytqsAPQp.mp4"}}}
{"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"clip_add","arguments":{"path":".../nuni_concat_test","mediaId":"m1","trackId":"T4","start":0}}}
{"jsonrpc":"2.0","id":5,"method":"tools/call","params":{"name":"clip_frame","arguments":{"path":".../nuni_concat_test","clipId":"c2","framing":"fill"}}}
{"jsonrpc":"2.0","id":6,"method":"tools/call","params":{"name":"captions_add","arguments":{"path":".../nuni_concat_test","offsetY":0.40,"style":{"fontFamily":"\"Noto Sans CJK TC\"","fontWeight":700,"fontSize":0.034,"color":"#ffffff","background":"#000000b3","maxWidth":0.86},"captions":[{"start":0.0,"end":2.6,"text":"你下指令還在寫你是一個專家嗎"}]}}}
{"jsonrpc":"2.0","id":7,"method":"tools/call","params":{"name":"preview_frame","arguments":{"path":".../nuni_concat_test","time":5.0,"output":"/workspace/learn/concat-test/screenshot_5s.png"}}}
{"jsonrpc":"2.0","id":8,"method":"tools/call","params":{"name":"export_start","arguments":{"path":".../nuni_concat_test","output":"/workspace/learn/concat-test/concat_export_1080x1920.mp4","width":1080,"height":1920}}}
{"jsonrpc":"2.0","id":9,"method":"tools/call","params":{"name":"export_wait","arguments":{"path":".../nuni_concat_test","job":"j1","timeoutSeconds":600}}}
```
小提醒：
- 預設字型 Hanken Grotesk 沒有中文字，style 要指定 `"Noto Sans CJK TC"`，字體名稱要連引號一起寫。
- 新專案預設有 T1–T4 四條軌，T4 在最底層。
- 完整 client 在 `mcp_client.py` 和 `run_concat.py`。

## 比對 1：字幕品質（前 30 秒，0–31.3 秒）
**對照組不是我親耳聽寫的**，我這邊沒辦法聽音訊。拿來對照的是原片作者燒進畫面的字幕：每 0.5 秒截一張圖，我逐張讀出來（見 `work/ref/sheet_*.jpg`）。
計算方式：去掉空白和標點、英文轉小寫後算編輯距離（CER），英文一個字母算一個字。

| 模型 | 編輯數 / 181 字 | CER | 把「它/他」當成同一個字 |
|---|---|---|---|
| small | 9 | 5.0% | 3.9% |
| base | 22 | 12.2% | 11.0% |

small 的錯字：
- Claude → **Cloud**，出現 3 次（「做Cloud的工程主管說」「帶過Cloud好幾個產品」「叫Cloud修好某個當機」）
- Rieseberg → **Riesberg**
- 它 → **他**，2 次（「叫他讓App…」「…電腦給他」），同音字
- 沒有引號「」，問號有保留

base 的錯字：
- 指令 → **子令**，3 次
- Claude → **Cold**，3 次
- Felix → **Philix**
- Rieseberg → **Resberg**
- 它 → 他，2 次
- 沒有問號

全片其他地方，small 還把 Felix 聽成 Philix（103 秒附近），兩個模型都把 Claude 聽成 Cloud 或 CLOAD。
**結論**：中文部分 small 幾乎全對，錯的集中在英文專有名詞，上片前一定要人工修。
時間軸：我沒辦法聽，所以沒有逐句驗證。GitHub issue #438 回報過 Concat GUI 的自動字幕會比語音「早 1–7 秒」（Windows、v0.2.7、英文 base），這個要注意。

## 比對 2：簡體還是繁體
- whisper.cpp 指定 `language=zh` 或 `auto`，這支影片的輸出**都已經是繁體**。拿 OpenCC `t2s` 試轉，會改動 143 個字，可見原文是繁體。
- OpenCC `s2twp` 跑完 0 個字有變動，`s2t` 只把「群」改成「羣」，這個反而不要。
- 如果之後遇到輸出簡體的情況，`opencc-python-reimplemented` 的 `s2twp` 可以轉，在這台機器上已經裝好也測過。
- Concat GUI 自己轉錄時會不會出簡體，我沒測到，因為它沒有開放給 headless。

## 比對 3：速度（這台機器實測，沒有 GPU）
| 步驟 | 時間 |
|---|---|
| 下載 .deb (155MB) | 3 秒 |
| apt 安裝 | 3 秒 |
| Whisper base 轉錄 107 秒的影片 | 3.6 秒 |
| Whisper small 轉錄 107 秒的影片 | 13.4 秒 |
| Concat：建專案、匯入、上 52 句字幕、存檔 | 合計不到 0.2 秒 |
| Concat preview_frame（1 張） | 14.4 秒 |
| **Concat 匯出 1080x1920 H.264（crf 20, medium）** | **130.8 秒** |
| **ffmpeg + libass 直接燒同一份 SRT（crf 20, medium）** | **16.2 秒** |

- 整條流程含 small 轉錄：Concat 約 13.4 + 145.4 ≈ 159 秒；ffmpeg 約 13.4 + 16.2 ≈ 30 秒。
- Concat 慢的原因：log 寫著 `no hardware adapter ... drawing on llvmpipe`，也就是用 CPU 模擬 GPU 來合成畫面。在有 GPU 的 Mac 上會不會比較快：**未驗證**。

## 優點
- 有正式的 MCP，工具描述寫得很完整，一支 Python 腳本就能驅動，剪接、轉場、關鍵影格、特效、模板都有 API。
- `preview_frame` 能先輸出一張合成好的畫面，給 agent 自己檢查版面。
- 專案存成資料夾，之後可以用 GUI 打開來人工微調。
- AGPL-3.0，本機跑，不用登入、不用上傳。

## 缺點
- **headless 拿不到自動字幕**（只有 GUI 有），這次測試最想要的功能剛好缺。
- 沒有 GPU 時匯出約慢 8 倍（130.8 秒對 16.2 秒）。
- MCP 不能匯入或匯出 SRT（issue #471）。
- 預設字型不支援中文，要自己指定。
- 版本更新很快（10/6、10/13、10/20 各發一版），API 可能會變。

## 跟我們現在用 ffmpeg 手動上字幕比
**沒有比較快。** 只是要「轉錄後把字幕燒上去」的話，whisper.cpp(small) + OpenCC + ffmpeg 約 30 秒就做完，Concat headless 要約 159 秒，自動轉錄還是得自己跑。
Concat 值得用的地方是多段剪接、動態字幕樣式、關鍵影格這類 ffmpeg 很難寫的東西，而且之後可以交給人用 GUI 微調。

## 檔案
- `concat_export_1080x1920.mp4`：Concat 匯出的成品，107.3 秒，20.9MB
- `concat_subs_whisper-small.srt`：字幕檔，whisper small，繁體
- `screenshot_5s.png`：Concat `preview_frame` 在第 5 秒的截圖
- `mcp_client.py`、`run_concat.py`、`work/transcribe.py`：腳本
- `work/whisper_small.json`、`work/whisper_base.json`、`work/whisper_base.srt`：轉錄原始結果
- `work/ffmpeg_baseline.mp4`：ffmpeg 對照組
- `work/ref/`：對照用的原片字幕截圖
- `tools.json`：42 個 MCP 工具的完整 schema
