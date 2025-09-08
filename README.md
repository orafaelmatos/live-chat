# Live Chat

**Live Chat** is a real-time messaging application built with **FastAPI**, **WebSockets**, and **PostgreSQL**, featuring:

- User registration and authentication (JWT-based)
- Real-time chat rooms with WebSocket communication
- Persistent messages stored in PostgreSQL
- Load testing with **k6** and performance monitoring using **Prometheus**
- Designed for scalability and maintainability

This project demonstrates modern Python backend development practices and real-time system design, making it a valuable addition to your portfolio.

---

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
- Prometheus: http://localhost:9090
- Redis: 6379
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