#cloud-config
package_update: true
hostname: ${node_name}
fqdn: ${node_name}
manage_etc_hosts: true

runcmd:
  - curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC="server --node-name=${node_name} --tls-san=${public_ip} --write-kubeconfig-mode=644" K3S_TOKEN="${k3s_token}" sh -
  - mkdir -p /home/ec2-user/.kube
  - cp /etc/rancher/k3s/k3s.yaml /home/ec2-user/.kube/config
  - sed -i "s/127.0.0.1/${public_ip}/" /home/ec2-user/.kube/config
  - chown -R ec2-user:ec2-user /home/ec2-user/.kube
  - chmod 600 /home/ec2-user/.kube/config
  - echo 'export KUBECONFIG=/home/ec2-user/.kube/config' >> /home/ec2-user/.bashrc
