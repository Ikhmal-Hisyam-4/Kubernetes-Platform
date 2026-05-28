# Main Terraform Configuration for Lab Environment
# Provisions VMs on Harvester for RobustGX Platform Testing

locals {
  common_labels = {
    environment = "lab"
    managed_by  = "terraform"
    project     = "robustgx"
  }
}

# Existing Rocky 9.7 image already uploaded in Harvester
data "harvester_image" "rocky" {
  name      = "image-jlzs2"
  namespace = var.vm_namespace
}

# SSH Key
resource "harvester_ssh_key" "lab" {
  name       = "lab-ssh-key"
  namespace  = var.vm_namespace
  public_key = var.ssh_public_key
}

# Cloud-init for node-01 (first server — bootstraps the cluster)
resource "harvester_cloudinit_secret" "rke2_node_01" {
  name      = "rke2-node-01-cloudinit"
  namespace = var.vm_namespace

  user_data = <<-EOF
    #cloud-config
    hostname: rgx-node-01
    manage_etc_hosts: true

    users:
      - name: rocky
        sudo: ALL=(ALL) NOPASSWD:ALL
        shell: /bin/bash
        ssh_authorized_keys:
          - ${var.ssh_public_key}
      - name: ikhmal
        sudo: ALL=(ALL) NOPASSWD:ALL
        shell: /bin/bash
        lock_passwd: false
        passwd: '$6$qjOvAi49sWN.RFYX$aTaaCCBq6W.U8ki8uzfQwX3U8Oxg8rOnugdJqM67e/LMYnuBW.rwvLMRGfPd4PJKKLVS/ECUd6jDX8tV.TNHl0'
        ssh_authorized_keys:
          - ${var.ssh_public_key}

    chpasswd:
      expire: false

    package_update: true
    packages:
      - curl
      - wget
      - vim
      - net-tools
      - jq

    runcmd:
      - "dnf install -y epel-release && dnf install -y htop"
      - "mkdir -p /etc/rancher/rke2"
      - "echo 'token: ${var.rke2_token}' > /etc/rancher/rke2/config.yaml"
      - "curl -sfL https://get.rke2.io | INSTALL_RKE2_TYPE=server sh -"
      - "systemctl enable rke2-server"
      - "systemctl start rke2-server"
      - "mkdir -p /root/.kube"
      - "cp /etc/rancher/rke2/rke2.yaml /root/.kube/config"
      - "chmod 600 /root/.kube/config"
      - "ln -s /var/lib/rancher/rke2/bin/kubectl /usr/local/bin/kubectl"
      - "sed -i 's/PasswordAuthentication no/PasswordAuthentication yes/' /etc/ssh/sshd_config.d/50-cloud-init.conf || true"
      - "systemctl restart sshd"
  EOF

  network_data = <<-EOF
    version: 1
    config:
      - type: physical
        name: eth0
        subnets:
          - type: static
            address: 10.10.30.10/24
            gateway: 10.10.30.1
            dns_nameservers:
              - 10.10.10.1
            dns_search:
              - lab.robusthpc.lan
      - type: physical
        name: eth1
        subnets:
          - type: dhcp
  EOF
}

