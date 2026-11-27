MINIMUM_CRITICAL_DOMAIN_OCCURRENCES={('C6-Q049','incremento'):2,('C6-Q058','normale ai raggi'):2}

def density_pair(m1,v1,m2,v2):return sp.Tuple(_positive(m1)/_positive(v1),_positive(m2)/_positive(v2))
def equal_resistance_diameter_ratio(length_ratio):return sp.sqrt(_positive(length_ratio))
def final_pressure(pressure,first_volume,final_volume,temperature_ratio):return _positive(pressure)*_positive(first_volume)*_positive(temperature_ratio)/_positive(final_volume)
def fall_distance(initial_speed,gravity,time):
    initial_speed,gravity,time=_nonnegative(initial_speed),_positive(gravity),_positive(time)
    return initial_speed*time+gravity*time**2/2

def hydraulic_increment(force,first_area,second_area):return _positive(force)*_positive(second_area)/_positive(first_area)
def lift_ratios(first_time,second_time):return sp.Tuple(sp.Integer(1),_positive(first_time)/_positive(second_time))
def focal_from_equal_magnitude(total_distance):return _positive(total_distance)/4
def last_cycle_heat(work,first_heat,second_heat):return _finite_exact(work)-_finite_exact(first_heat)-_finite_exact(second_heat)
def intercepted_ratio(area_ratio,radius_ratio):return _positive(area_ratio)/_positive(radius_ratio)**2
def branch_mean_speed(incoming,first,second,area):return _nonnegative(_positive(incoming)-_nonnegative(first)-_nonnegative(second))/_positive(area)
def resistive_duration(energy,voltage,resistance):return _positive(energy)*_positive(resistance)/_positive(voltage)**2
def recoil_velocity(first_mass,first_speed,second_mass):return -_positive(first_mass)*_finite_exact(first_speed)/_positive(second_mass)
def return_entropy(first_heat,first_temperature,second_heat,second_temperature):return -(_finite_exact(first_heat)/_positive(first_temperature)+_finite_exact(second_heat)/_positive(second_temperature))

@lru_cache(maxsize=1)
def oracle():
    main();values=predictions();q=sp.Rational
    witnesses={'C6-Q044':density_pair(12,8,18,12),'C6-Q045':equal_resistance_diameter_ratio(4),'C6-Q046':final_pressure(180,1,2,1),'C6-Q047':fall_distance(2,10,1),'C6-Q049':hydraulic_increment(8,4,100),'C6-Q051':lift_ratios(8,2),'C6-Q053':focal_from_equal_magnitude(64),'C6-Q057':last_cycle_heat(-12,40,-15),'C6-Q058':intercepted_ratio(4,2),'C6-Q059':branch_mean_speed(12*q(1,10**6),2*q(1,10**6),7*q(1,10**6),q(1,2)*q(1,10000)),'C6-Q060':resistive_duration(80,8,4),'C6-Q061':recoil_velocity(60,2,40),'C6-Q062':return_entropy(60,300,120,400)}
    for key,value in witnesses.items():
        old=values[key]
        if isinstance(old,tuple):assert tuple(value)==old,key
        else:assert sp.simplify(value-old)==0,key
    result=[]
    for key in ORDERED_IDS:
        number=int(key[-3:])
        if number in CONCEPTS:result.append(CONCEPTS[number])
        elif number==44:
            first,second=values[key];result.append(sp.simplify(second/first))
        elif number==51:result.append(sp.Tuple(*values[key]))
        else:result.append(values[key])
    return result

