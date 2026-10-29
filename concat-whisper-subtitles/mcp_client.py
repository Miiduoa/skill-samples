import json, subprocess, sys, time, os, threading
class MCP:
    def __init__(self, args=("concat","--mcp","headless"), env=None):
        e=dict(os.environ); e.update(env or {})
        self.p=subprocess.Popen(list(args),stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=open('/workspace/learn/concat-test/mcp_stderr.log','a'),text=True,bufsize=1,env=e)
        self.i=0
        self.req("initialize",{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"box-test","version":"0.1"}})
        self.note("notifications/initialized")
    def note(self,m,p=None):
        self.p.stdin.write(json.dumps({"jsonrpc":"2.0","method":m,**({"params":p} if p else {})})+"\n"); self.p.stdin.flush()
    def req(self,m,p=None,verbose=False):
        self.i+=1; rid=self.i
        self.p.stdin.write(json.dumps({"jsonrpc":"2.0","id":rid,"method":m,"params":p or {}})+"\n"); self.p.stdin.flush()
        while True:
            line=self.p.stdout.readline()
            if not line: raise RuntimeError("server closed")
            msg=json.loads(line)
            if msg.get("id")==rid: return msg
            if verbose: print("  <note>",json.dumps(msg,ensure_ascii=False)[:300],flush=True)
    def call(self,name,args=None,verbose=True):
        t=time.time()
        r=self.req("tools/call",{"name":name,"arguments":args or {},"_meta":{"progressToken":name}},verbose=verbose)
        dt=time.time()-t
        print(f"== {name} ({dt:.1f}s)",json.dumps(args or {},ensure_ascii=False)[:300],flush=True)
        out=r.get("result",r.get("error"))
        s=json.dumps(out,ensure_ascii=False)
        print(s[:600],flush=True)
        return out,dt
