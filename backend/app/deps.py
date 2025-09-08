from fastapi import Depends
from sqlalchemy.orm import Session
from .database import get_db
from .security import get_current_user
from .models import User


DB = Session


CurrentUser = User


def get_current_user_dep(user: User = Depends(get_current_user)) -> User:
    return user


def get_db_dep(db: Session = Depends(get_db)) -> Session:
    return db