from pydantic import BaseModel, EmailStr
from datetime import datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: int


class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: EmailStr
    created_at: datetime


    class Config:
        from_attributes = True


class RoomCreate(BaseModel):
    name: str


class RoomOut(BaseModel):
    id: int
    name: str


    class Config:
        from_attributes = True


class MessageCreate(BaseModel):
    room_id: int
    content: str


class MessageOut(BaseModel):
    id: int
    room_id: int
    user_id: int
    content: str
    created_at: datetime


    class Config:
        from_attributes = True