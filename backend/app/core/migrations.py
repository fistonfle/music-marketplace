"""Thin Alembic wrapper used at app startup."""

from pathlib import Path

from alembic import command
from alembic.config import Config


def upgrade_head() -> None:
    # Resolve alembic.ini relative to the backend package root so this works whether
    # the process cwd is `/backend` (Docker/local) or something else (CI/tests).
    backend_root = Path(__file__).resolve().parents[2]
    alembic_ini = backend_root / "alembic.ini"
    cfg = Config(str(alembic_ini if alembic_ini.exists() else Path("alembic.ini")))
    command.upgrade(cfg, "head")

