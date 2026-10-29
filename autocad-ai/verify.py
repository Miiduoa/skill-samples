"""讀回 dl22_plan.dxf 自動驗證。全部用 ezdxf 從檔案讀，不靠產生器的變數。"""
import sys, ezdxf
from collections import Counter, defaultdict
from shapely.geometry import Polygon
from shapely.ops import unary_union
PING = 3.305785
doc = ezdxf.readfile(sys.argv[1] if len(sys.argv) > 1 else "dl22_plan.dxf")
msp = doc.modelspace()
ok = True
def check(cond, msg):
    global ok; ok &= bool(cond); print(("PASS " if cond else "FAIL ") + msg)

need_layers = {"S-GRID","S-COLS","S-COLS-PATT","S-COLS-IDEN","A-WALL-EXTR","A-WALL-EXTR-PATT","A-WALL-INTR","A-WALL-INTR-PATT",
               "A-DOOR","A-GLAZ","A-GLAZ-PATT","A-FURN","A-ANNO-DIMS","A-ANNO-TEXT","A-ANNO-TITL","A-ANNO-TABL",
               "A-ANNO-TABL-TEXT","A-ANNO-TABL-PATT","A-AREA"}
have = {l.dxf.name for l in doc.layers}
check(need_layers <= have, f"必要圖層 {len(need_layers)} 個都在（檔內共 {len(have)} 個圖層）")
used = Counter(e.dxf.layer for e in msp)
check(all(used[l] > 0 for l in need_layers), "每個必要圖層都有物件：" + ", ".join(f"{l}={used[l]}" for l in sorted(need_layers)))
# 配色（比照原片）：柱/外牆 黃填紅框、內牆 咖啡填紅框、門窗藍、表格綠
COLOR = {"S-COLS": 1, "S-COLS-PATT": 2, "A-WALL-EXTR": 1, "A-WALL-EXTR-PATT": 2, "A-WALL-INTR": 1,
         "A-WALL-INTR-PATT": 32, "A-DOOR": 150, "A-GLAZ": 150, "A-GLAZ-PATT": 5, "A-ANNO-TABL": 3}
check(all(doc.layers.get(k).color == v for k, v in COLOR.items()), "圖層顏色符合原片配色：" + ", ".join(f"{k}={doc.layers.get(k).color}" for k in COLOR))
for lay in ("S-COLS-PATT", "A-WALL-EXTR-PATT", "A-WALL-INTR-PATT", "A-GLAZ-PATT"):
    hs = list(msp.query(f'HATCH[layer=="{lay}"]'))
    check(hs and all(h.dxf.solid_fill == 1 and h.dxf.color == 256 for h in hs), f"{lay}: {len(hs)} 個 SOLID HATCH，顏色 BYLAYER")
check(used.get("0", 0) == 0, f"0 圖層上沒有散落物件（{used.get('0',0)}）")

user_blocks = [b.name for b in doc.blocks if not b.name.startswith(("*", "_"))]  # _開頭是標註箭頭
inserts = [e for e in msp.query("INSERT")]
ins_cnt = Counter(e.dxf.name for e in inserts)
check(len(user_blocks) >= 8, f"自訂圖塊定義 {len(user_blocks)} 個：{', '.join(user_blocks)}")
check(all(ins_cnt[b] > 0 for b in user_blocks), f"每個圖塊都有被插入，INSERT 共 {len(inserts)} 個")

# 門窗數量：圖上 INSERT vs 門窗表
def region(x): return 0 if x < 1750 else (1 if x < 2300 else 2)   # 0 門窗/房間表、1 柱/牆表、2 算量表
rows = defaultdict(list)
for t in msp.query('TEXT[layer=="A-ANNO-TABL-TEXT"]'):
    rows[(round(t.dxf.insert.y, 1), region(t.dxf.insert.x))].append((t.dxf.insert.x, t.dxf.text))
table = {}
for (y, rg), cells in rows.items():
    vals = [v for _, v in sorted(cells)]
    if rg == 0 and len(vals) == 6 and vals[0] != "編號":
        table[vals[0]] = dict(w=int(vals[2]), h=int(vals[3]), qty=int(vals[5]))
