from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.crud import match as crud_match
from app.crud import tournament as crud_tournament
from app.crud import team as crud_team
from app.models.user import User
from app.models.match import MatchStatus
from app.schemas.match import (
    Match, MatchCreate, MatchUpdate, 
    MatchPlayer, MatchPlayerCreate, MatchStatusEnum
)

router = APIRouter()

@router.get("", response_model=List[Match])
def read_matches(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    tournament_id: Optional[int] = None,
    status: Optional[MatchStatusEnum] = None,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Retrieve matches with optional filters
    """
    # Convert string status to enum if provided
    db_status = None
    if status:
        db_status = MatchStatus[status.upper()]
    
    matches = crud_match.get_multi(
        db, skip=skip, limit=limit, tournament_id=tournament_id, status=db_status
    )
    return matches

@router.post("", response_model=Match)
def create_match(
    *,
    db: Session = Depends(get_db),
    match_in: MatchCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Create new match
    """
    # Check if tournament exists
    tournament = crud_tournament.get(db, tournament_id=match_in.tournament_id)
    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournament not found",
        )
    
    # Check if user is tournament organizer
    if not crud_tournament.is_tournament_organizer(db, tournament_id=match_in.tournament_id, user_id=current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only tournament organizers can create matches",
        )
    
    # Check if teams exist
    team1 = crud_team.get(db, team_id=match_in.team1_id)
    if not team1:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team 1 not found",
        )
    
    team2 = crud_team.get(db, team_id=match_in.team2_id)
    if not team2:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team 2 not found",
        )
    
    # Check if teams are registered for the tournament
    if not crud_tournament.is_team_registered(db, tournament_id=match_in.tournament_id, team_id=match_in.team1_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Team 1 is not registered for this tournament",
        )
    
    if not crud_tournament.is_team_registered(db, tournament_id=match_in.tournament_id, team_id=match_in.team2_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Team 2 is not registered for this tournament",
        )
    
    # Check if match between these teams already exists
    existing_match = crud_match.get_by_teams(
        db, tournament_id=match_in.tournament_id, 
        team1_id=match_in.team1_id, team2_id=match_in.team2_id
    )
    if existing_match:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A match between these teams already exists in this tournament",
        )
    
    match = crud_match.create(db, obj_in=match_in)
    return match

@router.get("/{match_id}", response_model=Match)
def read_match(
    match_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get match by ID
    """
    match = crud_match.get(db, match_id=match_id)
    if not match:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Match not found",
        )
    return match

@router.put("/{match_id}", response_model=Match)
def update_match(
    *,
    db: Session = Depends(get_db),
    match_id: int,
    match_in: MatchUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Update a match
    """
    match = crud_match.get(db, match_id=match_id)
    if not match:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Match not found",
        )
    
    # Check if user is tournament organizer
    if not crud_tournament.is_tournament_organizer(db, tournament_id=match.tournament_id, user_id=current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only tournament organizers can update matches",
        )
    
    match = crud_match.update(db, db_obj=match, obj_in=match_in)
    return match

@router.delete("/{match_id}", response_model=Match)
def delete_match(
    *,
    db: Session = Depends(get_db),
    match_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Delete a match
    """
    match = crud_match.get(db, match_id=match_id)
    if not match:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Match not found",
        )
    
    # Check if user is tournament organizer
    if not crud_tournament.is_tournament_organizer(db, tournament_id=match.tournament_id, user_id=current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only tournament organizers can delete matches",
        )
    
    match = crud_match.delete(db, match_id=match_id)
    return match

@router.get("/{match_id}/players", response_model=List[MatchPlayer])
def read_match_players(
    match_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get all players in a match
    """
    match = crud_match.get(db, match_id=match_id)
    if not match:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Match not found",
        )
    
    players = crud_match.get_match_players(db, match_id=match_id)
    return players

@router.post("/{match_id}/players", response_model=dict)
def add_match_player(
    *,
    db: Session = Depends(get_db),
    match_id: int,
    player_in: MatchPlayerCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Add a player to a match
    """
    match = crud_match.get(db, match_id=match_id)
    if not match:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Match not found",
        )
    
    # Check if user is tournament organizer or team captain
    is_organizer = crud_tournament.is_tournament_organizer(
        db, tournament_id=match.tournament_id, user_id=current_user.id
    )
    is_team1_captain = crud_team.is_team_captain(
        db, team_id=match.team1_id, user_id=current_user.id
    )
    is_team2_captain = crud_team.is_team_captain(
        db, team_id=match.team2_id, user_id=current_user.id
    )
    
    if not (is_organizer or is_team1_captain or is_team2_captain):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only tournament organizers or team captains can add players to matches",
        )
    
    # Check if player is already in the match
    if crud_match.is_player_in_match(db, match_id=match_id, user_id=player_in.user_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Player is already in this match",
        )
    
    # Check if player is a member of one of the teams
    is_team1_member = crud_team.is_team_member(
        db, team_id=match.team1_id, user_id=player_in.user_id
    )
    is_team2_member = crud_team.is_team_member(
        db, team_id=match.team2_id, user_id=player_in.user_id
    )
    
    if not (is_team1_member or is_team2_member):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Player must be a member of one of the teams in the match",
        )
    
    # Team captains can only add players from their own team
    if is_team1_captain and not is_team1_member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Team captains can only add players from their own team",
        )
    
    if is_team2_captain and not is_team2_member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Team captains can only add players from their own team",
        )
    
    crud_match.add_player(db, match_id=match_id, obj_in=player_in)
    return {"status": "success", "message": "Player added to match"}

@router.delete("/{match_id}/players/{user_id}", response_model=dict)
def remove_match_player(
    *,
    db: Session = Depends(get_db),
    match_id: int,
    user_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Remove a player from a match
    """
    match = crud_match.get(db, match_id=match_id)
    if not match:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Match not found",
        )
    
    # Check if player is in the match
    if not crud_match.is_player_in_match(db, match_id=match_id, user_id=user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Player is not in this match",
        )
    
    # Check if user is tournament organizer or team captain
    is_organizer = crud_tournament.is_tournament_organizer(
        db, tournament_id=match.tournament_id, user_id=current_user.id
    )
    is_team1_captain = crud_team.is_team_captain(
        db, team_id=match.team1_id, user_id=current_user.id
    )
    is_team2_captain = crud_team.is_team_captain(
        db, team_id=match.team2_id, user_id=current_user.id
    )
    
    if not (is_organizer or is_team1_captain or is_team2_captain):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only tournament organizers or team captains can remove players from matches",
        )
    
    # Check which team the player belongs to
    is_team1_member = crud_team.is_team_member(
        db, team_id=match.team1_id, user_id=user_id
    )
    is_team2_member = crud_team.is_team_member(
        db, team_id=match.team2_id, user_id=user_id
    )
    
    # Team captains can only remove players from their own team
    if is_team1_captain and not is_team1_member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Team captains can only remove players from their own team",
        )
    
    if is_team2_captain and not is_team2_member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Team captains can only remove players from their own team",
        )
    
    crud_match.remove_player(db, match_id=match_id, user_id=user_id)
    return {"status": "success", "message": "Player removed from match"} 