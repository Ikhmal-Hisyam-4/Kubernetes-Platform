# Variables for Lab Environment

# Harvester Configuration
variable "harvester_kubeconfig" {
  description = "Path to Harvester kubeconfig file"
  type        = string
  default     = "~/.kube/harvester-config"
}

# Rancher Configuration
variable "rancher_url" {
  description = "Rancher API URL"
  type        = string
  default     = "https://rancher.lab.robusthpc.lan"
}

variable "rancher_token" {
  description = "Rancher API token"
  type        = string
  sensitive   = true
}

variable "rancher_insecure" {
  description = "Skip TLS verification for Rancher"
  type        = bool
  default     = true
}

# RKE2 Cluster Configuration
variable "rke2_kubeconfig" {
  description = "Path to RKE2 cluster kubeconfig"
  type        = string
  default     = "~/.kube/rke2-config"
}

# VM Configuration
variable "vm_namespace" {
  description = "Harvester namespace for VMs"
  type        = string
  default     = "default"
}

variable "vm_network" {
  description = "VM network name (VLAN 30 - management)"
  type        = string
  default     = "vm-network"
}

variable "k8s_network" {
  description = "Kubernetes network name (VLAN 50 - k8s traffic)"
  type        = string
  default     = "k8s-network"
}

variable "storage_class" {
  description = "Storage class for VM disks"
  type        = string
  default     = "harvester-longhorn"
}

# RKE2 cluster join token (shared secret between control plane and workers)
variable "rke2_token" {
  description = "Pre-shared token for RKE2 cluster node registration"
  type        = string
  sensitive   = true
}

# SSH Configuration
variable "ssh_public_key" {
  description = "SSH public key for VM access"
  type        = string
}

# RKE2 Nodes (all identical, all roles: control-plane + etcd + worker)
variable "rke2_nodes" {
  description = "RKE2 node VM configuration (all nodes have identical specs and all roles)"
  type = object({
    count  = number
    cpu    = number
    memory = string
    disk   = string
  })
  default = {
    count  = 3
    cpu    = 4
    memory = "6Gi"
    disk   = "100Gi"
  }
}


