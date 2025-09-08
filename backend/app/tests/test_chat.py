def test_full_chat_flow(client):
    res = client.post("/auth/register", json={"email": "alice@test.com", "password": "secret"})
    assert res.status_code == 201
    user_id = res.json()["id"]

    res = client.post("/auth/login", json={"email": "alice@test.com", "password": "secret"})
    assert res.status_code == 200
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.post("/rooms/", headers=headers, json={"name": "Room1"})
    assert res.status_code == 201
    room_id = res.json()["id"]

    res = client.post(f"/messages", headers=headers, json={"room_id": room_id, "content": "Hello"})
    assert res.status_code == 200
    assert res.json()["content"] == "Hello"

    res = client.get(f"/messages/{room_id}")
    assert res.status_code == 200
    assert len(res.json()) == 1
