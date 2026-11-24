"""Check the actual distributable, not merely its intended file filter."""
import sys
import zipfile


def check(path):
    with zipfile.ZipFile(path) as archive:
        relative = lambda name: name.partition("/")[2]
        forbidden = [name for name in archive.namelist() if relative(name).startswith((
            "editorial/", "tools/corpus_engineering/", "tests/corpus/", "static/figures/corpus-"))]
        if forbidden: raise ValueError("Unpublished editorial material in release: " + str(forbidden))
        if not any(name.endswith("/content/C1.json") for name in archive.namelist()):
            raise ValueError("Canonical course missing from release")
    return {"draftSourcesInRelease": 0, "draftFiguresInRelease": 0}


if __name__ == "__main__": print(check(sys.argv[1]))
