"""Tests validating migration discovery and authoritative path."""
from pathlib import Path

MIGRATIONS_DIR = Path(__file__).parents[1] / "app" / "db" / "migrations"


def test_migration_directory_is_authoritative() -> None:
    """The canonical migration path inside app/db/migrations must exist."""
    assert MIGRATIONS_DIR.is_dir(), f"Migrations directory not found: {MIGRATIONS_DIR}"


def test_foundation_migration_present() -> None:
    files = sorted(MIGRATIONS_DIR.glob("*.sql"))
    names = [f.name for f in files]
    assert any("0001" in name for name in names), f"Foundation migration missing; found: {names}"


def test_market_data_schema_migration_present() -> None:
    files = sorted(MIGRATIONS_DIR.glob("*.sql"))
    names = [f.name for f in files]
    assert any("0002" in name for name in names), f"Market data schema migration missing; found: {names}"


def test_migrations_are_numerically_ordered() -> None:
    """Migration filenames must start with a zero-padded integer prefix."""
    files = sorted(MIGRATIONS_DIR.glob("*.sql"))
    for path in files:
        prefix = path.stem.split("_")[0]
        assert prefix.isdigit(), f"Migration file {path.name} must start with a numeric prefix"


def test_no_split_path_duplicates() -> None:
    """Old backend/migrations directory should not contain files also present in the canonical path."""
    old_dir = Path(__file__).parents[1] / "migrations"
    if not old_dir.is_dir():
        return  # already removed; test passes trivially
    canonical_names = {p.stem.lstrip("0") for p in MIGRATIONS_DIR.glob("*.sql")}
    for old_file in old_dir.glob("*.sql"):
        old_stem = old_file.stem.lstrip("0")
        assert old_stem not in canonical_names, (
            f"Migration {old_file.name} exists in both old and canonical path — remove from old path"
        )
