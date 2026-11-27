def _positive(value):
    value=_finite_exact(value)
    if value.is_positive is not True:raise ValueError('Positive exact domain required')
    return value

def _nonnegative(value):
    value=_finite_exact(value)
    if value.is_nonnegative is not True:raise ValueError('Nonnegative exact domain required')
    return value

def flight_time(distance,speed):return _positive(distance)/_positive(speed)
def pressure_mass(pressure,area,gravity):return _positive(pressure)*_positive(area)/_positive(gravity)
def outgoing_flow(incoming,branch,accumulated):return _nonnegative(_positive(incoming)-_nonnegative(branch)-_nonnegative(accumulated))
def fixed_voltage_power(charge,voltage,duration):return _positive(charge)*_positive(voltage)/_positive(duration)
def remaining_energy(available,measured):return _nonnegative(_nonnegative(available)-_nonnegative(measured))
def converted_cycle(hot,cold,efficiency):
    hot,cold,efficiency=_positive(hot),_nonnegative(cold),_nonnegative(efficiency)
    if cold>hot or efficiency>1:raise ValueError('Cycle output and efficiency outside admitted domain')
    return (hot-cold)*efficiency

def pressure_radius_ratio(radius_factor):return 1/_positive(radius_factor)**4
def count_reduction(activity_fraction,radius_factor):return _positive(radius_factor)**2/_positive(activity_fraction)
def signed_charge(first_current,first_time,second_current,second_time):return _finite_exact(first_current)*_positive(first_time)+_finite_exact(second_current)*_positive(second_time)
def hydrostatic_density(pressure,gravity,height):return _positive(pressure)/(_positive(gravity)*_positive(height))
def received_energy(power,efficiency,fraction,duration):
    power,efficiency,fraction,duration=_positive(power),_nonnegative(efficiency),_nonnegative(fraction),_positive(duration)
    if efficiency>1 or fraction>1:raise ValueError('Energy fractions outside [0,1]')
    return power*efficiency*fraction*duration

def heating_volume(power,specific_heat,temperature_increase,density):return _positive(power)/(_positive(specific_heat)*_positive(temperature_increase)*_positive(density))

@lru_cache(maxsize=1)
def oracle():
    main()
    values=predictions();q=sp.Rational
    witnesses={
      'C6-Q001':flight_time(q(3,10),1500)*10**6,
      'C6-Q002':pressure_mass(25000,q(2,10000),10),
      'C6-Q003':outgoing_flow(90,30,12),
      'C6-Q004':fixed_voltage_power(12,5,60),
      'C6-Q005':remaining_energy(30,24),
      'C6-Q006':converted_cycle(900,600,q(4,5)),
      'C6-Q007':pressure_radius_ratio(2),
      'C6-Q008':count_reduction(q(1,2),3),
      'C6-Q009':signed_charge(q(3,10),4,q(-1,10),5),
      'C6-Q010':hydrostatic_density(2000,10,q(1,4)),
      'C6-Q012':received_energy(5,q(1,5),q(1,50),3)*1000,
      'C6-AQ01':heating_volume(8,4000,q(1,2),1000)*10**6}
    for key,value in witnesses.items():assert sp.simplify(value-values[key])==0,key
    return [CONCEPT if key=='C6-Q011'else values[key]for key in ORDERED_IDS]

@lru_cache(maxsize=1)
def source_records():
    result={}
    for path in set(SOURCE_PATHS.values()):
        raw=git_bytes(Path(__file__).resolve().parents[3],SOURCE_REF,path)
        if sha(raw)!=SOURCE_FILE_SHA256[path]:raise ValueError('Pinned original source file changed')
        for row in json.loads(raw):
            if row['id']in EXPECTED_IDS and SOURCE_PATHS[row['id']]==path:result[row['id']]=row
    if set(result)!=EXPECTED_IDS:raise ValueError('Individual source path coverage incomplete')
    return result

