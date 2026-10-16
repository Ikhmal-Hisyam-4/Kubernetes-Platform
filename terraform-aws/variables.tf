variable "aws_region" {
  description = "AWS region to deploy the cluster into"
  type        = string
  default     = "ap-southeast-5"
}

variable "cluster_name" {
  description = "Name prefix for all cluster resources"
  type        = string
  default     = "kubex-k3s"
}

variable "instance_type" {
  description = "EC2 instance type for all nodes"
  type        = string
  default     = "t3.small"
}

variable "agent_count" {
  description = "Number of k3s agent (worker) nodes"
  type        = number
  default     = 2
}

variable "ssh_public_key" {
  description = "Public key material for the cluster SSH key pair"
  type        = string
}

variable "ssh_allowed_cidr" {
  description = "CIDR allowed to SSH into nodes and reach the k3s API (6443). Set to your own IP/32, not 0.0.0.0/0."
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block for the dedicated cluster VPC"
  type        = string
  default     = "10.20.0.0/16"
}

variable "public_subnet_cidr" {
  description = "CIDR block for the single public subnet nodes live in"
  type        = string
  default     = "10.20.1.0/24"
}

variable "root_volume_size" {
  description = "Root EBS volume size (GB) per node"
  type        = number
  default     = 20
}
