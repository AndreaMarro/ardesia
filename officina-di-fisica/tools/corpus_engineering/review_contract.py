"""Common integrity boundary for individually reviewed offline batches.

The mathematical oracle stays in each independent verifier; this module only
checks complete identity, provenance, payload and asset binding.
"""
import base64
from pathlib import Path

from .pipeline import digest, sha


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
        if row["answer"]["type"]=="choice":
            options=row["answer"]["options"]
            if len(options)!=5 or len(set(options))!=5 or options.count(row["answer"]["value"])!=1:
                errors.append("Distractors or unique key invalid")
        results.append((row,binding,signature,assets,errors))
    return results
