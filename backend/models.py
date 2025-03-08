from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Table, Float
from sqlalchemy.orm import relationship

from database import Base

# Table d'association pour la relation many-to-many entre Tournament et Team
tournament_team = Table(
    "tournament_team",
    Base.metadata,
    Column("tournament_id", Integer, ForeignKey("tournaments.id"), primary_key=True),
    Column("team_id", Integer, ForeignKey("teams.id"), primary_key=True)
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_admin = Column(Boolean, default=False)

    # Relations
    teams = relationship("Team", back_populates="owner")

class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    wins = Column(Integer, default=0)
    losses = Column(Integer, default=0)
    tournaments_won = Column(Integer, default=0)

    # Relations
    owner = relationship("User", back_populates="teams")
    players = relationship("Player", back_populates="team", cascade="all, delete-orphan")
    tournaments = relationship("Tournament", secondary=tournament_team, back_populates="teams")

class Player(Base):
    __tablename__ = "players"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    is_starter = Column(Boolean, default=False)
    team_id = Column(Integer, ForeignKey("teams.id"))
    wins = Column(Integer, default=0)
    status = Column(String, default="active")  # 'active', 'pending', 'declined'
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Relations
    team = relationship("Team", back_populates="players")
    user = relationship("User", backref="player_profiles")

class Tournament(Base):
    __tablename__ = "tournaments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    date = Column(String)
    status = Column(String, default="open")  # 'open', 'upcoming', 'in_progress', 'closed'
    max_teams = Column(Integer)
    owner_id = Column(Integer, ForeignKey("users.id"))

    # Relations
    teams = relationship("Team", secondary=tournament_team, back_populates="tournaments")
    matches = relationship("Match", back_populates="tournament", cascade="all, delete-orphan")
    owner = relationship("User", backref="tournaments")

class Match(Base):
    __tablename__ = "matches"

    id = Column(String, primary_key=True, index=True)
    tournament_id = Column(Integer, ForeignKey("tournaments.id"))
    team1_id = Column(Integer, ForeignKey("teams.id"))
    team2_id = Column(Integer, ForeignKey("teams.id"))
    team1_score = Column(Integer, nullable=True)
    team2_score = Column(Integer, nullable=True)
    round = Column(Integer)
    match_number = Column(Integer)

    # Relations
    tournament = relationship("Tournament", back_populates="matches")
    team1 = relationship("Team", foreign_keys=[team1_id])
    team2 = relationship("Team", foreign_keys=[team2_id])

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    type = Column(String)  # 'team_invitation', etc.
    content = Column(String)
    is_read = Column(Boolean, default=False)
    created_at = Column(String)
    data = Column(String)  # JSON data for additional information

    # Relations
    user = relationship("User", backref="notifications") 