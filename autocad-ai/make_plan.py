"""斗六 22 坪三房兩廳公寓 平面圖產生器（原創虛構案例）
單位：cm（$INSUNITS=5）。輸出 dl22_plan.dxf，可直接用 AutoCAD 開啟。
"""
import json, math, os
import ezdxf
from ezdxf.enums import TextEntityAlignment
from shapely.geometry import box, Polygon
from shapely.ops import unary_union

PING = 3.305785  # 1 坪 = 3.305785 m²
EXT, INT = 15, 12  # 外牆 / 內牆厚 cm

doc = ezdxf.new("R2018", setup=True)
doc.header["$INSUNITS"] = 5      # cm
doc.header["$MEASUREMENT"] = 1
doc.header["$LTSCALE"] = 20
msp = doc.modelspace()

# ---------- 圖層 ----------
LAYERS = [  # (名稱, ACI 顏色, 線型, 線寬, 說明)  配色比照原片：柱/外牆黃填紅框、內牆咖啡填紅框、門窗藍、表格綠
    ("S-GRID", 1, "CENTER", 13, "軸線（紅）"),
    ("S-COLS", 1, "Continuous", 35, "柱外框（紅）"),
    ("S-COLS-PATT", 2, "Continuous", 0, "柱填滿（黃 SOLID）"),
    ("S-COLS-IDEN", 2, "Continuous", 13, "柱編號（黃）"),
    ("A-WALL-EXTR", 1, "Continuous", 35, "外牆外框（紅）"),
    ("A-WALL-EXTR-PATT", 2, "Continuous", 0, "外牆填滿（黃 SOLID）"),
    ("A-WALL-INTR", 1, "Continuous", 35, "內牆外框（紅）"),
    ("A-WALL-INTR-PATT", 32, "Continuous", 0, "內牆填滿（咖啡 SOLID）"),
    ("A-DOOR", 150, "Continuous", 25, "門（藍）"),
    ("A-GLAZ", 150, "Continuous", 25, "窗（藍）"),
    ("A-GLAZ-PATT", 5, "Continuous", 0, "窗填滿（深藍 SOLID）"),
    ("A-FURN", 200, "Continuous", 18, "家具（紫）"),
    ("A-ANNO-DIMS", 3, "Continuous", 13, "尺寸（綠）"),
    ("A-ANNO-TEXT", 7, "Continuous", 18, "文字"),
    ("A-ANNO-TITL", 2, "Continuous", 25, "表名（黃）"),
    ("A-ANNO-TABL", 3, "Continuous", 25, "表格線（綠）"),
    ("A-ANNO-TABL-TEXT", 7, "Continuous", 13, "表格文字（白）"),
    ("A-ANNO-TABL-PATT", 7, "Continuous", 0, "表格色塊（顏色 BYENTITY）"),
    ("A-AREA", 9, "DASHED", 9, "房間面積邊界（不出圖）"),
]
for name, color, lt, lw, desc in LAYERS:
    lay = doc.layers.add(name, color=color, linetype=lt, lineweight=lw)
    lay.description = desc

doc.styles.add("CJK", font="msjh.ttc")  # AutoCAD(Windows)用微軟正黑體
dim = doc.dimstyles.new("PLAN_CM")
dim.dxf.dimtxt = 18; dim.dxf.dimasz = 10; dim.dxf.dimexe = 6; dim.dxf.dimexo = 6
dim.dxf.dimgap = 4; dim.dxf.dimtsz = 8; dim.dxf.dimtxsty = "CJK"; dim.dxf.dimdec = 0
dim.dxf.dimtad = 1; dim.dxf.dimclrd = 3; dim.dxf.dimclre = 3; dim.dxf.dimclrt = 3

def T(text, x, y, h=18, layer="A-ANNO-TEXT", align=TextEntityAlignment.MIDDLE_CENTER):
    return msp.add_text(text, height=h, dxfattribs={"layer": layer, "style": "CJK"}).set_placement((x, y), align=align)

def rect_pts(x0, y0, x1, y1):
    return [(x0, y0), (x1, y0), (x1, y1), (x0, y1)]

