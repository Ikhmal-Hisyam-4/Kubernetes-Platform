#!/usr/bin/env bash
# Health check for the kubex-k3s cluster: Kubernetes-level status (nodes/pods)
# plus EC2-level resource usage (CPU/RAM/disk) on each node.
#
# Usage: ./scripts/health-check.sh
# Reads node IPs from `terraform output`, so it stays correct even after IPs change.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TF_DIR="$(dirname "$SCRIPT_DIR")"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/kubex-k3s}"
SSH_OPTS="-i $SSH_KEY -o StrictHostKeyChecking=accept-new -o ConnectTimeout=10"

cd "$TF_DIR"

SERVER_IP=$(terraform output -raw server_public_ip)
AGENT_IPS=$(terraform output -json agent_public_ips | python3 -c "import json,sys; print(' '.join(json.load(sys.stdin)))")

echo "===================================================="
echo " kubex-k3s cluster health check — $(date)"
echo "===================================================="

echo
echo "---- Kubernetes: node status (via server $SERVER_IP) ----"
ssh $SSH_OPTS "ec2-user@$SERVER_IP" "sudo kubectl get nodes -o wide"

echo
echo "---- Kubernetes: pod status (all namespaces) ----"
ssh $SSH_OPTS "ec2-user@$SERVER_IP" "sudo kubectl get pods -A"

echo
echo "---- Kubernetes: non-Running/non-Completed pods (should be empty) ----"
ssh $SSH_OPTS "ec2-user@$SERVER_IP" \
  "sudo kubectl get pods -A --field-selector=status.phase!=Running,status.phase!=Succeeded 2>/dev/null || true"

for ip in "$SERVER_IP" $AGENT_IPS; do
  echo
  echo "---- EC2 resources: $ip ----"
  ssh $SSH_OPTS "ec2-user@$ip" '
    echo "uptime / load:"; uptime
    echo
    echo "memory:"; free -h
    echo
    echo "disk:"; df -h / | tail -1
  '
done

echo
echo "===================================================="
echo " Health check complete"
echo "===================================================="
