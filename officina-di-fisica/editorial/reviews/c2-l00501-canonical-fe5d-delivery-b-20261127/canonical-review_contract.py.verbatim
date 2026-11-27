"""Common integrity boundary for individually reviewed offline batches.

The mathematical oracle stays in each independent verifier; this module only
checks complete identity, provenance, payload and asset binding.
"""
import base64
from fractions import Fraction
from pathlib import Path
import re

from .pipeline import digest, sha


def exact_choice_identity(option):
    """Recognize bounded literal quantities only; prose/formulas still need reading.

    The explicit unit table is intentionally narrow. Unsupported expressions are
    not declared different or semantically valid merely because parsing stopped.
    No eval, floating point or arbitrary unit-expression evaluator is involved.
    """
    if not isinstance(option,str) or len(option)>120:return None
    number=r'[+-]?\d+(?:[.,]\d+)?(?:[eE][+-]?\d{1,2})?'
    match=re.fullmatch(fr'\s*({number})(?:\s*/\s*({number}))?\s*([A-Za-zµμΩ²³⁻/^0-9]+)?\s*',option.replace('−','-'))
    if not match:return None
    units={'':('1',Fraction(1)),'m':('L',Fraction(1)),'cm':('L',Fraction(1,100)),
      'mm':('L',Fraction(1,1000)),'km':('L',Fraction(1000)),
      's':('T',Fraction(1)),'ms':('T',Fraction(1,1000)),
      'kg':('M',Fraction(1)),'g':('M',Fraction(1,1000)),
      'm²':('L2',Fraction(1)),'cm²':('L2',Fraction(1,10000)),
      'm³':('L3',Fraction(1)),'cm³':('L3',Fraction(1,1000000)),
      'N':('F',Fraction(1)),'Pa':('P',Fraction(1)),'kPa':('P',Fraction(1000)),
      'V':('U',Fraction(1)),'A':('I',Fraction(1)),'K':('temperature',Fraction(1)),
      'J':('energy',Fraction(1)),'Hz':('frequency',Fraction(1)),
      'm/s':('velocity',Fraction(1)),'m/s²':('acceleration',Fraction(1))}
    unit=units.get(match[3] or '')
    if unit is None:return None
    try:
        value=Fraction(match[1].replace(',','.'))
        if match[2]:value/=Fraction(match[2].replace(',','.'))
    except (ValueError,ZeroDivisionError):return None
    return unit[0],value*unit[1]


def reviewed_rows(package, bindings, reviewed, expected_ids, asset_root):
    ids=[r["id"] for r in package["records"]]
    binding_ids=[b["id"] for b in bindings]
    if len(ids)!=len(expected_ids) or set(ids)!=expected_ids or len(binding_ids)!=len(expected_ids) or set(binding_ids)!=expected_ids:
        raise ValueError("Expected the complete unique reviewed batch and its source bindings")
    uploaded={}
    for asset in package.get("assets",[]):
        raw=base64.b64decode(asset["data"],validate=True)
        if not 0<len(raw)<=4*1024*1024 or sha(raw)!=asset["id"] or asset["id"] in uploaded:
            raise ValueError("Invalid or duplicated hashed package asset")
        uploaded[asset["id"]]=raw
    by_id={b["id"]:b for b in bindings}
    expected_assets={checksum for binding in bindings for checksum in binding.get("assetChecksums",{}).values()}
    if set(uploaded)!=expected_assets:raise ValueError("Unreviewed or missing package asset")
    results=[]
    for row in package["records"]:
        binding=by_id[row["id"]];errors=[];assets={}
        if digest(row)!=binding["candidateSha256"]:errors.append("Candidate hash differs from source binding")
        for name,checksum in binding.get("assetChecksums",{}).items():
            if Path(name).name!=name or not name.endswith(".svg"):raise ValueError("Invalid reviewed asset path")
            file=asset_root/name
            actual=sha(file.read_bytes()) if file.is_file() else "MISSING"
            assets[name]=actual
            if actual!=checksum or checksum not in uploaded:errors.append("Reviewed asset changed or missing")
        expected_src={"/asset/"+key for key in binding.get("assetChecksums",{}).values()}
        actual_src={b["src"] for b in row["blocks"] if b["type"]=="figure"}
        if actual_src!=expected_src:errors.append("Figure references differ from reviewed assets")
        signature=digest({"record":row,"assets":assets,"source":{"id":binding["sourceId"],"ref":binding["sourceRef"],"sha256":binding["sourceSha256"]}})
        if reviewed.get(row["id"])!=signature:errors.append("Independent reviewed signature mismatch")
        if row.get("answer",{}).get("type")=="choice":
            options=row["answer"]["options"]
            if len(options)!=5 or len(set(options))!=5 or options.count(row["answer"]["value"])!=1:
                errors.append("Distractors or unique key invalid")
            comparable=[identity for option in options if (identity:=exact_choice_identity(option)) is not None]
            if len(comparable)!=len(set(comparable)):
                errors.append('Equivalent exact numeric choices require editorial review')
        results.append((row,binding,signature,assets,errors))
    return results
