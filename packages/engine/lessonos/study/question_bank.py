"""Versioned, deterministic practice banks; scientific approval is separate.

Only bundled registry paths are reachable from HTTP. JSON records contain full
solutions, but student projections are explicit allowlists. Grading never uses
eval, a CAS, an LLM or a network call. Practice attempts here are stateless: this
is not a high-stakes exam system or a tutor-approved assessment receipt.
"""
from collections import Counter, OrderedDict
from copy import deepcopy
from fractions import Fraction
import hashlib
import json
import math
from pathlib import Path
import re
from threading import RLock
import unicodedata

from .models import StudyError


BANK_ID = 'physics-semestre-2026'
BANK_PATHS = {BANK_ID: Path(__file__).parent / 'content' / 'physics-semestre-2026-bank'}
_BANK_SUBJECTS = {(BANK_ID, 1): 'fisica'}
LEVELS = ('base', 'facile', 'medio', 'difficile')
FORMATS = ('multiple_choice', 'completion')
MAX_ANSWER_LENGTH = 128
MAX_SHARD_BYTES = 32 * 1024 * 1024
MAX_BANK_QUESTIONS = 10000
_NUMBER = r'[+-]?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)(?:[eE][+-]?[0-9]{1,3})?'
_RATIONAL = re.compile(rf'^({_NUMBER})(?:\s*/\s*({_NUMBER}))?$')
_SHA = re.compile(r'^[0-9a-f]{64}$')
_BANK_CACHE_LIMIT = 1
_BANK_CACHE = OrderedDict()
_BANK_CACHE_LOCK = RLock()
# Editorial bookkeeping is projected, never authored content: approving a
# question must not change the digest of the same revision.
APPROVAL_EXCLUDED_FIELDS = frozenset({'status', 'reviewer'})


def approval_content_sha256(question):
    """SHA-256 of every authored field except the editorial projections.

    The deny-list is deliberate: adding a new authored field changes the
    digest, so an old approval fails closed instead of silently covering it.
    """
    body = {key: value for key, value in question.items() if key not in APPROVAL_EXCLUDED_FIELDS}
    return hashlib.sha256(json.dumps(body, ensure_ascii=False, sort_keys=True,
                                     separators=(',', ':'), allow_nan=False).encode()).hexdigest()


class _FrozenDict(dict):
    """Internal JSON snapshot; public responses are detached ordinary objects."""

    def _immutable(self, *args, **kwargs):
        raise TypeError('question bank snapshots are immutable')

    __setitem__ = __delitem__ = clear = pop = popitem = setdefault = update = __ior__ = _immutable

    def __deepcopy__(self, memo):
        return {key: deepcopy(value, memo) for key, value in self.items()}


class _FrozenList(tuple):
    def __deepcopy__(self, memo):
        return [deepcopy(value, memo) for value in self]


def _freeze(value):
    if isinstance(value, dict):
        return _FrozenDict((key, _freeze(item)) for key, item in value.items())
    if isinstance(value, list):
        return _FrozenList(_freeze(item) for item in value)
    return value


def _source_stat(directory, name):
    source = (directory / name).resolve(strict=True)
    if not source.is_relative_to(directory):
        raise ValueError('bank source escapes registry directory')
    stat = source.stat()
    return (name, str(source), stat.st_size, stat.st_mtime_ns, stat.st_ctime_ns,
            stat.st_dev, stat.st_ino)


def _source_fingerprint(directory, names):
    return tuple(_source_stat(directory, name) for name in names)


def clear_bank_cache():
    """Discard bundled content snapshots; never stores principals or attempts."""
    with _BANK_CACHE_LOCK:
        _BANK_CACHE.clear()


def parse_rational(value):
    """Parse a bounded decimal/scientific number or a single quotient exactly.

    Decimal commas and Unicode minus are accepted; expressions, units,
    thousands separators, parentheses, NaN and unbounded exponents are not.
    """
    if not isinstance(value, str) or len(value) > MAX_ANSWER_LENGTH:
        return None
    value = value.strip().replace('−', '-').replace(',', '.')
    match = _RATIONAL.fullmatch(value)
    if not match:
        return None
    parts = [part for part in match.groups() if part is not None]
    if any(len(re.sub(r'[^0-9]', '', part)) > 64 for part in parts):
        return None
    for part in parts:
        exponent = re.search(r'[eE]([+-]?[0-9]+)$', part)
        if exponent and abs(int(exponent.group(1))) > 100:
            return None
    try:
        result = Fraction(parts[0]) / (Fraction(parts[1]) if len(parts) == 2 else 1)
        if result.numerator.bit_length() > 512 or result.denominator.bit_length() > 512:
            return None
        return result
    except (ValueError, ZeroDivisionError, OverflowError):
        return None