# ---------- 軸線（牆中心線） ----------
GX = {"1": 0, "2": 330, "3": 600, "4": 720, "5": 900}
GY = {"A": 0, "B": 310, "C": 500, "D": 810}
for k, x in GX.items():
    msp.add_line((x, -170), (x, 980), dxfattribs={"layer": "S-GRID"})
    msp.add_circle((x, 1005), 25, dxfattribs={"layer": "S-GRID"}); T(k, x, 1005, 22, "S-GRID")
for k, y in GY.items():
    msp.add_line((-190, y), (1080, y), dxfattribs={"layer": "S-GRID"})
    msp.add_circle((-215, y), 25, dxfattribs={"layer": "S-GRID"}); T(k, -215, y, 22, "S-GRID")

# ---------- 牆（中心線, 厚度） ----------
WALLS = [  # (x0,y0,x1,y1,t)  v2：浴室加深到 1.9m、主浴加寬到 2.4m
    (0, 0, 900, 0, EXT), (900, 0, 900, 810, EXT), (900, 810, 0, 810, EXT), (0, 810, 0, 0, EXT),
    (0, 500, 900, 500, INT), (330, 500, 330, 810, INT), (600, 500, 600, 810, INT),
    (0, 310, 240, 310, INT), (240, 310, 240, 500, INT),
    (720, 310, 720, 500, INT), (720, 310, 900, 310, INT), (720, 0, 720, 310, INT),
]
def wall_poly(x0, y0, x1, y1, t):
    h = t / 2
    if y0 == y1:
        a, b = sorted((x0, x1)); ext = EXT / 2
        return box(a - (ext if a == 0 else INT/2 if t == INT else ext), y0 - h, b + (ext if b == 900 else INT/2 if t == INT else ext), y0 + h)
    a, b = sorted((y0, y1)); ext = EXT / 2
    return box(x0 - h, a - (ext if a == 0 else INT/2 if t == INT else ext), x0 + h, b + (ext if b == 810 else INT/2 if t == INT else ext))
walls_full = unary_union([wall_poly(*w) for w in WALLS])
walls_ext = unary_union([wall_poly(*w) for w in WALLS if w[4] == EXT])
walls_int = unary_union([wall_poly(*w) for w in WALLS if w[4] == INT]).difference(walls_ext)

# ---------- 柱 C1–C6：45x45，外緣對齊外牆面 ----------
o = -EXT / 2; C = 45
COLS = {"C1": (o, o), "C2": (900 + EXT/2 - C, o), "C3": (o, 500 - C/2), "C4": (900 + EXT/2 - C, 500 - C/2),
        "C5": (o, 810 + EXT/2 - C), "C6": (900 + EXT/2 - C, 810 + EXT/2 - C)}
cols = {k: box(x, y, x + C, y + C) for k, (x, y) in COLS.items()}
cols_union = unary_union(list(cols.values()))
struct = unary_union([walls_full, cols_union])
OUTER = box(-EXT/2, -EXT/2, 900 + EXT/2, 810 + EXT/2)

# ---------- 門窗（編號, 寬, 高, 窗台高, 名稱） ----------
TYPES = {
    "D1": dict(w=100, h=210, sill=0, kind="door", name="大門（防火門）"),
    "D2": dict(w=90, h=210, sill=0, kind="door", name="房門"),
    "D3": dict(w=75, h=210, sill=0, kind="door", name="浴室門"),
    "SD1": dict(w=150, h=210, sill=0, kind="slide", name="廚房拉門"),
    "W1": dict(w=240, h=150, sill=90, kind="win", name="客廳落地外推窗"),
    "W2": dict(w=180, h=150, sill=90, kind="win", name="臥室橫拉窗"),
    "W3": dict(w=120, h=100, sill=110, kind="win", name="廚房窗"),
    "W4": dict(w=60, h=60, sill=160, kind="win", name="浴室氣窗"),
}
# 放置：(編號, 牆向 'h'/'v', 牆座標, 起, 迄, 牆厚, 開向 +1/-1, 鉸鏈 'a'/'b')
OPENINGS = [
    ("D1", "h", 0, 560, 660, EXT, +1, "b"),
    ("D2", "h", 500, 220, 310, INT, +1, "a"),
    ("D2", "h", 500, 490, 580, INT, +1, "b"),
    ("D2", "h", 500, 620, 710, INT, +1, "a"),
    ("D3", "h", 500, 45, 120, INT, +1, "a"),
    ("D3", "v", 720, 410, 485, INT, +1, "b"),
    ("SD1", "v", 720, 120, 270, INT, 0, "a"),
    ("W1", "h", 0, 60, 300, EXT, 0, "a"),
    ("W2", "h", 810, 75, 255, EXT, 0, "a"),
    ("W2", "h", 810, 375, 555, EXT, 0, "a"),
    ("W2", "h", 810, 660, 840, EXT, 0, "a"),
    ("W3", "v", 900, 105, 225, EXT, 0, "a"),
    ("W4", "v", 0, 370, 430, EXT, 0, "a"),
    ("W4", "v", 900, 340, 400, EXT, 0, "a"),
]
def opening_box(o_, t_):
    _, d, c, a, b, t, *_ = o_
    return box(a, c - t/2 - 1, b, c + t/2 + 1) if d == "h" else box(c - t/2 - 1, a, c + t/2 + 1, b)

