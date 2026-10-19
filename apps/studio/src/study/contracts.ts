/** HTTP study-resource shape, checked against the live API in the E2E journey. */
export type StudyResource = {
  id: string; revisionId: string; contextId: string; ownerId: string; editionId: string;
  kind: string; visibility: 'private'|'group'; text: string; sha256: string;
}
export type PostitReference = {resourceId:string; revisionId:string; contextId:string}
