terraform {
  required_version = ">= 1.5"

  
    backend "s3" {
    bucket                 = "kubex-terraform-state-164092712009"
    key                    = "k3s/terraform.tfstate"
    region                 = "ap-southeast-5"
    skip_region_validation = true
  }



  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }
}

provider "aws" {
  region = var.aws_region
}