# ---------- 圖塊定義 ----------
for code, ty in TYPES.items():
    blk = doc.blocks.new(code)
    w = ty["w"]
    if ty["kind"] == "door":
        blk.add_lwpolyline([(0, 0), (4, 0), (4, w), (0, w)], close=True)   # 門扇
        blk.add_arc((0, 0), w, 0, 90)                                      # 開門弧
    elif ty["kind"] == "slide":
        blk.add_lwpolyline(rect_pts(0, -1, w/2 + 5, 3), close=True)
        blk.add_lwpolyline(rect_pts(w/2 - 5, -5, w, -1), close=True)
    else:  # 窗：外牆 15cm
        h = EXT / 2
        blk.add_line((0, -h), (w, -h)); blk.add_line((0, h), (w, h))
        blk.add_line((0, -1.5), (w, -1.5)); blk.add_line((0, 1.5), (w, 1.5))
        blk.add_line((0, -h), (0, h)); blk.add_line((w, -h), (w, h))

def F(name, pts_list, circles=(), arcs=()):
    blk = doc.blocks.new(name)
    for pts, closed in pts_list:
        blk.add_lwpolyline(pts, close=closed)
    for c, r in circles:
        blk.add_circle(c, r)
    for c, r, a0, a1 in arcs:
        blk.add_arc(c, r, a0, a1)
# 家具圖塊（原點在左下角）
F("FN_BED_Q", [(rect_pts(0, 0, 150, 190), True), (rect_pts(10, 155, 70, 182), True), (rect_pts(80, 155, 140, 182), True), ([(0, 140), (150, 140)], False)])
F("FN_BED_S", [(rect_pts(0, 0, 105, 190), True), (rect_pts(15, 155, 90, 182), True), ([(0, 140), (105, 140)], False)])
F("FN_WARDROBE", [(rect_pts(0, 0, 120, 60), True), ([(0, 0), (120, 60)], False), ([(0, 60), (120, 0)], False)])
F("FN_DESK", [(rect_pts(0, 0, 100, 55), True), (rect_pts(30, -45, 70, -5), True)])
F("FN_SOFA3", [(rect_pts(0, 0, 210, 85), True), (rect_pts(15, 0, 195, 65), True), ([(80, 0), (80, 65)], False), ([(130, 0), (130, 65)], False)])
F("FN_TV", [(rect_pts(0, 0, 180, 40), True)])
F("FN_TEA", [(rect_pts(0, 0, 100, 50), True)])
F("FN_DINING4", [(rect_pts(0, 0, 130, 80), True), (rect_pts(15, -40, 55, -5), True), (rect_pts(75, -40, 115, -5), True), (rect_pts(15, 85, 55, 120), True), (rect_pts(75, 85, 115, 120), True)])
F("FN_TOILET", [(rect_pts(0, 0, 45, 20), True)], arcs=[((22.5, 20), 1, 0, 0)])
blk = doc.blocks.get("FN_TOILET"); blk.add_ellipse((22.5, 45), major_axis=(0, 25), ratio=0.72)
F("FN_BASIN", [(rect_pts(0, 0, 55, 45), True)], circles=[((27.5, 20), 14)])
F("FN_SHOWER", [(rect_pts(0, 0, 80, 80), True), ([(0, 0), (80, 80)], False), ([(0, 80), (80, 0)], False)], circles=[((40, 40), 4)])
F("FN_COUNTER", [(rect_pts(0, 0, 60, 240), True), (rect_pts(10, 150, 50, 220), True)], circles=[((30, 40), 11), ((30, 75), 11)])
F("FN_FRIDGE", [(rect_pts(0, 0, 70, 70), True), ([(0, 0), (70, 70)], False)])

