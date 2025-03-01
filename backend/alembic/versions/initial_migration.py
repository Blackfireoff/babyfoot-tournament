"""initial migration

Revision ID: 001
Revises: 
Create Date: 2023-03-01

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import enum
from app.core.config import settings
import logging

# Configure logging
logger = logging.getLogger("alembic")

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None

# Define enum types for SQLite compatibility
class TournamentStatus(enum.Enum):
    draft = "draft"
    open = "open"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"

class MatchStatus(enum.Enum):
    scheduled = "scheduled"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"

def upgrade() -> None:
    # Check if we're using SQLite
    is_sqlite = settings.USE_SQLITE_FALLBACK
    logger.info(f"Running migration with SQLite compatibility: {is_sqlite}")
    
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('username', sa.String(), nullable=False),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('full_name', sa.String(), nullable=True),
        sa.Column('is_active', sa.Boolean(), default=True, nullable=False),
        sa.Column('is_admin', sa.Boolean(), default=False, nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email'),
        sa.UniqueConstraint('username')
    )
    
    # Create teams table
    op.create_table(
        'teams',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )
    
    # Create team_members table
    op.create_table(
        'team_members',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('team_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('is_captain', sa.Boolean(), default=False, nullable=False),
        sa.Column('joined_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['team_id'], ['teams.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create tournaments table with enum handling for SQLite compatibility
    if is_sqlite:
        # For SQLite, use string type instead of enum
        op.create_table(
            'tournaments',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('name', sa.String(), nullable=False),
            sa.Column('description', sa.Text(), nullable=True),
            sa.Column('date', sa.Date(), nullable=False),
            sa.Column('location', sa.String(), nullable=False),
            sa.Column('max_teams', sa.Integer(), nullable=False),
            sa.Column('organizer_id', sa.Integer(), nullable=False),
            sa.Column('status', sa.String(), nullable=False),
            sa.Column('rules', sa.Text(), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
            sa.ForeignKeyConstraint(['organizer_id'], ['users.id'], ),
            sa.PrimaryKeyConstraint('id'),
            sa.CheckConstraint("status IN ('draft', 'open', 'in_progress', 'completed', 'cancelled')")
        )
    else:
        # For PostgreSQL, use enum type
        op.create_table(
            'tournaments',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('name', sa.String(), nullable=False),
            sa.Column('description', sa.Text(), nullable=True),
            sa.Column('date', sa.Date(), nullable=False),
            sa.Column('location', sa.String(), nullable=False),
            sa.Column('max_teams', sa.Integer(), nullable=False),
            sa.Column('organizer_id', sa.Integer(), nullable=False),
            sa.Column('status', sa.Enum('draft', 'open', 'in_progress', 'completed', 'cancelled', name='tournamentstatus'), nullable=False),
            sa.Column('rules', sa.Text(), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
            sa.ForeignKeyConstraint(['organizer_id'], ['users.id'], ),
            sa.PrimaryKeyConstraint('id')
        )
    
    # Create tournament_teams table
    op.create_table(
        'tournament_teams',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('tournament_id', sa.Integer(), nullable=False),
        sa.Column('team_id', sa.Integer(), nullable=False),
        sa.Column('registered_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('is_confirmed', sa.Boolean(), default=False, nullable=False),
        sa.ForeignKeyConstraint(['team_id'], ['teams.id'], ),
        sa.ForeignKeyConstraint(['tournament_id'], ['tournaments.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create matches table with enum handling for SQLite compatibility
    if is_sqlite:
        # For SQLite, use string type instead of enum
        op.create_table(
            'matches',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('tournament_id', sa.Integer(), nullable=False),
            sa.Column('team1_id', sa.Integer(), nullable=False),
            sa.Column('team2_id', sa.Integer(), nullable=False),
            sa.Column('team1_score', sa.Integer(), default=0, nullable=False),
            sa.Column('team2_score', sa.Integer(), default=0, nullable=False),
            sa.Column('status', sa.String(), nullable=False),
            sa.Column('scheduled_time', sa.DateTime(timezone=True), nullable=True),
            sa.Column('completed_time', sa.DateTime(timezone=True), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
            sa.ForeignKeyConstraint(['team1_id'], ['teams.id'], ),
            sa.ForeignKeyConstraint(['team2_id'], ['teams.id'], ),
            sa.ForeignKeyConstraint(['tournament_id'], ['tournaments.id'], ),
            sa.PrimaryKeyConstraint('id'),
            sa.CheckConstraint("status IN ('scheduled', 'in_progress', 'completed', 'cancelled')")
        )
    else:
        # For PostgreSQL, use enum type
        op.create_table(
            'matches',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('tournament_id', sa.Integer(), nullable=False),
            sa.Column('team1_id', sa.Integer(), nullable=False),
            sa.Column('team2_id', sa.Integer(), nullable=False),
            sa.Column('team1_score', sa.Integer(), default=0, nullable=False),
            sa.Column('team2_score', sa.Integer(), default=0, nullable=False),
            sa.Column('status', sa.Enum('scheduled', 'in_progress', 'completed', 'cancelled', name='matchstatus'), nullable=False),
            sa.Column('scheduled_time', sa.DateTime(timezone=True), nullable=True),
            sa.Column('completed_time', sa.DateTime(timezone=True), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
            sa.ForeignKeyConstraint(['team1_id'], ['teams.id'], ),
            sa.ForeignKeyConstraint(['team2_id'], ['teams.id'], ),
            sa.ForeignKeyConstraint(['tournament_id'], ['tournaments.id'], ),
            sa.PrimaryKeyConstraint('id')
        )
    
    # Create match_players association table
    op.create_table(
        'match_players',
        sa.Column('match_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['match_id'], ['matches.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('match_id', 'user_id')
    )


def downgrade() -> None:
    op.drop_table('match_players')
    op.drop_table('matches')
    op.drop_table('tournament_teams')
    op.drop_table('tournaments')
    op.drop_table('team_members')
    op.drop_table('teams')
    op.drop_table('users')
    
    # Drop enum types only if using PostgreSQL
    if not settings.USE_SQLITE_FALLBACK:
        op.execute('DROP TYPE IF EXISTS matchstatus')
        op.execute('DROP TYPE IF EXISTS tournamentstatus') 