"""Read-only bank audit; independent exact arithmetic, never scientific approval.

A deliberately small AST interpreter rechecks supported numeric substitutions.
It cannot solve arbitrary algebra or establish the suitability of a physical law.
Unsupported checks remain visible. No eval, CAS, provider or network at runtime.
"""
import ast
from collections import Counter
from copy import deepcopy
from fractions import Fraction
import hashlib
import json
from math import isqrt
import unicodedata

from ..question_bank import QuestionBank, approval_content_sha256, parse_rational

AUDIT_VERSION = 's04-quality-1'
COURSES = (
    ('strumenti-meccanica', 'Strumenti e meccanica', ('U1','U2'), 52),
    ('fluidi-termodinamica', 'Fluidi e termodinamica', ('U3','U5'), 57),
    ('elettricita-magnetismo', 'Elettricità e magnetismo', ('U6',), 33),
    ('onde-ottica-radiazioni', 'Onde, ottica e radiazioni', ('U4','U7'), 58),
)
QUARANTINE = frozenset({'invalid_schema','answer_mismatch','duplicate_content',
                        'missing_provenance','missing_unit','missing_solution_steps'})


def rational_expression(expression, values):
    """Evaluate at most 96 arithmetic nodes with exact, bounded fractions.

    sqrt is supported only when its value is an exact rational. Rejected syntax,
    unresolved symbols, irrational roots and arithmetic domains raise ValueError.
    """
    if not isinstance(expression,str) or not 1 <= len(expression) <= 512:
        raise ValueError('expression budget')
    try:
        tree = ast.parse(expression, mode='eval')
        if len(list(ast.walk(tree))) > 96:
            raise ValueError('node budget')
        def bounded(value):
            if value.numerator.bit_length() > 512 or value.denominator.bit_length() > 512:
                raise ValueError('fraction budget')
            return value
        def walk(node):
            if isinstance(node,ast.Constant) and type(node.value) in (int,float):
                number = parse_rational(ast.get_source_segment(expression,node))
                if number is None: raise ValueError('number budget')
                return number
            if isinstance(node,ast.Name):
                value = parse_rational(values.get(node.id))
                if value is None: raise ValueError('unresolved symbol')
                return value
            if isinstance(node,ast.UnaryOp) and isinstance(node.op,(ast.UAdd,ast.USub)):
                result = walk(node.operand)
                return result if isinstance(node.op,ast.UAdd) else -result
            if isinstance(node,ast.BinOp):
                left,right = walk(node.left),walk(node.right)
                if isinstance(node.op,ast.Add): result=left+right
                elif isinstance(node.op,ast.Sub): result=left-right
                elif isinstance(node.op,ast.Mult): result=left*right
                elif isinstance(node.op,ast.Div): result=left/right
                elif isinstance(node.op,ast.Pow) and right.denominator == 1 and abs(right) <= 12:
                    result=left**int(right)
                else: raise ValueError('unsupported operator')
                return bounded(result)
            if (isinstance(node,ast.Call) and isinstance(node.func,ast.Name)
                    and node.func.id == 'sqrt' and len(node.args) == 1 and not node.keywords):
                value=walk(node.args[0])
                if value < 0: raise ValueError('root domain')
                numerator,denominator=isqrt(value.numerator),isqrt(value.denominator)
                if numerator**2 != value.numerator or denominator**2 != value.denominator:
                    raise ValueError('irrational root')
                return Fraction(numerator,denominator)
            raise ValueError('unsupported syntax')
        return bounded(walk(tree.body))
    except (SyntaxError,TypeError,ZeroDivisionError,OverflowError,RecursionError,AttributeError) as error:
        raise ValueError('unsupported or invalid arithmetic') from error


def _numeric_status(question):
    answer=question.get('answer',{})
    if answer.get('kind') != 'rational': return 'NOT_APPLICABLE',[]
    exact=parse_rational(answer.get('exact'))
    checks=question.get('verification',{}).get('automaticChecks',[])
    verified=0
    unsupported=False
    for check in checks:
        try:
            kind=check.get('kind')
            if kind == 'substitution' and isinstance(check.get('values'),dict):
                result=rational_expression(check['expression'],check['values'])
            elif kind == 'ratio':
                numerator=parse_rational(check.get('numerator'))
                denominator=parse_rational(check.get('denominator'))
                if numerator is None or denominator is None or not denominator: raise ValueError('ratio')
                result=numerator/denominator
            elif kind is None and isinstance(check.get('expression'),str):
                result=rational_expression(check['expression'],{})
            else:
                unsupported=True
                continue
            # Do not use the generator's declared residual or expected result.
            if exact is None or result != exact: return 'FAILED',['answer_mismatch']
            verified+=1
        except (ValueError,KeyError,TypeError,AttributeError):
            unsupported=True
    if not verified or unsupported: return 'NOT_VERIFIED',['unsupported_check']
    return 'VERIFIED',[]