# ---------- 房間（中心線矩形, 名稱） ----------
ROOMS = [
    ("主臥室", box(0, 500, 330, 810)), ("臥室二", box(330, 500, 600, 810)), ("臥室三", box(600, 500, 900, 810)),
    ("主浴", box(0, 310, 240, 500)), ("走道", box(240, 310, 720, 500)), ("公浴", box(720, 310, 900, 500)),
    ("客廳", box(0, 0, 420, 310)), ("餐廳", box(420, 0, 720, 310)), ("廚房", box(720, 0, 900, 310)),
]
room_net = {n: r.difference(struct) for n, r in ROOMS}
centerline_area = box(0, 0, 900, 810).area

# ---------- 繪製牆、柱、填充 ----------
open_boxes = [opening_box(o_, o_[5]) for o_ in OPENINGS]
def solid(pts_rings, layer, color=256):
    h = msp.add_hatch(color=color, dxfattribs={"layer": layer})
    h.set_solid_fill(color=color)
    for pts in pts_rings:
        h.paths.add_polyline_path(pts, is_closed=True)
    return h
def draw_region(geom, line_layer, fill_layer):
    geoms = list(geom.geoms) if geom.geom_type == "MultiPolygon" else [geom]
    for g in geoms:
        rings = [[tuple(round(v, 3) for v in p) for p in r.coords[:-1]] for r in [g.exterior, *g.interiors]]
        solid(rings, fill_layer)                     # 先填色
        for pts in rings:                            # 再畫紅框
            msp.add_lwpolyline(pts, close=True, dxfattribs={"layer": line_layer})
cut = unary_union([cols_union, *open_boxes])
draw_region(walls_ext.difference(cut), "A-WALL-EXTR", "A-WALL-EXTR-PATT")
draw_region(walls_int.difference(cut), "A-WALL-INTR", "A-WALL-INTR-PATT")
for k, (x, y) in COLS.items():
    pts = rect_pts(x, y, x + C, y + C)
    solid([pts], "S-COLS-PATT")
    msp.add_lwpolyline(pts, close=True, dxfattribs={"layer": "S-COLS"})
    T(k, x - 24 if x < 0 else x + C + 24, y + C + 8 if y > 0 else y - 10, 14, "S-COLS-IDEN")
# 窗：牆厚範圍填藍
for o_ in OPENINGS:
    if TYPES[o_[0]]["kind"] == "win":
        bx = opening_box(o_, o_[5]); x0, y0, x1, y1 = bx.bounds
        solid([rect_pts(x0, y0 + 1, x1, y1 - 1) if o_[1] == "h" else rect_pts(x0 + 1, y0, x1 - 1, y1)], "A-GLAZ-PATT")

