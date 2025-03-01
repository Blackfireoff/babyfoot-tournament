import logging
import sys
from sqlalchemy.exc import OperationalError
from sqlalchemy import text
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

def check_database_connection():
    """
    Check if the database connection is working
    """
    try:
        # Import settings and database modules
        from app.core.config import settings
        from app.db.database import engine
        
        # Log database URL (with password masked)
        db_url = settings.EFFECTIVE_DATABASE_URL
        masked_url = db_url
        if "@" in db_url and ":" in db_url:
            # Mask password in URL for logging
            parts = db_url.split("@")
            credentials = parts[0].split("://")[1].split(":")
            masked_url = f"{parts[0].split('://')[0]}://{credentials[0]}:****@{parts[1]}"
        
        logger.info(f"Checking connection to database: {masked_url}")
        
        # Try to connect to the database
        with engine.connect() as conn:
            # Use SQLAlchemy text() to make the query compatible with all databases
            result = conn.execute(text("SELECT 1")).scalar()
            if result == 1:
                logger.info("✅ Database connection successful!")
                return True
            else:
                logger.error("❌ Database connection test failed!")
                return False
    except OperationalError as e:
        logger.error(f"❌ Database connection error: {str(e)}")
        logger.info("Database connection options:")
        logger.info("1. Make sure PostgreSQL is running")
        logger.info("2. Check your DATABASE_URL in the .env file")
        logger.info("3. Use SQLite fallback by setting USE_SQLITE_FALLBACK=True in your .env file")
        return False
    except Exception as e:
        logger.error(f"❌ Unexpected error: {str(e)}")
        return False

if __name__ == "__main__":
    success = check_database_connection()
    if not success:
        sys.exit(1) 