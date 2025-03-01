from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError
import logging

from app.core.config import settings
from app.db.base_class import Base

# Configure logging
logger = logging.getLogger(__name__)

# Create database connection URL
SQLALCHEMY_DATABASE_URL = settings.EFFECTIVE_DATABASE_URL
logger.info(f"Using database URL: {SQLALCHEMY_DATABASE_URL}")

# Create SQLAlchemy engine with connection pool settings
engine_args = {
    "pool_pre_ping": True,  # Enable connection health checks
    "pool_recycle": 3600,   # Recycle connections after 1 hour
}

# Add connect_args only for PostgreSQL
if not settings.USE_SQLITE_FALLBACK:
    engine_args["connect_args"] = {"connect_timeout": 10}  # Set connection timeout to 10 seconds

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    **engine_args
)

# Create local session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Function to get a database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    except SQLAlchemyError as e:
        logger.error(f"Database error: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close() 