# ---------- 插入門窗圖塊 ----------
def insert_opening(code, d, c, a, b, t, side, hinge):
    ty = TYPES[code]; lay = "A-GLAZ" if ty["kind"] == "win" else "A-DOOR"
    if ty["kind"] == "win":
        p, rot = ((a, c), 0) if d == "h" else ((c, a), 90)
        msp.add_blockref(code, p, dxfattribs={"layer": lay, "rotation": rot})
        tag_xy = (p[0] + ty["w"]/2, c + (40 if c > 0 else -40)) if d == "h" else (c + (45 if c > 0 else -45), p[1] + ty["w"]/2)
        T(code, *tag_xy, 15, "A-GLAZ"); return
    if ty["kind"] == "slide":
        p, rot = ((a, c), 0) if d == "h" else ((c, a), 90)
        msp.add_blockref(code, p, dxfattribs={"layer": lay, "rotation": rot})
        T(code, c - 30 if d == "v" else (a + b)/2, (a + b)/2 if d == "v" else c - 30, 15, "A-DOOR"); return
    s, e = (a, b) if hinge == "a" else (b, a)
    u = (1 if e > s else -1)
    if d == "h":
        ux, uy = u, 0; nx, ny = 0, side; p = (s, c + side * t/2)
    else:
        ux, uy = 0, u; nx, ny = side, 0; p = (c + side * t/2, s)
    rot = math.degrees(math.atan2(uy, ux)) % 360
    left = (-uy, ux)
    ys = 1 if (nx, ny) == left else -1
    msp.add_blockref(code, p, dxfattribs={"layer": lay, "rotation": rot, "yscale": ys})
    mx, my = ((a + b)/2, c - side * 28) if d == "h" else (c - side * 30, (a + b)/2)
    T(code, mx, my, 15, "A-DOOR")
for o_ in OPENINGS:
    insert_opening(*o_)

# ---------- 家具 ----------
FURN = [
    ("FN_BED_Q", (50, 612), 0), ("FN_WARDROBE", (324, 600), 90),
    ("FN_BED_S", (480, 610), 0), ("FN_WARDROBE", (340, 508), 0), ("FN_DESK", (345, 745), 0),
    ("FN_BED_S", (785, 610), 0), ("FN_WARDROBE", (775, 508), 0), ("FN_DESK", (615, 745), 0),
    ("FN_SOFA3", (100, 20), 0), ("FN_TEA", (155, 135), 0), ("FN_TV", (100, 258), 0),
    ("FN_DINING4", (500, 150), 0),
    ("FN_COUNTER", (833, 10), 0), ("FN_FRIDGE", (740, 10), 0),
    ("FN_TOILET", (20, 318), 0), ("FN_BASIN", (80, 318), 0), ("FN_SHOWER", (150, 318), 0),
    ("FN_TOILET", (847, 318), 0), ("FN_BASIN", (790, 318), 0), ("FN_SHOWER", (812, 395), 0),
]
FURN = list(dict.fromkeys(FURN))  # 去重
for name, p, rot in FURN:
    msp.add_blockref(name, p, dxfattribs={"layer": "A-FURN", "rotation": rot})

# ---------- 房名、面積、面積邊界 ----------
LABEL_AT = {"主臥室": (165, 585), "臥室二": (410, 615), "臥室三": (690, 660), "主浴": (165, 455),
            "走道": (480, 440), "公浴": (770, 405), "客廳": (330, 225), "餐廳": (470, 70), "廚房": (775, 190)}
area_rows = []
for name, r in ROOMS:
    g = room_net[name]
    pts = [tuple(round(v, 3) for v in p) for p in g.exterior.coords[:-1]]
    msp.add_lwpolyline(pts, close=True, dxfattribs={"layer": "A-AREA"})
    m2 = round(g.area / 1e4, 2)
    minx, miny, maxx, maxy = g.bounds
    formula = f"{(maxx-minx)/100:.3f}×{(maxy-miny)/100:.3f}" + ("－柱" if abs(g.area - (maxx-minx)*(maxy-miny)) > 1 else "")
    area_rows.append((name, formula, m2, round(m2 / PING, 2)))
    x, y = LABEL_AT[name]
    small = name == "公浴"
    T(name, x, y, 17 if small else 20)
    T(f"{(maxx-minx)/100:.2f}×{(maxy-miny)/100:.2f}={m2:.2f}m²", x, y - 22, 9 if small else 11)
    T(f"({m2/PING:.2f}坪)", x, y - (36 if small else 38), 9 if small else 11)

# ---------- 尺寸標註 ----------
def dimh(x0, x1, y, base):
    msp.add_linear_dim(base=(x0, base), p1=(x0, y), p2=(x1, y), dimstyle="PLAN_CM", dxfattribs={"layer": "A-ANNO-DIMS"}).render()
def dimv(y0, y1, x, base):
    msp.add_linear_dim(base=(base, y0), p1=(x, y0), p2=(x, y1), angle=90, dimstyle="PLAN_CM", dxfattribs={"layer": "A-ANNO-DIMS"}).render()