def _alias(value, *, symbolic=False):
    value = unicodedata.normalize('NFC', value).strip().replace('−', '-')
    if symbolic:
        # Case matters for physical symbols (r and R, for example).
        return re.sub(r'\s+', '', value).replace('⋅', '*').replace('×', '*')
    return ' '.join(value.casefold().split())


def _without_unit(value, unit):
    if not unit or unit == '1':
        return value
    text = value.strip()
    if text.endswith(unit):
        numeric = text[:-len(unit)].rstrip()
        if numeric and parse_rational(numeric) is not None:
            return numeric
    return value


def student_question(question):
    """Never project authoring formulae, option exact values or hidden hints."""
    projected = {key: deepcopy(question[key]) for key in
                 ('id', 'version', 'bankId', 'activityId', 'prompt', 'format',
                  'taxonomy', 'difficulty', 'familyId', 'status')}
    projected['lawFamily'] = question.get('lawFamily', question['familyId'])
    projected['options'] = [{'id': option['id'], 'text': option['text']}
                            for option in question['options']]
    descriptors = question.get('descriptors', {})
    projected['descriptors'] = {key: deepcopy(descriptors[key]) for key in
                               ('learningObjective', 'reasoningTask', 'representation',
                                'calculatorAllowed', 'estimatedSeconds', 'prerequisites',
                                'miniCourseIds', 'scope') if key in descriptors}
    return projected


def _profile(raw):
    if not isinstance(raw, dict):
        raise ValueError('invalid profile')
    result = deepcopy(raw)
    keys = ('questionCount', 'multipleChoice', 'completion', 'durationSeconds')
    if any(type(result.get(key)) is not int or result[key] < 0 for key in keys):
        raise ValueError('invalid profile')
    if (not isinstance(result.get('id'), str) or not result['id']
            or not 1 <= result['questionCount'] <= 100
            or result['questionCount'] != result['multipleChoice'] + result['completion']
            or not 1 <= result['durationSeconds'] <= 18000):
        raise ValueError('invalid profile')
    scoring = result.get('scoring', {})
    for key in ('correct', 'incorrect', 'omitted'):
        value = scoring.get(key)
        if type(value) not in (int, float) or not math.isfinite(value) or not -10 <= value <= 10:
            raise ValueError('invalid scoring')
    scopes = result.get('includedScopes')
    if scopes is not None and (not isinstance(scopes, list) or not 1 <= len(scopes) <= 8
                              or not all(isinstance(value, str) and 1 <= len(value) <= 64 for value in scopes)):
        raise ValueError('invalid scope policy')
    return result


