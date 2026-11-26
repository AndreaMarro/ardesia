import subprocess,sys,shutil
for n in (2,3,4,5):
 assert shutil.disk_usage('.').free>=2*1024**3
 subprocess.run([sys.executable,'-B','/private/tmp/cric-c4-peer-persist.py',f'cric-c4-l{n:02}'],check=True)
