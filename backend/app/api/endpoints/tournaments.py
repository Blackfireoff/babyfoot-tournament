from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.crud import tournament as crud_tournament
from app.crud import team as crud_team
from app.models.user import User
from app.models.tournament import TournamentStatus
from app.schemas.tournament import (
    Tournament, TournamentCreate, TournamentUpdate,
    TournamentTeam, TournamentTeamCreate, TournamentStatusEnum
)

router = APIRouter()

@router.get("", response_model=List[Tournament])
def read_tournaments(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    status: Optional[TournamentStatusEnum] = None,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Retrieve tournaments with optional status filter
    """
    # Convert string status to enum if provided
    db_status = None
    if status:
        db_status = TournamentStatus[status.upper()]
    
    tournaments = crud_tournament.get_multi(
        db, skip=skip, limit=limit, status=db_status
    )
    return tournaments

@router.post("", response_model=Tournament)
def create_tournament(
    *,
    db: Session = Depends(get_db),
    tournament_in: TournamentCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Create new tournament
    """
    # Check if tournament name already exists
    tournament = crud_tournament.get_by_name(db, name=tournament_in.name)
    if tournament:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tournament with this name already exists",
        )
    
    # Create the tournament with current user as organizer
    tournament = crud_tournament.create(
        db, obj_in=tournament_in, organizer_id=current_user.id
    )
    
    return tournament

@router.get("/{tournament_id}", response_model=Tournament)
def read_tournament(
    tournament_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get tournament by ID
    """
    tournament = crud_tournament.get(db, tournament_id=tournament_id)
    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournament not found",
        )
    return tournament

@router.put("/{tournament_id}", response_model=Tournament)
def update_tournament(
    *,
    db: Session = Depends(get_db),
    tournament_id: int,
    tournament_in: TournamentUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Update a tournament
    """
    tournament = crud_tournament.get(db, tournament_id=tournament_id)
    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournament not found",
        )
    
    # Check if user is organizer
    if not crud_tournament.is_tournament_organizer(db, tournament_id=tournament_id, user_id=current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only tournament organizers can update tournament details",
        )
    
    # Check if name is being updated and already exists
    if tournament_in.name and tournament_in.name != tournament.name:
        tournament_by_name = crud_tournament.get_by_name(db, name=tournament_in.name)
        if tournament_by_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tournament name already exists",
            )
    
    tournament = crud_tournament.update(db, db_obj=tournament, obj_in=tournament_in)
    return tournament

@router.delete("/{tournament_id}", response_model=Tournament)
def delete_tournament(
    *,
    db: Session = Depends(get_db),
    tournament_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Delete a tournament
    """
    tournament = crud_tournament.get(db, tournament_id=tournament_id)
    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournament not found",
        )
    
    # Check if user is organizer
    if not crud_tournament.is_tournament_organizer(db, tournament_id=tournament_id, user_id=current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only tournament organizers can delete the tournament",
        )
    
    tournament = crud_tournament.delete(db, tournament_id=tournament_id)
    return tournament

@router.get("/{tournament_id}/teams", response_model=List[TournamentTeam])
def read_tournament_teams(
    tournament_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get all teams registered for a tournament
    """
    tournament = crud_tournament.get(db, tournament_id=tournament_id)
    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournament not found",
        )
    
    teams = crud_tournament.get_tournament_teams(db, tournament_id=tournament_id)
    return teams

@router.post("/{tournament_id}/teams", response_model=TournamentTeam)
def register_team(
    *,
    db: Session = Depends(get_db),
    tournament_id: int,
    team_in: TournamentTeamCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Register a team for a tournament
    """
    tournament = crud_tournament.get(db, tournament_id=tournament_id)
    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournament not found",
        )
    
    # Check if tournament is open for registration
    if tournament.status != TournamentStatus.OPEN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tournament is not open for registration",
        )
    
    # Check if team exists
    team = crud_team.get(db, team_id=team_in.team_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found",
        )
    
    # Check if user is team captain
    if not crud_team.is_team_captain(db, team_id=team_in.team_id, user_id=current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only team captains can register for tournaments",
        )
    
    # Check if team is already registered
    if crud_tournament.is_team_registered(db, tournament_id=tournament_id, team_id=team_in.team_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Team is already registered for this tournament",
        )
    
    # Check if tournament is full
    registered_teams = crud_tournament.get_tournament_teams(db, tournament_id=tournament_id)
    if len(registered_teams) >= tournament.max_teams:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tournament has reached maximum number of teams",
        )
    
    team_registration = crud_tournament.register_team(
        db, tournament_id=tournament_id, obj_in=team_in
    )
    return team_registration

@router.put("/{tournament_id}/teams/{team_id}/confirm", response_model=TournamentTeam)
def confirm_team(
    *,
    db: Session = Depends(get_db),
    tournament_id: int,
    team_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Confirm a team's registration for a tournament (organizer only)
    """
    tournament = crud_tournament.get(db, tournament_id=tournament_id)
    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournament not found",
        )
    
    # Check if user is organizer
    if not crud_tournament.is_tournament_organizer(db, tournament_id=tournament_id, user_id=current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only tournament organizers can confirm team registrations",
        )
    
    # Check if team is registered
    if not crud_tournament.is_team_registered(db, tournament_id=tournament_id, team_id=team_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team is not registered for this tournament",
        )
    
    team_registration = crud_tournament.confirm_team(
        db, tournament_id=tournament_id, team_id=team_id
    )
    return team_registration

@router.delete("/{tournament_id}/teams/{team_id}", response_model=dict)
def unregister_team(
    *,
    db: Session = Depends(get_db),
    tournament_id: int,
    team_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Unregister a team from a tournament
    """
    tournament = crud_tournament.get(db, tournament_id=tournament_id)
    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournament not found",
        )
    
    # Check if team is registered
    if not crud_tournament.is_team_registered(db, tournament_id=tournament_id, team_id=team_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team is not registered for this tournament",
        )
    
    # Check if user is team captain or tournament organizer
    is_captain = crud_team.is_team_captain(db, team_id=team_id, user_id=current_user.id)
    is_organizer = crud_tournament.is_tournament_organizer(db, tournament_id=tournament_id, user_id=current_user.id)
    
    if not (is_captain or is_organizer):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only team captains or tournament organizers can unregister teams",
        )
    
    # Check if tournament is still in registration phase
    if tournament.status not in [TournamentStatus.DRAFT, TournamentStatus.OPEN]:
        # Only organizers can remove teams after registration is closed
        if not is_organizer:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot unregister after tournament has started. Contact the organizer.",
            )
    
    crud_tournament.unregister_team(db, tournament_id=tournament_id, team_id=team_id)
    return {"status": "success", "message": "Team unregistered from tournament"} 