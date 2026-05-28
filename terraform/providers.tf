# Terraform Providers for Lab Environment
# Harvester + Rancher VM Provisioning

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    harvester = {
      source  = "harvester/harvester"
      version = "~> 0.6.0"
    }
    rancher2 = {
      source  = "rancher/rancher2"
      version = "~> 4.0.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.25.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.12.0"
    }
  }

  backend "local" {
    path = "terraform.tfstate"
  }
}

# Harvester Provider
provider "harvester" {
  kubeconfig = var.harvester_kubeconfig
}

# Rancher Provider
provider "rancher2" {
  api_url   = var.rancher_url
  token_key = var.rancher_token
  insecure  = var.rancher_insecure
}

# Kubernetes Provider (for RKE2 cluster)
provider "kubernetes" {
  alias          = "rke2"
  config_path    = var.rke2_kubeconfig
  config_context = "default"
}

# Helm Provider (for RKE2 cluster)
provider "helm" {
  alias = "rke2"
  kubernetes {
    config_path    = var.rke2_kubeconfig
    config_context = "default"
  }
}

