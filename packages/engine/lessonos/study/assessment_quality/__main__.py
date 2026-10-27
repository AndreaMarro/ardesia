"""python -m lessonos.study.assessment_quality --output /path/report.json"""
import argparse
import json
from pathlib import Path
from ..models import StudyError
from ..question_bank import load_bank
from .audit import audit_bank


def main():
    parser=argparse.ArgumentParser(description='Audit consultivo; non crea revisioni o pubblicazioni.')
    parser.add_argument('--output',type=Path)
    parser.add_argument('--fail-on-quarantine',action='store_true')
    args=parser.parse_args()
    try:report=audit_bank(load_bank())
    except StudyError as error:parser.exit(1,f'{error.code}: banca non caricabile; nessun audit attestato.\n')
    text=json.dumps(report,ensure_ascii=False,indent=2)+'\n'
    if args.output:args.output.write_text(text,encoding='utf-8')
    else:print(text,end='')
    return 2 if args.fail_on_quarantine and report['summary']['quarantined'] else 0


if __name__=='__main__':raise SystemExit(main())
