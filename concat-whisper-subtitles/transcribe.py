import sys, time, json
from pywhispercpp.model import Model
m=sys.argv[1]
t=time.time()
model=Model(f'models/ggml-{m}.bin', n_threads=8, language='zh', print_progress=False, print_realtime=False)
tl=time.time()-t
t=time.time()
segs=model.transcribe('audio16k.wav')
tt=time.time()-t
out=[{"start":s.t0/100,"end":s.t1/100,"text":s.text.strip()} for s in segs]
json.dump({"model":m,"load_s":round(tl,2),"transcribe_s":round(tt,2),"segments":out},open(f'whisper_{m}.json','w'),ensure_ascii=False,indent=1)
print(m,'load',round(tl,2),'transcribe',round(tt,2),'segs',len(out))
for s in out: print(f"{s['start']:6.2f}-{s['end']:6.2f} {s['text']}")
