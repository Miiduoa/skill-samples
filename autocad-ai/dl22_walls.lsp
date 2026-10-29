;;; dl22_walls.lsp — 斗六 22 坪三房兩廳（虛構示範）：建圖層 + 畫軸線 + 牆中心線
;;; 用法：AutoCAD 指令列輸入 APPLOAD 載入本檔 → 輸入 DL22 → Enter
;;; 單位 cm。只做最少：圖層、軸線、牆中心線（外牆 15、內牆 12 用不同圖層區分）。
;;; ※ 未在 AutoCAD 實測（我們沒有 AutoCAD）。只用 entmake / tblsearch 等基本 AutoLISP，
;;;   不依賴中文版指令名稱。AutoCAD LT 需 2024 以上 Windows 版才有 AutoLISP。

(defun dl22:layer (name color ltype / )
  (if (not (tblsearch "LAYER" name))
    (entmake (list '(0 . "LAYER") '(100 . "AcDbSymbolTableRecord") '(100 . "AcDbLayerTableRecord")
                   (cons 2 name) '(70 . 0) (cons 62 color) (cons 6 ltype))))
  name)

(defun dl22:line (p1 p2 layer)
  (entmake (list '(0 . "LINE") (cons 8 layer) (cons 10 p1) (cons 11 p2))))

(defun dl22:text (pt h str layer)
  (entmake (list '(0 . "TEXT") (cons 8 layer) (cons 10 pt) (cons 11 pt) (cons 40 h)
                 (cons 1 str) '(72 . 1) '(73 . 2))))

(defun c:DL22 ( / gx gy w)
  (setvar "INSUNITS" 5)                      ; cm
  (if (not (tblsearch "LTYPE" "CENTER"))
    (vl-catch-all-apply 'vla-load
      (list (vla-get-linetypes (vla-get-activedocument (vlax-get-acad-object))) "CENTER" "acadiso.lin")))
  (dl22:layer "S-GRID" 1 (if (tblsearch "LTYPE" "CENTER") "CENTER" "Continuous"))
  (dl22:layer "A-WALL-EXT-CL" 7 "Continuous")   ; 外牆中心線（厚 15）
  (dl22:layer "A-WALL-INT-CL" 8 "Continuous")   ; 內牆中心線（厚 12）
  (foreach n '("S-COLS" "A-DOOR" "A-GLAZ" "A-FURN" "A-PATT" "A-ANNO-DIMS" "A-ANNO-TEXT")
    (dl22:layer n 7 "Continuous"))
  ;; 軸線：X 1–5、Y A–D
  (setq gx '(("1" . 0.0) ("2" . 330.0) ("3" . 600.0) ("4" . 720.0) ("5" . 900.0)))
  (setq gy '(("A" . 0.0) ("B" . 330.0) ("C" . 480.0) ("D" . 810.0)))
  (foreach g gx
    (dl22:line (list (cdr g) -170.0 0.0) (list (cdr g) 980.0 0.0) "S-GRID")
    (dl22:text (list (cdr g) 1005.0 0.0) 22.0 (car g) "S-GRID"))
  (foreach g gy
    (dl22:line (list -170.0 (cdr g) 0.0) (list 1070.0 (cdr g) 0.0) "S-GRID")
    (dl22:text (list -195.0 (cdr g) 0.0) 22.0 (car g) "S-GRID"))
  ;; 牆中心線 (x0 y0 x1 y1 外/內)
  (foreach w '((0 0 900 0 E) (900 0 900 810 E) (900 810 0 810 E) (0 810 0 0 E)
               (0 480 900 480 I) (330 480 330 810 I) (600 480 600 810 I)
               (0 330 210 330 I) (210 330 210 480 I)
               (720 330 720 480 I) (720 330 900 330 I) (720 0 720 330 I))
    (dl22:line (list (float (nth 0 w)) (float (nth 1 w)) 0.0)
               (list (float (nth 2 w)) (float (nth 3 w)) 0.0)
               (if (= (nth 4 w) 'E) "A-WALL-EXT-CL" "A-WALL-INT-CL")))
  (command "_.ZOOM" "_E")
  (princ "\nDL22 完成：圖層 + 軸線 5×4 + 牆中心線 12 段。牆厚、門窗、家具請用 dl22_plan.dxf。")
  (princ))
(vl-load-com)
(princ "\n已載入，輸入 DL22 執行。")
(princ)
