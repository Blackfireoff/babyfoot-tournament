import uvicorn
import os
import sys
import logging
from dotenv import load_dotenv
from sqlalchemy.exc import OperationalError
from sqlalchemy import text

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

def main():
    """
    Main function to run the application
    """
    try:
        # Try to import the app to check for database connectivity
        from app.db.database import engine
        from app.core.config import settings
        
        # Test database connection
        try:
            with engine.connect() as conn:
                # Use SQLAlchemy text() to make the query compatible with all databases
                conn.execute(text("SELECT 1"))
                logger.info(f"Database connection successful (using {'SQLite' if settings.USE_SQLITE_FALLBACK else 'PostgreSQL'})")
        except OperationalError as e:
            logger.error("Database connection error: %s", str(e))
            if not settings.USE_SQLITE_FALLBACK:
                logger.error("Please make sure PostgreSQL is running and accessible.")
                logger.error("Check your DATABASE_URL in the .env file.")
                logger.error("You can use SQLite fallback by setting USE_SQLITE_FALLBACK=True in your .env file.")
            else:
                logger.error("SQLite connection failed. Check your SQLITE_URL in the .env file.")
            sys.exit(1)
        
        # Get port from environment variable or use default
        port = int(os.getenv("PORT", 8000))
        
        # Run the application with uvicorn
        logger.info(f"Starting server on port {port}...")
        uvicorn.run(
            "app.main:app",
            host="0.0.0.0",
            port=port,
            reload=True,
            log_level="info"
        )
    except Exception as e:
        logger.error("Application startup error: %s", str(e))
        sys.exit(1)

if __name__ == "__main__":
    main() 