"""Back-compat import path.

Prefer importing from `app.api.deps`.
"""

from app.api.deps import get_current_user, require_admin  # noqa: F401

