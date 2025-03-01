from typing import Any, Dict, List, Optional, Union
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.match import Match, MatchStatus, match_players
from app.schemas.match import MatchCreate, MatchUpdate, MatchPlayerCreate

def get(db: Session, match_id: int) -> Optional[Match]:
    """
    Get a match by ID
    """
    return db.query(Match).filter(Match.id == match_id).first()

def get_multi(
    db: Session, 
    skip: int = 0, 
    limit: int = 100, 
    tournament_id: Optional[int] = None,
    status: Optional[MatchStatus] = None
) -> List[Match]:
    """
    Get multiple matches with optional filters
    """
    query = db.query(Match)
    
    if tournament_id:
        query = query.filter(Match.tournament_id == tournament_id)
    
    if status:
        query = query.filter(Match.status == status)
    
    return query.offset(skip).limit(limit).all()

def get_by_teams(
    db: Session, tournament_id: int, team1_id: int, team2_id: int
) -> Optional[Match]:
    """
    Get a match by tournament and teams
    """
    return db.query(Match).filter(
        Match.tournament_id == tournament_id,
        ((Match.team1_id == team1_id) & (Match.team2_id == team2_id)) |
        ((Match.team1_id == team2_id) & (Match.team2_id == team1_id))
    ).first()

def create(db: Session, obj_in: MatchCreate) -> Match:
    """
    Create a new match
    """
    db_obj = Match(
        tournament_id=obj_in.tournament_id,
        team1_id=obj_in.team1_id,
        team2_id=obj_in.team2_id,
        scheduled_time=obj_in.scheduled_time,
        status=MatchStatus.SCHEDULED
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update(
    db: Session, *, db_obj: Match, obj_in: Union[MatchUpdate, Dict[str, Any]]
) -> Match:
    """
    Update a match
    """
    if isinstance(obj_in, dict):
        update_data = obj_in
    else:
        update_data = obj_in.dict(exclude_unset=True)
    
    # Convert string status to enum if present
    if "status" in update_data and isinstance(update_data["status"], str):
        update_data["status"] = MatchStatus[update_data["status"].upper()]
    
    # If status is being updated to COMPLETED, set completed_time
    if update_data.get("status") == MatchStatus.COMPLETED and not update_data.get("completed_time"):
        update_data["completed_time"] = datetime.utcnow()
    
    for field in update_data:
        if hasattr(db_obj, field):
            setattr(db_obj, field, update_data[field])
    
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete(db: Session, *, match_id: int) -> Match:
    """
    Delete a match
    """
    match = db.query(Match).filter(Match.id == match_id).first()
    db.delete(match)
    db.commit()
    return match

def add_player(
    db: Session, match_id: int, obj_in: MatchPlayerCreate
) -> None:
    """
    Add a player to a match
    """
    # Check if player is already in the match
    existing = db.query(match_players).filter(
        match_players.c.match_id == match_id,
        match_players.c.user_id == obj_in.user_id
    ).first()
    
    if not existing:
        # Insert into the association table
        db.execute(
            match_players.insert().values(
                match_id=match_id,
                user_id=obj_in.user_id
            )
        )
        db.commit()

def remove_player(db: Session, match_id: int, user_id: int) -> None:
    """
    Remove a player from a match
    """
    db.execute(
        match_players.delete().where(
            (match_players.c.match_id == match_id) &
            (match_players.c.user_id == user_id)
        )
    )
    db.commit()

def get_match_players(db: Session, match_id: int) -> List[Dict]:
    """
    Get all players in a match
    """
    from app.models.user import User
    
    return db.query(User).join(
        match_players, 
        match_players.c.user_id == User.id
    ).filter(
        match_players.c.match_id == match_id
    ).all()

def is_player_in_match(db: Session, match_id: int, user_id: int) -> bool:
    """
    Check if a user is a player in a match
    """
    player = db.query(match_players).filter(
        match_players.c.match_id == match_id,
        match_players.c.user_id == user_id
    ).first()
    
    return player is not None 