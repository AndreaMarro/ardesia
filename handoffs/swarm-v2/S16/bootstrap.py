"""Fetch only the three pinned, small build/test packages; never run npm scripts."""
import base64
import hashlib
import io
import json
from pathlib import Path
import subprocess
import tarfile

ROOT = Path(__file__).resolve().parent
PACKAGES = [
    ("property-graph", "4.1.0", "https://registry.npmjs.org/property-graph/-/property-graph-4.1.0.tgz", "AvPcP7XECNWy4LGmFQ77k7un4lSKM4eS29PTvW4ck95uYeLxXPWJM7hLuBqK91FaHqCcgJvIUCuNJjjxKE7VKQ=="),
    ("@gltf-transform/core", "4.5.1", "https://registry.npmjs.org/@gltf-transform/core/-/core-4.5.1.tgz", "OWgBYssKHKoXMIrMb2N20jXqWRnMP9HdtcTFQBEAJtz4P+OOxx5fozl5eAeK7nktIs5uDE/lu4NbkE5VCZaR9g=="),
    ("gltf-validator", "2.0.0-dev.3.10", "https://registry.npmjs.org/gltf-validator/-/gltf-validator-2.0.0-dev.3.10.tgz", "odJ4k0tRkGXiDGn78yDBg+fBbAIvBnXxh3RwAta0emSxGtyagFE8B4xELB1oYe3S5RD8Ci3uZAsZaascH2LAEQ=="),
]


def main():
    receipts = []
    for name, version, url, digest in PACKAGES:
        destination = ROOT / ".toolchain" / "node_modules" / name
        if destination.exists():
            raise SystemExit(f"Existing toolchain at {destination}; use it or remove it explicitly before bootstrap")
        # macOS system curl uses the installed trust store. Do not disable TLS
        # verification when a standalone Python installation lacks its CA bundle.
        data = subprocess.run(["curl", "--fail", "--silent", "--show-error", "--location",
                               "--proto", "=https", "--tlsv1.2", "--max-time", "30",
                               "--max-filesize", "8000000", url], check=True, capture_output=True).stdout
        if len(data) > 8_000_000:
            raise SystemExit("Download exceeds 8 MB cap")
        if base64.b64encode(hashlib.sha512(data).digest()).decode() != digest:
            raise SystemExit(f"Integrity mismatch: {name}")
        with tarfile.open(fileobj=io.BytesIO(data), mode="r:gz") as archive:
            members = archive.getmembers()
            if sum(m.size for m in members) > 8_000_000:
                raise SystemExit("Unpacked package exceeds 8 MB cap")
            for member in members:
                path = Path(member.name)
                if not path.parts or path.parts[0] != "package" or ".." in path.parts:
                    raise SystemExit("Unexpected archive path")
                if not (member.isdir() or member.isfile()):
                    raise SystemExit("Links and special files are not accepted")
            for member in members:
                target = destination.joinpath(*Path(member.name).parts[1:])
                if member.isdir():
                    target.mkdir(parents=True, exist_ok=True)
                else:
                    target.parent.mkdir(parents=True, exist_ok=True)
                    target.write_bytes(archive.extractfile(member).read())
        metadata = json.loads((destination / "package.json").read_text())
        assert metadata["name"] == name and metadata["version"] == version
        receipt = {"name": name, "version": version, "license": metadata["license"],
                   "url": url, "sha512": digest, "downloadBytes": len(data)}
        receipts.append(receipt)
        print(f"{name}@{version}: verified {len(data)} bytes; {metadata['license']}")
    (ROOT / ".toolchain" / "receipt.json").write_text(json.dumps(receipts, indent=2) + "\n")


if __name__ == "__main__":
    main()
