import pytest
from pydantic import ValidationError

from app.core.config import Settings
from app.db.manager import DatabaseManager


def test_database_is_optional_by_default() -> None:
    settings = Settings(_env_file=None)
    status = DatabaseManager(settings).status()
    assert status.configured is False
    assert status.required is False
    assert status.ready is True


def test_database_url_requires_ssl() -> None:
    with pytest.raises(ValidationError):
        Settings(_env_file=None, database_url="postgresql://user:pass@host/db")


def test_neon_style_ssl_url_is_accepted_and_secret_is_masked() -> None:
    settings = Settings(
        _env_file=None,
        database_url="postgresql://user:pass@host/db?sslmode=require",
    )
    assert settings.database_url is not None
    assert "pass" not in repr(settings.database_url)


def test_pool_max_cannot_be_smaller_than_min() -> None:
    with pytest.raises(ValidationError):
        Settings(
            _env_file=None,
            database_pool_min_size=5,
            database_pool_max_size=2,
        )
