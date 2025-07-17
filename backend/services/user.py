import jwt
from datetime import datetime, timedelta
from fastapi import HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from backend.models.user import User
from sqlmodel import Session, select
from passlib.context import CryptContext

SECRET_KEY = "your_secret_key_here"  # Replace with a secure value in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

security = HTTPBearer()

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_user(session: Session, username: str, password: str) -> User:
    hashed_password = get_password_hash(password)
    user = User(username=username, hashed_password=hashed_password)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

def get_user_by_username(session: Session, username: str):
    statement = select(User).where(User.username == username)
    return session.exec(statement).first()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def authenticate_user(session: Session, username: str, password: str):
    user = get_user_by_username(session, username)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_access_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="האסימון פג תוקף")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="אסימון לא חוקי")

def get_current_user(request: Request, session: Session = Depends()):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="לא מחובר")
    payload = verify_access_token(token)
    username = payload.get("sub")
    if username is None:
        raise HTTPException(status_code=401, detail="אסימון לא חוקי")
    user = get_user_by_username(session, username)
    if user is None:
        raise HTTPException(status_code=401, detail="משתמש לא נמצא")
    return user 