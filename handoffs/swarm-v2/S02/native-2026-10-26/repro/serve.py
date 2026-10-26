from pathlib import Path
import sys
import uvicorn
root=Path(__file__).resolve().parents[1]
sys.path[:0]=[str(root/'packages/engine'),str(root/'services/study-api')]
from study_api.app import create_app
app=create_app(root/'qa/data/study.sqlite',demo=True)
uvicorn.run(app,host='127.0.0.1',port=5421,log_level='warning')
