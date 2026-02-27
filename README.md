# CAMARA API

Demo NestJS adapter CAMARA APIs

## Prerequisites

Backend:
- Node.js ≥ 18
- Docker & Docker Compose
Emulator:
- 5.4.x Linux kernel [See free5GC prerequisites](https://free5gc.org/guide/3-install-free5gc/#a-prerequisites)
- [free5GC](https://github.com/free5gc/free5gc-compose) v4.2.0 — included in `free5gc-compose/`
- [UERANSIM](https://github.com/aligungr/UERANSIM) — included in `UERANSIM/` (runs inside Docker via compose)

## 1. Start the 5G Core

```bash
cd free5gc-compose
docker compose up -d
```

This brings up free5GC (AMF, SMF, UPF, UDM, UDR, NRF, NEF, etc.), MongoDB, the WebUI, and a UERANSIM gNB.

| Service       | Port (host) | Description                     |
|---------------|-------------|---------------------------------|
| MongoDB       | 27017       | free5gc subscriber DB           |
| WebUI         | 5000        | free5gc web console             |
| WebUI (API)   | 2121 / 2122 | free5gc billing/charging API    |

> **Tip:** To register test subscribers, open `http://localhost:5000` (default login `admin` / `free5gc`).

### Register a UE (optional)

```bash
docker exec -it ueransim ./nr-ue -c ./config/uecfg.yaml
```

## 2. Configure environment

Copy the example and adjust ports if needed:

```bash
cp .env.example .env
```

## 3. Run the API

```bash
npm install
npm run start:dev
```

- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/api-docs`
- Health: `http://localhost:3000/health`