class QuestionBank:
    """A verified immutable snapshot of one bundled manifest and its shards."""

    def __setattr__(self, name, value):
        if getattr(self, '_sealed', False):
            raise AttributeError('question bank snapshots are immutable')
        object.__setattr__(self, name, value)

    def __init__(self, directory):
        try:
            directory = Path(directory).resolve()
            observed = [_source_stat(directory, 'manifest.json')]
            manifest_bytes = (directory / 'manifest.json').read_bytes()
            if len(manifest_bytes) > 2 * 1024 * 1024:
                raise ValueError('manifest budget')
            manifest = json.loads(manifest_bytes)
            if (manifest.get('id') != BANK_ID or type(manifest.get('version')) is not int
                    or manifest['version'] != 1
                    or manifest.get('schemaVersion') != '1.0.0'
                    or type(manifest.get('questionCount')) is not int
                    or not 1 <= manifest['questionCount'] <= MAX_BANK_QUESTIONS):
                raise ValueError('manifest identity')
            self.sha256 = hashlib.sha256(manifest_bytes).hexdigest()
            self.manifest = manifest
            raw_profiles = manifest['examProfiles']
            if isinstance(raw_profiles, dict):
                raw_profiles = [dict(value, id=key) for key, value in raw_profiles.items()]
            profiles = [_profile(profile) for profile in raw_profiles]
            self._profiles = {profile['id']: profile for profile in profiles}
            if len(self._profiles) != len(profiles) or not profiles:
                raise ValueError('profile identities')
            self._by_id = {}
            self._content_sha256 = {}
            seen_shards = set()
            shards = manifest['shards']
            if not isinstance(shards, list) or not 1 <= len(shards) <= 32:
                raise ValueError('shard count')
            for shard in shards:
                name = shard['path']
                if (not isinstance(name, str) or not re.fullmatch(r'questions/[A-Za-z0-9_.-]+\.json', name)
                        or name in seen_shards or not _SHA.fullmatch(shard['sha256'])
                        or type(shard['count']) is not int or not 0 <= shard['count'] <= MAX_BANK_QUESTIONS):
                    raise ValueError('shard metadata')
                seen_shards.add(name)
                source = (directory / name).resolve()
                observed.append(_source_stat(directory, name))
                if not source.is_relative_to(directory) or source.stat().st_size > MAX_SHARD_BYTES:
                    raise ValueError('shard path or budget')
                raw = source.read_bytes()
                if hashlib.sha256(raw).hexdigest() != shard['sha256']:
                    raise ValueError('shard checksum')
                questions = json.loads(raw)
                if not isinstance(questions, list) or len(questions) != shard['count']:
                    raise ValueError('shard count')
                for question in questions:
                    self._validate_question(question)
                    if question['id'] in self._by_id:
                        raise ValueError('duplicate question')
                    self._by_id[question['id']] = question
                    self._content_sha256[question['id']] = approval_content_sha256(question)
            if len(self._by_id) != manifest['questionCount']:
                raise ValueError('bank count')
            self._source_names = tuple(row[0] for row in observed)
            self._source_fingerprint = tuple(observed)
            if _source_fingerprint(directory, self._source_names) != self._source_fingerprint:
                raise ValueError('bank changed during validation')
            self.manifest = _freeze(self.manifest)
            self._profiles = _freeze(self._profiles)
            self._by_id = _freeze(self._by_id)
            self._content_sha256 = _freeze(self._content_sha256)
            self._questions = tuple(self._by_id[key] for key in sorted(self._by_id))
            self._sealed = True
        except (OSError, ValueError, KeyError, TypeError, AttributeError):
            raise StudyError('question_bank_unavailable', 409) from None

    @staticmethod
    def _validate_question(question):
        if (not isinstance(question, dict) or question['bankId'] != BANK_ID
                or type(question['version']) is not int or question['version'] != 1
                or question['activityId'] != 'physics-question-bank-v1'
                or not isinstance(question['id'], str) or not 1 <= len(question['id']) <= 128
                or not isinstance(question['prompt'], str) or not question['prompt']
                or question['format'] not in FORMATS
                or question['difficulty']['level'] not in LEVELS
                or type(question['difficulty']['rank']) is not int
                or question['difficulty']['rank'] != LEVELS.index(question['difficulty']['level']) + 1
                or question['taxonomy']['unitId'] not in {f'U{index}' for index in range(1, 8)}
                or not all(isinstance(question['taxonomy'].get(key), str)
                           for key in ('unitId', 'macroarea', 'microarea', 'topic'))
                or not isinstance(question['familyId'], str) or not question['familyId']
                or not isinstance(question.get('lawFamily', question['familyId']), str)
                or not question.get('lawFamily', question['familyId'])
                or question['status'] != 'DRAFT' or question['reviewer'] is not None
                or not isinstance(question['solution'], str) or not question['solution']
                or not isinstance(question['solutionSteps'], list) or not question['solutionSteps']
                or question['descriptors'].get('calculatorAllowed') is not False):
            raise ValueError('question shape')
        answer = question['answer']
        if (answer['kind'] not in ('rational', 'symbolic', 'text')
                or not all(isinstance(answer[key], str) for key in ('exact', 'unit', 'text'))
                or not isinstance(answer['accepted'], list)
                or not all(isinstance(alias, str) and len(alias) <= 1024 for alias in answer['accepted'])):
            raise ValueError('answer shape')
        if answer['kind'] == 'rational' and parse_rational(answer['exact']) is None:
            raise ValueError('invalid exact answer')
        options = question['options']
        if not isinstance(options, list):
            raise ValueError('options shape')
        if question['format'] == 'multiple_choice':
            if (len(options) != 5 or {option['id'] for option in options} != set('ABCDE')
                    or len({_alias(option['text']) for option in options}) != 5
                    or answer.get('correctOptionId') not in set('ABCDE')
                    or not all(isinstance(option['text'], str) and option['text'] for option in options)):
                raise ValueError('invalid options')
        elif options:
            raise ValueError('completion options')

    def _pin(self, expected_sha256):
        if expected_sha256 is not None and expected_sha256 != self.sha256:
            raise StudyError('question_bank_changed', 409)

    def approval_content_sha256(self, question_id):
        """Digest bound to one exact revision; unknown ids fail closed."""
        if not isinstance(question_id, str) or question_id not in self._content_sha256:
            raise StudyError('question_not_found', 404)
        return self._content_sha256[question_id]

    def question_version(self, question_id):
        if not isinstance(question_id, str) or question_id not in self._by_id:
            raise StudyError('question_not_found', 404)
        return self._by_id[question_id]['version']

    def review_record(self, question_id):
        """Private reviewer projection: full authored content, never public."""
        if not isinstance(question_id, str) or question_id not in self._by_id:
            raise StudyError('question_not_found', 404)
        return deepcopy(self._by_id[question_id])

    def catalog(self, published_ids=None):
        """Catalog. When a publication filter is supplied, counts cover it only."""
        if published_ids is None:
            questions = self._questions
        else:
            if not isinstance(published_ids, (set, frozenset)):
                raise StudyError('invalid_publication_filter')
            questions = tuple(q for q in self._questions if q['id'] in published_ids)
        published = None if published_ids is None else len(questions)
        return {
            'id': self.manifest['id'], 'version': self.manifest['version'],
            'schemaVersion': self.manifest['schemaVersion'], 'bankSha256': self.sha256,
            'title': self.manifest.get('title', 'Fisica — Semestre filtro 2026/27'),
            'questionCount': len(questions), 'editorialStatus': 'DRAFT',
            'scientificApproval': 'NOT_RUN', 'calculatorAllowed': False,
            'countsByDifficulty': dict(Counter(q['difficulty']['level'] for q in questions)),
            'countsByUnit': dict(Counter(q['taxonomy']['unitId'] for q in questions)),
            'countsByFormat': dict(Counter(q['format'] for q in questions)),
            'examProfiles': deepcopy(list(self._profiles.values())),
            'taxonomy': deepcopy(self.manifest.get('taxonomy', [])),
            'difficultyRubric': deepcopy(self.manifest.get('difficultyRubric', {})),
            'practiceAttemptsPersisted': False,
            'publication': {
                'gate': 'scientific-editorial-approval-v1',
                'defaultDeny': True,
                'publishedQuestionCount': published,
                'status': ('REVIEW_REQUIRED' if published is None
                           else 'PUBLISHED' if published else 'UNPUBLISHED'),
            },
        }

    def inventory_collections(self):
        """Private, detached metadata for declared groups; not enrolment authority.

        Counts come from this verified snapshot, including overlapping membership.
        No edition ledger is consulted and no authored answer text is projected.
        """
        subject = _BANK_SUBJECTS.get((self.manifest['id'], self.manifest['version']))
        if subject is None:
            raise StudyError('question_bank_unavailable', 409)
        definitions = self.manifest.get('miniCourses', ())
        if not isinstance(definitions, (list, tuple)):
            raise StudyError('question_bank_unavailable', 409)
        for question in self._questions:
            memberships = question['descriptors'].get('miniCourseIds', ())
            if (not isinstance(memberships, (list, tuple))
                    or not all(isinstance(value, str) for value in memberships)):
                raise StudyError('question_bank_unavailable', 409)
        result, seen = [], set()
        for definition in definitions:
            if (not isinstance(definition, dict)
                    or not isinstance(definition.get('id'), str) or not definition['id']
                    or definition['id'] in seen
                    or not isinstance(definition.get('title'), str) or not definition['title']
                    or definition.get('bankId', self.manifest['id']) != self.manifest['id']):
                raise StudyError('question_bank_unavailable', 409)
            mini_course_id = definition['id']
            seen.add(mini_course_id)
            questions = tuple(q for q in self._questions
                              if mini_course_id in q['descriptors'].get('miniCourseIds', ()))
            prerequisites = set()
            for question in questions:
                labels = question['descriptors'].get('prerequisites', ())
                if isinstance(labels, (list, tuple)):
                    prerequisites.update(label for label in labels if isinstance(label, str) and label)
            result.append({
                'id': f"{self.manifest['id']}@{self.manifest['version']}:{mini_course_id}",
                'title': definition['title'], 'subject': subject, 'bankId': self.manifest['id'],
                'bankVersion': self.manifest['version'], 'bankSha256': self.sha256,
                'academicYear': self.manifest.get('academicYear'),
                'selection': {'miniCourseId': mini_course_id},
                'unitIds': sorted({q['taxonomy']['unitId'] for q in questions}),
                'microareas': sorted({q['taxonomy']['microarea'] for q in questions}),
                'topics': sorted({q['taxonomy']['topic'] for q in questions}),
                'prerequisites': sorted(prerequisites),
                'learningObjectives': sorted({q['descriptors']['learningObjective'] for q in questions
                    if isinstance(q['descriptors'].get('learningObjective'), str)
                    and q['descriptors']['learningObjective']}),
                'questionCount': len(questions),
                'familyCount': len({q['familyId'] for q in questions}),
                'solutionCount': sum(bool(q['solution']) for q in questions),
                'countsByDifficulty': dict(sorted(Counter(q['difficulty']['level'] for q in questions).items())),
                'countsByFormat': dict(sorted(Counter(q['format'] for q in questions).items())),
                'countsByUnit': dict(sorted(Counter(q['taxonomy']['unitId'] for q in questions).items())),
                'questionRefs': [{'id': q['id'], 'version': q['version'],
                                  'contentSha256': self._content_sha256[q['id']]} for q in questions[:3]],
                'creatable': False, 'editorialStatus': 'DRAFT', 'scientificReview': 'NOT_RUN',
                'gaps': ['Gruppo di quesiti, non un CoursePack configurato.',
                         'Sequenza didattica e incontri da progettare.',
                         'Revisione scientifica e decisione editoriale da completare.',
                         'Percorso completo e collaudo dell’edizione da verificare.'],
            })
        return result

    def _filtered(self, *, unit_id=None, difficulty=None, format=None, query=None, mini_course_id=None,
                  published_ids=None):
        if unit_id is not None and unit_id not in {f'U{index}' for index in range(1, 8)}:
            raise StudyError('invalid_question_filter')
        if difficulty is not None and difficulty not in LEVELS:
            raise StudyError('invalid_question_filter')
        if format is not None and format not in FORMATS:
            raise StudyError('invalid_question_filter')
        if query is not None and (not isinstance(query, str) or len(query) > 120):
            raise StudyError('invalid_question_filter')
        if mini_course_id is not None and (not isinstance(mini_course_id, str) or not 1 <= len(mini_course_id) <= 128):
            raise StudyError('invalid_question_filter')
        terms = _alias(query).split() if query else []
        result = []
        for question in self._questions:
            if published_ids is not None and question['id'] not in published_ids:
                continue
            if unit_id and question['taxonomy']['unitId'] != unit_id:
                continue
            if difficulty and question['difficulty']['level'] != difficulty:
                continue
            if format and question['format'] != format:
                continue
            if mini_course_id and mini_course_id not in question['descriptors'].get('miniCourseIds', []):
                continue
            searchable = _alias(question['prompt'] + ' ' + ' '.join(
                question['taxonomy'][key] for key in ('unitId', 'macroarea', 'microarea', 'topic')))
            if not all(term in searchable for term in terms):
                continue
            result.append(question)
        return result

    def questions(self, *, limit=20, after=None, expected_sha256=None, published_ids=None, **filters):
        self._pin(expected_sha256)
        if type(limit) is not int or not 1 <= limit <= 100:
            raise StudyError('invalid_question_pagination')
        if after is not None and (not isinstance(after, str) or not 1 <= len(after) <= 128):
            raise StudyError('invalid_question_pagination')
        questions = self._filtered(published_ids=published_ids, **filters)
        total = len(questions)
        if after is not None:
            if not any(question['id'] == after for question in questions):
                raise StudyError('invalid_question_cursor')
            questions = [question for question in questions if question['id'] > after]
        page = questions[:limit]
        return {'bankId': BANK_ID, 'bankSha256': self.sha256, 'total': total,
                'items': [student_question(question) for question in page],
                'nextCursor': page[-1]['id'] if len(questions) > limit else None}

    def question(self, question_id):
        if not isinstance(question_id, str) or question_id not in self._by_id:
            raise StudyError('question_not_found', 404)
        return student_question(self._by_id[question_id])

    def _exam_profile(self, profile_id):
        if not isinstance(profile_id, str) or profile_id not in self._profiles:
            raise StudyError('invalid_exam_profile')
        return self._profiles[profile_id]

    def exam(self, seed, *, profile_id='semestre-2026', difficulty=None, expected_sha256=None,
             published_ids=None):
        self._pin(expected_sha256)
        if not isinstance(seed, str) or not 1 <= len(seed) <= 128:
            raise StudyError('invalid_exam_seed')
        profile = self._exam_profile(profile_id)
        questions = self._filtered(difficulty=difficulty, published_ids=published_ids)
        included_scopes = profile.get('includedScopes',
                                      ['syllabus_core'] if profile_id == 'semestre-2026' else None)
        excluded_scopes = sorted({q['descriptors'].get('scope', 'syllabus_core') for q in questions
                                  if included_scopes is not None
                                  and q['descriptors'].get('scope', 'syllabus_core') not in included_scopes})
        questions = [question for question in questions if included_scopes is None
                     or question['descriptors'].get('scope', 'syllabus_core') in included_scopes]
        groups = {}
        for question in questions:
            law_family = question.get('lawFamily', question['familyId'])
            groups.setdefault(law_family, {}).setdefault(question['format'], []).append(question)
        def order(value):
            return hashlib.sha256((self.sha256 + '\0' + profile_id + '\0' + seed + '\0' + value).encode()).digest()
        single = {kind: [] for kind in FORMATS}
        shared = []
        for family in sorted(groups, key=order):
            if len(groups[family]) == 2:
                shared.append(family)
            else:
                single[next(iter(groups[family]))].append(family)
        needs = {'multiple_choice': profile['multipleChoice'], 'completion': profile['completion']}
        selected = []
        for kind in FORMATS:
            dedicated = single[kind][:needs[kind]]
            selected.extend((family, kind) for family in dedicated)
            needs[kind] -= len(dedicated)
        if len(shared) < sum(needs.values()):
            raise StudyError('insufficient_distinct_families', 409)
        cursor = 0
        for kind in FORMATS:
            selected.extend((family, kind) for family in shared[cursor:cursor + needs[kind]])
            cursor += needs[kind]
        picked = [min(groups[family][kind], key=lambda q: order(q['id'])) for family, kind in selected]
        required_units = [f'U{index}' for index in range(1, 8)] if profile_id == 'semestre-2026' else []
        # This is an editorial practice strategy, not an official unit quota.
        # Exchange within the same format so that 21/10 and distinct law
        # families remain invariant. Report coverage, including small fixtures.
        unit_counts = Counter(q['taxonomy']['unitId'] for q in picked)
        candidates_by_unit = {unit: [q for q in questions if q['taxonomy']['unitId'] == unit]
                              for unit in required_units}
        for unit in sorted(required_units, key=lambda value: (len(candidates_by_unit[value]), value)):
            if unit_counts[unit]:
                continue
            selected_laws = {q.get('lawFamily', q['familyId']): index for index, q in enumerate(picked)}
            for candidate in sorted(candidates_by_unit[unit], key=lambda q: order(q['id'])):
                law = candidate.get('lawFamily', candidate['familyId'])
                if law in selected_laws:
                    choices = [selected_laws[law]]
                else:
                    choices = sorted(range(len(picked)), key=lambda index: order(picked[index]['id']))
                donor = next((index for index in choices
                              if picked[index]['format'] == candidate['format']
                              and unit_counts[picked[index]['taxonomy']['unitId']] > 1), None)
                if donor is not None:
                    unit_counts[picked[donor]['taxonomy']['unitId']] -= 1
                    picked[donor] = candidate
                    unit_counts[unit] += 1
                    break
        # The national paper groups choice questions before completion questions.
        picked.sort(key=lambda q: (FORMATS.index(q['format']), order(q['id'])))
        return {'bankId': BANK_ID, 'bankSha256': self.sha256, 'profileId': profile_id,
                'seed': seed, 'durationSeconds': profile['durationSeconds'],
                'scoring': deepcopy(profile['scoring']), 'editorialStatus': 'DRAFT',
                'scientificApproval': 'NOT_RUN', 'familyRepetition': False,
                'lawFamilyRepetition': False, 'excludedScopes': excluded_scopes,
                'includedScopes': deepcopy(included_scopes),
                'samplingStrategy': {'kind': 'editorial_training', 'officialUnitQuota': False,
                                     'requestedUnitCoverage': required_units,
                                     'coveredUnits': sorted(unit_counts),
                                     'unitCoverageComplete': all(unit_counts[unit] > 0 for unit in required_units)},
                'questions': [student_question(question) for question in picked]}

    def attempt(self, question_id, response, *, profile_id='semestre-2026', expected_sha256=None):
        self._pin(expected_sha256)
        if not isinstance(response, str) or len(response) > MAX_ANSWER_LENGTH:
            raise StudyError('invalid_answer')
        if not isinstance(question_id, str) or question_id not in self._by_id:
            raise StudyError('question_not_found', 404)
        question = self._by_id[question_id]
        answer = question['answer']
        scoring = self._exam_profile(profile_id)['scoring']
        policy = 'choice_id' if question['format'] == 'multiple_choice' else (
            'exact_rational' if answer['kind'] == 'rational' else 'approved_aliases_only')
        if not response.strip():
            outcome = 'omitted'
        elif question['format'] == 'multiple_choice':
            outcome = 'correct' if response.strip().upper() == answer['correctOptionId'] else 'incorrect'
        elif answer['kind'] == 'rational':
            value = parse_rational(_without_unit(response, answer['unit']))
            outcome = 'correct' if value is not None and value == parse_rational(answer['exact']) else 'incorrect'
        else:
            aliases = list(answer['accepted']) + [answer['exact']]
            normalize = lambda value: _alias(value, symbolic=answer['kind'] == 'symbolic')
            outcome = 'correct' if normalize(response) in {normalize(alias) for alias in aliases} else 'incorrect'
        return {'questionId': question_id, 'bankId': BANK_ID, 'bankSha256': self.sha256,
                'outcome': outcome, 'score': scoring[outcome], 'matchingPolicy': policy,
                'answer': deepcopy(answer), 'solution': question['solution'],
                'solutionSteps': deepcopy(question['solutionSteps']),
                'editorialStatus': question['status'], 'scientificApproval': 'NOT_RUN',
                'reviewer': None, 'persisted': False}


