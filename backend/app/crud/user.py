from typing import Any, Dict, Optional, Union
from sqlalchemy.orm import Session

from app.core.security import get_password_hash, verify_password
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate

def get_by_email(db: Session, email: str) -> Optional[User]:
    """
    Get a user by email
    """
    return db.query(User).filter(User.email == email).first()

def get_by_username(db: Session, username: str) -> Optional[User]:
    """
    Get a user by username
    """
    return db.query(User).filter(User.username == username).first()

def get(db: Session, user_id: int) -> Optional[User]:
    """
    Get a user by ID
    """
    return db.query(User).filter(User.id == user_id).first()

def get_multi(db: Session, skip: int = 0, limit: int = 100):
    """
    Get multiple users
    """
    return db.query(User).offset(skip).limit(limit).all()

def create(db: Session, obj_in: UserCreate) -> User:
    """
    Create a new user
    """
    db_obj = User(
        email=obj_in.email,
        username=obj_in.username,
        hashed_password=get_password_hash(obj_in.password),
        full_name=obj_in.full_name,
        is_active=True,
        is_admin=False
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update(
    db: Session, *, db_obj: User, obj_in: Union[UserUpdate, Dict[str, Any]]
) -> User:
    """
    Update a user
    """
    if isinstance(obj_in, dict):
        update_data = obj_in
    else:
        update_data = obj_in.dict(exclude_unset=True)
    
    if update_data.get("password"):
        hashed_password = get_password_hash(update_data["password"])
        del update_data["password"]
        update_data["hashed_password"] = hashed_password
    
    for field in update_data:
        if hasattr(db_obj, field):
            setattr(db_obj, field, update_data[field])
    
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete(db: Session, *, user_id: int) -> User:
    """
    Delete a user
    """
    user = db.query(User).filter(User.id == user_id).first()
    db.delete(user)
    db.commit()
    return user

def authenticate(db: Session, *, username: str, password: str) -> Optional[User]:
    """
    Authenticate a user
    """
    user = get_by_username(db, username=username)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

def is_active(user: User) -> bool:
    """
    Check if a user is active
    """
    return user.is_active

def is_admin(user: User) -> bool:
    """
    Check if a user is an admin
    """
    return user.is_admin 