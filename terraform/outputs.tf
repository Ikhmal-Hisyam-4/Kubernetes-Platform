# Terraform Outputs for Lab Environment

output "rke2_node_01_ip" {
  description = "IP address of RKE2 node 01 (bootstrap)"
  value       = harvester_virtualmachine.rke2_node_01.network_interface[0].ip_address
}

output "rke2_node_ips" {
  description = "IP addresses of RKE2 nodes 02+"
  value       = [for vm in harvester_virtualmachine.rke2_node : vm.network_interface[0].ip_address]
}

output "vm_image_id" {
  description = "Harvester VM image ID"
  value       = data.harvester_image.rocky.id
}

output "ssh_key_id" {
  description = "Harvester SSH key ID"
  value       = harvester_ssh_key.lab.id
}

output "cluster_info" {
  description = "RKE2 cluster node information"
  value = {
    node_01 = {
      name = harvester_virtualmachine.rke2_node_01.name
      ip   = harvester_virtualmachine.rke2_node_01.network_interface[0].ip_address
      cpu  = harvester_virtualmachine.rke2_node_01.cpu
      mem  = harvester_virtualmachine.rke2_node_01.memory
    }
    nodes = [for vm in harvester_virtualmachine.rke2_node : {
      name = vm.name
      ip   = vm.network_interface[0].ip_address
      cpu  = vm.cpu
      mem  = vm.memory
    }]
  }
}
