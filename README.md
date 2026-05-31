# Kubernetes Platform — gpu.kubex.my

A end-to-end homelab infrastructure project built from scratch — from bare-metal servers and a managed switch, all the way up to a live, HTTPS-secured web application running on a self-managed Kubernetes cluster.

The application simulates a **GPU cloud marketplace** (Kubex) where users can browse GPU instances, compare pricing, and deploy servers — modelled after platforms like vast.ai and TensorDock, but fully self-hosted on-premises.

> **Live:** https://gpu.kubex.my
> **Documentation:** https://www.notion.so/370f5cca41248112ad22f06d5a35f8f6

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐   ┌──────────────────────────────────┐
│                  ON-PREMISES INFRASTRUCTURE                  │   │         CI/CD PIPELINE           │
│                                                             │   │                                  │
│  Internet / End Users                                       │   │  GitLab (gitlab.com)             │
│  gpu.kubex.my (via Cloudflare Tunnel)                       │   │          │ trigger               │
│           │                                                 │   │  GitLab Runner (rgx-node-01)     │
│           ▼                                                 │   │          │                       │
│  pfSense Firewall (10.10.10.1)                              │   │  ┌───────▼────────────────────┐  │
│           │                                                 │   │  │ 1. Test (tsc --noEmit)     │  │
│  Core Switch — S3900-24T4S (10.10.10.2)                     │   │  │ 2. Docker Build            │  │
│  VLANs: 10-Mgmt | 30-VM Network | 40-Storage | 50-K8s      │   │  │ 3. Push to AWS ECR         │  │
│           │                                                 │   │  │ 4. kubectl apply → RKE2    │  │
│  ┌────────┴──────────────────────────────────────────────┐  │   │  └────────────────────────────┘  │
│  │  Harvester Virtualization Cluster                      │  │   │                                  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐     │  │   └──────────────────────────────────┘
│  │  │ lab-hvst-01 │ │ lab-hvst-02 │ │ lab-hvst-03 │     │  │
│  │  │ 10.10.10.11 │ │ 10.10.10.12 │ │ 10.10.10.13 │     │  │   ┌──────────────────────────────────┐
│  │  └─────────────┘ └─────────────┘ └─────────────┘     │  │   │           AWS CLOUD              │
│  └───────────────────────────┬───────────────────────────┘  │   │                                  │
│                               │                              │   │  AWS ECR — Container Registry    │
│  Rancher Manager (10.10.10.10)│                              │   │  AWS S3  — Backup Storage        │
│  Provision & manage K8s cluster                             │   └──────────────────────────────────┘
│                               ▼
│  Longhorn Distributed Storage (VLAN 40)                     │
│                               │                             │
│  ┌────────────────────────────▼────────────────────────┐   │
│  │  RKE2 Kubernetes Cluster — rgx-cluster (VLAN 30/50) │   │
│  │                                                      │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │   │
│  │  │ rgx-node-01 │ │ rgx-node-02 │ │ rgx-node-03 │   │   │
│  │  │ 10.10.30.10 │ │ 10.10.30.11 │ │ 10.10.30.12 │   │   │
│  │  │ control-plane + etcd + worker (all 3 nodes)   │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  │                                                      │   │
│  │  ┌─────────────────────┐  ┌───────────────────────┐ │   │
│  │  │  Observability       │  │  Application (kubex)  │ │   │
│  │  │  Prometheus (metrics)│  │  frontend (React)     │ │   │
│  │  │  Loki (logs)        │  │  backend (Node.js)    │ │   │
│  │  │  Grafana (dashboards)│  │  postgres (Longhorn)  │ │   │
│  │  └─────────────────────┘  └───────────────────────┘ │   │
│  │  Calico CNI (VLAN 50 — Kubernetes Network)           │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Detail |
|---|---|---|
| **Network** | pfSense + S3900-24T4S | Firewall, DHCP, DNS, VLAN segmentation |
| **Virtualisation** | Harvester HCI | 3-node bare-metal HCI cluster |
| **Cluster Management** | Rancher | Manages Harvester + RKE2 |
| **Kubernetes** | RKE2 | 3 nodes, all roles: control-plane + etcd + worker |
| **CNI** | Calico | Pod networking on VLAN 50 |
| **Storage** | Longhorn | Distributed block storage, 3x replication |
| **Observability** | Prometheus + Loki + Grafana | Metrics, logs, dashboards |
| **IaC** | Terraform + Ansible | VM provisioning + cluster bootstrap |
| **Frontend** | React + Vite + TypeScript + Tailwind CSS | 4 pages |
| **Backend** | Node.js + Express + Prisma | REST API |
| **Database** | PostgreSQL 16 | In-cluster, Longhorn PVC |
| **Containers** | Docker (multi-stage) | Local dev via docker-compose |
| **Registry** | AWS ECR | ap-southeast-1, kubex/frontend + kubex/backend |
| **CI/CD** | GitLab CI + self-hosted Runner | 4 stages, shell executor |
| **Public Access** | Cloudflare Tunnel | HTTPS, no open inbound ports |
| **Backup** | AWS S3 | Harvester VM snapshots |

