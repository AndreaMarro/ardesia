#!/usr/bin/env python3
"""Expand authored physical models into explicit, reproducible learning records.

Build-time only. Requires SymPy 1.14; runtime reads expanded JSON, never this file.
No numerical-only random augmentation: each model contributes sixteen named tasks.
"""
from __future__ import annotations

import argparse
import ast
from collections import Counter
from concurrent.futures import ProcessPoolExecutor
from functools import lru_cache
import hashlib
import json
from pathlib import Path
import re
import sys
import time
import unicodedata

import sympy as s

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
DEST = ROOT / 'packages/engine/lessonos/study/content/physics-semestre-2026-bank'
X, Z, Y, ALPHA, BETA = s.symbols('x z y alpha beta', positive=True)
LOCALS = {'x': X, 'z': Z, 'y': Y, 'pi': s.pi, 'sqrt': s.sqrt,
          'alpha': ALPHA, 'beta': BETA, 'log': s.log, 'exp': s.exp,
          'sin': s.sin, 'cos': s.cos, 'Abs': s.Abs}
LEVELS = ['base', 'facile', 'medio', 'difficile']
TITLES = ['Calcolo diretto', 'Controllo delle unità', 'Modello e concetto',
          'Confronto controllato', 'Risolvere per la prima grandezza',
          'Risolvere per la seconda grandezza', 'Rapporto fra due stati',
          'Individuare lo scarto', 'Ricavare una formula inversa',
          'Legge dei fattori di variazione', 'Variazioni simultanee',
          'Media di misure in due stati', 'Variazione compensata',
          'Taratura con un riferimento', 'Taratura con due riferimenti',
          'Vincolo fra le grandezze']
TASKS = ['direct_evaluation', 'dimensional_analysis', 'model_identification',
         'controlled_comparison', 'inverse_first_input', 'inverse_second_input',
         'single_change_ratio', 'diagnose_numeric_error', 'symbolic_inverse_first',
         'symbolic_joint_scaling', 'joint_change_ratio', 'mean_of_outputs',
         'compensated_change', 'reference_calibration', 'affine_calibration',
         'constrained_identifiability']
WHY = [
    'Una relazione fisica e una breve operazione, oppure il riconoscimento di una grandezza o di una condizione.',
    'Una relazione fisica, scelta della grandezza incognita e uno o due passaggi di algebra o confronto.',
    'Relazione simbolica, due condizioni confrontate o una media che richiede di tenere separati i passaggi.',
    'Più vincoli o una taratura da ricostruire prima di applicare il modello; serve controllare anche l’identificabilità.'
]


def canonical(obj):
    return json.dumps(obj, ensure_ascii=False, sort_keys=True, separators=(',', ':'), allow_nan=False)


def digest(obj):
    return hashlib.sha256(canonical(obj).encode()).hexdigest()


def parse(value):
    return s.sympify(str(value), locals=LOCALS, rational=True)


def exact(value):
    return s.sstr(s.simplify(value))


def nice(value, maximum=1000000):
    value = s.simplify(value)
    if value.is_real is not True or value.is_finite is not True:
        return False
    if value.is_Rational:
        return abs(value.p) <= maximum and value.q <= 1000
    return s.count_ops(value) <= 7 and abs(float(value)) <= maximum


def human(value, model=None):
    text = s.sstr(value) if isinstance(value, s.Basic) else str(value)
    if model:
        for token, var in [('x', model['x']), ('z', model['z']), ('y', model['y'])]:
            text = re.sub(r'\b' + token + r'\b', var['symbol'], text)
    text = text.replace('**', '^').replace('*', '·').replace('sqrt(', '√(')
    return text.replace('pi', 'π').replace('log(', 'ln(').replace('alpha', 'κ₁').replace('beta', 'κ₂')


def display_value(value, unit='1', model=None):
    return human(value, model) + ('' if unit in ('1', '', 'adimensionale') else ' ' + unit)


def label(model, which, value):
    var = model[which]
    return f"{var['symbol']} = {display_value(value, var['unit'])}"


def domain_ok(model, x, z):
    if x.is_real is not True or z.is_real is not True or x <= 0 or z <= 0:
        return False
    for variable in model.get('integerVariables', []):
        if {'x':x, 'z':z}[variable].is_integer is not True:
            return False
    domain = str(model.get('domain', 'x > 0 and z > 0'))
    # Authored inequalities, never executed as Python code.
    for fragment in re.split(r'\band\b|&&|;', domain):
        fragment = fragment.strip()
        if not fragment:
            continue
        if not re.fullmatch(r'[xyz0-9\s.<>=!+*/()\-]+', fragment):
            raise ValueError('Unrecognized domain condition: '+fragment)
        try:
            condition = parse(fragment).subs({X: x, Z: z})
            if condition is s.false or condition == False:
                return False
            if condition is not s.true and condition != True:
                raise ValueError('Unresolved domain condition: '+str(condition))
        except (TypeError, s.SympifyError) as exc:
            raise ValueError('Invalid domain condition: '+fragment) from exc
    return True


def numeric(model, x, z):
    return s.simplify(model['_expr'].subs({X: x, Z: z}))


def trace_expression(expr, values, model):
    """Show each actual arithmetic operation instead of hiding it in a result."""
    source = s.sstr(expr)
    tree = ast.parse(source, mode='eval').body
    rows = []
    names = {'x': X, 'z': Z, 'y': Y}

    def visit(node):
        if isinstance(node, ast.Constant) and type(node.value) in (int, float):
            return s.Rational(str(node.value)), str(node.value)
        if isinstance(node, ast.Name):
            if node.id == 'pi':
                return s.pi, 'π'
            symbol = names[node.id]
            value = values.get(symbol, symbol)
            return value, human(value, model)
        if isinstance(node, ast.UnaryOp) and isinstance(node.op, (ast.USub, ast.UAdd)):
            value, text = visit(node.operand)
            if isinstance(node.op, ast.USub):
                return -value, f'−({text})'
            return value, text
        if isinstance(node, ast.BinOp):
            a, ta = visit(node.left)
            b, tb = visit(node.right)
            if isinstance(node.op, ast.Add):
                value, op, why = a+b, '+', 'Sommiamo i contributi mantenendo il loro segno.'
            elif isinstance(node.op, ast.Sub):
                value, op, why = a-b, '−', 'Sottraiamo il secondo contributo dal primo; invertire l’ordine cambierebbe il segno.'
            elif isinstance(node.op, ast.Mult):
                value, op, why = a*b, '×', 'Moltiplichiamo i fattori; eventuali frazioni si possono semplificare prima del prodotto.'
            elif isinstance(node.op, ast.Div):
                value, op, why = a/b, '/', 'Dividiamo per il denominatore non nullo, conservando una frazione esatta.'
            elif isinstance(node.op, ast.Pow):
                value, op, why = a**b, '^', 'Calcoliamo prima la potenza: l’esponente si applica all’intera base fra parentesi.'
            else:
                raise ValueError('unsupported arithmetic')
            value = s.simplify(value)
            math = f'({ta}) {op} ({tb}) = {human(value, model)}'
            if not value.free_symbols:
                rows.append({'title': 'Operazione elementare', 'explanation': why, 'math': math})
            return value, human(value, model)
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Name):
            args = [visit(arg) for arg in node.args]
            func = LOCALS.get(node.func.id)
            if not callable(func):
                raise ValueError('unsupported function')
            value = s.simplify(func(*[a for a, _ in args]))
            shown = node.func.id + '(' + ', '.join(t for _, t in args) + ')'
            why = ('La radice richiesta è quella non negativa, perché stiamo usando moduli o grandezze positive.'
                   if node.func.id == 'sqrt' else
                   'Usiamo il valore esatto della funzione. Se resta un logaritmo o una costante, la risposta simbolica è intenzionale e non richiede una calcolatrice.')
            rows.append({'title': 'Funzione elementare', 'explanation': why,
                         'math': f'{human(shown)} = {human(value, model)}'})
            return value, human(value, model)
        raise ValueError('unsupported expression: ' + ast.dump(node))

    value, _ = visit(tree)
    if not rows:
        rows = [{'title': 'Sostituzione', 'explanation': 'La grandezza cercata coincide qui con il valore isolato.',
                 'math': human(value, model)}]
    return value, rows


