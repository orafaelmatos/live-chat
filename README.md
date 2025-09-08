# Live Chat

**Live Chat** is a modern real-time messaging application built with **FastAPI**, **WebSockets**, **React**, and **PostgreSQL**. It enables users to create chat rooms, exchange messages in **real time**, and manage memberships securely with JWT authentication.

https://github.com/user-attachments/assets/61308c7e-f6cd-419a-af7b-9fe6adabe4b3



## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Running Tests](#running-tests)
- [Performance Monitoring](#performance-monitoring)
- [Folder Structure](#folder-structure)
- [License](#license)

---

## Features

- User registration & login
- JWT authentication
- Chat rooms & real-time messaging
- Message persistence with PostgreSQL
- Create rooms and invite people
- Load testing with k6
- Metrics collection with Prometheus

---

## Tech Stack

- **Backend**: FastAPI, SQLAlchemy
- **Database**: PostgreSQL, Redis
- **Real-time Communication**: WebSockets
- **Testing**: Pytest, FastAPI TestClient, k6
- **Monitoring**: Prometheus
- **Containerization**: Docker, Docker Compose
- **Python Version**: 3.12

---

## Getting Started

### Prerequisites

- Docker & Docker Compose installed
- (Optional) Node.js if you extend the frontend

### Run Locally

Clone the repository:

```bash
git clone https://github.com/yourusername/live-chat.git
cd live-chat
```
Build and start services:
```bash
docker compose up --build
```

Services exposed:
- API: http://localhost:8000
- Frontend: http://localhost:8080
- Prometheus: http://localhost:9090
- PostgreSQL: 5432
---


## Running Tests
### API Tests
Inside the API container:
```bash
docker compose exec api pytest app/tests -v
```
This will run unit and integration tests for:
- User registration & login
- Room creation
- Messaging endpoints

### Load Testing with k6
Run a load test:
```bash
docker compose exec k6 k6 run /k6/chat_load_test.js
```
You can monitor k6 metrics via Prometheus at http://localhost:9090.