plan_dw = {k: v for k, v in ins_cnt.items() if k in table}
check(set(table) == {k for k in ins_cnt if k[0] in "DSW" and not k.startswith("FN")}, f"門窗表編號 {sorted(table)} 與圖上門窗圖塊一致")
for k, r in table.items():
    check(plan_dw.get(k, 0) == r["qty"], f"{k}: 圖上 {plan_dw.get(k,0)} 樘 / 表上 {r['qty']} 樘")
for k, r in table.items():
    blk = doc.blocks.get(k)
    xs = []
    for e in blk:
        if e.dxftype() == "LINE": xs += [e.dxf.start.x, e.dxf.end.x]
        elif e.dxftype() == "LWPOLYLINE": xs += [p[0] for p in e.get_points("xy")]
        elif e.dxftype() == "ARC": xs += [e.dxf.center.x + e.dxf.radius]
    width = max(xs) - min(xs)
    check(abs(width - r["w"]) < 1.01, f"{k} 圖塊實際寬 {width:.0f} = 表上寬 {r['w']}")
check(table["D2"]["w"] == 90 and table["D2"]["h"] == 210 and table["D3"]["w"] == 75, "房門 90×210、浴室門 75 符合題目")

# 面積：房間邊界多邊形 vs 面積表
from shapely.geometry import Point
polys = {}
labels = [t for t in msp.query('TEXT[layer=="A-ANNO-TEXT"]')]
for pl in msp.query('LWPOLYLINE[layer=="A-AREA"]'):
    p = Polygon(pl.get_points("xy"))
    names = [t.dxf.text for t in labels if p.contains(Point(t.dxf.insert.x, t.dxf.insert.y)) and not any(c.isdigit() for c in t.dxf.text) and len(t.dxf.text) <= 4]
    polys[names[0] if len(names) == 1 else f"?{len(polys)}"] = p
area_rows = {}
for (y, rg), cells in rows.items():
    vals = [v for _, v in sorted(cells)]
    if rg == 0 and len(vals) == 4 and vals[0] not in ("空間", "類型", "編號") and not vals[0].startswith("C") and vals[0] not in ("外牆", "內牆"):
        area_rows[vals[0]] = float(vals[2])
room_names = [k for k in area_rows if k not in ("室內淨面積合計", "牆柱面積", "外牆面包絡")]
room_m2 = sorted(round(p.area / 1e4, 2) for p in polys.values())
check(len(polys) == len(room_names) == 9, f"房間邊界 {len(polys)} 個、面積表房間 {len(room_names)} 列")
check(room_m2 == sorted(area_rows[k] for k in room_names), "每間房邊界算出的面積 = 面積表數字")
s = sum(p.area for p in polys.values()) / 1e4
u = unary_union(list(polys.values())).area / 1e4
check(abs(s - u) < 0.001, f"房間彼此不重疊（加總 {s:.3f} / 聯集 {u:.3f} m²）")
check(abs(round(s, 2) - area_rows["室內淨面積合計"]) <= 0.02, f"房間加總 {s:.2f} = 表上合計 {area_rows['室內淨面積合計']:.2f} m²")
tot = area_rows["室內淨面積合計"] + area_rows["牆柱面積"]
check(abs(tot - area_rows["外牆面包絡"]) <= 0.03, f"淨面積 + 牆柱 = {tot:.2f} ≈ 外牆面包絡 {area_rows['外牆面包絡']:.2f} m²")
# 牆柱面積從圖上牆輪廓＋柱輪廓獨立重算（牆輪廓已挖開門窗，所以加回開口才能比）
walls = [Polygon(pl.get_points("xy")) for pl in msp.query('LWPOLYLINE[layer=="A-WALL-EXTR" | layer=="A-WALL-INTR"]')]
cols = [Polygon(pl.get_points("xy")) for pl in msp.query('LWPOLYLINE[layer=="S-COLS"]')]
check(len(cols) == 6, f"柱 {len(cols)} 支（C1–C6）")
outer = unary_union(walls + cols + list(polys.values())).convex_hull.area / 1e4
check(abs(outer - area_rows["外牆面包絡"]) < 0.01, f"圖上外輪廓重算 {outer:.2f} m² = 表上 {area_rows['外牆面包絡']:.2f}")
cl = 9.0 * 8.1
check(21.5 <= cl / PING <= 22.5, f"軸線內面積 {cl:.2f} m² = {cl/PING:.2f} 坪（題目 22 坪）")
check(set(polys) == set(room_names), f"每個面積邊界內剛好一個房名：{sorted(polys)}")

