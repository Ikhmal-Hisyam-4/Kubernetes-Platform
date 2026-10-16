#cloud-config
package_update: true
hostname: ${node_name}
fqdn: ${node_name}
manage_etc_hosts: true

runcmd:
  - curl -sfL https://get.k3s.io | K3S_URL="https://${server_private_ip}:6443" K3S_TOKEN="${k3s_token}" INSTALL_K3S_EXEC="agent --node-name=${node_name}" sh -
