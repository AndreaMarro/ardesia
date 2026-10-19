"""Read-only preparation report; never grants launch permission."""
HUMAN_GATES=('scientific_review','tutor_journey','privacy_and_rights','retention_and_external_erasure','production_identity_tls_storage','calendar_and_commercial_terms','support_and_incident_owner','accessibility_devices')


def assess_readiness(content_manifest,decisions,proofs):
    def evidenced(key):
        row=decisions.get(key)
        return isinstance(row,dict) and row.get('status')=='APPROVED' and all(isinstance(row.get(field),str) and row[field].strip() for field in ('reviewer','completedAt','artifact'))
    pending=[key for key in HUMAN_GATES if not evidenced(key)]
    if content_manifest.get('scientificApproval')!='APPROVED' and 'scientific_review' not in pending:pending.append('scientific_review')
    local=all(proofs.get(key)=='PASS' for key in ('tests','browser','restore','review'))
    return {'state':'LOCAL_PREPARED_HUMAN_GATES_OPEN' if local else 'LOCAL_PROOFS_PENDING','localPrepared':local,'humanGatesOpen':pending,'launchAllowed':False,'launchBlock':'User prohibits merge, public deployment and API spending; this report cannot grant permission.','apiSpendUsd':0,'liveAI':'DISABLED','humanPilot':'NOT_RUN'}
