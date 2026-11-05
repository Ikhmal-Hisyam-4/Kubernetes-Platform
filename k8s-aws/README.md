# Gpu.kubex on k3s (production)

Kubernetes manifests running the Gpu.kubex stack on the k3s cluster provisioned by
`../terraform-aws/`. This **is production** — `app.kubex.my` / `api.kubex.my` run
here. The previous Docker Compose EC2 box has been decommissioned.

## Prerequisites

- Cluster up via `terraform apply` in `../terraform-aws/`
- `kubectl` on the server requires `sudo` (see `../terraform-aws/` notes) —
  `ssh -i ~/.ssh/kubex-k3s ec2-user@<server-ip>`, then `sudo kubectl ...`

## First-time setup

`kubex-secret` (POSTGRES_PASSWORD, JWT_SECRET) is no longer created by hand.
It's pulled automatically from AWS Secrets Manager (`kubex/app-secret`) by the
External Secrets Operator, using the EC2 instance role — see
`secret-store.yaml` and `external-secret.yaml`. Apply those once; after that
the operator keeps `kubex-secret` in sync (refreshes hourly).

`secret.yaml.example` is kept only as a reference for what keys exist.

## Deploy

Manifests live locally in this folder; the server reads its own copy from
`~/k8s-manifests/`, so after editing anything here, copy it over first:

```
scp -i ~/.ssh/kubex-k3s *.yaml ec2-user@<server-ip>:~/k8s-manifests/
```

Then, on the server, apply in this order:

```
kubectl apply -f namespace.yaml
kubectl apply -f secret-store.yaml
kubectl apply -f external-secret.yaml
kubectl apply -f configmap.yaml
kubectl apply -f postgres.yaml
kubectl apply -f redis.yaml
kubectl apply -f migrate-seed-job.yaml
kubectl wait --for=condition=complete job/migrate-seed -n kubex --timeout=120s
kubectl apply -f backend.yaml
kubectl apply -f frontend.yaml
kubectl apply -f ingress-frontend.yaml
kubectl apply -f ingress-backend.yaml
```

## Access

- Frontend: `https://app.kubex.my` (Ingress) or `http://<node-public-ip>:30080` (NodePort fallback)
- Backend: `https://api.kubex.my` (Ingress) or `http://<node-public-ip>:30800/docs` (NodePort fallback)

DNS: Cloudflare A records for `app.kubex.my` / `api.kubex.my` point at the
server's Elastic IP, proxied (orange cloud). Get the current IP from
`terraform output server_public_ip` in `../terraform-aws/`.

## Verify

```
kubectl get pods -n kubex
kubectl get svc -n kubex
kubectl get ingress -n kubex
kubectl logs -n kubex job/migrate-seed
```

## Re-running the migrate/seed job

Jobs don't re-run automatically. After changing the backend image or schema:

```
kubectl delete job migrate-seed -n kubex
kubectl apply -f migrate-seed-job.yaml
```

## Tear down

```
kubectl delete namespace kubex
```

This deletes everything in one shot, including the Postgres PVC — **this is now
production data**, so don't run this casually.
