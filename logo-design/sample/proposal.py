from PIL import Image, ImageDraw, ImageFont
import cairosvg, io
import os; S=os.path.dirname(os.path.abspath(__file__))
F='/usr/share/fonts/opentype/noto/'
def f(sz,bold=False,serif=False):
    n=('NotoSerifCJK-' if serif else 'NotoSansCJK-')+('Bold' if bold else 'Regular')+'.ttc'
    return ImageFont.truetype(F+n,sz,index=3)
def png(svg,w,bg=None,recolor=None):
    s=open(svg).read()
    if recolor: s=s.replace('#1F1A17',recolor)
    return Image.open(io.BytesIO(cairosvg.svg2png(bytestring=s.encode(),output_width=w,background_color=bg))).convert('RGBA')
INK=(31,26,23); GREY=(120,114,108); LINE=(222,218,212)
W,H=2400,1760
im=Image.new('RGB',(W,H),'white'); d=ImageDraw.Draw(im)
def wrap(t,font,maxw):
    out,cur=[], ''
    for ch in t:
        if d.textlength(cur+ch,font=font)>maxw and ch not in '，。、；：）」': out.append(cur); cur=ch
        else: cur+=ch
    return out+[cur]
M=90
d.text((M,70),'阿杏豆花　標誌提案　第一輪',font=f(56,True),fill=INK)
d.text((M,150),'需求：斗六老字號豆花店，招牌要讓路過的人一眼記住。客戶明確不要：碗、湯匙、愛心。',font=f(30),fill=GREY)
d.text((W-M-d.textlength('先看形狀，顏色下一輪再談',font=f(26)),95),'先看形狀，顏色下一輪再談',font=f(26),fill=GREY)
d.line((M,215,W-M,215),fill=INK,width=3)
cards=[('a-soft-kou','A','軟口杏','字形標',
        '「杏」的口，是一塊剛凝固、頂面微凹的豆花。',
        '16px 時口的內框只剩一條縫，小尺寸版要加粗。',True),
       ('b-old-sign','B','老招牌','直式店招',
        '直式老招牌，頂邊是第一杓刮下去的那道弧。',
        '最接近同行常見的「古字＋印章」路線；16px 字會糊，小圖要改成只放「杏」。',False),
       ('c-one-scrape','C','一刮','抽象符號',
        '一塊豆花被平杓刮走一角，刮起的那片還翹在旁邊。',
        '沒看過豆花現刮的人，可能先看成被咬一口的方塊。',False)]
cw=(W-2*M-2*40)//3; top=250; ch=1060
for i,(k,L,name,typ,idea,risk,rec) in enumerate(cards):
    x=M+i*(cw+40)
    d.rounded_rectangle((x,top,x+cw,top+ch),radius=10,outline=INK if rec else LINE,width=4 if rec else 2)
    if rec:
        tag='建議採用'; tw=d.textlength(tag,font=f(24,True))
        d.rectangle((x+cw-tw-48,top,x+cw,top+46),fill=INK); d.text((x+cw-tw-24,top+6),tag,font=f(24,True),fill='white')
    sym=png(f'{S}/{k}.svg',400); im.paste(sym,(x+(cw-400)//2,top+50),sym)
    lk=png(f'{S}/{k}-lockup.svg',520); im.paste(lk,(x+(cw-520)//2,top+470),lk)
    # 實際尺寸
    yy=top+680; xx=x+40
    for sz in (64,32,16):
        t=png(f'{S}/{k}.svg',sz); im.paste(t,(xx,yy+(64-sz)),t)
        d.text((xx,yy+74),f'{sz}px',font=f(20),fill=GREY); xx+=sz+46
    # 反白
    rv=Image.new('RGBA',(64,64),INK+(255,)); w=png(f'{S}/{k}.svg',64,recolor='#FFFFFF')
    rv.paste(w,(0,0),w); im.paste(rv,(x+cw-40-64,yy)); d.text((x+cw-40-64,yy+74),'反白',font=f(20),fill=GREY)
    d.text((x+40,top+800),f'{L}　{name}',font=f(40,True),fill=INK)
    d.text((x+40+d.textlength(f'{L}　{name}',font=f(40,True))+18,top+816),typ,font=f(24),fill=GREY)
    y=top+868
    for ln in wrap(idea,f(27),cw-80): d.text((x+40,y),ln,font=f(27),fill=INK); y+=40
    y+=6
    for ln in wrap('風險：'+risk,f(23),cw-80): d.text((x+40,y),ln,font=f(23),fill=GREY); y+=34
# 刪掉的點子
y0=top+ch+50
d.text((M,y0),'刪掉的點子',font=f(34,True),fill=INK)
d.text((M+200,y0+10),'畫出來或縮小後會被看錯的，先拿掉',font=f(24),fill=GREY)
dropped=[('杏桃果實輪廓','縮小像桃子，跟愛心太近'),('一串粉圓','看起來像一串葡萄'),
         ('三層疊起的豆花片','排成弧形就是 Wi‑Fi 訊號'),('碗口冒三條蒸氣','碗不能用；三條蒸氣是溫泉符號'),
         ('糖水水滴','像自來水公司、水電行'),('花生粒點綴','16px 變成葫蘆或數字 8'),
         ('條紋布篷攤車','像馬戲團帳篷'),('黃豆冒嫩芽','像有機店、環保標章，跟甜品無關'),
         ('戴斗笠的阿嬤頭像','64px 糊成一團，也像農會、米店'),('C 第一版：凹頂方塊加一片','看起來是杯子，等於換個方式畫碗')]
colw=(W-2*M)//2; yb=y0+70
for j,(a,b) in enumerate(dropped):
    cx=M+(j%2)*colw; cy=yb+(j//2)*52
    d.line((cx,cy+20,cx+18,cy+20),fill=INK,width=3)
    d.text((cx+32,cy),a,font=f(26,True),fill=INK)
    d.text((cx+32+d.textlength(a,font=f(26,True))+20,cy+2),'— '+b,font=f(25),fill=GREY)
im.save(f'{S}/proposal.png'); print(im.size, yb+5*52)
