// @vitest-environment jsdom
import { afterEach, expect, test, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { createStudyPostit, moveStudyPostit } from '../postit'
import { StudyPostit } from '../StudyPostit'

afterEach(cleanup)
const resource = {id:'resource-1', revisionId:'rev-1', contextId:'context-1', ownerId:'student-01', editionId:'fluidi', kind:'notes', visibility:'private' as const, text:'Una fonte sintetica', sha256:'a'.repeat(64)}

test('moving_postit_preserves_resource_revision_and_acl',()=>{
  const view=createStudyPostit('study-source-1',resource,{x:0,y:0,width:320,height:240})
  const moved=moveStudyPostit(view,{x:120,y:80,width:400,height:300})
  expect(moved.pluginState).toEqual({resourceId:'resource-1',revisionId:'rev-1',contextId:'context-1'})
  expect(moved.bounds.x).toBe(120)
  expect(resource.ownerId).toBe('student-01')
  expect(resource.visibility).toBe('private')
})

test('same_resource_two_views_not_two_sources',()=>{
  const one=createStudyPostit('study-source-1',resource,{x:0,y:0,width:320,height:240})
  const two=createStudyPostit('study-source-2',resource,{x:340,y:0,width:320,height:240})
  expect(one.instanceId).not.toBe(two.instanceId)
  expect(one.pluginState.resourceId).toBe(two.pluginState.resourceId)
  const resolve=vi.fn(()=>resource)
  render(<><StudyPostit view={one} resource={resolve()} onSubmit={()=>{}}/><StudyPostit view={two} resource={resolve()} onSubmit={()=>{}}/></>)
  expect(screen.getAllByText('Una fonte sintetica')).toHaveLength(2)
})

test('keyboard_context_has_explicit_commands_and_restores_focus',()=>{
  const view=createStudyPostit('study-source-1',resource,{x:0,y:0,width:320,height:240})
  const submit=vi.fn()
  render(<StudyPostit view={view} resource={resource} onSubmit={submit}/>)
  const open=screen.getByRole('button',{name:'Contesto della fonte'})
  open.focus(); fireEvent.click(open)
  expect(screen.getByRole('dialog').textContent).toContain('rev-1')
  fireEvent.keyDown(screen.getByRole('dialog'),{key:'Escape'})
  expect(document.activeElement).toBe(open)
  fireEvent.click(screen.getByRole('button',{name:'Usa nella consegna'}))
  expect(submit).toHaveBeenCalledWith({resourceId:'resource-1',revisionId:'rev-1',contextId:'context-1'})
})
