import logging
import sys
from sqlalchemy.orm import Session
from sqlalchemy.exc import OperationalError, SQLAlchemyError

from app.db.database import SessionLocal, engine
from app.db.base import Base
from app.crud import user as crud_user
from app.schemas.user import UserCreate
from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db() -> None:
    try:
        # Create tables
        logger.info("Creating database tables...")
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
        
        db = SessionLocal()
        try:
            # Create admin user
            user = crud_user.get_by_email(db, email="admin@example.com")
            if not user:
                logger.info("Creating admin user...")
                user_in = UserCreate(
                    email="admin@example.com",
                    username="admin",
                    password="admin123",
                    full_name="Administrator"
                )
                user = crud_user.create(db, obj_in=user_in)
                # Set as admin
                user.is_admin = True
                db.add(user)
                db.commit()
                logger.info("Admin user created successfully")
            else:
                logger.info("Admin user already exists")
                
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(f"Database error while creating admin user: {str(e)}")
            raise
        finally:
            db.close()
    except OperationalError as e:
        logger.error(f"Database error: {str(e)}")
        logger.error("Please make sure your database is properly configured")
        if not settings.USE_SQLITE_FALLBACK:
            logger.error("Consider using SQLite fallback by setting USE_SQLITE_FALLBACK=True in your .env file")
        else:
            logger.error("SQLite connection failed. Check your SQLITE_URL in the .env file.")
            logger.error("Make sure the directory for the SQLite database exists and is writable.")
        raise
    except Exception as e:
        logger.error(f"Error initializing database: {str(e)}")
        raise

def main() -> None:
    logger.info("Creating initial data")
    try:
        init_db()
        logger.info("Initial data created successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main() 