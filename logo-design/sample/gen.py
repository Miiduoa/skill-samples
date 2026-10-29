# 阿杏豆花 logo 三方向產生器（手寫幾何 + Noto CJK TC 字形轉外框，OFL 授權允許用於 logo）
from fontTools.ttLib import TTCollection
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
import os
import os; OUT=os.path.dirname(os.path.abspath(__file__))
SANS=TTCollection('/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc').fonts
SERIF=TTCollection('/usr/share/fonts/opentype/noto/NotoSerifCJK-Bold.ttc').fonts
def face(c):
    for f in c:
        if 'TC' in f['name'].getDebugName(1): return f
SANS,SERIF=face(SANS),face(SERIF)
def glyph(font,ch,x,y,size):
    """回傳字形 path；(x,y)=字身左上角，size=字身高"""
    gs=font.getGlyphSet(); name=font.getBestCmap()[ord(ch)]
    pen=SVGPathPen(gs,ntos=lambda v:('%.1f'%v).rstrip('0').rstrip('.')); s=size/1000
    tp=TransformPen(pen,(s,0,0,-s,x,y+880*s))
    gs[name].draw(tp); return pen.getCommands()
def text(font,s,x,y,size,track=0,vertical=False):
    d=[]
    for i,ch in enumerate(s):
        if vertical: d.append(glyph(font,ch,x,y+i*(size+track),size))
        else: d.append(glyph(font,ch,x+i*(size+track),y,size))
    return ' '.join(d)
def svg(vb,body,title):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" role="img"><title>{title}</title>{body}</svg>\n'
INK='#1F1A17'

# ---- A 軟口杏：自己用幾何拼「杏」，口 是一塊剛凝固、頂面微微下凹的豆花 ----
def A_symbol(fill=INK):
    bar='M36 58 H220 V82 H36 Z'                       # 橫
    stem='M116 22 H140 V128 H116 Z'                    # 豎
    # 撇、捺：45° 斜筆，寬 24
    pie='M116 84 L133 101 L66 150 L46 133 Z'
    na ='M140 84 L123 101 L190 150 L210 133 Z'
    # 口：外框圓角，頂邊是一道淺淺下凹的軟弧（豆花表面），內孔同樣下凹
    kou=('M76 166 Q128 180 180 166 Q194 163 194 177 V226 Q194 240 180 240 H76 Q62 240 62 226 V177 Q62 163 76 166 Z '
         'M86 192 Q128 202 170 192 V216 H86 Z')
    return f'<path fill="{fill}" d="{bar}"/><path fill="{fill}" d="{stem}"/><path fill="{fill}" d="{pie}"/><path fill="{fill}" d="{na}"/><path fill="{fill}" fill-rule="evenodd" d="{kou}"/>'

# ---- B 老招牌：直式招牌，阿杏 反白直排，招牌頂邊是第一刀刮下去的弧 ----
def B_symbol(fill=INK,bg='#FFFFFF'):
    board='M60 20 Q128 44 196 20 V222 Q196 236 182 236 H74 Q60 236 60 222 Z'
    chars=text(SERIF,'阿杏',84,50,88,track=-2,vertical=True)
    return f'<path fill="{fill}" fill-rule="evenodd" d="{board} {chars}"/>'

# ---- C 一刮：一塊豆花被平杓刮走一層，刮起的那片浮在上方 ----
def C_symbol(fill=INK):
    # 方塊右上角被一杓斜斜刮走（凹弧），刮起的那片薄片在右上方翹起
    block='M60 76 H118 Q132 150 208 160 V214 Q208 236 186 236 H60 Q38 236 38 214 V98 Q38 76 60 76 Z'
    slice_='M146 52 Q156 112 226 126 Q234 108 228 98 Q178 92 170 40 Q156 38 146 52 Z'
    return f'<g transform="translate(-6 -9)"><path fill="{fill}" d="{block} {slice_}"/></g>'

SYMS={'a-soft-kou':(A_symbol,'阿杏豆花 A 軟口杏'),'b-old-sign':(B_symbol,'阿杏豆花 B 老招牌'),'c-one-scrape':(C_symbol,'阿杏豆花 C 一刮')}
for k,(fn,t) in SYMS.items():
    open(f'{OUT}/{k}.svg','w').write(svg('0 0 256 256',fn(),t))
    # 橫式組合：符號 + 字標（思源黑體粗，轉外框）
    word=text(SANS if k!='b-old-sign' else SERIF,'阿杏豆花',300,74,108,track=8)
    open(f'{OUT}/{k}-lockup.svg','w').write(svg('0 0 780 256',f'<g>{fn()}</g><path fill="{INK}" d="{word}"/>',t+' 橫式'))
print('ok')