xs = sorted(GX.values()); ys = sorted(GY.values())
for a, b in zip(xs, xs[1:]): dimh(a, b, -8, -95)
dimh(0, 900, -8, -145)
for a, b in zip(xs, xs[1:]): dimh(a, b, 818, 895)
for a, b in zip(ys, ys[1:]): dimv(a, b, -8, -95)
dimv(0, 810, -8, -145)
for a, b in zip(ys, ys[1:]): dimv(a, b, 908, 985)
dimv(0, 810, 908, 1035)

# ---------- 表格（綠線、白字、黃表名） ----------
def table(x0, y_top, title, headers, rows, widths, rh=34, swatch=None, fs=13):
    T(title, x0, y_top + 40, 28, "A-ANNO-TITL", TextEntityAlignment.LEFT)
    W = sum(widths); n = len(rows) + 1
    for i in range(n + 1):
        msp.add_line((x0, y_top - i * rh), (x0 + W, y_top - i * rh), dxfattribs={"layer": "A-ANNO-TABL"})
    cx = x0
    for w in [0] + widths:
        cx += w; msp.add_line((cx, y_top), (cx, y_top - n * rh), dxfattribs={"layer": "A-ANNO-TABL"})
    for i, row in enumerate([headers] + rows):
        cx = x0
        for w, v in zip(widths, row):
            if str(v) != "":
                T(str(v), cx + w/2, y_top - i * rh - rh/2, fs if i else fs + 1, "A-ANNO-TABL-TEXT")
            cx += w
    for (ri, ci), color in (swatch or {}).items():   # 顏色欄色塊
        cx = x0 + sum(widths[:ci]); cy = y_top - (ri + 2) * rh
        solid([rect_pts(cx + widths[ci]/2 - 14, cy + 9, cx + widths[ci]/2 + 14, cy + rh - 9)], "A-ANNO-TABL-PATT", color)
    return y_top - n * rh

from collections import Counter
cnt = Counter(o_[0] for o_ in OPENINGS)
dw_rows = [[k, TYPES[k]["name"], TYPES[k]["w"], TYPES[k]["h"], TYPES[k]["sill"], cnt[k]] for k in TYPES]
TX = 1180
yb = table(TX, 900, "門窗表（單位 cm）", ["編號", "名稱", "寬", "高", "窗台高", "數量"], dw_rows, [70, 190, 60, 60, 80, 60])
tot_m2 = round(sum(g.area for g in room_net.values()) / 1e4, 2)
struct_m2 = round(struct.area / 1e4, 2)
rows = [[n, f, f"{m:.2f}", f"{p:.2f}"] for n, f, m, p in area_rows]
rows.append(["室內淨面積合計", "Σ", f"{tot_m2:.2f}", f"{tot_m2/PING:.2f}"])
rows.append(["牆柱面積", "外牆面－室內淨", f"{struct_m2:.2f}", f"{struct_m2/PING:.2f}"])
rows.append(["外牆面包絡", "9.150×8.250", f"{OUTER.area/1e4:.2f}", f"{OUTER.area/1e4/PING:.2f}"])
yb2 = table(TX, yb - 90, "房間面積表（淨面積，扣牆柱）", ["空間", "算式(m)", "m²", "坪"], rows, [170, 200, 90, 80])
T(f"註：軸線內面積 9.00×8.10＝{centerline_area/1e4:.2f}m²（{centerline_area/1e4/PING:.2f}坪）；牆厚外牆15、內牆12；樓高{360}", TX, yb2 - 30, 12, "A-ANNO-TEXT", TextEntityAlignment.LEFT)

# ---------- 柱表、牆表（含顏色欄） ----------
TX2 = TX + 600
table(TX2, 900, "柱表（單位 cm）", ["編號", "尺寸", "數量", "位置", "顏色"],
      [["C1,C2,C5,C6", "45×45", 4, "角柱"], ["C3,C4", "45×45", 2, "邊柱(C軸)"]], [150, 90, 60, 110, 60],
      swatch={(0, 4): 2, (1, 4): 2})
