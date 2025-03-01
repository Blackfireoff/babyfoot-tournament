from sqlalchemy import Boolean, Column, Integer, String, DateTime, ForeignKey, Enum, Text, Date
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from app.db.database import Base

class TournamentStatus(enum.Enum):
    DRAFT = "draft"
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class Tournament(Base):
    __tablename__ = "tournaments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text, nullable=True)
    date = Column(Date, index=True)
    location = Column(String)
    max_teams = Column(Integer)
    organizer_id = Column(Integer, ForeignKey("users.id"))
    status = Column(Enum(TournamentStatus), default=TournamentStatus.DRAFT)
    rules = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relations
    organizer = relationship("User", back_populates="tournaments_created")
    teams = relationship("TournamentTeam", back_populates="tournament")
    matches = relationship("Match", back_populates="tournament")

class TournamentTeam(Base):
    __tablename__ = "tournament_teams"
    
    id = Column(Integer, primary_key=True, index=True)
    tournament_id = Column(Integer, ForeignKey("tournaments.id"))
    team_id = Column(Integer, ForeignKey("teams.id"))
    registered_at = Column(DateTime(timezone=True), server_default=func.now())
    is_confirmed = Column(Boolean, default=False)
    
    # Relations
    tournament = relationship("Tournament", back_populates="teams")
    team = relationship("Team", back_populates="tournament_teams") 