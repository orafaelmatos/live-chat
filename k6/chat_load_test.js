import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
    vus: 100, // 100 concurrent users
    duration: '30s',
};

const BASE_URL = 'http://api:8000';

export default function () {
    // 1️⃣ Register new user
    const email = `user${Math.floor(Math.random()*100000)}@test.com`;
    const payload = JSON.stringify({ email: email, password: 'secret' });
    let res = http.post(`${BASE_URL}/auth/register`, payload, { headers: { 'Content-Type': 'application/json' } });

    // Ignore 400 errors (email exists)
    check(res, { 'status 201 or 400': r => r.status === 201 || r.status === 400 });

    // 2️⃣ Login
    res = http.post(`${BASE_URL}/auth/login`, payload, { headers: { 'Content-Type': 'application/json' } });
    check(res, { 'login 200': r => r.status === 200 });
    const token = res.json().access_token;

    // 3️⃣ Create room (optional)
    const roomPayload = JSON.stringify({ name: `Room-${Math.floor(Math.random()*1000)}` });
    res = http.post(`${BASE_URL}/rooms/`, roomPayload, { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } });
    check(res, { 'room created': r => r.status === 201 || r.status === 400 });

    sleep(0.1);
}
