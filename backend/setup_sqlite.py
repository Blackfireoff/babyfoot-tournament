import os
import sys
import logging
from dotenv import load_dotenv
from sqlalchemy import text

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

def setup_sqlite():
    """
    Set up SQLite database for development
    """
    try:
        # Make sure we're using SQLite
        os.environ["USE_SQLITE_FALLBACK"] = "True"
        
        # Import settings and database modules
        from app.core.config import settings
        from app.db.database import engine
        from app.db.base import Base
        
        # Check if we're using SQLite
        if not settings.USE_SQLITE_FALLBACK:
            logger.error("This script is intended for SQLite setup only.")
            logger.error("Please set USE_SQLITE_FALLBACK=True in your .env file.")
            return False
        
        # Log database URL
        db_url = settings.EFFECTIVE_DATABASE_URL
        logger.info(f"Setting up SQLite database: {db_url}")
        
        # Create database file if it doesn't exist
        db_path = db_url.replace("sqlite:///", "")
        db_dir = os.path.dirname(db_path)
        if db_dir and not os.path.exists(db_dir):
            os.makedirs(db_dir, exist_ok=True)
            logger.info(f"Created directory: {db_dir}")
        
        # Create tables
        logger.info("Creating database tables...")
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
        
        # Test connection
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1")).scalar()
            if result == 1:
                logger.info("✅ SQLite database setup successful!")
                return True
            else:
                logger.error("❌ SQLite database setup failed!")
                return False
    except Exception as e:
        logger.error(f"❌ Error setting up SQLite database: {str(e)}")
        return False

if __name__ == "__main__":
    logger.info("Setting up SQLite database for development...")
    success = setup_sqlite()
    if not success:
        logger.error("Failed to set up SQLite database.")
        sys.exit(1)
    else:
        logger.info("SQLite database setup complete. Now run:")
        logger.info("1. python init_db.py - to create the admin user")
        logger.info("2. python run.py - to start the application") 