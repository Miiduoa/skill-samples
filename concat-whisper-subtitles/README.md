# concat-whisper-subtitles：中文影片自動上字幕

測試 Concat（開源剪輯軟體）能不能在沒有畫面的伺服器上，透過 MCP 自動剪片、上字幕、匯出。結論：剪片、上字幕、匯出都可以，但它的自動聽寫只有視窗版有，所以改用同一份 whisper.cpp 模型自己聽寫，再把字幕丟回 Concat。

這裡只放筆記和腳本，沒有放測試用的影片和匯出結果（素材不是我們的）。

## 檔案
- `NOTES.md`：完整步驟、MCP 指令範例、速度比較
- `transcribe.py`：用 whisper.cpp（pywhispercpp）聽寫，輸出 JSON
- `mcp_client.py`：最小的 stdio JSON-RPC MCP client
- `run_concat.py`：依序呼叫 Concat 建專案、匯入、上字幕、匯出

## 怎麼跑
```bash
pip install pywhispercpp
# 裝 Concat 0.2.8 .deb，下載 ggml-small.bin（見 NOTES.md）
ffmpeg -i 影片.mp4 -ar 16000 -ac 1 work/audio16k.wav
python3 transcribe.py small
CONCAT_MCP_ROOTS=$PWD python3 run_concat.py work/whisper_small.json
```
腳本裡的路徑是當時測試機的路徑，用之前改成自己的。