ext_len = sum(abs(w[2]-w[0]) + abs(w[3]-w[1]) for w in WALLS if w[4] == EXT) / 100
int_len = sum(abs(w[2]-w[0]) + abs(w[3]-w[1]) for w in WALLS if w[4] == INT) / 100
table(TX2, 700, "牆表（中心線長）", ["類型", "厚度", "長度(m)", "說明", "顏色"],
      [["外牆", EXT, f"{ext_len:.2f}", "RC"], ["內牆", INT, f"{int_len:.2f}", "1/2B磚"]], [90, 70, 100, 150, 60],
      swatch={(0, 4): 2, (1, 4): 32})

# ---------- 面積計算表（不扣門窗）：裝修算量 ----------
H_FLOOR, H_CEIL, H_TILE = 3.60, 2.80, 2.40      # 樓高、平釘天花、浴室壁磚高（m）
BATHS = ["主浴", "公浴"]
nonbath = unary_union([room_net[n] for n, _ in ROOMS if n not in BATHS])   # 客餐廳＋走道相通處自動合併，不算牆面
P_nb = round(nonbath.length / 100, 2)                                    # 非浴室實際牆面周長（含柱面轉折）
P_b = round(sum(room_net[n].length for n in BATHS) / 100, 2)             # 兩間浴室周長
def rect_formula(g):
    minx, miny, maxx, maxy = g.bounds
    w, h = round((maxx - minx) / 100, 3), round((maxy - miny) / 100, 3)
    notch = round(w * h - g.area / 1e4, 2)
    return f"{w:.3f}×{h:.3f}" + (f"−{notch:.2f}(柱)" if notch > 0 else ""), w * h - notch
bath_f = [rect_formula(room_net[n]) for n in BATHS]
kit_f = rect_formula(room_net["廚房"])
ceil_m2 = round(sum(g.area for g in room_net.values()) / 1e4, 2)
CURTAIN_ROOMS = ["客廳", "主臥室", "臥室二", "臥室三"]
def room_of(o_):
    c = opening_box(o_, o_[5]).centroid
    return min(ROOMS, key=lambda r: room_net[r[0]].distance(c))[0]
curtain = [TYPES[o_[0]]["w"] / 100 for o_ in OPENINGS if TYPES[o_[0]]["kind"] == "win" and room_of(o_) in CURTAIN_ROOMS]
TAKEOFF = [  # (項目, 算式, 數量, 單位, 備註)
    ("室內打底粉刷", f"{P_nb:.2f}×{H_FLOOR:.2f}", P_nb * H_FLOOR, "m²", "浴室除外，打底至樓板"),
    ("室內油漆", f"{P_nb:.2f}×{H_CEIL:.2f}+{P_b:.2f}×{H_CEIL - H_TILE:.2f}", P_nb * H_CEIL + P_b * (H_CEIL - H_TILE), "m²", "至H280；浴室取壁磚以上"),
    ("浴室打底", f"{P_b:.2f}×{H_FLOOR:.2f}", P_b * H_FLOOR, "m²", "浴室牆面，至樓板"),
    ("浴室貼壁磚", f"{P_b:.2f}×{H_TILE:.2f}", P_b * H_TILE, "m²", "H240"),
    ("浴室地磚", "+".join(f"{round(room_net[n].area/1e4, 2):.2f}({n})" for n in BATHS),
     sum(round(room_net[n].area/1e4, 2) for n in BATHS), "m²", "淨面積，扣柱"),
    ("廚房貼地磚", kit_f[0], kit_f[1], "m²", ""),
    ("平釘天花板", "Σ各室地坪面積", ceil_m2, "m²", "H280"),
    ("天花板油漆", "同平釘天花板", ceil_m2, "m²", ""),
    ("窗簾盒", "+".join(f"{v:.2f}" for v in curtain), sum(curtain), "m", f"客廳＋臥室窗，合{sum(curtain)/0.30303:.1f}台尺"),
]
to_rows = []
for i, (item, f, q, unit, note) in enumerate(TAKEOFF, 1):
    to_rows.append([i, item, f, f"{q:.2f}", unit, f"{q/PING:.2f}" if unit == "m²" else "—", note])
TX3 = TX2 + 540
yt = table(TX3, 900, "面積計算表（不扣門窗）", ["項次", "項目", "計算式", "數量", "單位", "坪數", "備註"], to_rows,
           [50, 140, 310, 90, 50, 80, 230], rh=36)