def all_samples(model):
    if '_samples' in model:
        return model['_samples']
    supplied = model.get('samples', [])
    values = []
    for pair in supplied:
        if isinstance(pair, dict):
            pair = [pair['x'], pair['z']]
        x, z = map(parse, pair)
        if not domain_ok(model, x, z):
            continue
        v = numeric(model, x, z)
        if nice(v) and v > 0:
            values.append((x, z, v))
    # Deterministic small rational search; no corpus inflation by random values.
    for x in map(s.Rational, [1,2,3,4,5,6,8,10,12,16]):
        for z in map(s.Rational, [1,2,3,4,5,6,8,10,12,16]):
            if domain_ok(model,x,z):
                value = numeric(model,x,z)
                if nice(value,10000) and 0 < value <= 10000:
                    values.append((x,z,value))
    model['_samples']=list(dict.fromkeys(values))
    return model['_samples']


def inverses(model, variable):
    answers = s.solve(Y - model['_expr'], variable, check=True)
    answers = [s.simplify(a) for a in answers if not a.has(s.I)]
    if not answers:
        raise ValueError(model['id'] + ': cannot invert ' + str(variable))
    return answers


def select_inverse(model, variable, candidates, sample):
    x,z,y=sample
    target = x if variable == X else z
    for candidate in candidates:
        result=s.simplify(candidate.subs({X:x,Z:z,Y:y}))
        if s.simplify(result-target)==0:
            return candidate
    raise ValueError(model['id']+': no physical inverse at '+str(sample))


def pick_samples(model):
    samples=all_samples(model)
    ix=inverses(model,X)
    iz=inverses(model,Z)
    # Prefer distinct simple exact outputs with both independent variables varied.
    for a in samples:
        try:
            fx=select_inverse(model,X,ix,a)
            fz=select_inverse(model,Z,iz,a)
        except ValueError:
            continue
        same_x=[p for p in samples if p[0]==a[0] and p[1]!=a[1] and p[2]!=a[2]]
        same_z=[p for p in samples if p[1]==a[1] and p[0]!=a[0] and p[2]!=a[2]]
        both=[p for p in samples if p[0]!=a[0] and p[1]!=a[1] and p[2]!=a[2]]
        if same_x and same_z and both:
            b=same_x[0];c=same_z[0];d=both[0]
            return a,b,c,d,fx,fz,ix,iz
    raise ValueError(model['id']+': need nondegenerate simple exact samples varying both inputs')


def options_for(answer, kind, model, serial, custom=None):
    if custom:
        choices, correct = custom
        ordered=[(text,i==correct,None) for i,text in enumerate(choices)]
    else:
        if kind in ('rational','symbolic'):
            candidates=[answer,answer*2,answer/2,answer+1,answer-1,-answer,
                        s.Integer(0),s.Integer(1),1/answer if answer!=0 else s.Integer(3)]
            if kind=='symbolic':
                candidates += [X+Z,X-Z,X/Z,Z/X,Y+X,Y/Z]
            chosen=[]
            for value in candidates:
                value=s.simplify(value)
                if value.has(s.zoo,s.nan,s.oo,-s.oo):
                    continue
                if not any(s.simplify(value-v)==0 for v in chosen):
                    chosen.append(value)
                if len(chosen)==5:
                    break
            if len(chosen)!=5:
                raise ValueError('not enough distinct distractors')
            ordered=[(human(v,model),i==0,exact(v)) for i,v in enumerate(chosen)]
        else:
            raise ValueError('text options require candidates')
    if len(ordered)!=5 or len({v[0] for v in ordered})!=5:
        raise ValueError(model['id']+': repeated custom options')
    offset=int(hashlib.sha256((model['id']+str(serial)).encode()).hexdigest()[:8],16)%5
    ordered=ordered[offset:]+ordered[:offset]
    out=[];key=None
    for i,(text,correct,canonical_value) in enumerate(ordered):
        option={'id':chr(65+i),'text':text}
        if canonical_value is not None:
            option['exact']=canonical_value
        out.append(option)
        if correct:key=option['id']
    return out,key


def dimensions(model):
    # Exact declared SI dimensions are metadata, audited against physical law.
    unit=model['y']['unit']
    dimension=str(model['y'].get('dimension','')).replace(' ','')
    base_dimensions={'kg':'M','s':'T','m':'L','K':'Θ','A':'I','mol':'N','cd':'J'}
    aliases={'g':'M','mg':'M','µg':'M','cm':'L','mm':'L','µm':'L','nm':'L',
             'km':'L','min':'T','h':'T','ms':'T','°C':'Θ'}
    equivalent=aliases.get(unit,base_dimensions.get(unit,dimension))
    # A distractor may not be a dimensionally equivalent alternative, e.g. J
    # versus N·m for torque. Base units keep that ambiguity out of the item.
    alternatives=[unit]+[u for u,d in base_dimensions.items() if d!=equivalent]
    unique=[]
    for u in alternatives:
        if u not in unique:unique.append(u)
    return unique[:5]


