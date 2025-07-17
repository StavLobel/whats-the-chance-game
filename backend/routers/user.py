print("User router loaded")
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse
from fastapi import Response
from sqlmodel import Session
from backend.schemas.user import UserCreate, UserRead
from backend.services.user import create_user, get_user_by_username, authenticate_user, create_access_token, get_current_user
from backend.models.user import User
from backend.db import get_session
import re

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/register", response_model=UserRead)
def register_user(user: UserCreate, session: Session = Depends(get_session)):
    if get_user_by_username(session, user.username):
        raise HTTPException(status_code=400, detail="האימייל כבר קיים במערכת")
    new_user = create_user(session, user.username, user.password)
    return UserRead(id=new_user.id, username=new_user.username)

@router.post("/login")
def login_user(user: UserCreate, response: Response, session: Session = Depends(get_session)):
    db_user = authenticate_user(session, user.username, user.password)
    if not db_user:
        raise HTTPException(status_code=401, detail="שם משתמש או סיסמה שגויים")
    token = create_access_token({"sub": db_user.username})
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=False,  # Set to True in production with HTTPS
        samesite="lax",
        max_age=60*60,  # 1 hour
        path="/"
    )
    return {"user": {"id": db_user.id, "username": db_user.username}}

@router.post("/logout")
def logout_user(response: Response):
    response.delete_cookie(key="access_token", path="/")
    return {"message": "התנתקת בהצלחה"}

@router.get("/me", response_model=UserRead)
def get_me(current_user: User = Depends(get_current_user)):
    return UserRead(id=current_user.id, username=current_user.username) 