for k, line in enumerate(["※ 面積不扣除門窗開口；室內淨尺寸（扣牆柱）計算。",
                          f"※ 樓高 360；平釘天花板 H280；浴室壁磚 H240。非浴室牆面周長 {P_nb:.2f} m、浴室 {P_b:.2f} m。",
                          "※ 客餐廳與走道相通處無牆，不計粉刷面。窗簾盒以 m 計，不換算坪。"]):
    T(line, TX3, yt - 28 - k * 24, 13, "A-ANNO-TEXT", TextEntityAlignment.LEFT)
# ---------- 門窗圖（立面） ----------
ex = TX; ey = yb2 - 200
T("門窗圖（立面，1:50 示意，單位 cm）", ex, ey + 30, 24, "A-ANNO-TITL", TextEntityAlignment.LEFT)
gx = ex
for k, ty in TYPES.items():
    s = 0.5; w, h, sill = ty["w"] * s, ty["h"] * s, ty["sill"] * s
    base = ey - 150
    msp.add_line((gx - 5, base), (gx + w + 5, base), dxfattribs={"layer": "A-ANNO-TEXT"})
    lay = "A-GLAZ" if ty["kind"] == "win" else "A-DOOR"
    msp.add_lwpolyline(rect_pts(gx, base + sill, gx + w, base + sill + h), close=True, dxfattribs={"layer": lay})
    if ty["kind"] == "win":
        msp.add_line((gx + w/2, base + sill), (gx + w/2, base + sill + h), dxfattribs={"layer": lay})
    else:
        msp.add_circle((gx + w - 5, base + h/2), 1.5, dxfattribs={"layer": lay})
    T(k, gx + w/2, base - 18, 13, lay); T(f"{ty['w']}×{ty['h']}", gx + w/2, base - 34, 10, "A-ANNO-TEXT")
    gx += w + 30

# ---------- 圖名 ----------
T("斗六某公寓（虛構）　22坪三房兩廳　平面配置圖", 0, -230, 28, "A-ANNO-TEXT", TextEntityAlignment.LEFT)
T("S=1:100　單位：cm　僅供示範，非施工核定圖", 0, -268, 14, "A-ANNO-TEXT", TextEntityAlignment.LEFT)

# ---------- 圖框 ----------
from ezdxf import bbox as _bb
ext = _bb.extents(msp)
fx0, fy0 = ext.extmin.x - 40, ext.extmin.y - 110
fx1, fy1 = ext.extmax.x + 40, ext.extmax.y + 40
doc.layers.add("A-ANNO-TTLB", color=7, lineweight=50).description = "圖框"
msp.add_lwpolyline(rect_pts(fx0, fy0, fx1, fy1), close=True, dxfattribs={"layer": "A-ANNO-TTLB", "const_width": 3})
msp.add_line((fx0, fy0 + 70), (fx1, fy0 + 70), dxfattribs={"layer": "A-ANNO-TTLB"})
for i, (k, v) in enumerate([("案名", "斗六某公寓（虛構示範）"), ("圖名", "平面配置圖／門窗表／面積表／門窗圖"),
                            ("比例", "1:100"), ("圖號", "A-101"), ("日期", "2026.10.29")]):
    xx = fx0 + 20 + i * (fx1 - fx0 - 40) / 5
    T(f"{k}：{v}", xx, fy0 + 35, 15, "A-ANNO-TTLB", TextEntityAlignment.LEFT)
doc.saveas(os.path.join(os.path.dirname(os.path.abspath(__file__)), "dl22_plan.dxf"))
json.dump({"rooms": area_rows, "total_m2": tot_m2, "struct_m2": struct_m2, "outer_m2": OUTER.area/1e4,
           "centerline_m2": centerline_area/1e4, "openings": dict(cnt),
           "takeoff": [[r[1], r[2], r[3], r[4], r[5]] for r in to_rows], "P_nonbath_m": P_nb, "P_bath_m": P_b},
          open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "build_meta.json"), "w"), ensure_ascii=False, indent=1)
print("ok", tot_m2, struct_m2, OUTER.area/1e4, dict(cnt))
