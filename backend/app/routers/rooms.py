from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Room, Membership, User
from ..schemas import RoomCreate, RoomOut, AddMemberRequest
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


@router.post("/{room_id}/add_member")
def add_member_to_room(
    room_id: int,
    request: AddMemberRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verifica se a sala existe
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    # Verifica se o usuário que está convidando é membro
    membership = db.query(Membership).filter(
        Membership.room_id == room_id,
        Membership.user_id == current_user.id
    ).first()
    if not membership:
        raise HTTPException(status_code=403, detail="You are not a member of this room")

    # Verifica se o usuário a ser adicionado existe
    user_to_add = db.query(User).filter(User.email == request.user_email).first()
    if not user_to_add:
        raise HTTPException(status_code=404, detail="User not found")

    # Verifica se já é membro
    existing_membership = db.query(Membership).filter(
        Membership.room_id == room_id,
        Membership.user_id == user_to_add.id
    ).first()
    if existing_membership:
        raise HTTPException(status_code=400, detail="User already a member")

    # Adiciona o usuário à sala
    new_membership = Membership(user_id=user_to_add.id, room_id=room_id)
    db.add(new_membership)
    db.commit()

    return {"message": f"{user_to_add.email} added to room {room.name}"}

@router.delete("/{room_id}", status_code=204)
def delete_room(room_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    # Optional: only creator can delete
    db.delete(room)
    db.commit()
    return