# Cloud-init for nodes 02 and 03 (join existing cluster as additional server nodes)
resource "harvester_cloudinit_secret" "rke2_node" {
  count     = var.rke2_nodes.count - 1
  name      = "rke2-node-0${count.index + 2}-cloudinit"
  namespace = var.vm_namespace

  user_data = <<-EOF
    #cloud-config
    hostname: rgx-node-0${count.index + 2}
    manage_etc_hosts: true

    users:
      - name: rocky
        sudo: ALL=(ALL) NOPASSWD:ALL
        shell: /bin/bash
        ssh_authorized_keys:
          - ${var.ssh_public_key}
      - name: ikhmal
        sudo: ALL=(ALL) NOPASSWD:ALL
        shell: /bin/bash
        lock_passwd: false
        passwd: '$6$qjOvAi49sWN.RFYX$aTaaCCBq6W.U8ki8uzfQwX3U8Oxg8rOnugdJqM67e/LMYnuBW.rwvLMRGfPd4PJKKLVS/ECUd6jDX8tV.TNHl0'
        ssh_authorized_keys:
          - ${var.ssh_public_key}

    chpasswd:
      expire: false

    package_update: true
    packages:
      - curl
      - wget
      - vim
      - net-tools
      - jq

    runcmd:
      - "dnf install -y epel-release && dnf install -y htop"
      - "mkdir -p /etc/rancher/rke2"
      - "echo 'server: https://10.10.30.10:9345' > /etc/rancher/rke2/config.yaml"
      - "echo 'token: ${var.rke2_token}' >> /etc/rancher/rke2/config.yaml"
      - "curl -sfL https://get.rke2.io | INSTALL_RKE2_TYPE=server sh -"
      - "systemctl enable rke2-server"
      - "systemctl start rke2-server"
      - "mkdir -p /root/.kube"
      - "cp /etc/rancher/rke2/rke2.yaml /root/.kube/config"
      - "chmod 600 /root/.kube/config"
      - "ln -s /var/lib/rancher/rke2/bin/kubectl /usr/local/bin/kubectl"
      - "sed -i 's/PasswordAuthentication no/PasswordAuthentication yes/' /etc/ssh/sshd_config.d/50-cloud-init.conf || true"
      - "systemctl restart sshd"
  EOF

  network_data = <<-EOF
    version: 1
    config:
      - type: physical
        name: eth0
        subnets:
          - type: static
            address: 10.10.30.${11 + count.index}/24
            gateway: 10.10.30.1
            dns_nameservers:
              - 10.10.10.1
            dns_search:
              - lab.robusthpc.lan
      - type: physical
        name: eth1
        subnets:
          - type: dhcp
  EOF
}

# Node 01 VM (bootstrap server)
resource "harvester_virtualmachine" "rke2_node_01" {
  name      = "rgx-node-01"
  namespace = var.vm_namespace

  description = "RobustGX RKE2 Node 01"
  tags        = local.common_labels

  cpu    = var.rke2_nodes.cpu
  memory = var.rke2_nodes.memory

  efi         = true
  secure_boot = false

  run_strategy = "RerunOnFailure"
  hostname     = "rgx-node-01"
  machine_type = "q35"

  ssh_keys = [
    harvester_ssh_key.lab.id
  ]

  network_interface {
    name           = "nic-1"
    network_name   = var.vm_network
    wait_for_lease = true
  }

  network_interface {
    name           = "nic-2"
    network_name   = var.k8s_network
    wait_for_lease = false
  }

  disk {
    name       = "rootdisk"
    type       = "disk"
    size       = var.rke2_nodes.disk
    bus        = "virtio"
    boot_order = 1

    image       = data.harvester_image.rocky.id
    auto_delete = true
  }

  cloudinit {
    user_data_secret_name    = harvester_cloudinit_secret.rke2_node_01.name
    network_data_secret_name = harvester_cloudinit_secret.rke2_node_01.name
  }
}

# Nodes 02 and 03 VMs (join as additional server nodes)
resource "harvester_virtualmachine" "rke2_node" {
  count     = var.rke2_nodes.count - 1
  name      = "rgx-node-0${count.index + 2}"
  namespace = var.vm_namespace

  description = "RobustGX RKE2 Node 0${count.index + 2}"
  tags        = local.common_labels

  cpu    = var.rke2_nodes.cpu
  memory = var.rke2_nodes.memory

  efi         = true
  secure_boot = false

  run_strategy = "RerunOnFailure"
  hostname     = "rgx-node-0${count.index + 2}"
  machine_type = "q35"

  ssh_keys = [
    harvester_ssh_key.lab.id
  ]

  network_interface {
    name           = "nic-1"
    network_name   = var.vm_network
    wait_for_lease = true
  }

  network_interface {
    name           = "nic-2"
    network_name   = var.k8s_network
    wait_for_lease = false
  }

  disk {
    name       = "rootdisk"
    type       = "disk"
    size       = var.rke2_nodes.disk
    bus        = "virtio"
    boot_order = 1

    image       = data.harvester_image.rocky.id
    auto_delete = true
  }

  cloudinit {
    user_data_secret_name    = harvester_cloudinit_secret.rke2_node[count.index].name
    network_data_secret_name = harvester_cloudinit_secret.rke2_node[count.index].name
  }

  depends_on = [harvester_virtualmachine.rke2_node_01]
}
