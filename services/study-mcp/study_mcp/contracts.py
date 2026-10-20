"""Strict caller inputs; explicit allowlists for authorized Core response data."""
from typing import Annotated, Generic, Literal, TypeVar
from pydantic import BaseModel, ConfigDict, Field, JsonValue, StringConstraints

Identifier = Annotated[str, StringConstraints(min_length=1, max_length=128, pattern=r'^[A-Za-z0-9][A-Za-z0-9_-]*$')]
ContextIdentifier = Annotated[str, StringConstraints(min_length=1, max_length=8192, pattern=r'^[A-Za-z0-9][A-Za-z0-9_-]*$')]
OpaqueCursor = Annotated[str, StringConstraints(min_length=1, max_length=8192, pattern=r'^[^\x00-\x1f\x7f]+$')]
CoreId = Annotated[str, StringConstraints(min_length=1, max_length=16384)]
Text = Annotated[str, StringConstraints(max_length=20000)]
Digest = Annotated[str, StringConstraints(pattern=r'^[0-9a-f]{64}$')]


class StrictInput(BaseModel):
    model_config = ConfigDict(extra='forbid', strict=True)


class CourseInput(StrictInput):
    limit: int = Field(default=20, ge=1, le=50)
    cursor: OpaqueCursor | None = None


class ContextInput(StrictInput):
    contextId: ContextIdentifier
    resourceId: Identifier
    revisionId: Identifier
    query: str = Field(default='', max_length=500)


class ReceiptInput(StrictInput):
    receiptId: Identifier


class CoreDTO(BaseModel):
    # Newly added Core fields are not automatically exposed to external clients.
    model_config = ConfigDict(extra='ignore', strict=True, allow_inf_nan=False)


class SessionDTO(CoreDTO):
    id: CoreId
    role: Literal['student', 'teacher']


class CourseSession(CoreDTO):
    start: str
    end: str


class EditionDTO(CoreDTO):
    id: CoreId
    teacherId: CoreId
    capacity: int = Field(ge=1)
    priceMinor: int = Field(ge=0)
    state: str
    sessions: list[CourseSession] = Field(max_length=100)
    timezone: str
    courseId: str
    packId: str
    packVersion: int
    packSha256: Digest
    title: str
    subject: str
    duration: str


class CoursePage(CoreDTO):
    items: list[EditionDTO] = Field(max_length=50)
    nextCursor: OpaqueCursor | None


class ResourceDTO(CoreDTO):
    id: CoreId
    revisionId: CoreId
    contextId: CoreId
    ownerId: CoreId
    editionId: CoreId
    kind: str
    visibility: Literal['private', 'group']
    text: Text
    sha256: Digest


class ObservationEvidence(CoreDTO):
    submissionId: CoreId
    sourceId: CoreId | None
    revisionId: CoreId | None
    segmentId: CoreId
    text: Text


class Observation(CoreDTO):
    id: CoreId
    reviewId: CoreId
    text: Text
    evidence: ObservationEvidence
    status: str
    relations: list[str] = Field(max_length=20)


class ContextDTO(CoreDTO):
    contextId: CoreId
    resource: ResourceDTO
    sourceState: Literal['CURRENT', 'HISTORICAL']
    observations: list[Observation] = Field(max_length=6)
    omittedStale: int = Field(ge=0)
    limits: list[str] = Field(max_length=20)


class CourseContext(CoreDTO):
    courseId: str
    packId: str
    packVersion: int
    packSha256: Digest
    modelId: str | None
    modelVersion: int | None
    parameters: dict[str, JsonValue] | None


class ActivityContext(CoreDTO):
    threadId: CoreId
    exerciseId: CoreId
    parameters: dict[str, JsonValue]
    prompt: Text
    rubric: list[str]
    assignedAfterEventSeq: int


class ReceiptDTO(CoreDTO):
    receiptId: CoreId
    submissionId: CoreId
    studentId: CoreId
    activityId: CoreId
    revision: int = Field(ge=1)
    parentId: CoreId | None
    receivedAt: float
    state: Literal['received']
    courseContext: CourseContext | None = None
    activityContext: ActivityContext | None = None


Data = TypeVar('Data')


class Envelope(BaseModel, Generic[Data]):
    model_config = ConfigDict(extra='forbid', strict=True)
    schemaVersion: Literal['ardesia.mcp.read/1'] = 'ardesia.mcp.read/1'
    status: Literal['ok', 'unavailable']
    data: Data | None
    sourceVersion: dict[str, JsonValue] | None
    evidenceRefs: list[dict[str, str]]
    representation: Literal['text-fallback'] = 'text-fallback'
    capabilities: dict[str, bool] = Field(default_factory=lambda: {'interactiveUI':False})
    losses: list[str]
    error: str | None = None


INPUTS = {'course.list_mine':CourseInput, 'lesson.get_context':ContextInput, 'submission.get_receipt':ReceiptInput}
OUTPUTS = {'course.list_mine':Envelope[CoursePage], 'lesson.get_context':Envelope[ContextDTO],
           'submission.get_receipt':Envelope[ReceiptDTO]}
