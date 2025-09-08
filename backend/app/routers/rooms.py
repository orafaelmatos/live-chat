from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Room, Membership, User
from ..schemas import RoomCreate, RoomOut
from ..security import get_current_user

router = APIRouter(prefix="/rooms", tags=["rooms"])

@router.post("/", response_model=RoomOut, status_code=201)
def create_room(payload: RoomCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(Room).filter(Room.name == payload.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Room name already exists")
    
    room = Room(name=payload.name)
    db.add(room)
    db.commit()
    db.refresh(room)

    # Automatically add creator as a member
    membership = Membership(user_id=current_user.id, room_id=room.id)
    db.add(membership)
    db.commit()

    return room

@router.get("/", response_model=list[RoomOut])
def list_rooms(db: Session = Depends(get_db)):
    return db.query(Room).all()
