print("User router loaded")
from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session
from backend.schemas.user import UserCreate, UserRead
from backend.services.user import create_user, get_user_by_username, authenticate_user
from backend.models.user import User
from backend.db import get_session

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/register", response_model=UserRead)
def register_user(user: UserCreate, session: Session = Depends(get_session)):
    if get_user_by_username(session, user.username):
        raise HTTPException(status_code=400, detail="Username already exists")
    new_user = create_user(session, user.username, user.password)
    return UserRead(id=new_user.id, username=new_user.username)

@router.post("/login", response_model=UserRead)
def login_user(user: UserCreate, session: Session = Depends(get_session)):
    db_user = authenticate_user(session, user.username, user.password)
    if not db_user:
        raise HTTPException(status_code=401, detail="שם משתמש או סיסמה שגויים")
    return UserRead(id=db_user.id, username=db_user.username) 