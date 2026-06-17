import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ExperimentPicker from '../../../src/components/lavagna/ExperimentPicker';

// Helper: switch to "Tutti gli esperimenti" view (chapter view)
function switchToChapterView() {
  const btn = screen.getByText('Tutti gli esperimenti');
  fireEvent.click(btn);
}

describe('ExperimentPicker', () => {
  const mockClose = vi.fn();
  const mockSelect = vi.fn();

  afterEach(() => { vi.clearAllMocks(); });

  it('does not render when closed', () => {
    const { container } = render(
      <ExperimentPicker open={false} onClose={mockClose} onSelect={mockSelect} />
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders modal with 3 volume tabs when open', () => {
    render(<ExperimentPicker open={true} onClose={mockClose} onSelect={mockSelect} />);
    expect(screen.getByText('Volume 1')).toBeTruthy();
    expect(screen.getByText('Volume 2')).toBeTruthy();
    expect(screen.getByText('Volume 3')).toBeTruthy();
  });

  it('defaults to lesson view with lesson cards', () => {
    render(<ExperimentPicker open={true} onClose={mockClose} onSelect={mockSelect} />);
    // Should show lesson titles, not individual experiments
    expect(screen.getByText('Accendi il LED')).toBeTruthy();
    expect(screen.getByText('Il LED RGB')).toBeTruthy();
    expect(screen.getByText('Lezioni')).toBeTruthy();
  });

  it('shows experiment cards in chapter view', () => {
    render(<ExperimentPicker open={true} onClose={mockClose} onSelect={mockSelect} />);
    switchToChapterView();
    expect(screen.getByText(/Accendi il tuo primo LED/i)).toBeTruthy();
  });

  it('switches volume when tab is clicked', () => {
    render(<ExperimentPicker open={true} onClose={mockClose} onSelect={mockSelect} />);
    fireEvent.click(screen.getByText('Volume 2'));
    // In lesson view, should show Vol2 lessons
    // Sprint U Cycle 3: rinominato da v2-resistenze "Le resistenze in dettaglio" → v2-multimetro "Il Multimetro"
    expect(screen.getByText('Il Multimetro')).toBeTruthy();
    // Switch to chapter view and check Vol2 experiments
    switchToChapterView();
    expect(screen.queryByText(/Accendi il tuo primo LED/i)).toBeNull();
  });

  it('filters lessons by search', () => {
    render(<ExperimentPicker open={true} onClose={mockClose} onSelect={mockSelect} />);
    const input = screen.getByPlaceholderText('Cerca esperimento...');
    fireEvent.change(input, { target: { value: 'plastilina' } });
    // Should show plastilina lesson
    expect(screen.getByText('Circuiti con la plastilina')).toBeTruthy();
    // Should NOT show unrelated lessons
    expect(screen.queryByText('Accendi il LED')).toBeNull();
  });

  it('expands lesson to show experiments on click', () => {
    render(<ExperimentPicker open={true} onClose={mockClose} onSelect={mockSelect} />);
    // Click on "Accendi il LED" lesson (has 3 experiments)
    const lessonBtn = screen.getByText('Accendi il LED').closest('button');
    fireEvent.click(lessonBtn);
    // Should now show the individual experiments
    expect(screen.getByText(/primo LED/i)).toBeTruthy();
  });

  it('calls onSelect and onClose when experiment is clicked from chapter view', () => {
    render(<ExperimentPicker open={true} onClose={mockClose} onSelect={mockSelect} />);
    switchToChapterView();
    const firstCard = screen.getByText(/Accendi il tuo primo LED/i).closest('button');
    fireEvent.click(firstCard);
    expect(mockSelect).toHaveBeenCalledTimes(1);
    expect(mockSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'v1-cap6-esp1' }));
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it('closes on Escape key', () => {
    render(<ExperimentPicker open={true} onClose={mockClose} onSelect={mockSelect} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it('closes on backdrop click', () => {
    render(<ExperimentPicker open={true} onClose={mockClose} onSelect={mockSelect} />);
    const backdrop = screen.getByRole('dialog');
    fireEvent.click(backdrop);
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it('shows completion count', () => {
    render(
      <ExperimentPicker open={true} onClose={mockClose} onSelect={mockSelect} completedIds={['v1-cap6-esp1']} />
    );
    expect(screen.getByText(/1\/38 completati/)).toBeTruthy();
  });

  it('has accessible dialog role and label', () => {
    render(<ExperimentPicker open={true} onClose={mockClose} onSelect={mockSelect} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.getAttribute('aria-label')).toBe('Scegli un esperimento');
  });
});