def parse_option(number,option):
    if type(number)is not int or not 44<=number<=74 or not isinstance(option,str):raise ValueError('Reviewed index and exact option string required')
    if number==44:
        if option=='Le densità medie coincidono':return sp.Integer(1)
        if option=='Le densità sono nel rapporto 2:3':return sp.Rational(2,3)
        raise ValueError('Statement does not assert the computed equality of mean densities')
    if number==51:
        parts=option.split(' e ')
        if len(parts)!=2:raise ValueError('Two ordered work and power ratios required')
        return sp.Tuple(*(parse_literal(part)for part in parts))
    if number==58:
        meanings={'Resta la stessa':sp.Integer(1),'La stessa':sp.Integer(1),'Diventa quattro volte minore':sp.Rational(1,4),'Diventa sedici volte minore':sp.Rational(1,16),'Raddoppia':sp.Integer(2),'Quadruplica':sp.Integer(4)}
        if option not in meanings:raise ValueError('Reviewed physical power-ratio statement required')
        return meanings[option]
    suffix=OPTION_SUFFIX.get(number,'')
    if suffix and not option.endswith(suffix):raise ValueError('Required physical unit absent')
    value=parse_literal(option.removesuffix(suffix)if suffix else option)
    return value/100 if number==59 else value

def alternative_identity(option,number=None):
    if not isinstance(option,str):return None
    if number in(44,51,58):
        try:return 'ratio_'+str(number),parse_option(number,option)
        except ValueError:pass
    for suffix,dimension,scale in [(' kg/m³','density',sp.Integer(1)),(' g/cm³','density',sp.Integer(1000)),(' kPa','pressure',sp.Integer(1000)),(' Pa','pressure',sp.Integer(1)),(' cm/s','speed',sp.Rational(1,100)),(' m/s','speed',sp.Integer(1)),(' cm','length',sp.Rational(1,100)),(' m','length',sp.Integer(1)),(' N','force',sp.Integer(1)),(' J/K','entropy',sp.Integer(1)),(' J','energy',sp.Integer(1)),(' s','time',sp.Integer(1)),('','dimensionless',sp.Integer(1))]:
        if suffix and not option.endswith(suffix):continue
        try:value=parse_literal(option.removesuffix(suffix)if suffix else option)
        except(ValueError,TypeError):continue
        return dimension,sp.simplify(value*scale)
    return None

