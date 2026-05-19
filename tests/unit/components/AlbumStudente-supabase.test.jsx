/**
 * AlbumStudente Supabase wire-up test — iter 72 TEAM D.
 *
 * Closes Codex iter 70 MED finding: "Album SCAFFOLD only — no Supabase
 * integration". Iter 72 added an optional fetch path triggered ONLY when
 * `sessions` prop is undefined AND `studentId` is provided.
 *
 * These tests verify:
 *   - Mocked Supabase client returns mapped sessions → renders grid + cards.
 *   - Empty Supabase result → renders empty-state with plurale "Ragazzi"
 *     opener + kit ELAB hint (PRINCIPIO ZERO).
 *   - Supabase error → renders empty-state + offline marker testid.
 *   - Backward-compat: explicit `sessions={[]}` short-circuits the fetch.
 *
 * Andrea Marro — 2026-05-17 iter 72 Team D
 */
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

// Mock the supabaseClient module BEFORE importing the component under test.
// Tests dynamically swap the `.from()` resolver per scenario via the
// `__nextResponse` helper (single-shot Promise resolver).
let __nextResponse = { data: [], error: null };

vi.mock('../../../src/services/supabaseClient', () => {
  const mockSelect = {
    eq: vi.fn(function () { return this; }),
    order: vi.fn(function () { return Promise.resolve(__nextResponse); }),
  };
  const mockFrom = vi.fn(() => ({
    select: vi.fn(() => mockSelect),
  }));
  const supabase = { from: mockFrom };
  return {
    default: supabase,
    isSupabaseConfigured: () => true,
  };
});

// Imported AFTER mock declaration.
import AlbumStudente from '../../../src/components/album/AlbumStudente';

const ROW_FIXTURE = {
  id: 'album-row-1',
  student_id: 'student-uuid-abc',
  experiment_id: 'v1-cap6-esp1',
  chapter_title: 'I LED',
  comic_asset_url: null,
  comic_metadata: {
    experimentTitle: 'Accendi il primo LED',
    panels: [
      { index: 1, role: 'problema', title: 'Il problema', caption: 'CAP. 6 — I LED' },
      { index: 2, role: 'successo', title: 'Funziona!', caption: 'OK' },
    ],
  },
  created_at: '2026-05-16T10:00:00.000Z',
};

describe('AlbumStudente Supabase wire-up (iter 72 TEAM D)', () => {
  beforeEach(() => {
    __nextResponse = { data: [], error: null };
  });

  it('fetches from Supabase when sessions prop is undefined + studentId provided', async () => {
    __nextResponse = { data: [ROW_FIXTURE], error: null };
    render(<AlbumStudente studentId="student-uuid-abc" />);
    await waitFor(() => {
      expect(screen.getByTestId('album-grid')).toBeTruthy();
    });
    expect(screen.getByTestId('album-card-album-row-1')).toBeTruthy();
    expect(screen.getByText('Accendi il primo LED')).toBeTruthy();
  });

  it('renders empty state plurale "Ragazzi" + kit ELAB hint when Supabase returns zero rows', async () => {
    __nextResponse = { data: [], error: null };
    render(<AlbumStudente studentId="student-uuid-abc" />);
    await waitFor(() => {
      expect(screen.getByTestId('album-empty')).toBeTruthy();
    });
    const empty = screen.getByTestId('album-empty');
    expect(empty.textContent).toMatch(/Ragazzi/);
    expect(empty.textContent).toMatch(/kit ELAB/i);
  });

  it('shows offline marker when Supabase fetch errors', async () => {
    __nextResponse = { data: null, error: { message: 'relation does not exist' } };
    render(<AlbumStudente studentId="student-uuid-abc" />);
    await waitFor(() => {
      expect(screen.getByTestId('album-fetch-error')).toBeTruthy();
    });
    expect(screen.getByTestId('album-empty')).toBeTruthy();
  });

  it('does NOT fetch when sessions prop is explicitly empty array (backward-compat iter 70)', async () => {
    render(<AlbumStudente sessions={[]} studentId="student-uuid-abc" />);
    // Empty-state renders immediately, no loading state observed.
    expect(screen.getByTestId('album-empty')).toBeTruthy();
    expect(screen.queryByTestId('album-loading')).toBeNull();
  });

  it('renders loading state initially when sessions prop is undefined', () => {
    render(<AlbumStudente studentId="student-uuid-abc" />);
    // Loading state shown before async fetch resolves.
    expect(screen.getByTestId('album-loading')).toBeTruthy();
    expect(screen.getByTestId('album-loading').textContent).toMatch(/Ragazzi/);
  });
});