def _signature(question):
    def normalize(value):
        return ' '.join(unicodedata.normalize('NFC',value).split())
    # Preserve signs, exponents, case-sensitive units and option ordering: normalization is not a proof
    # that two genuinely different parameterized problems are duplicates.
    content=[normalize(question.get('prompt','')),
             [normalize(option.get('text','')) for option in question.get('options',[])]]
    return hashlib.sha256(json.dumps(content,ensure_ascii=False).encode()).hexdigest()


def audit_records(records, *, bank_sha256=None):
    """Return advisory metadata only; never mutate, approve or remove a record."""
    items=[]; signatures={}; families=set()
    for original in records:
        question=deepcopy(original)
        issues=[]
        try: QuestionBank._validate_question(question)
        except (ValueError,KeyError,TypeError,AttributeError): issues.append('invalid_schema')
        provenance=question.get('provenance',{})
        if (not isinstance(provenance,dict) or not provenance.get('kind')
                or not provenance.get('sources') or any(not source.get('sourceId') or not source.get('locator')
                    for source in provenance.get('sources',[]) if isinstance(source,dict))
                or any(not isinstance(source,dict) for source in provenance.get('sources',[]))):
            issues.append('missing_provenance')
        if not question.get('answer',{}).get('unit'): issues.append('missing_unit')
        if not question.get('solutionSteps') or any(not step.get('explanation','').strip()
                for step in question.get('solutionSteps',[])):
            issues.append('missing_solution_steps')
        numeric,more=_numeric_status(question);issues.extend(more)
        signature=_signature(question)
        family=question.get('familyId','UNKNOWN');families.add(family)
        row={'id':question['id'],'version':question['version'],'title':question.get('title',question['id']),
             'unitId':question.get('taxonomy',{}).get('unitId','UNKNOWN'),'familyId':family,
             'contentSha256':approval_content_sha256(question),'numericStatus':numeric,'issues':issues}
        signatures.setdefault(signature,[]).append(row)
        items.append(row)
    for group in signatures.values():
        if len(group)>1:
            for row in group: row['issues'].append('duplicate_content')
    for row in items: row['quarantined']=bool(QUARANTINE.intersection(row['issues']))
    items.sort(key=lambda row:row['id'])
    return {'auditVersion':AUDIT_VERSION,'bankSha256':bank_sha256,
            'editorialBaseline':{'total':200,'meaning':'internal_editorial_subobjectives','delta':0},
            'summary':{'records':len(items),'distinctRecords':len(signatures),'templateFamilies':len(families),
                       'quarantined':sum(row['quarantined'] for row in items),
                       'verifiedNumeric':sum(row['numericStatus']=='VERIFIED' for row in items),
                       'unverifiedNumeric':sum(row['numericStatus']=='NOT_VERIFIED' for row in items),
                       'failedNumeric':sum(row['numericStatus']=='FAILED' for row in items),
                       'notApplicableNumeric':sum(row['numericStatus']=='NOT_APPLICABLE' for row in items)},
            'courses':[{'id':identifier,'title':title,'unitIds':list(units),'requiredObjectives':required,
                        'records':sum(row['unitId'] in units for row in items),
                        'quarantined':sum(row['unitId'] in units and row['quarantined'] for row in items)}
                       for identifier,title,units,required in COURSES],
            'issueCounts':dict(sorted(Counter(issue for row in items for issue in row['issues']).items())),
            'limitations':['Controprova aritmetica distinta dal generatore; modello fisico non certificato.',
                           'I controlli non supportati non sono verificati; nessuna approvazione umana implicita.',
                           'I parametri strutturati non sono estratti dal testo: allineamento ai dati del problema da rivedere.',
                           'Duplicati testuali normalizzati, non prova di unicità semantica.',
                           'Famiglie di generazione, record e sotto-obiettivi editoriali sono conteggi distinti.'],
            'items':items}


def audit_bank(bank):
    return audit_records(bank._questions,bank_sha256=bank.sha256)
