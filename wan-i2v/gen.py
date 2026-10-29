import sys,time,shutil
from gradio_client import Client, handle_file
space=sys.argv[1]; out=sys.argv[2]; dur=float(sys.argv[3]) if len(sys.argv)>3 else 5
P="Gentle wisps of steam slowly rise and curl from the hot latte in the ceramic cup, very slow smooth camera push-in toward the cup, soft morning window light, leaves sway slightly, realistic, stable cup and saucer, latte art stays intact, no text"
t=time.time()
c=Client(space)
r=c.predict(input_image=handle_file('input_latte.jpg'),prompt=P,steps=6,duration_seconds=dur,seed=int(sys.argv[4]) if len(sys.argv)>4 else 42,randomize_seed=False,api_name="/generate_video")
print(r, "elapsed %.1fs"%(time.time()-t))
v=r[0]['video'] if isinstance(r[0],dict) else r[0]
shutil.copy(v,out)
