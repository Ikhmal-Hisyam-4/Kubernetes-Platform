output "server_public_ip" {
  description = "Elastic IP of the k3s server node (stable across stop/start). SSH here and copy /etc/rancher/k3s/k3s.yaml for kubeconfig."
  value       = aws_eip.server.public_ip
}

output "server_private_ip" {
  value = aws_instance.server.private_ip
}

output "agent_public_ips" {
  value = aws_instance.agent[*].public_ip
}

output "ssh_user" {
  value = "ec2-user"
}

output "kubeconfig_fetch_command" {
  description = "Run this to pull a working kubeconfig to your machine (fixes the server address to the public IP)."
  value       = "ssh ec2-user@${aws_eip.server.public_ip} sudo cat /etc/rancher/k3s/k3s.yaml | sed 's/127.0.0.1/${aws_eip.server.public_ip}/' > kubeconfig.yaml"
}