def make_question(model,serial,prompt,answer,kind='rational',unit='1',steps=None,
                  fmt='multiple_choice',custom_options=None,verification=None,objective=None,
                  extra_assumption=None):
    if kind=='rational' and isinstance(answer,s.Basic) and not answer.is_Rational:
        kind='symbolic'
    level=LEVELS[serial//4]
    if kind!='rational':fmt='multiple_choice'
    assumptions=model['assumptions']+([extra_assumption] if extra_assumption else [])
    intro=model['context'].strip()
    conditions=' '.join(assumptions)
    question_prompt=(intro+'\n\n' if intro else '')+prompt+'\n\nIpotesi e convenzioni: '+conditions
    if fmt=='completion':
        question_prompt+='\nInserisci solo il numero esatto (è ammessa una frazione); l’unità richiesta è '+unit+'.'
    display=display_value(answer,unit,model)
    correct=None;opts=[]
    if fmt=='multiple_choice':
        opts,correct=options_for(answer,kind,model,serial,custom_options)
    if kind=='text':display=str(answer)
    answer_obj={'kind':kind,'exact':exact(answer) if kind!='text' else str(answer),
                'unit':unit,'text':display,'accepted':[exact(answer) if kind!='text' else str(answer)]}
    if kind=='rational' and answer.is_Rational:
        # Decimal aliases only where exact, without approximate acceptances.
        q=int(answer.q)
        while q%2==0:q//=2
        while q%5==0:q//=5
        if q==1:
            decimal=format(float(answer),'.12g')
            if s.Rational(decimal)==answer:
                answer_obj['accepted']+=sorted({decimal,decimal.replace('.',',')})
    if correct:answer_obj['correctOptionId']=correct
    outline=[
        {'title':'Capire il fenomeno','explanation':model['explanation']},
        {'title':'Scegliere la relazione e leggere i simboli',
         'explanation':(' '.join(model.get('derivation',[]))+' '+
            ('' if model.get('_standalone_concept') else
            f"Qui {model['x']['symbol']} indica {model['x']['name']}, in {model['x']['unit']}; "
            f"{model['z']['symbol']} indica {model['z']['name']}, in {model['z']['unit']}; "
            f"{model['y']['symbol']} indica {model['y']['name']}, in {model['y']['unit']}. "
            'I simboli rappresentano queste grandezze e non vanno scambiati con i loro valori numerici.')),
         'math':model['law']},
    ]
    if model.get('_omit_standard_exposition'):
        outline=[]
    outline=[step for step in outline if step['explanation'].strip() or step.get('math')]
    outline.extend(steps or [])
    outline.append({'title':'Risposta e significato',
                    'explanation':f'La risposta richiesta è {display}. '+
                    ('È un rapporto adimensionale: confronta due valori della stessa grandezza e non una nuova unità di misura.'
                     if unit=='1' and kind=='rational' and serial not in (0,4,5,7,13,14,15) else
                     'Va riferita alla grandezza esattamente richiesta nel testo. Il risultato resta valido nelle ipotesi indicate; cambiare il vincolo cambierebbe il problema.')})
    outline.append({'title':'Controllare ed evitare l’errore tipico',
                    'explanation':' '.join(model['traps'][:2])+' '+
                    ('Controlla che la risposta rispetti tutte le condizioni dichiarate e distingua il fenomeno fisico dalle parole usate per descriverlo.' if model.get('_standalone_concept') else
                    'Per controllare un risultato inverso, rimettilo nella relazione di partenza: deve riprodurre il dato assegnato, con le unità coerenti. Non basta che il numero sembri plausibile.')})
    sol='\n\n'.join('### '+str(i+1)+'. '+step['title']+'\n'+step['explanation']+
                    ('\n'+step['math'] if step.get('math') else '') for i,step in enumerate(outline))
    semantics={'physicalModel':model['id'],'lawFamily':model.get('lawFamily',model['id']),
               'reasoningTask':TASKS[serial],'requested':objective or TITLES[serial],
               'representation':'qualitative' if kind=='text' else 'symbolic' if kind=='symbolic' else 'exact_numeric',
               'constraints':assumptions}
    record={
        'id':model['id'].lower()+'-'+f'{serial+1:02}', 'version':1,'schemaVersion':'1.0.0',
        'bankId':'physics-semestre-2026','activityId':'physics-question-bank-v1','language':'it-IT',
        'title':model['title']+' — '+TITLES[serial], 'prompt':question_prompt,'format':fmt,
        'options':opts,'answer':answer_obj,'solution':sol,'solutionSteps':outline,
        'taxonomy':{key:model[key] for key in ('unitId','macroarea','microarea','topic')},
        'difficulty':{'level':level,'rank':serial//4+1,'reason':WHY[serial//4],
                      'calibrationStatus':'editorial_not_student_calibrated',
                      'conceptualLoad':serial//4+1,'algebraicLoad':1 if kind=='text' else serial//4+1,
                      'reasoningSteps':len(steps or [])},
        'descriptors':{'learningObjective':objective or TITLES[serial], 'reasoningTask':TASKS[serial],
            'representation':semantics['representation'],'calculatorAllowed':False,
            'estimatedSeconds':[45,70,110,160][serial//4],
            'prerequisites':model['prerequisites'],'misconceptions':model['traps'],
            'miniCourseIds':['sf-'+model['unitId'].lower(), 'sf-fisica-simulazioni'],
            'syllabusSubtopics':model.get('syllabusSubtopics',[]),
            'scope':model.get('scope','syllabus_core'),'assumptions':assumptions,
            'symbols':{} if model.get('_standalone_concept') else {k:model[k] for k in ('x','z','y')},
            'estimatedDifficultyIsEmpirical':False},
        'hints':['Individua la grandezza richiesta e le quantità che restano fissate.',
                 (model.get('derivation') or ['Collega ogni dato alla relazione fisica pertinente.'])[0],
                 model['law'] or 'Confronta tutte le alternative con le condizioni dichiarate nella domanda.'],
        'familyId':model['id'],'lawFamily':model.get('lawFamily',model['id']),
        'semanticSignature':digest(semantics),'semanticDescriptor':semantics,
        'status':'DRAFT','reviewer':None,
        'provenance':{'kind':'original_authored_model_expansion','authoringModelId':model['id'],
                      'authoringTaskId':TASKS[serial], 'sources':model['sourceRefs'],
                      'copiedQuestion':False,'aiAssisted':True,'createdOn':'2026-10-21'},
        'verification':{'arithmetic':'exact_sympy' if kind!='text' else 'not_applicable',
                        'automaticChecks':verification or [],'humanScientificReview':'NOT_RUN',
                        'semanticUniqueness':'structural_signature_and_normalized_text_checked',
                        'limitations':['Controlli algebrici non equivalgono a una revisione scientifica umana completa.']}
    }
    return record


def explain_step(title,text,math=None):
    return {'title':title,'explanation':text,**({'math':math} if math else {})}


def algebra_steps(model,var,answer,left=Y,right=None):
    """Expose algebraic equalities, including both sides of each operation."""
    right=model['_expr'] if right is None else right
    target=model['x' if var==X else 'z']
    rows=[explain_step('Scrivere l’equazione da risolvere',
        f"L’incognita è {target['name']}. Le altre grandezze sono dati: "
        'manteniamole indicate con i loro simboli mentre separiamo i termini.',
        f'{human(left,model)} = {human(right,model)}')]
    lhs,rhs=left,right
    for _ in range(12):
        if rhs==var:
            break
        new_left=None;new_right=None;why=None
        if rhs.is_Add:
            varying=[term for term in rhs.args if term.has(var)]
            if len(varying)==1:
                constant=s.simplify(rhs-varying[0])
                new_left=s.simplify(lhs-constant);new_right=varying[0]
                why=f'Sottraiamo {human(constant,model)} da entrambi i membri: il termine noto scompare dal membro che contiene l’incognita.'
        elif rhs.is_Mul:
            varying=[term for term in rhs.args if term.has(var)]
            if len(varying)==1:
                constant=s.simplify(rhs/varying[0])
                new_left=s.simplify(lhs/constant);new_right=varying[0]
                why=f'Dividiamo entrambi i membri per il fattore non nullo {human(constant,model)}. Il fattore si cancella dal prodotto che contiene l’incognita.'
        elif rhs.is_Pow:
            base,power=rhs.args
            if base.has(var) and not power.has(var):
                new_left=s.simplify(lhs**(1/power));new_right=base
                why=f'Invertiamo la potenza {human(power)} elevando entrambi i membri a {human(1/power)}. Per grandezze positive si sceglie il ramo positivo; le eventuali altre radici devono rispettare le ipotesi fisiche.'
            elif power.has(var) and not base.has(var):
                new_left=s.simplify(s.log(lhs)/s.log(base));new_right=power
                why=f'Applichiamo il logaritmo ai due membri. La regola ln(b^u)=u ln(b) permette di dividere per ln({human(base,model)}) e isolare l’esponente.'
        elif rhs.func==s.log and len(rhs.args)==1 and rhs.args[0].has(var):
            new_left=s.exp(lhs);new_right=rhs.args[0]
            why='Applichiamo l’esponenziale ai due membri: exp(ln u)=u per un argomento positivo. Il logaritmo è così eliminato senza approssimarlo.'
        if new_left is not None:
            lhs,rhs=new_left,new_right
            rows.append(explain_step('Applicare la stessa operazione ai due membri',why,
                f'{human(lhs,model)} = {human(rhs,model)}'))
            continue
        numerator,denominator=s.fraction(s.together(lhs-rhs))
        try:
            poly=s.Poly(numerator,var)
        except s.PolynomialError:
            break
        rows.append(explain_step('Eliminare il denominatore e raccogliere i termini',
            'Portiamo tutto a un membro e riduciamo a denominatore comune. Nel dominio dichiarato il denominatore è non nullo, quindi l’equazione equivale ad annullare il numeratore.',
            f'{human(s.expand(numerator),model)} = 0'))
        if poly.degree()==1:
            a,b=poly.all_coeffs()
            rows.extend([
                explain_step('Raccogliere il coefficiente dell’incognita',
                    f'I termini che contengono {target["symbol"]} vengono raccolti; gli altri sono il termine noto.',
                    f'({human(a,model)})·{target["symbol"]} + ({human(b,model)}) = 0'),
                explain_step('Spostare il termine noto',
                    'Sottraiamo il termine noto da entrambi i membri, conservando il segno.',
                    f'({human(a,model)})·{target["symbol"]} = {human(-b,model)}'),
                explain_step('Dividere per il coefficiente',
                    'Il coefficiente dell’incognita deve essere non nullo perché la misura determini un valore unico. Nel ramo fisico qui usato questa condizione è soddisfatta.',
                    f'{target["symbol"]} = ({human(-b,model)})/({human(a,model)}) = {human(answer,model)}')])
        elif poly.degree()==2:
            a,b,c=poly.all_coeffs();delta=s.simplify(b*b-4*a*c)
            rows.extend([
                explain_step('Individuare i coefficienti del quadratico',
                    'Confrontiamo l’equazione con A·u²+B·u+C=0. Il discriminante decide se le radici sono reali; il dominio fisico decide quali radici siano ammissibili.',
                    f'A={human(a,model)}; B={human(b,model)}; C={human(c,model)}; Δ=B²−4AC={human(delta,model)}'),
                explain_step('Applicare la formula risolutiva',
                    'Le radici matematiche sono u=(−B±√Δ)/(2A). Si conserva la radice che rispetta il segno e gli eventuali vincoli fra grandezze dichiarati nel testo.',
                    f'{target["symbol"]} = {human(answer,model)}')])
        else:
            nonzero=[(power[0],coefficient) for power,coefficient in poly.terms()]
            if len(nonzero)==2 and nonzero[-1][0]==0:
                degree,coef=nonzero[0];constant=nonzero[-1][1]
                rows.append(explain_step('Isolare la potenza e prenderne la radice',
                    f'Spostiamo il termine noto, dividiamo per {human(coef,model)} e prendiamo la radice di ordine {degree}. Il ramo deve rispettare le ipotesi.',
                    f'{target["symbol"]}^{degree} = {human(-constant/coef,model)}; {target["symbol"]} = {human(answer,model)}'))
            else:
                rows.append(explain_step('Selezionare la soluzione nel dominio',
                    'Si risolve l’equazione raccolta e si verifica la soluzione nella legge originaria, escludendo radici che annullano denominatori o violano le ipotesi.',
                    f'{target["symbol"]} = {human(answer,model)}'))
        break
    rows.append(explain_step('Leggere la formula isolata',
        'L’espressione finale risponde alla grandezza richiesta. La sua validità comprende le ipotesi fisiche del modello e le condizioni di esistenza delle divisioni, delle radici e dei logaritmi.',
        f'{target["symbol"]} = {human(answer,model)}'))
    return rows


def inverse_steps(model,var,expr,values):
    _,trace=trace_expression(expr,values,model)
    return [*algebra_steps(model,var,expr),*trace]


def evaluation_steps(model,sample,state):
    x,z,value=sample
    _,trace=trace_expression(model['_expr'],{X:x,Z:z},model)
    return [explain_step('Valutare lo stato '+state,
        'Sostituiamo nella legge soltanto i dati di questo stato. Le costanti e le ipotesi restano quelle dichiarate.',
        f"{label(model,'x',x)}; {label(model,'z',z)}"),*trace,
        explain_step('Conservare il risultato dello stato '+state,
        'Questo valore sarà usato nel confronto successivo, senza arrotondarlo.',
        f"{model['y']['symbol']}_{state} = {display_value(value,model['y']['unit'])}")]


@lru_cache(maxsize=1)
def load_overrides():
    result={}
    for path in sorted(HERE.glob('overrides_*.json')):
        payload=json.loads(path.read_text())
        for entry in payload if isinstance(payload,list) else payload['overrides']:
            by_serial=result.setdefault(entry['modelId'],{})
            if entry['serial'] in by_serial:
                raise ValueError('Repeated authored task override: '+entry['modelId'])
            by_serial[entry['serial']]=entry
    return result


def authored_question(model,entry):
    authored=dict(model)
    if entry.get('standalone') or entry.get('replaceStandardExposition'):
        authored['_standalone_concept']=True
        authored['context']=''
        authored['assumptions']=['Valgono le condizioni specificate nella domanda.']
        authored['law']=''
        authored['derivation']=[]
        authored['traps']=[]
        authored['_omit_standard_exposition']=bool(entry.get('replaceStandardExposition'))
    for field in ('context','assumptions','explanation','derivation','law','traps','scope','topic','microarea','syllabusSubtopics','prerequisites'):
        if field in entry:authored[field]=entry[field]
    serial=entry['serial'];answer=entry['answer'];kind=answer['kind']
    value=answer['exact'] if kind=='text' else parse(answer['exact'])
    custom=(entry['options'],entry['correctIndex']) if 'options' in entry else None
    checks=entry.get('verification',[])
    if isinstance(checks,dict):checks=[checks]
    record=make_question(authored,serial,entry['prompt'],value,kind=kind,unit=answer['unit'],
        steps=entry['steps'],custom_options=custom,fmt=entry.get('format','multiple_choice'),
        objective=entry['objective'],verification=checks)
    task=entry['reasoningTask']
    task_title=entry.get('taskTitle',entry.get('title',entry['objective']))
    record['title']=(task_title if authored.get('_standalone_concept')
                     else model['title']+' — '+task_title)
    record['descriptors']['reasoningTask']=task
    record['semanticDescriptor']['reasoningTask']=task
    record['semanticSignature']=digest(record['semanticDescriptor'])
    record['provenance']['authoringTaskId']=task
    record['provenance']['kind']='original_individually_authored_task'
    return record


def apply_authored_tasks(model,questions):
    for serial,entry in load_overrides().get(model['id'],{}).items():
        questions[serial]=authored_question(model,entry)
    return questions


def build_model(model):
    model=dict(model)
    model['assumptions']=list(model['assumptions'])
    domain_text=human(model.get('domain','x > 0 and z > 0'),model).replace(' and ',' e ')
    model['assumptions'].append('I valori numerici rispettano: '+domain_text+'.')
    for variable in model.get('integerVariables',[]):
        model['assumptions'].append(f"{model[variable]['symbol']} è un conteggio intero positivo.")
    model['_expr']=parse(model['formula'])
    if not {X,Z}<=model['_expr'].free_symbols:
        raise ValueError(model['id']+': both independent variables required')
    a,b,c,d,ix,iz,all_ix,all_iz=pick_samples(model)
    xa,za,ya=a;xb,zb,yb=b;xc,zc,yc=c;xd,zd,yd=d
    common={'reference':{'x':exact(xa),'z':exact(za),'y':exact(ya)},
            'formula':model['formula']}
    q=[]
    _,trace=trace_expression(model['_expr'],{X:xa,Z:za},model)
    q.append(make_question(model,0,
        f"Sono assegnati {label(model,'x',xa)} e {label(model,'z',za)}. "
        f"Quanto vale {model['y']['name']} ({model['y']['symbol']}) in {model['y']['unit']}?",
        ya,unit=model['y']['unit'],fmt='completion',steps=trace,
        verification=[{'kind':'substitution','expression':model['formula'],'values':common['reference'],'residual':'0'}]))

    units=dimensions(model)
    unit_model=dict(model)
    unit_model['context']=''
    unit_model['assumptions']=['Si chiede un’unità dimensionalmente compatibile con la grandezza indicata, fra le cinque alternative proposte.']
    q.append(make_question(unit_model,1,
        f"Nell’argomento «{model['topic']}» si considera {model['y']['name']}. "
        'Quale delle unità proposte è dimensionalmente adatta a esprimere questa grandezza? '
        'Un eventuale prefisso cambia la scala numerica dell’unità, non la sua dimensione fisica.',
        model['y']['unit'],kind='text',custom_options=(units,0),steps=[explain_step(
        'Separare il numero dall’unità',
        f"{model['y']['name'].capitalize()} si misura qui in {model['y']['unit']}. "
        f"La sua dimensione fisica è {model['y'].get('dimension','specificata dalla legge')}. "
        'Le costanti fisiche possono avere dimensioni proprie: non si possono cancellare soltanto perché non sono incognite. '
        'Si elevano a potenza anche le unità dei fattori elevati a potenza; una divisione si applica anche alle rispettive unità.')],
        verification=[{'kind':'declared_dimension','dimension':model['y'].get('dimension'),'editorialCheck':'model_source_review'}]))

    conceptual=model.get('conceptual')
    if conceptual:
        concept_model=dict(model)
        # Concept questions may explicitly change a physical condition. Their
        # explanation must not inherit a formula valid only in the old setup.
        concept_model['explanation']=conceptual['explanation']
        concept_model['_standalone_concept']=True
        concept_model['context']=conceptual.get('context','')
        concept_model['assumptions']=conceptual.get('assumptions',['Valgono le condizioni specificate nella domanda.'])
        concept_model['traps']=conceptual.get('traps',[])
        concept_model['derivation']=conceptual.get('derivation',[
            'Per questa domanda concettuale usiamo le condizioni specificate nella domanda. '
            'I parametri numerici del modello di riferimento servono soltanto a identificare il contesto.'])
        concept_model['law']=conceptual.get('law','Relazione concettuale: '+conceptual.get('objective','interpretare le condizioni dichiarate'))
        for field in ('context','assumptions','traps','scope'):
            if field in conceptual:concept_model[field]=conceptual[field]
        concept_model['topic']=conceptual.get('topic',conceptual.get('objective',model['topic']))
        for field in ('topic','microarea','syllabusSubtopics','prerequisites'):
            if field in conceptual:concept_model[field]=conceptual[field]
        q.append(make_question(concept_model,2,conceptual['prompt'],conceptual['options'][conceptual['correctIndex']],
            kind='text',custom_options=(conceptual['options'],conceptual['correctIndex']),
            steps=[explain_step('Identificare il criterio decisivo',
                'La scelta deve essere coerente con tutte le condizioni indicate, non soltanto con una parola chiave. '
                'Le alternative cambiano una relazione fisica, un verso o una condizione e vanno valutate con lo stesso criterio.')],objective=conceptual.get('objective')))
        q[-1]['provenance']['kind']='original_individually_authored_task'
        q[-1]['title']=conceptual.get('title',conceptual.get('objective',concept_model['topic']))
        q[-1]['provenance']['authoringTaskId']='conceptual_application'
        q[-1]['descriptors']['reasoningTask']='conceptual_application'
        q[-1]['semanticDescriptor']['reasoningTask']='conceptual_application'
        q[-1]['semanticSignature']=digest(q[-1]['semanticDescriptor'])
    else:
        q.append(make_question(model,2,
            f"Usando i simboli definiti nel testo, quale espressione fornisce correttamente "
            f"{model['y']['symbol']} nelle unità indicate? I coefficienti fissi sono già compresi nelle espressioni.",
            model['_expr'],kind='symbolic',unit=model['y']['unit'],steps=[explain_step('Tradurre il fenomeno in una relazione',
            'Occorre scegliere l’espressione che conserva contemporaneamente il ruolo dei fattori, '
            'le potenze, i termini da sommare e quelli da sottrarre. Un fattore due o un segno diverso '
            'non rappresenta una forma alternativa della stessa legge.',model['law'])]))

    direction='aumenta' if yc>ya else 'diminuisce' if yc<ya else 'resta invariata'
    choices=['aumenta','diminuisce','resta invariata','diventa necessariamente nulla','non è possibile confrontarla con i dati forniti']
    q.append(make_question(model,3,
        f"Si passa da {label(model,'x',xa)} a {label(model,'x',xc)}, mantenendo "
        f"{label(model,'z',za)} e le altre condizioni fisse. Che cosa accade a {model['y']['name']}?",
        direction,kind='text',custom_options=(choices,choices.index(direction)),steps=[
        *evaluation_steps(model,a,'A'),*evaluation_steps(model,c,'B'),
        explain_step('Cambiare una sola grandezza',
        f"Il controllo del confronto consiste nel mantenere davvero fissata {model['z']['name']}. "
        'Calcoliamo o confrontiamo i due membri della medesima legge, senza introdurre ipotesi diverse.',
        f"{model['y']['symbol']}_A = {human(ya)}; {model['y']['symbol']}_B = {human(yc)}"),
        explain_step('Leggere la direzione',f'Il secondo valore è {"maggiore" if yc>ya else "minore" if yc<ya else "uguale"} al primo: la grandezza {direction}. '
            'Questo giudizio descrive il confronto indicato, non qualsiasi esperimento in cui cambino contemporaneamente altre quantità.')]))

    for serial,var,other,value,inverse in [(4,X,'z',xa,ix),(5,Z,'x',za,iz)]:
        target=model['x' if var==X else 'z'];known=za if other=='z' else xa
        steps=inverse_steps(model,var,inverse,{X:xa,Z:za,Y:ya})
        steps.append(explain_step('Verifica per sostituzione',
            'Rimettiamo il valore trovato nella formula originale insieme al dato noto. '
            'Si deve ottenere esattamente il valore misurato, senza arrotondamenti.',
            f"{human(model['_expr'],model)} = {human(ya)}"))
        q.append(make_question(model,serial,
            f"La misura di {model['y']['name']} è {display_value(ya,model['y']['unit'])}; "
            f"si conosce {label(model,other,known)}. Determina {target['name']} nelle unità indicate. "
            'Si considera il ramo fisico positivo coerente con le ipotesi.',
            value,unit=target['unit'],fmt='completion',steps=steps,
            verification=[{'kind':'inverse_substitution','expression':exact(inverse),'residual':'0'}]))

    ratio=s.simplify(yb/ya)
    q.append(make_question(model,6,
        f"Nello stato A: {label(model,'x',xa)}, {label(model,'z',za)}. Nello stato B "
        f"rimane {label(model,'x',xa)}, mentre {label(model,'z',zb)}. "
        f"Calcola il rapporto {model['y']['symbol']}_B/{model['y']['symbol']}_A.",
        ratio,steps=[*evaluation_steps(model,a,'A'),*evaluation_steps(model,b,'B'),explain_step('Costruire un rapporto fra stati',
        'Il numeratore descrive il nuovo stato; il denominatore descrive quello iniziale. '
        'Le unità uguali si cancellano. Conservare l’ordine B/A è essenziale: A/B sarebbe il reciproco.',
        f'{human(yb)}/{human(ya)} = {human(ratio)}')],verification=[{'kind':'ratio','numerator':exact(yb),'denominator':exact(ya),'residual':'0'}]))

    reported=ya*2
    difference=s.simplify(reported-ya)
    q.append(make_question(model,7,
        f"Con {label(model,'x',xa)} e {label(model,'z',za)}, una soluzione propone "
        f"{model['y']['symbol']}_proposto = {display_value(reported,model['y']['unit'])}. "
        'Calcola lo scarto con segno «valore proposto meno valore corretto».',
        difference,unit=model['y']['unit'],steps=[*trace,explain_step('Definire lo scarto senza ambiguità',
        'Prima ricaviamo il risultato dalla legge, poi confrontiamo la proposta con quel risultato. '
        'Uno scarto positivo significa sovrastima; uno negativo significherebbe sottostima. '
        'Non stiamo chiedendo un errore percentuale.',f'{human(reported)} − {human(ya)} = {human(difference)}')]))

    for serial,var,inverse in [(8,X,ix)]:
        target=model['x' if var==X else 'z']
        q.append(make_question(model,serial,
            f"Si misura {model['y']['symbol']} e si conoscono le altre quantità della relazione "
            f"{model['law']}. Quale formula isola {target['symbol']} nel ramo fisico dichiarato? "
            'Tutte le grandezze indicate come positive vanno mantenute tali.',
            inverse,kind='symbolic',unit=target['unit'],steps=[*algebra_steps(model,var,inverse),
            explain_step('Controllare l’identità',
            'Sostituire questa espressione al simbolo isolato ricostruisce la relazione originale. '
            'La positività o il ramo geometrico specificato elimina le soluzioni matematiche incompatibili con il modello.')],
            verification=[{'kind':'symbolic_inverse','expression':exact(inverse),
                          'residual':exact(s.simplify(model['_expr'].subs(var,inverse)-Y))}]))

    scaled=model['_expr'].subs({X:ALPHA*X,Z:BETA*Z},simultaneous=True)
    scale_ratio=s.factor(s.cancel(scaled/model['_expr']))
    q.append(make_question(model,9,
        f"Da uno stato A con grandezze {model['x']['symbol']} e {model['z']['symbol']} "
        f"si passa a uno stato B in cui {model['x']['symbol']}_B = κ₁·{model['x']['symbol']} "
        f"e {model['z']['symbol']}_B = κ₂·{model['z']['symbol']}. I fattori κ₁ e κ₂ sono positivi "
        'e i due stati rispettano entrambi il dominio del modello. '
        f"Quale espressione dà il rapporto {model['y']['symbol']}_B/{model['y']['symbol']}_A? "
        'Nelle risposte, i simboli senza pedice indicano lo stato A.',
        scale_ratio,kind='symbolic',steps=[
            explain_step('Sostituire i fattori dentro la legge',
                'Ogni ingresso viene sostituito con il prodotto del suo valore iniziale per il relativo fattore. '
                'Una potenza agisce anche sul fattore che entra nella sua base; una somma conserva invece separati i propri termini.',
                f"{model['y']['symbol']}_B = {human(scaled,model)}"),
            explain_step('Dividere per il valore iniziale',
                'Costruiamo il quoziente nuovo/iniziale. Si possono semplificare fattori comuni di numeratore e denominatore, '
                'ma non cancellare termini separati da una somma o da una differenza.',
                f"({human(scaled,model)})/({human(model['_expr'],model)}) = {human(scale_ratio,model)}"),
            explain_step('Controllare il caso senza variazioni',
                'Ponendo κ₁=1 e κ₂=1 entrambi gli ingressi tornano allo stato iniziale; il rapporto deve diventare uno. '
                'Questo controllo è necessario e non sostituisce i passaggi di sostituzione appena eseguiti.',
                f'rapporto(κ₁=1, κ₂=1) = {human(s.simplify(scale_ratio.subs({ALPHA:1,BETA:1})))}')],
        verification=[{'kind':'symbolic_scaling','expression':exact(scale_ratio),'residual':'0'}]))

    joint=s.simplify(yd/ya)
    q.append(make_question(model,10,
        f"Nello stato iniziale A si hanno {label(model,'x',xa)} e {label(model,'z',za)}. "
        f"Nello stato B si hanno {label(model,'x',xd)} e {label(model,'z',zd)}. "
        f"Qual è il rapporto {model['y']['symbol']}_B/{model['y']['symbol']}_A? "
        'Qui cambiano entrambe le grandezze: ogni altro parametro resta fissato.',
        joint,fmt='completion',steps=[*evaluation_steps(model,a,'A'),*evaluation_steps(model,d,'B'),explain_step('Tenere separati i due effetti',
        'Non basta seguire la prima variazione: la seconda può rafforzarla o compensarla. '
        'Scriviamo la legge prima per A, poi per B, e soltanto dopo facciamo il rapporto.',
        f"{model['y']['symbol']}_A={human(ya)}; {model['y']['symbol']}_B={human(yd)}"),
        explain_step('Confrontare gli stati completi',
        'Il confronto è adimensionale e conserva il verso nuovo/iniziale. Non sommiamo fattori di variazione che nella legge si moltiplicano.',
        f'{human(yd)}/{human(ya)} = {human(joint)}')]))

    mean=s.simplify((ya+yd)/2)
    q.append(make_question(model,11,
        f"Si registrano due letture con uguale peso statistico. La prima usa {label(model,'x',xa)}, "
        f"{label(model,'z',za)}; la seconda usa {label(model,'x',xd)}, {label(model,'z',zd)}. "
        f"Qual è la media aritmetica delle due letture di {model['y']['name']}? "
        'Calcola prima ogni lettura: non è richiesta la risposta del modello alle medie degli ingressi.',
        mean,unit=model['y']['unit'],steps=[*evaluation_steps(model,a,'A'),*evaluation_steps(model,d,'B'),explain_step('Calcolare prima le due uscite',
        'La media di una grandezza trasformata non coincide in generale con la trasformazione degli ingressi medi. '
        'Per questo calcoliamo separatamente i due valori fisici osservati.',
        f'y_A={human(ya)}; y_B={human(yd)}'),explain_step('Attribuire lo stesso peso alle letture',
        'Due letture equiponderate contribuiscono ciascuna per metà. Si sommano valori della stessa grandezza e poi si divide per due.',
        f'({human(ya)} + {human(yd)})/2 = {human(mean)}')]))

    invd=select_inverse(model,Z,all_iz,d)
    zratio=s.simplify(zd/za)
    q.append(make_question(model,12,
        f"La condizione iniziale è {label(model,'x',xa)}, {label(model,'z',za)}. "
        f"Si impone poi {label(model,'x',xd)} e si vuole che la grandezza d’uscita "
        f"diventi {human(joint)} volte quella iniziale. Quale rapporto "
        f"{model['z']['symbol']}_B/{model['z']['symbol']}_A è necessario?",
        zratio,fmt='completion',steps=[*evaluation_steps(model,a,'A'),explain_step('Ricostruire l’obiettivo fisico',
        'Il fattore assegnato riguarda l’uscita: prima trasformiamolo in un valore della stessa grandezza. '
        'Poi imponiamo il nuovo valore della prima variabile e risolviamo per la seconda.',
        f'{human(joint)} × {human(ya)} = {human(yd)}'),
        *inverse_steps(model,Z,invd,{X:xd,Z:zd,Y:yd}),
        explain_step('Tornare al rapporto richiesto',
        'Il valore dell’incognita non è ancora la risposta richiesta: bisogna dividerlo per il valore iniziale della medesima grandezza.',
        f'{human(zd)}/{human(za)} = {human(zratio)}')]))

    invx_d=select_inverse(model,X,all_ix,d)
    signal_a=3*ya;signal_d=3*yd
    q.append(make_question(model,13,
        f"Uno strumento misura {model['y']['symbol']} con legge S_strum = a_cal·{model['y']['symbol']}, "
        'dove a_cal è un fattore di taratura positivo sconosciuto e non c’è offset. '
        f"Nel riferimento {label(model,'x',xa)}, {label(model,'z',za)}, legge S_strum={human(signal_a)}. "
        f"In una nuova prova legge S_strum={human(signal_d)} e si conosce {label(model,'z',zd)}. "
        f"Determina {model['x']['name']} nella nuova prova. Le letture S_strum sono espresse nella stessa unità strumentale.",
        xd,unit=model['x']['unit'],fmt='completion',steps=[
        *evaluation_steps(model,a,'A'),
        explain_step('Calcolare il riferimento reale',
        'La lettura strumentale non è ancora il valore fisico: il riferimento noto permette di ricavare la sensibilità dello strumento.',
        f'{model["y"]["symbol"]}_A={human(ya)}; a_cal=S_strum,A/{model["y"]["symbol"]}_A={human(signal_a)}/{human(ya)}=3'),
        explain_step('Correggere la seconda lettura',
        'Lo stesso fattore moltiplica tutte le letture. Per ritrovare la grandezza fisica dividiamo la nuova lettura per il fattore, senza cambiarne il valore fra le prove.',
        f'{human(signal_d)}/3 = {human(yd)}'),
        *inverse_steps(model,X,invx_d,{X:xd,Z:zd,Y:yd})]))

    # The third state differs from both references in its output where possible.
    third=next((v for v in all_samples(model) if v[2] not in (ya,yd) and v[0]!=xa),c)
    xt,zt,yt=third
    invt=select_inverse(model,X,all_ix,third)
    sa=2*ya+1;sd=2*yd+1;st=2*yt+1
    q.append(make_question(model,14,
        f"Lo strumento obbedisce a S_strum = a_cal·{model['y']['symbol']} + b_cal, con a_cal e b_cal ignoti ma costanti. "
        f"Riferimento A: {label(model,'x',xa)}, {label(model,'z',za)}, S_strum={human(sa)}. "
        f"Riferimento B: {label(model,'x',xd)}, {label(model,'z',zd)}, S_strum={human(sd)}. "
        f"Prova C: {label(model,'z',zt)}, S_strum={human(st)}. Trova {model['x']['name']} nella prova C. "
        'Le letture S_strum sono nella medesima unità strumentale; l’offset non è stato sottratto.',
        xt,unit=model['x']['unit'],steps=[
        *evaluation_steps(model,a,'A'),*evaluation_steps(model,d,'B'),
        explain_step('Tradurre i riferimenti in valori fisici',
        'La legge fisica fornisce due valori veri; la legge dello strumento associa a essi due letture. '
        'Occorre identificare sia il fattore sia l’offset: una sola coppia non basterebbe.',
        f'y_A={human(ya)}; y_B={human(yd)}'),
        explain_step('Eliminare l’offset con una differenza',
        'Sottraendo le due equazioni dello strumento, b_cal si cancella. Dividiamo quindi la variazione della lettura per la variazione fisica.',
        f'a_cal=({human(sd)}−{human(sa)})/({human(yd)}−{human(ya)})=2'),
        explain_step('Recuperare l’offset',
        'Usiamo uno dei riferimenti e togliamo dalla lettura la parte proporzionale alla grandezza fisica.',
        f'b_cal={human(sa)}−2×{human(ya)}=1'),
        explain_step('Decodificare la prova C',
        'Prima sottraiamo l’offset, poi dividiamo per la sensibilità. Dividere per a_cal senza togliere b_cal darebbe una grandezza fisica errata.',
        f'y_C=({human(st)}−1)/2={human(yt)}'),
        *inverse_steps(model,X,invt,{X:xt,Z:zt,Y:yt})]))

    # Some physical constraints require a separate authored task: forcing the
    # same equation type onto an exponential can create a calculator problem.
    if 15 in load_overrides().get(model['id'],{}):
        q.append(authored_question(model,load_overrides()[model['id']][15]))
        return apply_authored_tasks(model,q)

    # A numerical ratio of input values is dimensional when input units differ.
    k=s.simplify(xa/za)
    constrained=s.simplify(model['_expr'].subs(X,k*Z))
    if (constrained.has(Z) and not constrained.is_algebraic_expr(Z)
            and model['id']!='U7-two-layer-transmission'):
        raise ValueError(model['id']+': authored task required for a transcendental coupled constraint; solver branches are not assumed complete')
    values=s.solve(constrained-ya,Z) if constrained.has(Z) else []
    valid=[]
    for value in values:
        if value.is_real is True and value.is_positive is True and domain_ok(model,k*value,value):
            valid.append(s.simplify(value))
    if constrained.has(Z):
        if not any(s.simplify(value-za)==0 for value in valid):
            raise ValueError(model['id']+': constrained solve lost the known physical root')
        probes={parse(value) for value in ['1/4','1/2','1','2','3','4','5','8','10','16']}
        probes.update(sample[1] for sample in all_samples(model))
        for value in probes:
            if (domain_ok(model,k*value,value) and s.simplify(constrained.subs(Z,value)-ya)==0
                    and not any(s.simplify(value-root)==0 for root in valid)):
                raise ValueError(model['id']+': constrained solver omitted a second admissible root: '+str(value))
    constraint_text=(f"I valori numerici nelle unità dichiarate devono soddisfare "
        f"{model['x']['symbol']} = {human(k)}·{model['z']['symbol']}. "
        'Il coefficiente del vincolo ha l’unità necessaria a collegare le due grandezze. ')
    if not constrained.has(Z):
        choices=['Infinite coppie positive compatibili con il vincolo','Una sola coppia positiva',
                 'Nessuna coppia positiva','Esattamente due coppie positive','È necessario porre entrambe le grandezze uguali a zero']
        q.append(make_question(model,15,constraint_text+
            f"Si misura inoltre {model['y']['symbol']}={display_value(ya,model['y']['unit'])}. "
            'Quante coppie di valori positivi sono determinate da questi dati, nel dominio dichiarato?',
            choices[0],kind='text',custom_options=(choices,0),steps=[
            explain_step('Usare il vincolo prima di risolvere',
            'Sostituiamo il vincolo nella legge. Tutta la dipendenza dalla grandezza libera si cancella: '
            'la misura è quindi una conferma del vincolo, non una seconda informazione indipendente.',
            f'{human(constrained)} = {human(ya)}'),
            explain_step('Riconoscere la mancanza di identificabilità',
            'Si può scegliere un valore positivo ammesso della seconda grandezza e ricavare la prima dal vincolo. '
            'Cambiare entrambe coerentemente mantiene lo stesso risultato. Servirebbe una misura indipendente per individuare una coppia specifica.')]))
    elif len(valid)==1:
        ans=valid[0]
        q.append(make_question(model,15,constraint_text+
            f"L’uscita misurata è {model['y']['symbol']}={display_value(ya,model['y']['unit'])}. "
            f"Determina {model['z']['name']} nel dominio fisico positivo.",ans,unit=model['z']['unit'],
            steps=[explain_step('Ridurre a una sola incognita',
            'Le grandezze di ingresso non sono più indipendenti. Il vincolo permette di sostituire la prima nella legge, '
            'ottenendo un’equazione soltanto nella seconda.',f'{human(constrained,model)} = {human(ya)}'),
            *algebra_steps(model,Z,ans,left=ya,right=constrained),
            explain_step('Risolvere e ricostruire l’altra grandezza',
            'Risolviamo l’equazione nel dominio ammesso e poi controlliamo anche il vincolo iniziale. '
            'Una radice con segno incompatibile non è una soluzione fisica.',
            f"{model['z']['symbol']}={human(ans)}; {model['x']['symbol']}={human(k*ans)}")],
            verification=[{'kind':'constrained_equation','expression':exact(constrained),'root':exact(ans),'residual':'0'}]))
    else:
        # Multiple roots are reported, not silently discarded.
        choices=[str(len(valid)),str(len(valid)+1),str(len(valid)+2),'0' if valid else '3','Infinite']
        choices=list(dict.fromkeys(choices))
        for v in ['1','2','3','4','5']:
            if len(choices)==5:break
            if v not in choices:choices.append(v)
        q.append(make_question(model,15,constraint_text+
            f"Si misura {model['y']['symbol']}={display_value(ya,model['y']['unit'])}. "
            'Quante soluzioni reali positive, distinte e ammesse dalle ipotesi soddisfano entrambe le condizioni?',
            str(len(valid)),kind='text',custom_options=(choices,0),steps=[explain_step('Contare solo le radici ammissibili',
            'La relazione vincolata va risolta prima di decidere se la risposta sia unica. '
            'Si eliminano le radici negative, complesse o fuori dal dominio; le altre non possono essere scartate arbitrariamente.',
            f'{human(constrained,model)}={human(ya)}; soluzioni: '+', '.join(human(v) for v in valid))]))
    return apply_authored_tasks(model,q)


def normalize_prompt(text):
    text=unicodedata.normalize('NFKC',text).casefold()
    text=re.sub(r'\d+(?:[.,]\d+)?','<n>',text)
    return re.sub(r'\s+',' ',text).strip()


def validate(records, expected=None):
    errors=[]
    for name,key in [('ID',lambda q:q['id']),('testo',lambda q:q['prompt']),
                     ('struttura del testo',lambda q:normalize_prompt(q['prompt'])),
                     ('firma strutturale',lambda q:q['semanticSignature'])]:
        groups={}
        for question in records:
            groups.setdefault(key(question),[]).append(question['id'])
        for ids in groups.values():
            if len(ids)>1:errors.append(f'Duplicato {name}: '+', '.join(ids))
    counts=Counter(q['difficulty']['level'] for q in records)
    if expected and len(records)!=expected:errors.append(f'Count {len(records)} != {expected}')
    if expected==4000 and counts!={v:1000 for v in LEVELS}:errors.append('Difficulty quota: '+str(counts))
    lengths=[]
    for q in records:
        words=len(re.findall(r'\w+',q['solution']))
        lengths.append(words)
        if words<170:errors.append(q['id']+': spiegazione troppo breve '+str(words))
        if q['format']=='multiple_choice':
            if len(q['options'])!=5:errors.append(q['id']+': expected five options')
            if sum(o['id']==q['answer']['correctOptionId'] for o in q['options'])!=1:errors.append(q['id']+': bad correct ID')
            nums=[parse(o['exact']) for o in q['options'] if 'exact' in o]
            if any(s.simplify(a-b)==0 for i,a in enumerate(nums) for b in nums[i+1:]):errors.append(q['id']+': equivalent options')
        elif q['answer']['kind']!='rational' or not parse(q['answer']['exact']).is_Rational:
            errors.append(q['id']+': completion is not exact rational')
        if q['descriptors']['calculatorAllowed'] is not False:errors.append(q['id']+': calculator')
    return {'ok':not errors,'errors':errors,'questionCount':len(records),'byDifficulty':dict(counts),
            'byUnit':dict(Counter(q['taxonomy']['unitId'] for q in records)),
            'byFormat':dict(Counter(q['format'] for q in records)),
            'familyCount':len({q['familyId'] for q in records}),
            'solutionWords':{'minimum':min(lengths) if lengths else 0,'maximum':max(lengths) if lengths else 0,
                             'total':sum(lengths)},
            'duplicatePolicy':'Exact text, digit-normalized full prompt, explicit reasoning signature. This is not an exhaustive semantic proof.',
            'humanScientificReview':'NOT_RUN','difficultyCalibration':'NOT_RUN'}


def build_result(model):
    try:
        return build_model(model), None
    except Exception as exc:
        return [], {'model': model['id'], 'error': str(exc)}


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--models',nargs='*')
    parser.add_argument('--only')
    parser.add_argument('--expected',type=int)
    parser.add_argument('--shard-size',type=int,default=160)
    parser.add_argument('--jobs',type=int,default=1)
    parser.add_argument('--output',type=Path,default=DEST)
    args=parser.parse_args()
    if not 1 <= args.shard_size <= 1000:
        raise SystemExit('shard-size must be between 1 and 1000')
    if not 1 <= args.jobs <= 8:
        raise SystemExit('jobs must be between 1 and 8')
    paths=[Path(p) for p in args.models] if args.models else sorted(HERE.glob('models_*.json'))
    models=[]
    for path in paths:
        payload=json.loads(path.read_text())
        models.extend(payload if isinstance(payload,list) else payload['models'])
    if args.only:models=[m for m in models if args.only in m['id']]
    ids=[m['id'] for m in models]
    if len(ids)!=len(set(ids)):raise SystemExit('Duplicate model IDs')
    records=[];failures=[]
    pool=ProcessPoolExecutor(max_workers=args.jobs) if args.jobs>1 else None
    outcomes=pool.map(build_result,models) if pool else map(build_result,models)
    try:
        for index,(model,(questions,failure)) in enumerate(zip(models,outcomes)):
            records.extend(questions)
            if failure:
                failures.append(failure)
                print('ERROR '+model['id']+': '+failure['error'],flush=True)
            else:
                print(f'{index+1}/{len(models)} {model["id"]}: {len(questions)}',flush=True)
    finally:
        if pool:pool.shutdown()
    args.output.mkdir(parents=True,exist_ok=True)
    (args.output/'generation-failures.json').write_text(json.dumps(failures,ensure_ascii=False,indent=2)+'\n')
    report=validate(records,args.expected)
    if failures:report['ok']=False
    report['generationFailures']=failures
    (args.output/'validation-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    shards=[]
    questions_dir=args.output/'questions'
    questions_dir.mkdir(exist_ok=True)
    for old in questions_dir.glob('U*.json'):
        old.unlink()
    for unit in sorted({q['taxonomy']['unitId'] for q in records}):
        subset=[q for q in records if q['taxonomy']['unitId']==unit]
        for index,start in enumerate(range(0,len(subset),args.shard_size),1):
            part=subset[start:start+args.shard_size]
            filename=f'{unit}-{index:02}.json'
            path=questions_dir/filename
            encoded=(json.dumps(part,ensure_ascii=False,indent=2,allow_nan=False)+'\n').encode()
            path.write_bytes(encoded)
            shards.append({'path':'questions/'+filename,'count':len(part),'sha256':hashlib.sha256(encoded).hexdigest()})
    (args.output/'shards-built.json').write_text(json.dumps(shards,indent=2)+'\n')
    print(json.dumps(report,ensure_ascii=False,indent=2))
    if not report['ok']:raise SystemExit(1)


if __name__=='__main__':main()