---

## Project Structure

```
kubernetes-platform/
├── terraform/                  # VM provisioning on Harvester
│   ├── main.tf                 # VM resources + cloud-init
│   ├── variables.tf            # Input variables
│   ├── providers.tf            # Harvester, Rancher, K8s, Helm providers
│   ├── outputs.tf              # Node IPs and cluster info
│   └── terraform.tfvars.example
├── ansible/                    # Cluster bootstrap and configuration
│   ├── site.yml                # Master playbook
│   ├── inventory/rke2.yml      # Node inventory
│   └── playbooks/
│       ├── 00a-prepare-nodes-longhorn.yml
│       ├── 00-install-longhorn.yml
│       ├── 01-deploy-monitoring.yml
│       └── 02-verify-monitoring.yml
├── frontend/                   # React + TypeScript + Tailwind CSS
├── backend/                    # Node.js + Express + Prisma
├── k8s/                        # Kubernetes manifests
│   ├── namespace.yaml
│   ├── frontend.yaml
│   ├── backend.yaml
│   ├── postgres.yaml
│   ├── ingress.yaml
│   └── configmap.yaml
├── docker-compose.yml          # Local development
└── .gitlab-ci.yml              # CI/CD pipeline
```

---

## Setup

### 1. Provision VMs with Terraform

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Fill in: Harvester kubeconfig, Rancher token, RKE2 join token, SSH public key

terraform init
terraform plan
terraform apply
# Node-01 bootstraps the RKE2 cluster, nodes 02-03 join automatically via cloud-init
```

### 2. Bootstrap Cluster with Ansible

```bash
cd ansible

# Full stack (Longhorn + Monitoring)
ansible-playbook site.yml --extra-vars "grafana_admin_password=YourPassword"

# Or run individually by tag
ansible-playbook site.yml --tags longhorn    # Storage only
ansible-playbook site.yml --tags monitoring  # Prometheus + Grafana + Loki only
```

### 3. Run Locally with Docker Compose

```bash
docker-compose up --build

# Frontend: http://localhost:80
# Backend:  http://localhost:3001
# Database: localhost:5432
```

### 4. Deploy to Kubernetes

CI/CD handles this automatically on every push to `main`. To deploy manually:

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/
kubectl rollout status deployment/frontend -n kubex
kubectl rollout status deployment/backend -n kubex
```

---

## CI/CD Pipeline

Every push to `main` triggers the full pipeline automatically:

```
git push → GitLab
               |
         GitLab Runner (on rgx-node-01)
               |
         ┌─────▼─────┐
         │   test    │  npx tsc --noEmit (frontend + backend in parallel)
         └─────┬─────┘
         ┌─────▼─────┐
         │   build   │  docker build (frontend + backend in parallel)
         └─────┬─────┘
         ┌─────▼─────┐
         │   push    │  push to AWS ECR (tagged with commit SHA + latest)
         └─────┬─────┘
         ┌─────▼─────┐
         │  deploy   │  kubectl apply + rollout status (300s timeout)
         └───────────┘
               |
         gpu.kubex.my updated live
```

---

## Monitoring

| Service | Access | Purpose |
|---|---|---|
| Grafana | http://10.10.30.10:30300 | Dashboards — node metrics, pod health, logs |
| Prometheus | `kubectl port-forward -n monitoring svc/kube-prometheus-stack-prometheus 9090:9090` | Metrics collection |
| Loki | via Grafana → Explore | Log aggregation from all pods |

---

## Application

The app is a GPU cloud marketplace with 4 pages:

| Route | Page |
|---|---|
| `/` | Home — hero, GPU availability widget, hardware tiers |
| `/gpus` | GPU Instances — filterable marketplace |
| `/pricing` | Pricing — per-second billing, cost estimates |
| `/dashboard` | Dashboard — deployed instances |

---

## Author

**Ikhmal** — Platform / Infrastructure Engineer

- GitHub: [Ikhmal-Hisyam-4/Kubernetes-Platform](https://github.com/Ikhmal-Hisyam-4/Kubernetes-Platform)
- GitLab: [gitlab.com/ikhmal/kubernetes-platform](https://gitlab.com/ikhmal/kubernetes-platform)
- Live: [gpu.kubex.my](https://gpu.kubex.my)
