from pydantic import BaseModel, EmailStr, validator
from password_validator import PasswordValidator

# Define password policy
password_schema = PasswordValidator()
password_schema \
    .min(8) \
    .has().letters() \
    .has().digits() \
    .has().symbols()

class UserCreate(BaseModel):
    username: EmailStr
    password: str

    @validator('password')
    def password_strong(cls, v):
        if not password_schema.validate(v):
            raise ValueError('הסיסמה חייבת להיות באורך 8 תווים לפחות, לכלול אותיות, מספרים ותו מיוחד')
        return v

class UserRead(BaseModel):
    id: int
    username: str 