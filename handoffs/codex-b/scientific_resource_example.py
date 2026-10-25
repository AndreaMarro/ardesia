#!/usr/bin/env python3
"""Authoring example using existing Core input/result contracts, not a new pack format.

Requires Python >=3.12 and PYTHONPATH=packages/engine. No signing or installation
is claimed: the consumer's immutable CoursePack and export remain authoritative.
"""
import argparse
import json
from pathlib import Path

from lessonos.study.electrical import evaluate_dc_circuit
from lessonos.study.kinematics import evaluate_kinematics
from lessonos.study.waves import evaluate_harmonic_wave


def main():
    handlers = {'dc-resistance-v1': evaluate_dc_circuit,
                'harmonic-wave-v1': evaluate_harmonic_wave,
                'kinematics-v1': evaluate_kinematics}
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('activity', choices=handlers)
    parser.add_argument('parameters', type=Path)
    parser.add_argument('--output', type=Path)
    args = parser.parse_args()
    result = handlers[args.activity](json.loads(args.parameters.read_text()))
    encoded = json.dumps(result, ensure_ascii=False, indent=2, allow_nan=False) + '\n'
    if args.output:
        args.output.write_text(encoded)
    else:
        print(encoded, end='')


if __name__ == '__main__':
    main()
