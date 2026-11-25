"""Shared integrity adapter for independently solved U5-05 state functions.

The existing reviewed_rows port remains the authority for payload and assets.
No candidate authoring module is imported; each family supplies its own model.
"""
from pathlib import Path
import ast
import re
from fractions import Fraction
import pint
import sympy as sp
from .pipeline import digest,sha
from .review_contract import reviewed_rows
from . import entropy_hot_cold_verifier as literals
SI=pint.UnitRegistry(non_int_type=Fraction)
APP=Path(__file__).resolve().parents[2]


def exact_literal(raw):
    """Decode bounded rational/radical literals without a binary-float roundtrip."""
    if not isinstance(raw,str) or len(raw)>60:raise ValueError('Bounded exact literal required')
    raw=re.sub(r'√([0-9]{1,4})',r'r(\1)',raw)
    raw=re.sub(r'(?<=\d)(?=r\()', '*',raw)
    if not re.fullmatch(r'[0-9r()+*/. \-]+',raw):raise ValueError('Unsupported numeric literal')
    tree=ast.parse(raw,mode='eval')
    if len(list(ast.walk(tree)))>80:raise ValueError('Literal too complex')
    def visit(node):
        if isinstance(node,ast.Constant) and type(node.value) in (int,float):
            segment=ast.get_source_segment(raw,node)
            if not re.fullmatch(r'(?:\d+(?:\.\d*)?|\.\d+)',segment):raise ValueError('Decimal or integer lexeme required')
            return sp.Rational(segment)
        if isinstance(node,ast.UnaryOp) and isinstance(node.op,(ast.UAdd,ast.USub)):
            value=visit(node.operand);return value if isinstance(node.op,ast.UAdd) else -value
        if isinstance(node,ast.BinOp):
            left,right=visit(node.left),visit(node.right)
            if isinstance(node.op,ast.Add):return left+right
            if isinstance(node.op,ast.Sub):return left-right
            if isinstance(node.op,ast.Mult):return left*right
            if isinstance(node.op,ast.Div) and right!=0:return left/right
        if isinstance(node,ast.Call) and isinstance(node.func,ast.Name) and node.func.id=='r' and len(node.args)==1 and not node.keywords:
            value=visit(node.args[0])
            if value.is_Integer and 0<=value<=10**4:return sp.sqrt(value)
        raise ValueError('Unsupported exact arithmetic node')
    value=visit(tree.body)
    if value.is_real is not True or value.is_finite is not True:raise ValueError('Non-real or non-finite result')
    return value


def verify(module,package,bindings,asset_root=None):
    if package.get('schema')!='astra/1':raise ValueError('Expected reviewed astra/1 package')
    expected=module.oracle();results=[]
    common=[]
    if digest(package)!=module.REVIEWED_PACKAGE_SHA256:common.append('Reviewed package edition changed')
    if digest(bindings)!=module.REVIEWED_BINDINGS_SHA256:common.append('Reviewed bindings edition changed')
    dependencies={Path(__file__).name:sha(Path(__file__).read_bytes()),Path(literals.__file__).name:sha(Path(literals.__file__).read_bytes())}
    for row,binding,signature,assets,errors in reviewed_rows(package,bindings,module.REVIEWED_CANDIDATES,module.EXPECTED_IDS,Path(asset_root) if asset_root else APP/'editorial/assets'):
        errors.extend(common);n=int(row['id'].rsplit('-',1)[1]);source_id='u5-'+module.FAMILY+f'-{n:02}'
        if binding.get('sourceRef')!=module.SOURCE_REF or binding.get('sourceId')!=source_id or binding.get('sourceSha256')!=module.READ_SOURCE_SHA256.get(source_id):errors.append('Independent pinned source binding mismatch')
        if row.get('course')!='C3' or row.get('skill')!='C3-L10':errors.append('Independent real course or primary skill mismatch')
        want=expected[n-1];answer=row['answer'];value=answer['value']
        if isinstance(want,str):
            if value!=want:errors.append('Independent conceptual key mismatch')
        else:
            def quantity(text):
                raw=str(text).replace('−','-').strip();suffix=module.SUFFIX.get(n,'')
                if raw in module.DIMENSIONLESS_DISTRACTORS.get(n,set()):return None
                if suffix:
                    if not raw.endswith(suffix):raise ValueError('Missing physical unit')
                    raw=raw.removesuffix(suffix).strip()
                if raw in module.EXACT_READ_EXPRESSIONS:return module.EXACT_READ_EXPRESSIONS[raw]
                return exact_literal(raw)
            try:
                actual=quantity(value)
                if actual is None or sp.simplify(actual-want)!=0:errors.append('Independent exact result mismatch')
                if answer['type']=='choice':
                    equivalents=[option for option in answer['options'] if (q:=quantity(option)) is not None and sp.simplify(q-want)==0]
                    if equivalents!=[value]:errors.append('Independent equivalent numeric alternatives')
            except (ValueError,TypeError,ZeroDivisionError,SyntaxError,RecursionError):errors.append('Independent answer or unit invalid')
        if answer['type']=='numeric' and (answer.get('unit')!=module.NUMERIC_UNITS.get(n) or answer.get('tolerance')!=0):errors.append('Independent numeric unit or exact tolerance mismatch')
        results.append({'id':row['id'],'sourceSha256':binding['sourceSha256'],'candidateSha256':digest(row),'reviewedSignature':signature,'assetChecksums':assets,'ok':not errors,'errors':errors,'expectedExact':str(want),'dimension':{str(k):str(v) for k,v in SI.Unit(module.UNITS[n]).dimensionality.items()},'manualArithmetic':module.MANUAL[n-1],'physicalAssumptions':module.ASSUMPTIONS,'distractors':module.DISTRACTORS[n-1],'pedagogicalReview':'Independent source-first derivation compared with complete authored reasoning, all options, hints and feedback. '+module.MANUAL[n-1],'scientificAssetReview':module.SVG_REVIEW if assets else 'No figure attached to this individual record. Full reasoning and formulas reviewed.','verificationMode':'AI_CONCEPTUAL' if isinstance(want,str) else 'EXACT_ORACLE','calculationScope':'NO_STUDENT_CALCULATION' if n==2 else 'EXACT_MANUAL_CALCULATION','reviewDependencySha256':dependencies,'methods':['SymPy_independent_state_function_inverse_and_domain','Pint_Fraction_exact_dimensions','source_first_manual_arithmetic_and_adversarial_options','independent_full_XML_and_native_asset_reading'],'humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE'})
    return results


def report(module,package,bindings,asset_root=None):
    return {'schemaVersion':'1.0.0','records':verify(module,package,bindings,asset_root),'verifierSha256':sha(Path(module.__file__).read_bytes()),'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},'sourceFirstPrimarySha256':module.PRIMARY_SHA256,'reviewedCandidateCommit':module.CANDIDATE_REF,'reviewer':'root_independent_reviewer_not_A_or_B_author','humanApproval':'NOT_RUN','publication':'DRAFT','publicationAction':'NONE'}
