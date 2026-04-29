from core.database import Base

# Import all models here so Alembic can discover them
from models.user import User

__all__ = ["Base", "User"]
