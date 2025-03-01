from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.crud import team as crud_team
from app.models.user import User
from app.schemas.team import (
    Team, TeamCreate, TeamUpdate, 
    TeamMember, TeamMemberCreate
)

router = APIRouter()

@router.get("", response_model=List[Team])
def read_teams(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Retrieve teams
    """
    teams = crud_team.get_multi(db, skip=skip, limit=limit)
    return teams

@router.post("", response_model=Team)
def create_team(
    *,
    db: Session = Depends(get_db),
    team_in: TeamCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Create new team
    """
    # Check if team name already exists
    team = crud_team.get_by_name(db, name=team_in.name)
    if team:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Team with this name already exists",
        )
    
    # Create the team
    team = crud_team.create(db, obj_in=team_in)
    
    # Add the current user as captain
    member_in = TeamMemberCreate(user_id=current_user.id, is_captain=True)
    crud_team.add_team_member(db, team_id=team.id, obj_in=member_in)
    
    # Refresh the team to include the member
    team = crud_team.get(db, team_id=team.id)
    
    return team

@router.get("/{team_id}", response_model=Team)
def read_team(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get team by ID
    """
    team = crud_team.get(db, team_id=team_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found",
        )
    return team

@router.put("/{team_id}", response_model=Team)
def update_team(
    *,
    db: Session = Depends(get_db),
    team_id: int,
    team_in: TeamUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Update a team
    """
    team = crud_team.get(db, team_id=team_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found",
        )
    
    # Check if user is captain
    if not crud_team.is_team_captain(db, team_id=team_id, user_id=current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only team captains can update team details",
        )
    
    # Check if name is being updated and already exists
    if team_in.name and team_in.name != team.name:
        team_by_name = crud_team.get_by_name(db, name=team_in.name)
        if team_by_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Team name already exists",
            )
    
    team = crud_team.update(db, db_obj=team, obj_in=team_in)
    return team

@router.delete("/{team_id}", response_model=Team)
def delete_team(
    *,
    db: Session = Depends(get_db),
    team_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Delete a team
    """
    team = crud_team.get(db, team_id=team_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found",
        )
    
    # Check if user is captain
    if not crud_team.is_team_captain(db, team_id=team_id, user_id=current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only team captains can delete the team",
        )
    
    team = crud_team.delete(db, team_id=team_id)
    return team

@router.get("/{team_id}/members", response_model=List[TeamMember])
def read_team_members(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get all members of a team
    """
    team = crud_team.get(db, team_id=team_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found",
        )
    
    members = crud_team.get_team_members(db, team_id=team_id)
    return members

@router.post("/{team_id}/members", response_model=TeamMember)
def add_team_member(
    *,
    db: Session = Depends(get_db),
    team_id: int,
    member_in: TeamMemberCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Add a member to a team
    """
    team = crud_team.get(db, team_id=team_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found",
        )
    
    # Check if user is captain
    if not crud_team.is_team_captain(db, team_id=team_id, user_id=current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only team captains can add members",
        )
    
    # Check if user is already a member
    if crud_team.is_team_member(db, team_id=team_id, user_id=member_in.user_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already a member of this team",
        )
    
    member = crud_team.add_team_member(db, team_id=team_id, obj_in=member_in)
    return member

@router.delete("/{team_id}/members/{user_id}", response_model=dict)
def remove_team_member(
    *,
    db: Session = Depends(get_db),
    team_id: int,
    user_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Remove a member from a team
    """
    team = crud_team.get(db, team_id=team_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found",
        )
    
    # Check if user is captain or removing themselves
    if not crud_team.is_team_captain(db, team_id=team_id, user_id=current_user.id) and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only team captains can remove other members",
        )
    
    # Check if user is a member
    if not crud_team.is_team_member(db, team_id=team_id, user_id=user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User is not a member of this team",
        )
    
    # Prevent removing the last captain
    if crud_team.is_team_captain(db, team_id=team_id, user_id=user_id):
        # Count captains
        members = crud_team.get_team_members(db, team_id=team_id)
        captains = [m for m in members if m.is_captain]
        if len(captains) <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot remove the last captain. Assign another captain first.",
            )
    
    crud_team.remove_team_member(db, team_id=team_id, user_id=user_id)
    return {"status": "success", "message": "Member removed from team"} 