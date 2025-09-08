from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Message, Room, User
from ..schemas import MessageCreate, MessageOut
from ..security import get_current_user

router = APIRouter(prefix="/messages", tags=["messages"])

@router.post("/", response_model=MessageOut)
def send_message(payload: MessageCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    room = db.query(Room).filter(Room.id == payload.room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    message = Message(user_id=current_user.id, room_id=room.id, content=payload.content)
    db.add(message)
    db.commit()
    db.refresh(message)
    return message

@router.get("/{room_id}", response_model=list[MessageOut])
def get_messages(room_id: int, db: Session = Depends(get_db)):
    return db.query(Message).filter(Message.room_id == room_id).order_by(Message.created_at.asc()).all()
