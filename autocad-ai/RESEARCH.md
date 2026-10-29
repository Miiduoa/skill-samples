# 影片拆解與查證（DeYpFJGxARy，@mk.thinktank，2026-10-12 上傳，58 秒，讚數 5,174）

## 影片實際用了什麼（只寫畫面看得到的）
| 項目 | 證據（截圖） |
|---|---|
| AI：**Claude 的電腦操作**（Claude is using your computer） | ref/hi_42.png、hi_43.png（0:42–0:44 視窗標題） |
| 軟體：AutoCAD 繁中版（功能區有「群組／公用程式／剪貼簿／圖層／區塊」） | ref/hi_34.png、hi_36.png。**版本看不出來（未驗證）** |
| 圖層名有 `A-FURN`（AIA 命名） | ref/hi_34.png 圖層下拉 |
| 是真的圖層與圖塊（字卡「點一下就看到圖層，可以直接修改」） | ref/hi_34.png |
| 繪圖順序：軸線→柱→牆→窗→門→家具→房名→尺寸→四表→算量→門窗圖 | ref/f_19.jpg 底部進度條 |
| 柱 C1–C12，黃色填滿、紅色外框；門 D1–D3、SD1 | ref/hi_11.png、f_19.jpg |
| 四表：門表、窗表、柱表、牆表；面積計算表（不扣門窗）是粉刷／油漆／地磚／天花的**算量** | ref/full_1.png、hi_36.png |
| 錄影標示「實際錄影・2 倍速」「實際螢幕錄影・3 倍速」 | ref/hi_6.png、hi_11.png |
| 沒看到：AutoCAD MCP、AutoLISP、ChatGPT | 畫面中沒出現，**不能斷定沒用** |

畫面上的指令原文（hi_43.png）：
「柱跟牆也做成表格／門窗用藍色編號及繪製／柱子黃色填滿,外框紅色／外牆黃色填滿,外框紅色／內牆咖啡色填滿,外框紅色／備註多一條樓高:360CM／在表格的右邊出面積計算表(不扣門窗) 裡面含:室內打底粉刷、室內油漆、打底、浴室貼壁磚(H240)、地磚、廚房貼地磚、平釘天花板(H280)、天花板油漆、窗簾盒」

## 作者的七大項（影片 0:52 字卡，ref/hi_52.5.png）
1 基本設定：單位、比例、樓高、牆厚
2 格局：尺寸、房間配置
3 編號規則：柱、門、窗、鐵捲門
4 圖面表現：配色、線型、門窗符號
5 繪圖順序：從軸線到家具
6 數量表：門窗柱牆表、面積計算
7 門窗圖：立面、尺寸、窗台高
完整清單：作者說放在 IG 個人主頁連結第三則。IG 要登入才看得到，網路搜尋也找不到公開文字版 → **沒拿到，未驗證**。沒有留言索取。

## AutoCAD MCP 類開源專案（GitHub API 2026-10-29 查）
| repo | 授權 | 星數 | 重點 |
|---|---|---|---|
| puran-water/autocad-mcp | MIT | 603 | AutoCAD LT 2024+（File IPC＋AutoLISP）或 ezdxf 無頭模式 |
| U-C4N/Autocad-MCP（PyPI autocad-mcp-pro） | MIT | 200 | COM 操作 AutoCAD 或 ezdxf；README 寫有平面圖工具 |
| beiming183-cloud/AutoCAD-MCP | MIT | 39 | 以 puran-water 為基礎，加入原生 worker |
| Slacker-LLC/autocad-mcp | Apache-2.0（搜尋結果） | 3（搜尋結果；API 回傳已搬移） | 只支援 AutoCAD 2026 完整版 COM |
Autodesk 官方：AutoCAD／Civil 3D MCP server 只在 Autodesk Assistant 內使用。來源：https://www.autodesk.com/support/technical/article/caas/sfdcarticles/sfdcarticles/AutoCAD-Civil-3D-MCP.html