def load_bank(bank_id=BANK_ID):
    if not isinstance(bank_id, str) or bank_id not in BANK_PATHS:
        raise StudyError('question_bank_not_found', 404)
    directory = Path(BANK_PATHS[bank_id]).resolve()
    # Authentication and edition access happen before this content-only cache.
    # A stat check is cheap on every request; a miss revalidates all SHA-256s.
    with _BANK_CACHE_LOCK:
        cached = _BANK_CACHE.get(directory)
        if cached is not None:
            try:
                unchanged = _source_fingerprint(directory, cached._source_names) == cached._source_fingerprint
            except (OSError, ValueError):
                unchanged = False
            if unchanged:
                _BANK_CACHE.move_to_end(directory)
                return cached
            del _BANK_CACHE[directory]
        snapshot = QuestionBank(directory)
        _BANK_CACHE[directory] = snapshot
        while len(_BANK_CACHE) > _BANK_CACHE_LIMIT:
            _BANK_CACHE.popitem(last=False)
        return snapshot


def bank_for_edition(store, principal, edition_id, bank_id=BANK_ID):
    """Recheck persisted membership and the pinned CoursePack on every request."""
    return bank_access_for_edition(store, principal, edition_id, bank_id)[1]


def bank_access_for_edition(store, principal, edition_id, bank_id=BANK_ID):
    """Return the authorized edition and bank; never trust a client bank id."""
    edition = store._edition_access(principal, edition_id)
    if bank_id not in edition.get('questionBankIds', []):
        raise StudyError('question_bank_not_available_for_edition', 404)
    return edition, load_bank(bank_id)


def bank_catalog_for_edition(store, principal, edition_id):
    edition = store._edition_access(principal, edition_id)
    from .question_bank_approvals import ApprovalGate
    items = []
    for bank_id in edition.get('questionBankIds', []):
        bank = load_bank(bank_id)
        gate = ApprovalGate(store, bank, edition_id)
        published = None if principal.role == 'teacher' else gate.servable_ids()
        items.append(bank.catalog(published_ids=published))
    return {'editionId': edition_id, 'items': items}