def parse_option(number,option):
    if type(number)is not int or not 1<=number<=13 or not isinstance(option,str):raise ValueError('Reviewed option index and exact string required')
    suffix=OPTION_SUFFIX.get(number,'')
    if suffix and not option.endswith(suffix):raise ValueError('Required physical unit absent')
    return parse_literal(option.removesuffix(suffix)if suffix else option)

def alternative_identity(option,number=None):
    if not isinstance(option,str):return None
    for suffix,dimension,scale in [(' μs','time',sp.Rational(1,10**6)),(' µs','time',sp.Rational(1,10**6)),(' ms','time',sp.Rational(1,1000)),(' s','time',sp.Integer(1)),(' g','mass',sp.Rational(1,1000)),(' kg','mass',sp.Integer(1)),(' mL/min','flow',sp.Rational(1,60000000)),(' mL/s','flow',sp.Rational(1,10**6)),(' cm³/s','flow',sp.Rational(1,10**6)),(' m³/s','flow',sp.Integer(1)),(' mJ','energy',sp.Rational(1,1000)),(' J','energy',sp.Integer(1)),(' mW','power',sp.Rational(1,1000)),(' W','power',sp.Integer(1)),(' mC','charge',sp.Rational(1,1000)),(' C','charge',sp.Integer(1)),(' kg/m³','density',sp.Integer(1)),(' g/cm³','density',sp.Integer(1000)),('','dimensionless',sp.Integer(1))]:
        if suffix and not option.endswith(suffix):continue
        try:value=parse_literal(option.removesuffix(suffix)if suffix else option)
        except(ValueError,TypeError):continue
        return dimension,sp.simplify(value*scale)
    return None

def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    actual=tuple((e.tag,tuple(sorted(e.attrib.items())),e.text or'')for e in root.iter())
    if actual!=REQUIRED_GEOMETRY:raise ValueError('Independent physical scale or reviewed SVG quantity labels/accessibility changed')
    return GEOMETRY_REVIEW

