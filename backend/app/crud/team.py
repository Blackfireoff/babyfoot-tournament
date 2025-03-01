from typing import Any, Dict, List, Optional, Union
from sqlalchemy.orm import Session

from app.models.team import Team, TeamMember
from app.schemas.team import TeamCreate, TeamUpdate, TeamMemberCreate

def get(db: Session, team_id: int) -> Optional[Team]:
    """
    Get a team by ID
    """
    return db.query(Team).filter(Team.id == team_id).first()

def get_multi(db: Session, skip: int = 0, limit: int = 100) -> List[Team]:
    """
    Get multiple teams
    """
    return db.query(Team).offset(skip).limit(limit).all()

def get_by_name(db: Session, name: str) -> Optional[Team]:
    """
    Get a team by name
    """
    return db.query(Team).filter(Team.name == name).first()

def create(db: Session, obj_in: TeamCreate) -> Team:
    """
    Create a new team
    """
    db_obj = Team(
        name=obj_in.name,
        description=obj_in.description
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update(
    db: Session, *, db_obj: Team, obj_in: Union[TeamUpdate, Dict[str, Any]]
) -> Team:
    """
    Update a team
    """
    if isinstance(obj_in, dict):
        update_data = obj_in
    else:
        update_data = obj_in.dict(exclude_unset=True)
    
    for field in update_data:
        if hasattr(db_obj, field):
            setattr(db_obj, field, update_data[field])
    
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete(db: Session, *, team_id: int) -> Team:
    """
    Delete a team
    """
    team = db.query(Team).filter(Team.id == team_id).first()
    db.delete(team)
    db.commit()
    return team

def get_team_members(db: Session, team_id: int) -> List[TeamMember]:
    """
    Get all members of a team
    """
    return db.query(TeamMember).filter(TeamMember.team_id == team_id).all()

def add_team_member(
    db: Session, team_id: int, obj_in: TeamMemberCreate
) -> TeamMember:
    """
    Add a member to a team
    """
    db_obj = TeamMember(
        team_id=team_id,
        user_id=obj_in.user_id,
        is_captain=obj_in.is_captain
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def remove_team_member(db: Session, team_id: int, user_id: int) -> TeamMember:
    """
    Remove a member from a team
    """
    member = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.user_id == user_id
    ).first()
    
    if member:
        db.delete(member)
        db.commit()
    
    return member

def is_team_member(db: Session, team_id: int, user_id: int) -> bool:
    """
    Check if a user is a member of a team
    """
    member = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.user_id == user_id
    ).first()
    
    return member is not None

def is_team_captain(db: Session, team_id: int, user_id: int) -> bool:
    """
    Check if a user is the captain of a team
    """
    member = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.user_id == user_id,
        TeamMember.is_captain == True
    ).first()
    
    return member is not None 