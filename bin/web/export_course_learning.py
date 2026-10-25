#!/usr/bin/env python3
"""Project canonical CoursePacks, coverage and model states; no publication/grade."""
import argparse
import itertools
import json
from pathlib import Path
import sys
ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT/'packages/engine'))
from lessonos.study.four_courses import course_projection
from lessonos.study.activities import evaluate_activity

from lessonos.study.course_models import attach_model_cases


def projection(review=False):
 data=course_projection(review=review)
 for course in data['courses']:attach_model_cases(course)
 return data


def main():
 p=argparse.ArgumentParser();p.add_argument('--check',action='store_true');p.add_argument('--review',action='store_true');p.add_argument('--output',type=Path,default=ROOT/'apps/web/src/generated/courseLearningData.ts');a=p.parse_args()
 value='// Generated from canonical CoursePacks; never edit numeric answers here.\nexport const courseLearningData = '+json.dumps(projection(a.review),ensure_ascii=False,indent=2)+';\n'
 if a.check:
  if not a.output.is_file() or a.output.read_text()!=value:raise SystemExit('Course projection stale; regenerate from Core.')
 else:a.output.write_text(value)
 print('CoursePack projection checked' if a.check else 'CoursePack projection generated')
if __name__=='__main__':main()
