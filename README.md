# CAMARA API

Demo NestJS adapter CAMARA APIs

For now number verification API using free5gc emulator, other APIs using mock data.

## Emulator Prerequisites
- 5.4.x Linux kernel [See free5GC prerequisites](https://free5gc.org/guide/3-install-free5gc/#a-prerequisites)
- [free5GC](https://github.com/free5gc/free5gc-compose) v4.2.0 — included in `free5gc-compose/`
- [UERANSIM](https://github.com/aligungr/UERANSIM) — included in `UERANSIM/` (runs inside Docker via compose)

If running on VMware, need to config port forwarding to expose the emulator to the host machine (nef/db/webui ports)

Get the emulator submodules
```bash
git submodule update --init --recursive
```

## 1. Start the 5G Core


```bash
sudo apt update
sudo apt install -y git make gcc linux-headers-$(uname -r)
cd gtp5g
make
sudo make install
```

```bash
sudo apt update
sudo apt install -y git make gcc linux-headers-$(uname -r)
cd free5gc-compose
make base
docker compose up -d
```

This brings up free5GC (AMF, SMF, UPF, UDM, UDR, NRF, NEF, etc.), MongoDB, the WebUI, and a UERANSIM gNB.

WebUI login:
- username: admin
- password: free5gc


| Service       | Port (host) | Description                     |
|---------------|-------------|---------------------------------|
| MongoDB       | 27017       | free5gc subscriber DB           |
| WebUI         | 5000        | free5gc web console             |
| WebUI (API)   | 2121 / 2122 | free5gc billing/charging API    |


### Register a UE (optional)

```bash
sudo apt update
sudo apt install -y make gcc g++ libsctp-dev lksctp-tools iproute2 cmake
cd UERANSIM
make
```

> **Note for VMware setup:**
> If running inside a VM, need update `UERANSIM/config/free5gc-gnb.yaml`:
> - Set `linkIp`, `ngapIp`, and `gtpIp` to the **VM's host IP**.
> - Use `docker inspect` to find the **AMF container IP** and update the `amfConfigs` section.

Spawn a gnb
```bash
build/nr-gnb -c config/free5gc-gnb.yaml
```

Spawn an UE
```bash
sudo build/nr-ue -c config/free5gc-ue.yaml -n 1
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
