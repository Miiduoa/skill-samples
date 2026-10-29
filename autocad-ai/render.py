"""出圖：python render.py 檔.dxf 輸出.png [--dark] [x0,y0,x1,y1]
預設：白底黑線（填充牆柱變黑色實心，窗填色與表格色塊關閉）並同時輸出 PDF。
--dark：深色背景 #212830、照圖層顏色，模擬 AutoCAD 模型空間（含淡格線）。"""
import sys, ezdxf, matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from ezdxf.addons.drawing import RenderContext, Frontend
from ezdxf.addons.drawing.matplotlib import MatplotlibBackend
from ezdxf.addons.drawing.config import Configuration, ColorPolicy, BackgroundPolicy, LineweightPolicy
args = [a for a in sys.argv[1:] if not a.startswith("--")]
dark = "--dark" in sys.argv
src, out = args[0], args[1]
BG = "#212830"
doc = ezdxf.readfile(src)
doc.styles.get("CJK").dxf.font = "NotoSansCJK-Bold.ttc" if dark else "NotoSansCJK-Regular.ttc"  # 只在渲染時換本機字型
doc.layers.get("A-AREA").off()  # 面積邊界不出圖
if not dark:
    for n in ("A-GLAZ-PATT", "A-ANNO-TABL-PATT"):
        doc.layers.get(n).off()
fig = plt.figure(figsize=(20, 12.5)); ax = fig.add_axes([0, 0, 1, 1])
ctx = RenderContext(doc)
if dark:
    cfg = Configuration(color_policy=ColorPolicy.COLOR, background_policy=BackgroundPolicy.CUSTOM, custom_bg_color=BG,
                        lineweight_policy=LineweightPolicy.ABSOLUTE, lineweight_scaling=1.4)
else:
    cfg = Configuration(color_policy=ColorPolicy.BLACK, background_policy=BackgroundPolicy.WHITE,
                        lineweight_policy=LineweightPolicy.ABSOLUTE, lineweight_scaling=1.6)
Frontend(ctx, MatplotlibBackend(ax), config=cfg).draw_layout(doc.modelspace(), finalize=True)
from ezdxf import bbox
e = bbox.extents(doc.modelspace()); m = 15
if len(args) > 2:
    x0, y0, x1, y1 = map(float, args[2].split(","))
else:
    x0, y0, x1, y1 = e.extmin.x - m, e.extmin.y - m, e.extmax.x + m, e.extmax.y + m
if dark:  # AutoCAD 模型空間格線（只在出圖時畫，不寫進 DXF）
    import numpy as np
    for v in np.arange(np.floor(x0 / 100) * 100, x1, 100):
        ax.axvline(v, color="#2c3440" if v % 500 else "#36404e", lw=0.6, zorder=-1)
    for v in np.arange(np.floor(y0 / 100) * 100, y1, 100):
        ax.axhline(v, color="#2c3440" if v % 500 else "#36404e", lw=0.6, zorder=-1)
ax.set_xlim(x0, x1); ax.set_ylim(y0, y1)
fig.set_size_inches(20, 20 * (y1 - y0) / (x1 - x0))
bg = BG if dark else "white"
ax.set_facecolor(bg)
fig.savefig(out, dpi=170, facecolor=bg)
if out.endswith(".png") and not dark: fig.savefig(out[:-4] + ".pdf", facecolor=bg)
print("saved", out)
