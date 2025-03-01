from typing import Any, Dict, List, Optional, Union
from sqlalchemy.orm import Session

from app.models.tournament import Tournament, TournamentTeam, TournamentStatus
from app.schemas.tournament import TournamentCreate, TournamentUpdate, TournamentTeamCreate

def get(db: Session, tournament_id: int) -> Optional[Tournament]:
    """
    Get a tournament by ID
    """
    return db.query(Tournament).filter(Tournament.id == tournament_id).first()

def get_multi(
    db: Session, skip: int = 0, limit: int = 100, status: Optional[TournamentStatus] = None
) -> List[Tournament]:
    """
    Get multiple tournaments with optional status filter
    """
    query = db.query(Tournament)
    if status:
        query = query.filter(Tournament.status == status)
    return query.offset(skip).limit(limit).all()

def get_by_name(db: Session, name: str) -> Optional[Tournament]:
    """
    Get a tournament by name
    """
    return db.query(Tournament).filter(Tournament.name == name).first()

def create(db: Session, obj_in: TournamentCreate, organizer_id: int) -> Tournament:
    """
    Create a new tournament
    """
    db_obj = Tournament(
        name=obj_in.name,
        description=obj_in.description,
        date=obj_in.date,
        location=obj_in.location,
        max_teams=obj_in.max_teams,
        organizer_id=organizer_id,
        status=TournamentStatus.DRAFT,
        rules=obj_in.rules
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update(
    db: Session, *, db_obj: Tournament, obj_in: Union[TournamentUpdate, Dict[str, Any]]
) -> Tournament:
    """
    Update a tournament
    """
    if isinstance(obj_in, dict):
        update_data = obj_in
    else:
        update_data = obj_in.dict(exclude_unset=True)
    
    # Convert string status to enum if present
    if "status" in update_data and isinstance(update_data["status"], str):
        update_data["status"] = TournamentStatus[update_data["status"].upper()]
    
    for field in update_data:
        if hasattr(db_obj, field):
            setattr(db_obj, field, update_data[field])
    
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete(db: Session, *, tournament_id: int) -> Tournament:
    """
    Delete a tournament
    """
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    db.delete(tournament)
    db.commit()
    return tournament

def get_tournament_teams(db: Session, tournament_id: int) -> List[TournamentTeam]:
    """
    Get all teams registered for a tournament
    """
    return db.query(TournamentTeam).filter(TournamentTeam.tournament_id == tournament_id).all()

def register_team(
    db: Session, tournament_id: int, obj_in: TournamentTeamCreate
) -> TournamentTeam:
    """
    Register a team for a tournament
    """
    db_obj = TournamentTeam(
        tournament_id=tournament_id,
        team_id=obj_in.team_id,
        is_confirmed=False
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def confirm_team(db: Session, tournament_id: int, team_id: int) -> TournamentTeam:
    """
    Confirm a team's registration for a tournament
    """
    team_registration = db.query(TournamentTeam).filter(
        TournamentTeam.tournament_id == tournament_id,
        TournamentTeam.team_id == team_id
    ).first()
    
    if team_registration:
        team_registration.is_confirmed = True
        db.add(team_registration)
        db.commit()
        db.refresh(team_registration)
    
    return team_registration

def unregister_team(db: Session, tournament_id: int, team_id: int) -> TournamentTeam:
    """
    Unregister a team from a tournament
    """
    team_registration = db.query(TournamentTeam).filter(
        TournamentTeam.tournament_id == tournament_id,
        TournamentTeam.team_id == team_id
    ).first()
    
    if team_registration:
        db.delete(team_registration)
        db.commit()
    
    return team_registration

def is_team_registered(db: Session, tournament_id: int, team_id: int) -> bool:
    """
    Check if a team is registered for a tournament
    """
    team_registration = db.query(TournamentTeam).filter(
        TournamentTeam.tournament_id == tournament_id,
        TournamentTeam.team_id == team_id
    ).first()
    
    return team_registration is not None

def is_tournament_organizer(db: Session, tournament_id: int, user_id: int) -> bool:
    """
    Check if a user is the organizer of a tournament
    """
    tournament = db.query(Tournament).filter(
        Tournament.id == tournament_id,
        Tournament.organizer_id == user_id
    ).first()
    
    return tournament is not None 