#!/usr/bin/env python3
"""Run the unchanged producer validator with its output redirected outside git.

Only PACK (the source-map/report root) is redirected to a temporary facade;
sources remains a read-only symlink to original inputs. All validation logic,
bank bytes, assertions, and runtime code remain unchanged.
"""
import argparse
import contextlib
import io
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import types

sys.dont_write_bytecode = True


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--repo',type=Path,required=True)
    parser.add_argument('--output-dir',type=Path,required=True)
    parser.add_argument('--expected-commit',required=True)
    args=parser.parse_args()
    root=args.repo.resolve(strict=True)
    output=args.output_dir.resolve()
    if output.is_relative_to(root):raise ValueError('Output must be outside reviewed repository')
    head=subprocess.check_output(['git','-C',str(root),'rev-parse','HEAD'],text=True).strip()
    if head!=args.expected_commit:raise ValueError('Unexpected git HEAD')
    source=root/'bin/content/physics_bank/validate_bank.py'
    module=types.ModuleType('producer_validator_readonly')
    module.__file__=str(source)
    exec(compile(source.read_text(),str(source),'exec'),module.__dict__)
    capture=io.StringIO()
    failed=None
    with tempfile.TemporaryDirectory(prefix='ardesia-bank-validator-') as temporary:
        facade=Path(temporary)
        (facade/'sources').symlink_to(root/'packs/semestre-filtro-2026-27/sources',target_is_directory=True)
        module.PACK=facade
        try:
            with contextlib.redirect_stdout(capture):module.main()
        except SystemExit as error:
            failed=error.code
        output.mkdir(parents=True,exist_ok=True)
        (output/'validator.log').write_text(capture.getvalue())
        result=json.loads((facade/'reports/delivery-validation.json').read_text())
        result['independentRerunSourceCommit']=head
        result['outputRedirectedOutsideWorktree']=True
        (output/'delivery-validation-rerun.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({k:v for k,v in result.items() if k!='examSamples'},ensure_ascii=False,indent=2))
    if failed:raise SystemExit(failed)


if __name__=='__main__':main()
