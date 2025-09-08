import asyncio
from redis.asyncio import Redis
from .config import settings


CHANNEL_PREFIX = "room:"


class RedisBus:
    def __init__(self):
        self.redis = Redis.from_url(settings.REDIS_URL, decode_responses=True)


async def publish_room(self, room_id: int, message: str):
    await self.redis.publish(f"{CHANNEL_PREFIX}{room_id}", message)


async def subscribe_room(self, room_id: int):
    pubsub = self.redis.pubsub()
    await pubsub.subscribe(f"{CHANNEL_PREFIX}{room_id}")
    return pubsub


async def listener(self, pubsub, queue: asyncio.Queue):
    async for msg in pubsub.listen():
        if msg.get("type") == "message":
            await queue.put(msg["data"])