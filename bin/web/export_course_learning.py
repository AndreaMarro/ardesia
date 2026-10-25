#!/usr/bin/env python3
"""Project canonical CoursePacks, coverage and model states; no publication/grade."""
import argparse
import hashlib
import math
import json
from pathlib import Path
import sys
ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT/'packages/engine'))
from lessonos.study.four_courses import course_projection

from lessonos.study.course_models import attach_model_cases


SOURCES=('activities.py','catalog.py','four_courses.py','course_models.py','electrical.py','waves.py','kinematics.py','thermodynamics.py','spring.py')


def transport_numbers(value):
 """Portable display transport:12 significant digits, sub1e-14 noise→zero.

 Core and HTTP calculations retain their full precision. Exact source hashes,
 pack hashes, strings and structural data remain part of the byte-level check.
 """
 if isinstance(value,float):
  if not math.isfinite(value):raise ValueError('nonfinite_course_projection')
  return 0.0 if abs(value)<1e-14 else float(format(value,'.12g'))
 if isinstance(value,list):return [transport_numbers(x) for x in value]
 if isinstance(value,dict):return {k:transport_numbers(v) for k,v in value.items()}
 return value


def projection(review=False):
 data=course_projection(review=review)
 for course in data['courses']:attach_model_cases(course)
 data['coreSourcesSha256']={name:hashlib.sha256((ROOT/'packages/engine/lessonos/study'/name).read_bytes()).hexdigest() for name in SOURCES}
 return transport_numbers(data)


def main():
 p=argparse.ArgumentParser();p.add_argument('--check',action='store_true');p.add_argument('--review',action='store_true');p.add_argument('--output',type=Path,default=ROOT/'apps/web/src/generated/courseLearningData.ts');a=p.parse_args()
 value='// Generated from canonical CoursePacks; never edit numeric answers here.\nexport const courseLearningData = '+json.dumps(projection(a.review),ensure_ascii=False,indent=2)+';\n'
 if a.check:
  if not a.output.is_file() or a.output.read_text()!=value:
   import difflib
   old=a.output.read_text() if a.output.is_file() else ''
   print(''.join(list(difflib.unified_diff(old.splitlines(True),value.splitlines(True),fromfile='stored',tofile='current-Core'))[:25]))
   raise SystemExit('Course projection stale; regenerate from Core.')
 else:a.output.write_text(value)
 print('CoursePack projection checked' if a.check else 'CoursePack projection generated')
if __name__=='__main__':main()
