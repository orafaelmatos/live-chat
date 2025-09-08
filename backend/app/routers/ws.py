from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from typing import Dict, List
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Room, Membership, Message
from ..schemas import MessageOut
from ..security import get_current_user
import json

router = APIRouter(prefix="/ws", tags=["ws"])

class ConnectionManager:
    def __init__(self):
        # room_id -> list of websocket connections
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, room_id: int, websocket: WebSocket):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
        self.active_connections[room_id].append(websocket)

    def disconnect(self, room_id: int, websocket: WebSocket):
        self.active_connections[room_id].remove(websocket)
        if not self.active_connections[room_id]:
            del self.active_connections[room_id]

    async def broadcast(self, room_id: int, message: dict):
        """Send message to all connections in the room"""
        if room_id not in self.active_connections:
            return
        for connection in self.active_connections[room_id]:
            await connection.send_text(json.dumps(message))

manager = ConnectionManager()


def get_current_user_ws(token: str = Query(...), db: Session = Depends(get_db)):
    return get_current_user(db=db, token=token)


@router.websocket("/rooms/{room_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    room_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_ws)
):
    # Check if user is a member of the room
    membership = db.query(Membership).filter(
        Membership.room_id == room_id,
        Membership.user_id == current_user.id
    ).first()
    if not membership:
        new_membership = Membership(user_id=current_user.id, room_id=room_id)
        db.add(new_membership)
        db.commit()
        membership = new_membership

    await manager.connect(room_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Save message to DB
            payload = json.loads(data)
            content = payload.get("content")
            message = Message(user_id=current_user.id, room_id=room_id, content=content)
            db.add(message)
            db.commit()
            db.refresh(message)

            # Broadcast to all room members
            await manager.broadcast(room_id, {
                "id": message.id,
                "user_id": message.user_id,
                "room_id": message.room_id,
                "content": message.content,
                "created_at": str(message.created_at)
            })

    except WebSocketDisconnect:
        manager.disconnect(room_id, websocket)
