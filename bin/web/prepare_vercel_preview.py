#!/usr/bin/env python3
"""Prepare a Vercel Build Output API v3 directory, without any deployment.

Only the verified public tree is copied. No project is linked, created or changed;
human scientific/editorial and publication gates remain open.
Reference: https://vercel.com/docs/build-output-api/configuration
"""
import argparse
import hashlib
import html
import subprocess
import json
from pathlib import Path
import re
import shutil

from check_teaching_candidate import check
from teaching_policy import HEADERS, PRIVATE_HEADERS, integrated_routes


def prepare(candidate: Path, destination: Path, *, private_integrated=False, main_sha=None, head_sha=None) -> dict:
    candidate, destination = candidate.resolve(), destination.resolve()
    if destination.exists() or destination.is_relative_to(candidate):
        raise ValueError('fresh_output_outside_candidate_required')
    verification = check(candidate)
    if verification['technicalStatus'] != 'PASS':
        raise ValueError('candidate_technical_verification_required')
    if not (candidate / 'public/404.html').is_file():
        raise ValueError('custom_404_required')
    manifest_bytes = (candidate / 'candidate-manifest.json').read_bytes()
    if hashlib.sha256(manifest_bytes).hexdigest() != verification['binding']['candidateManifestSha256']:
        raise ValueError('candidate_changed_after_verification')
    manifest = json.loads(manifest_bytes)
    if private_integrated:
        return prepare_private(candidate,destination,manifest,verification,main_sha,head_sha)
    public_assets = {name.removeprefix('public/'): digest for name, digest in manifest['assetsSha256'].items() if name.startswith('public/')}
    routes = [{'src': '/.*', 'headers': HEADERS, 'continue': True}]
    for name in sorted(public_assets):
        if name == 'index.html':
            routes.append({'src': '/$', 'dest': '/index.html'})
        elif name.endswith('/index.html'):
            route = '/' + name.removesuffix('/index.html')
            routes.append({'src': re.escape(route) + '/?$', 'dest': '/' + name})
    routes.extend([{'handle': 'filesystem'}, {'src': '/.*', 'status': 404, 'dest': '/404.html'}])
    config = {'version': 3, 'routes': routes}
    output = destination / '.vercel/output'
    try:
        output.mkdir(parents=True)
        shutil.copytree(candidate / 'public', output / 'static', symlinks=True,
                        copy_function=lambda source, target: shutil.copy2(source, target, follow_symlinks=False))
        # Verify the copied bytes, too. The source package may have changed since
        # the first read; no unchecked copy is declared ready for an operator.
        copied = {p.relative_to(output / 'static').as_posix(): hashlib.sha256(p.read_bytes()).hexdigest()
                  for p in (output / 'static').rglob('*') if p.is_file() and not p.is_symlink()}
        if copied != public_assets or any(p.is_symlink() for p in (output / 'static').rglob('*')):
            raise ValueError('public_copy_changed')
        (output / 'config.json').write_text(json.dumps(config, indent=2) + '\n')
        receipt = {'schemaVersion': 1, 'kind': 'local-vercel-preview-preparation',
                   'binding': verification['binding'], 'releaseStatus': 'BLOCKED',
                   'deploymentPerformed': False, 'projectLinked': False,
                   'privateBetaIncluded': False, 'publicAssetsSha256': copied,
                   'configSha256': hashlib.sha256((output / 'config.json').read_bytes()).hexdigest(),
                   'providerRuntimeValidation': 'NOT_RUN', 'releaseGates': verification['releaseGates']}
        (destination / 'preview-manifest.json').write_text(json.dumps(receipt, indent=2) + '\n')
        return receipt
    except Exception:
        shutil.rmtree(destination)
        raise


def git_sha(ref):
    return subprocess.check_output(['git','rev-parse',ref],cwd=Path(__file__).resolve().parents[2],text=True).strip()


