"""Finite model cases shared by HTTP and public CoursePack projections."""
import itertools
from .activities import evaluate_activity

GRIDS={
 'kinematics-v1':{'positionX':[0,5],'positionY':[0],'velocityX':[-2,3],'velocityY':[4],'accelerationX':[0],'accelerationY':[-2],'time':[2,4],'duration':[4]},
 'hooke-v1':{'force':[2,4,6,8],'stiffness':[20,40,80]},
 'ideal-gas-v1':{'moles':[.5,1],'temperatureK':[250,300,400],'pressurePa':[50000,100000,200000]},
 'dc-resistance-v1':{'voltage':[6,12,18],'resistance1':[4,6],'resistance2':[8,12],'topology':['series','parallel']},
 'harmonic-wave-v1':{'speed':[4,6],'frequency':[1,2,4],'amplitude':[.1],'phase':[0],'time':[0,.125,.25]},
}


def attach_model_cases(course):
 for lesson in course['lessons']:
  if lesson.get('activityId') not in GRIDS:continue
  grid=GRIDS[lesson['activityId']]
  lesson['modelCases']=[{'parameters':dict(zip(grid,values)),'result':evaluate_activity(lesson['activityId'],dict(zip(grid,values)))} for values in itertools.product(*grid.values())]
  lesson['controls']=grid
