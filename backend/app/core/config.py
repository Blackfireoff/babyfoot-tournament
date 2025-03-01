from pydantic_settings import BaseSettings
from typing import Optional
import os
import logging
from dotenv import load_dotenv
import pathlib

load_dotenv()

logger = logging.getLogger(__name__)

class Settings(BaseSettings):
    PROJECT_NAME: str = "BabyFoot Tournament API"
    PROJECT_VERSION: str = "1.0.0"
    PROJECT_DESCRIPTION: str = "API pour l'application de tournois de babyfoot"
    
    # Database settings
    USE_SQLITE_FALLBACK: bool = os.getenv("USE_SQLITE_FALLBACK", "False").lower() == "true"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost/babyfoot")
    SQLITE_URL: str = os.getenv("SQLITE_URL", "sqlite:///babyfoot.db")
    
    # Get the effective database URL (with fallback logic)
    @property
    def EFFECTIVE_DATABASE_URL(self) -> str:
        if self.USE_SQLITE_FALLBACK:
            # Ensure the SQLite URL is properly formatted
            sqlite_url = self.SQLITE_URL
            
            # If it's a relative path, make sure the directory exists
            if "sqlite:///" in sqlite_url and not sqlite_url.startswith("sqlite:////"):
                # Extract the path part
                path_part = sqlite_url.split("sqlite:///")[1]
                
                # If it's not an absolute path, create the directory if needed
                if not os.path.isabs(path_part):
                    db_dir = os.path.dirname(path_part)
                    if db_dir and not os.path.exists(db_dir):
                        try:
                            os.makedirs(db_dir, exist_ok=True)
                            logger.info(f"Created directory for SQLite database: {db_dir}")
                        except Exception as e:
                            logger.warning(f"Could not create directory for SQLite database: {e}")
            
            logger.info(f"Using SQLite fallback database: {sqlite_url}")
            return sqlite_url
        return self.DATABASE_URL
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    # Configuration pour l'envoi d'emails
    MAIL_USERNAME: Optional[str] = os.getenv("MAIL_USERNAME")
    MAIL_PASSWORD: Optional[str] = os.getenv("MAIL_PASSWORD")
    MAIL_FROM: Optional[str] = os.getenv("MAIL_FROM")
    MAIL_PORT: Optional[int] = int(os.getenv("MAIL_PORT", "587"))
    MAIL_SERVER: Optional[str] = os.getenv("MAIL_SERVER")
    MAIL_TLS: bool = os.getenv("MAIL_TLS", "True").lower() == "true"
    MAIL_SSL: bool = os.getenv("MAIL_SSL", "False").lower() == "true"
    
    # CORS settings
    CORS_ORIGINS: list = ["http://localhost:5173", "http://localhost:3000"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings() 