def prepare_private(candidate,destination,manifest,verification,main_sha,head_sha):
    if manifest.get('privateBeta') is not True:
        raise ValueError('paired_private_clients_required')
    marker=candidate/'public/courses-manifest.json'
    if marker.is_file() and json.loads(marker.read_text()).get('releaseScope')!='PUBLIC_DEMONSTRATION':
        raise ValueError('separate_editorial_preview_required')
    if verification['humanReview']['draftExamples']:
        raise ValueError('separate_editorial_preview_required')
    main_sha=main_sha or git_sha('refs/remotes/origin/main')
    head_sha=head_sha or git_sha('HEAD')
    if any(not isinstance(v,str) or not re.fullmatch('[0-9a-f]{40}',v) for v in (main_sha,head_sha)):
        raise ValueError('exact_release_refs_required')
    output=destination/'.vercel/output';static=output/'static'
    try:
        output.mkdir(parents=True)
        shutil.copytree(candidate/'beta/web', static, symlinks=True,
                        copy_function=lambda source, target: shutil.copy2(source, target, follow_symlinks=False))
        # Reserved routes belong to composition; a web asset cannot shadow them.
        for name in ('studio','study','ops','_integration','release-manifest.json'):
            if (static/name).exists():raise ValueError('reserved_integrated_path')
        shutil.copytree(candidate/'beta/studio', static/'studio', symlinks=True,
                        copy_function=lambda source, target: shutil.copy2(source, target, follow_symlinks=False))
        # A candidate can change after check(). Reject additions as well as
        # changed bytes, and never dereference newly inserted symlinks.
        if any(p.is_symlink() for p in static.rglob('*')):
            raise ValueError('linked_integrated_asset')
        expected = {name.removeprefix('beta/web/') if name.startswith('beta/web/')
                    else 'studio/' + name.removeprefix('beta/studio/'): digest
                    for name, digest in manifest['assetsSha256'].items()
                    if name.startswith(('beta/web/', 'beta/studio/'))}
        copied = {p.relative_to(static).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest()
                  for p in static.rglob('*') if p.is_file()}
        if copied != expected:
            raise ValueError('integrated_copy_changed')
        release={'schemaVersion':1,'scope':'PRIVATE_INTEGRATED_PREVIEW',
                 'stage':'PREPARED_PRIVATE_CLIENTS','mainObserved':main_sha,
                 'integrationHead':head_sha,'sourceProduct':verification['binding']['sourceCommit'],
                 'sourceTreeSha256':verification['binding']['sourceTreeSha256'],
                 'candidateManifestSha256':verification['binding']['candidateManifestSha256'],
                 'buildFlags':manifest.get('source',{}).get('buildFlags',{}),
                 'deployment':None,'backend':'NOT_CONFIGURED','remoteReady':False,
                 'applicationAuthorization':'CORE_REQUIRED; preview SSO is a separate operator gate',
                 'publicReleaseAllowed':False,'editorialApproval':False}
        (static/'release-manifest.json').write_text(json.dumps(release,indent=2)+'\n')
        (static/'_integration').mkdir()
        (static/'_integration/backend-unavailable.json').write_text('{"error":"backend_not_configured","remoteReady":false}\n')
        # Keep headers consistent for hosts that also consume the static file.
        (static/'_headers').write_text('/*\n'+''.join('  '+k+': '+v+'\n' for k,v in PRIVATE_HEADERS.items()))
        (static/'robots.txt').write_text('User-agent: *\nDisallow: /\n')
        (static/'404.html').write_text('<!doctype html><html lang="it"><meta charset="utf-8"><title>Risorsa non disponibile</title><h1>Risorsa non disponibile</h1><a href="/">Torna ad Ardesia</a></html>')
        panel=static/'ops/release';panel.mkdir(parents=True)
        fields=''.join('<dt>'+label+'</dt><dd><code>'+html.escape(value)+'</code></dd>' for label,value in (('Main osservata',main_sha),('Head candidata',head_sha),('Sorgente prodotto',release['sourceProduct'])))
        panel.joinpath('index.html').write_text('<!doctype html><html lang="it"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Ardesia · Registro del candidato</title><style>body{font:1rem system-ui;background:#f7f6f2;color:#24302d;max-width:64rem;margin:3rem auto;padding:1rem}a{color:#98452e}nav{display:flex;gap:2rem;margin:2rem 0}dd{margin:0 0 1rem;overflow-wrap:anywhere}h1{font:2.5rem Georgia}section{background:white;padding:2rem;border:1px solid #d8d9cf}</style><main><p>Ardesia · Regia</p><h1>Sola anteprima privata</h1><p>Client Web e Studio nello stesso host. Backend da collegare e collaudare con S10.</p><nav><a href="/?view=courses">Apri Aula</a><a href="/studio/">Apri Studio</a><a href="/release-manifest.json">Manifesto</a></nav><section><h2>Versioni del candidato</h2><dl>'+fields+'</dl><p>Deployment: attestazione provider successiva. Autorizzazioni applicative: Core.</p><p>Stato: preparato; verifica remota, integrazione e approvazione restano prove distinte.</p></section></main></html>')
        assets={p.relative_to(static).as_posix():hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(static.rglob('*')) if p.is_file()}
        if any(p.is_symlink() for p in static.rglob('*')):raise ValueError('linked_integrated_asset')
        routes=integrated_routes()
        config={'version':3,'routes':routes};(output/'config.json').write_text(json.dumps(config,indent=2)+'\n')
        receipt={'schemaVersion':1,'kind':'private-integrated-preview-preparation',
                 'binding':verification['binding'],'releaseStatus':'BLOCKED',
                 'deploymentPerformed':False,'projectLinked':False,'privateBetaIncluded':True,
                 'requiresProtectedPreview':True,'staticAssetsSha256':assets,
                 'releaseManifestSha256':assets['release-manifest.json'],
                 'configSha256':hashlib.sha256((output/'config.json').read_bytes()).hexdigest(),
                 'providerRuntimeValidation':'NOT_RUN','releaseGates':verification['releaseGates'],
                 'remoteBackend':'NOT_CONFIGURED','lineage':release}
        (destination/'preview-manifest.json').write_text(json.dumps(receipt,indent=2)+'\n');return receipt
    except Exception:
        shutil.rmtree(destination)
        raise


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--candidate', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--private-integrated',action='store_true',help='Protected Web+Studio client preview; never a public release or certified remote backend')
    parser.add_argument('--main-sha',help='Exact main observation; defaults to local origin/main')
    parser.add_argument('--head-sha',help='Exact integration head; defaults to local HEAD')
    args = parser.parse_args()
    try:
        value = prepare(args.candidate,args.output,private_integrated=args.private_integrated,main_sha=args.main_sha,head_sha=args.head_sha)
    except (ValueError, OSError, KeyError) as error:
        print('Preview preparation failed: ' + type(error).__name__)
        return 1
    print(f"Prepared {len(value.get('staticAssetsSha256',value.get('publicAssetsSha256',{})))} files; private={value['privateBetaIncluded']}; no deployment; release BLOCKED")
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
