"""Explicit metadata allowlist shared with Core's existing private catalog read."""
from typing import Literal
from pydantic import Field
from .contracts import CoreDTO, Digest, StrictInput

class CatalogInput(StrictInput):
    pass

class Source(CoreDTO):
    title: str | None = None
    url: str | None = None
    scope: str | None = None

class Metadata(CoreDTO):
    id: str
    title: str
    prerequisites: list[str]
    learningObjectives: list[str]
    editorialStatus: str
    scientificReview: str
    gaps: list[str]
    creatable: bool

class Activity(CoreDTO):
    id: str
    title: str

class Programme(Metadata):
    subject: str
    packId: str
    packVersion: int
    packSha256: Digest
    entryActivityId: str | None
    scope: str
    activities: list[Activity]
    exerciseCount: int
    transferCount: int
    solutionCount: int
    rights: str
    sources: list[Source]

class Reference(CoreDTO):
    id: str
    version: int
    contentSha256: Digest

class Selection(CoreDTO):
    miniCourseId: str

class Collection(Metadata):
    subject: str
    bankId: str
    bankVersion: int
    bankSha256: Digest
    academicYear: str | None
    selection: Selection
    unitIds: list[str]
    microareas: list[str]
    topics: list[str]
    questionCount: int
    familyCount: int
    solutionCount: int
    countsByDifficulty: dict[str, int]
    countsByFormat: dict[str, int]
    countsByUnit: dict[str, int]
    questionRefs: list[Reference] = Field(max_length=3)

class Coverage(CoreDTO):
    questionCount: int
    familyCount: int
    unitIds: list[str]
    prerequisites: list[str]
    learningObjectives: list[str]
    microareas: list[str]
    countsByAuthoringStatus: dict[str, int]
    editorialStatus: str
    scientificReview: str
    publicationStatus: Literal['EDITION_SCOPED']
    creatable: Literal[False]
    gaps: list[str]

class Unit(Coverage):
    id: str
    title: str
    collectionIds: list[str]

class Pathway(Coverage):
    id: str
    title: str
    units: list[Unit] = Field(max_length=50)

class BankRef(CoreDTO):
    bankId: str
    bankVersion: int
    bankSha256: Digest

class Provenance(CoreDTO):
    kind: str
    scientificValidation: str
    sources: list[Source]

class Pathways(CoreDTO):
    id: str
    version: int
    sha256: Digest
    bankRef: BankRef
    items: list[Pathway] = Field(max_length=20)
    coverage: Coverage
    transversalCollectionIds: list[str]
    provenance: Provenance

class SharedPrerequisite(CoreDTO):
    label: str
    entryIds: list[str]

class Inventory(CoreDTO):
    programmes: list[Programme] = Field(max_length=50)
    collections: list[Collection] = Field(max_length=100)
    pathways: Pathways | None
    pathwaysError: str | None
    sharedPrerequisites: list[SharedPrerequisite]

class CatalogDTO(CoreDTO):
    inventory: Inventory
