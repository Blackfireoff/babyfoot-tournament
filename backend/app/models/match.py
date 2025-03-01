from sqlalchemy import Boolean, Column, Integer, String, DateTime, ForeignKey, Enum, Table
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from app.db.database import Base

class MatchStatus(enum.Enum):
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

# Table d'association pour les joueurs d'un match
match_players = Table(
    "match_players",
    Base.metadata,
    Column("match_id", Integer, ForeignKey("matches.id"), primary_key=True),
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True)
)

class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    tournament_id = Column(Integer, ForeignKey("tournaments.id"))
    team1_id = Column(Integer, ForeignKey("teams.id"))
    team2_id = Column(Integer, ForeignKey("teams.id"))
    team1_score = Column(Integer, default=0)
    team2_score = Column(Integer, default=0)
    status = Column(Enum(MatchStatus), default=MatchStatus.SCHEDULED)
    scheduled_time = Column(DateTime(timezone=True))
    completed_time = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relations
    tournament = relationship("Tournament", back_populates="matches")
    team1 = relationship("Team", foreign_keys=[team1_id])
    team2 = relationship("Team", foreign_keys=[team2_id])
    players = relationship("User", secondary=match_players, back_populates="matches") 