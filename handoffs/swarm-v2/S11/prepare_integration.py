"""Create a reviewable patch for shared-file owners; never edit their files.

The optional --copies output supports tests of exactly these proposed sources.
It is a local composition counterproof, not evidence of an installed hook.
"""
import argparse
import difflib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
CHANGES = {
    'services/study-api/study_api/app.py': [
        ('request_body_budget=128*1024*1024, request_body_wait=.5):',
         'request_body_budget=128*1024*1024, request_body_wait=.5, learning_insights_notice=None):'),
        ('    from .admin_routes import install_admin_routes',
         '    from lessonos.study.learning_insights.routes import install_routes as install_learning_insights_routes\n'
         '    install_learning_insights_routes(app,store_dependency,authenticate,notice=learning_insights_notice)\n'
         '    from .admin_routes import install_admin_routes')],
    'packages/engine/lessonos/study/operations.py': [
        ("        try:\n            with store.transaction() as c:c.execute('DELETE FROM study_sessions');c.execute('DELETE FROM study_invitations')",
         "        try:\n            from .learning_insights.maintenance import invalidate_after_restore\n"
         "            invalidate_after_restore(store,apply=True)\n"
         "            with store.transaction() as c:c.execute('DELETE FROM study_sessions');c.execute('DELETE FROM study_invitations')")],
    'apps/web/src/App.tsx': [
        ('const Courses = lazy(() =>',
         'const LearningInsights = lazy(() => import("./features/learning-insights/LearningInsights").then(m => ({default:m.LearningInsights})));\nconst Courses = lazy(() =>'),
        ('              ) : view === "work" ? (\n                <Work',
         '              ) : view === "work" ? (\n                <>\n                <Work'),
        ('              ) : view === "review" && me.role === "teacher" ? (',
         '                <LearningInsights me={me} editionId={data.edition.id}/>\n                </>\n              ) : view === "review" && me.role === "teacher" ? (')]
}


def prepare(root=ROOT, copies=None):
    patch = ''
    for filename, replacements in CHANGES.items():
        before = (root / filename).read_text()
        after = before
        for old, new in replacements:
            if new in after:
                continue  # The owner-approved hook is already installed.
            if after.count(old) != 1:
                raise ValueError(f'Shared source changed; review new owner source: {filename}')
            after = after.replace(old, new)
        patch += ''.join(difflib.unified_diff(before.splitlines(True),after.splitlines(True),
                                             fromfile='a/'+filename,tofile='b/'+filename))
        if copies is not None:
            target = Path(copies) / filename
            target.parent.mkdir(parents=True,exist_ok=True)
            target.write_text(after)
    if copies is not None:
        schema = 'packages/engine/lessonos/study/schema.sql'
        (Path(copies) / schema).write_bytes((root / schema).read_bytes())
    # Git accepts empty context lines without a space prefix; keep the patch itself whitespace-clean.
    return ''.join('\n' if line == ' \n' else line for line in patch.splitlines(True))


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--copies',type=Path)
    parser.add_argument('--patch',type=Path,required=True)
    args = parser.parse_args()
    args.patch.write_text(prepare(copies=args.copies))
