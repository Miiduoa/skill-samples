# Headless Concat pipeline over MCP stdio: 9:16 project -> import -> fill -> captions (from whisper json) -> preview -> export
import json, time, sys, os, shutil
from mcp_client import MCP
ROOT='/workspace/learn/concat-test'
PROJ_LOC=f'{ROOT}/work/projects'; NAME=sys.argv[2] if len(sys.argv)>2 else 'nuni_concat_test'
SRC='/workspace/learn/_inbox/De6ytqsAPQp.mp4'
SEGS=json.load(open(sys.argv[1]))['segments']
os.makedirs(PROJ_LOC,exist_ok=True); shutil.rmtree(f'{PROJ_LOC}/{NAME}',ignore_errors=True)
T={}; t0=time.time()
m=MCP(env={'CONCAT_MCP_ROOTS':ROOT})
r,T['project_create']=m.call('project_create',{'location':PROJ_LOC,'name':NAME,'video':{'width':1080,'height':1920,'rateNum':30,'rateDen':1}})
P=f'{PROJ_LOC}/{NAME}'
r,T['media_import']=m.call('media_import',{'path':P,'file':SRC})
mid=r['structuredContent'].get('createdId')
r,_=m.call('timeline_read',{'path':P})
tl=r['structuredContent']; print('TL keys',list(tl.keys()))
vt=tl['timeline']['tracks'][-1]['id']; print('using track',vt)
r,T['clip_add']=m.call('clip_add',{'path':P,'mediaId':mid,'trackId':vt,'start':0})
cid=r['structuredContent'].get('createdId')
r,T['clip_frame']=m.call('clip_frame',{'path':P,'clipId':cid,'framing':'fill'})
caps=[{'start':s['start'],'end':s['end'],'text':s['text'].rstrip('?？')} for s in SEGS if s['text']]
style={'fontFamily':'"Noto Sans CJK TC"','fontWeight':700,'fontSize':0.034,'color':'#ffffff','background':'#000000b3','maxWidth':0.86}
r,T['captions_add']=m.call('captions_add',{'path':P,'captions':caps,'offsetY':0.40,'style':style},verbose=False)
r,T['project_save']=m.call('project_save',{'path':P})
r,T['preview_frame']=m.call('preview_frame',{'path':P,'time':5.0,'output':f'{ROOT}/screenshot_5s.png'})
t1=time.time()
r,_=m.call('export_start',{'path':P,'output':f'{ROOT}/concat_export_1080x1920.mp4','width':1080,'height':1920})
job=r['structuredContent'].get('job') or r['structuredContent']
while True:
    r,_=m.call('export_wait',{'path':P,'job':job,'timeoutSeconds':600} if isinstance(job,str) else {'path':P,'timeoutSeconds':600},verbose=False)
    st=r.get('structuredContent',{}).get('state')
    if st!='running': break
T['export']=time.time()-t1
T['total']=time.time()-t0
print('TIMES',json.dumps({k:round(v,2) for k,v in T.items()}))
json.dump({k:round(v,2) for k,v in T.items()},open(f'{ROOT}/work/times_{NAME}.json','w'))
m.call('project_close',{'path':P,'save':True})
