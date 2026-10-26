import json
from datetime import datetime,timezone
from pathlib import Path
from lessonos.study.independent_study.vendor.pyfsrs import Card,Rating,Scheduler
now=datetime(2026,10,26,tzinfo=timezone.utc)
scheduler=Scheduler(enable_fuzzing=False,maximum_interval=365)
card=Card(card_id=1,due=now);before=card.to_dict();outcomes={}
for rating in Rating:
 next_card,log=scheduler.review_card(card,rating,now)
 assert Card.from_json(next_card.to_json()).to_dict()==next_card.to_dict()
 outcomes[rating.name]={'delaySeconds':(next_card.due-now).total_seconds(),'state':int(next_card.state),'log':log.to_dict()}
assert card.to_dict()==before
logs=[];current=card
for rating in [Rating.Good,Rating.Good,Rating.Again]:
 current,log=scheduler.review_card(current,rating,current.due);logs.append(log)
replayed=scheduler.reschedule_card(current,logs)
assert replayed.to_dict()==current.to_dict()
try:scheduler.review_card(card,Rating.Good,datetime(2026,10,26))
except ValueError:naive_rejected=True
else:raise AssertionError('naive datetime accepted')
result={'component':'py-fsrs','version':'6.3.2','pin':'9446cb06605c597a063aeee49f7d188d42e34dc2','outcomes':outcomes,'previewInputUnchanged':card.to_dict()==before,'serializationRoundtrip':True,'threeReviewReplayExact':True,'naiveClockRejected':naive_rejected,'networkUsed':False,'optimizerImported':False}
Path(__file__).with_name('probe-result.local.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result))