def verify(package,bindings,asset_root=None):
    if package.get('schema')!='astra/1':raise ValueError('Expected astra/1')
    asset_root=asset_root or Path(__file__).resolve().parents[2]/'editorial/assets'
    expected=oracle();source=source_records();geometry=asset_geometry(asset_root);common=[];records=[]
    model=Path(__file__).resolve().parents[2]/MODEL_PATH;literal_hash=sha(Path(exact_numbers.__file__).read_bytes())
    if sha(model.read_bytes())!=INDEPENDENT_MODELS_IMPLEMENTATION_SHA256:common.append('Independent frozen source-only model changed')
    if literal_hash!=EXACT_LITERAL_DEPENDENCY_SHA256:common.append('Independent exact decoder changed')
    if digest(package)!=REVIEWED_PACKAGE_SHA256:common.append('Independent reviewed package edition changed')
    if digest(bindings)!=REVIEWED_BINDINGS_SHA256:common.append('Independent reviewed binding edition changed')
    for row,b,signature,assets,errors in reviewed_rows(package,bindings,REVIEWED_CANDIDATES,EXPECTED_IDS,asset_root):
        errors.extend(common);key=row['id'];index=INDEX[key];number=int(key[-3:]);original=source[key];context=EXPECTED_CONTEXT[key];provenance=b.get('provenance',{})
        for fragment in REQUIRED_DOMAIN_FRAGMENTS.get(key,[]):
            if row.get('prompt','').count(fragment)<MINIMUM_CRITICAL_DOMAIN_OCCURRENCES.get((key,fragment),1):errors.append('Independent reviewed physical domain missing: '+fragment)
        if b.get('sourceId')!=key or b.get('sourceRef')!=SOURCE_REF or b.get('sourceSha256')!=digest(original):errors.append('Independent pinned Git source binding mismatch')
        if(provenance.get('sourcePath')!=SOURCE_PATHS[key]or provenance.get('sourceRef')!=SOURCE_REF or provenance.get('sourceId')!=key or provenance.get('sourceOrigin')!='cric' or provenance.get('sourceVersion')!=original['version']or type(provenance.get('sourceVersion'))is not int or provenance.get('sourceReasoningTask')!='Existing Cric question; original edition preserved'or provenance.get('sourceProvenance')!=original.get('provenance')or provenance.get('authoringModule')!='tools.corpus_engineering.cric_c6_protected_exam_02_authoring'or b.get('provenanceSha256')!=digest(provenance)or provenance.get('humanApproval')!='NOT_RUN'or provenance.get('status')!='DRAFT'or provenance.get('independentReview')!='NOT_RUN'):
            errors.append('Independent pinned source provenance mismatch')
        for field in('id','kind','course','section','order','skill','prerequisites','family','difficulty','exam'):
            if row.get(field)!=context.get(field)or type(row.get(field))is not type(context.get(field)):errors.append('Individual Cric identity/context mismatch: '+field)
        if(row.get('baseVersion')!=original['version']or row.get('version')!=original['version']+1 or type(row.get('baseVersion'))is not int or type(row.get('version'))is not int):errors.append('Individual Cric baseVersion/version mismatch')
        if row.get('error',{}).get('target')!=row['skill']:errors.append('Actual skill and feedback target mismatch')
        wanted=expected[index];answer=row['answer'];value=answer['value']
        if answer['type']!='choice'or not isinstance(value,str):errors.append('Independent reviewed exact choice format required')
        if number in CONCEPTS:
            if value!=wanted:errors.append('Independent physical conceptual key mismatch')
        else:
            try:
                actual=parse_option(number,value)
                if isinstance(wanted,sp.Tuple):equal=actual==wanted
                else:equal=sp.simplify(actual-wanted)==0
                if not equal:errors.append('Independent physical exact result mismatch')
            except(ValueError,TypeError):errors.append('Independent exact physical answer or unit invalid')
        identities=[v for option in answer.get('options',[])if(v:=alternative_identity(option,number))is not None]
        if len(identities)!=len(set(identities)):errors.append('Equivalent exact numeric choices require editorial review')
        records.append({'id':key,'sourceSha256':b['sourceSha256'],'candidateSha256':digest(row),'reviewedSignature':signature,'reviewDependencySha256':{'exact_arithmetic_literals.py':literal_hash},'assetChecksums':assets,'ok':not errors,'errors':errors,'expectedExact':str(wanted),'dimension':{str(k):str(v)for k,v in SI.Unit(UNITS.get(number,'dimensionless')).dimensionality.items()},'manualArithmetic':MANUAL[key],'physicalAssumptions':READING_NOTES[key],'distractors':READING_NOTES[key],'pedagogicalReview':READING_NOTES[key],'assetReview':geometry if assets else'not attached to this record','verificationMode':'EXACT_ORACLE'if number in EXACT_NUMBERS else'AI_CONCEPTUAL','methods':['unchanged_frozen_prompt_only_model_AST','separate_SI_constitutive_witnesses_and_exact_Pint_Fraction','individual_manual_original_final_options_domains_lessons_and_SVG_reading'],'lessonReference':LESSON_REFERENCES[key],'protectedExam':2,'humanApproval':'NOT_RUN','publication':'DRAFT'})
    return records

def report(package,bindings,asset_root=None):
    return {'schemaVersion':'1.0.0','records':verify(package,bindings,asset_root),'verifierSha256':sha(Path(__file__).read_bytes()),'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),'reviewDependencySha256':{'exact_arithmetic_literals.py':sha(Path(exact_numbers.__file__).read_bytes())},'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__,'hypothesis':hypothesis.__version__},'reviewer':'separate_AI_reviewer_not_candidate_author','humanApproval':'NOT_RUN','publication':'DRAFT','protectedExam':'2; default-deny in application until independent publication gates','reviewedCandidateCommit':CANDIDATE_REF,'packageSha256':digest(package),'bindingsSha256':digest(bindings),'source':{'commit':SOURCE_REF,'pathsById':SOURCE_PATHS,'sourceFileSha256':SOURCE_FILE_SHA256},'primaryBeforeCandidateKeys':{'path':PRIMARY_PATH,'sha256':PRIMARY_SHA256},'modelsBeforeCandidateKeys':{'path':MODEL_PATH,'sha256':INDEPENDENT_MODELS_IMPLEMENTATION_SHA256,'commit':MODEL_REF},'modelFunctionBodies':'All frozen source-only model function AST identical; separate physical witnesses added after candidate reading.'}