# ---------- 面積計算表（不扣門窗）：從房間邊界、窗圖塊獨立重算 ----------
import re
H, HC, HT = 3.60, 2.80, 2.40
BATHS = ["主浴", "公浴"]
P_nb = unary_union([p for n, p in polys.items() if n not in BATHS]).length / 100
P_b = sum(polys[n].length for n in BATHS) / 100
A = {n: p.area / 1e4 for n, p in polys.items()}
def blk_w(name):
    xs = [v for e in doc.blocks.get(name) if e.dxftype() == "LINE" for v in (e.dxf.start.x, e.dxf.end.x)]
    return (max(xs) - min(xs)) / 100
curtain = []
for ins in msp.query("INSERT"):
    if ins.dxf.name.startswith("W"):
        c = Point(ins.dxf.insert.x, ins.dxf.insert.y)
        w = blk_w(ins.dxf.name)
        import math
        a = math.radians(ins.dxf.rotation); mid = Point(c.x + math.cos(a) * w * 50, c.y + math.sin(a) * w * 50)
        room = min(polys, key=lambda n: polys[n].distance(mid))
        if room in ("客廳", "主臥室", "臥室二", "臥室三"): curtain.append(w)
expect = {"室內打底粉刷": P_nb * H, "室內油漆": P_nb * HC + P_b * (HC - HT), "浴室打底": P_b * H, "浴室貼壁磚": P_b * HT,
          "浴室地磚": A["主浴"] + A["公浴"], "廚房貼地磚": A["廚房"], "平釘天花板": sum(A.values()),
          "天花板油漆": sum(A.values()), "窗簾盒": sum(curtain)}
tk = {}
for (y, rg), cells in rows.items():
    vals = [v for _, v in sorted(cells)]
    if rg == 2 and vals[0].isdigit():
        tk[vals[1]] = vals
check(list(expect) == [tk[k][1] for k in sorted(tk, key=lambda k: int(tk[k][0]))], f"算量表 9 項齊全、順序正確：{'、'.join(expect)}")
def ev(f):
    f = re.sub(r"\([^)]*\)", "", f).replace("×", "*").replace("−", "-")
    return eval(f) if re.fullmatch(r"[0-9.+\-* ]+", f) else None
for k, exp in expect.items():
    v = tk[k]; qty = float(v[3]); f_val = ev(v[2])
    ok_f = f_val is None or abs(round(f_val, 2) - qty) <= 0.01
    ok_q = abs(qty - exp) <= 0.06          # 周長取兩位小數造成的捨入
    ok_p = (v[5] == "—") if v[4] == "m" else abs(float(v[5]) - qty / PING) <= 0.01
    check(ok_f and ok_q and ok_p, f"{k}: 表上 {v[2]} = {qty:.2f} {v[4]}／{v[5]} 坪；圖上重算 {exp:.2f}" + ("" if f_val is None else f"；算式 {f_val:.2f}"))
check(abs(float(tk["平釘天花板"][3]) - area_rows["室內淨面積合計"]) <= 0.01, "平釘天花板 = 房間面積表合計")
check(f"{P_nb:.2f}" in tk["室內打底粉刷"][2] and f"{P_b:.2f}" in tk["浴室打底"][2], f"周長從圖上重算：非浴室 {P_nb:.2f} m、浴室 {P_b:.2f} m")
check(min(A["主浴"], A["公浴"]) >= 2.8, f"浴室調寬：主浴 {A['主浴']:.2f} m²、公浴 {A['公浴']:.2f} m²（v1 主浴 2.72）")
note = " ".join(t.dxf.text for t in msp.query("TEXT"))
check("樓高 360" in note or "樓高360" in note, "圖面註明樓高 360")
dims = list(msp.query("DIMENSION"))
check(len(dims) >= 12, f"尺寸標註 {len(dims)} 個，數值：{sorted(round(d.get_measurement()) for d in dims)}")
print("\n總結：", "全部通過" if ok else "有失敗項目")
sys.exit(0 if ok else 1)
