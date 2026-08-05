from pathlib import Path

from app.core.config import get_settings
from app.db.manager import DatabaseManager


def main() -> None:
    settings = get_settings()
    manager = DatabaseManager(settings)
    manager.open()
    try:
        count = manager.migrate(Path(__file__).parent / "migrations")
        status = manager.status()
        print(f"migrations={count} schema_version={status.migration_version} ready={status.ready}")
    finally:
        manager.close()


if __name__ == "__main__":
    main()