def verify(package,bindings,asset_root=None):
    if package.get('schema')!='astra/1':raise ValueError('Expected astra/1')
    asset_root=asset_root or Path(__file__).resolve().parents[2]/'editorial/assets'
    expected=oracle();source=source_records();geometry=asset_geometry(asset_root);common=[];records=[]
    model=Path(__file__).resolve().parents[2]/MODEL_PATH
    literal_hash=sha(Path(exact_numbers.__file__).read_bytes())
    if sha(model.read_bytes())!=INDEPENDENT_MODELS_IMPLEMENTATION_SHA256:common.append('Independent frozen source-only model changed')
    if literal_hash!=EXACT_LITERAL_DEPENDENCY_SHA256:common.append('Independent exact decoder changed')
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append('Independent reviewed package edition changed')
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append('Independent reviewed binding edition changed')
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);key=row['id'];index=INDEX[key];number=index+1;original=source[key];context=EXPECTED_CONTEXT[key];provenance=b.get('provenance',{})
        for fragment in REQUIRED_DOMAIN_FRAGMENTS.get(key,[]):
            if fragment not in row.get('prompt',''):errors.append('Independent reviewed physical domain missing: '+fragment)
        if b.get('sourceId')!=key or b.get('sourceRef')!=SOURCE_REF or b.get('sourceSha256')!=digest(original):errors.append('Independent pinned Git source binding mismatch')
        if(provenance.get('sourcePath')!=SOURCE_PATHS[key]or provenance.get('sourceRef')!=SOURCE_REF or provenance.get('sourceId')!=key or provenance.get('sourceOrigin')!='cric' or provenance.get('sourceVersion')!=original['version']or type(provenance.get('sourceVersion'))is not int or provenance.get('sourceReasoningTask')!='Existing Cric question; original edition preserved'or provenance.get('sourceProvenance')!=original.get('provenance')or provenance.get('authoringModule')!='tools.corpus_engineering.cric_c6_integrative_authoring'or b.get('provenanceSha256')!=digest(provenance)or provenance.get('humanApproval')!='NOT_RUN'or provenance.get('status')!='DRAFT'or provenance.get('independentReview')!='NOT_RUN'):
            errors.append('Independent pinned source provenance mismatch')
        for field in('id','kind','course','section','order','skill','prerequisites','family','difficulty','exam'):
            if row.get(field)!=context.get(field)or type(row.get(field))is not type(context.get(field)):errors.append('Individual Cric identity/context mismatch: '+field)
        if(row.get('baseVersion')!=original['version']or row.get('version')!=original['version']+1 or type(row.get('baseVersion'))is not int or type(row.get('version'))is not int):errors.append('Individual Cric baseVersion/version mismatch')
        if row.get('error',{}).get('target')!=row['skill']:errors.append('Actual skill and feedback target mismatch')
        wanted=expected[index];answer=row['answer'];value=answer['value']
        if isinstance(wanted,str):
            if value!=wanted:errors.append('Independent physical conceptual key mismatch')
        else:
            if answer['type']=='numeric'and type(value)is not int:errors.append('Independent numeric answer must preserve an exact integer JSON value')
            try:
                actual=parse_option(number,str(value))if answer['type']=='choice'else parse_literal(str(value))
                if sp.simplify(actual-wanted)!=0:errors.append('Independent primary physical exact result mismatch')
            except(ValueError,TypeError):errors.append('Independent exact answer or physical unit invalid')
            if answer['type']=='choice':
                identities=[v for option in answer['options']if(v:=alternative_identity(option,number))is not None]
                if len(identities)!=len(set(identities)):errors.append('Equivalent exact numeric choices require editorial review')
        if answer['type']=='numeric'and(answer.get('unit')!=NUMERIC_UNITS.get(number)or answer.get('tolerance')!=0):errors.append('Independent numeric physical unit mismatch')
        records.append({'id':key,'sourceSha256':b['sourceSha256'],'candidateSha256':digest(row),'reviewedSignature':signature,'reviewDependencySha256':{'exact_arithmetic_literals.py':literal_hash},'assetChecksums':assets,'ok':not errors,'errors':errors,'expectedExact':str(wanted),'dimension':{str(k):str(v)for k,v in SI.Unit(UNITS[number]).dimensionality.items()},'manualArithmetic':MANUAL[key],'physicalAssumptions':READING_NOTES[key],'distractors':READING_NOTES[key],'pedagogicalReview':READING_NOTES[key],'assetReview':geometry if assets else'not attached to this record','verificationMode':'AI_CONCEPTUAL'if isinstance(wanted,str)else'EXACT_ORACLE','methods':['prompt_only_frozen_primary_and_identical_source_model_AST','exact_SymPy_and_Fraction_Pint_dimensions','separate_manual_original_final_distractor_lesson_and_full_SVG_review'],'lessonReference':LESSON_REFERENCES[key],'humanApproval':'NOT_RUN','publication':'DRAFT'})
    return records

def report(package,bindings,asset_root=None):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings,asset_root),'verifierSha256':sha(Path(__file__).read_bytes()),'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),'reviewDependencySha256':{'exact_arithmetic_literals.py':sha(Path(exact_numbers.__file__).read_bytes())},'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__,'hypothesis':hypothesis.__version__},'reviewer':'separate_AI_reviewer_not_candidate_author','humanApproval':'NOT_RUN','publication':'DRAFT','reviewedCandidateCommit':CANDIDATE_REF,'packageSha256':digest(package),'bindingsSha256':digest(bindings),'source':{'commit':SOURCE_REF,'pathsById':SOURCE_PATHS,'sourceFileSha256':SOURCE_FILE_SHA256},'primaryBeforeCandidateKeys':{'path':PRIMARY_PATH,'sha256':PRIMARY_SHA256},'modelsBeforeCandidateKeys':{'path':MODEL_PATH,'sha256':INDEPENDENT_MODELS_IMPLEMENTATION_SHA256,'commit':MODEL_REF},'modelFunctionBodies':'All frozen source-only model functions retain identical AST; separate typed SI-law witnesses and exact literal guard added afterward.'}
