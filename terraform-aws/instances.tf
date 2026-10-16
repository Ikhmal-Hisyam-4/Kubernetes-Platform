data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

resource "random_password" "k3s_token" {
  length  = 48
  special = false
}

resource "aws_key_pair" "this" {
  key_name   = "${var.cluster_name}-key"
  public_key = var.ssh_public_key
}

# Elastic IP so the server's public address is known before boot (needed for
# node-external-ip/tls-san in user_data) and stays stable across stop/start.
resource "aws_eip" "server" {
  domain = "vpc"

  tags = {
    Name = "${var.cluster_name}-server-eip"
  }
}

# k3s server (control-plane). Single node — no HA, per current scope.
resource "aws_instance" "server" {
  ami                    = data.aws_ami.amazon_linux.id
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.cluster.id]
  key_name               = aws_key_pair.this.key_name

  root_block_device {
    volume_size = var.root_volume_size
    volume_type = "gp3"
  }

  user_data = templatefile("${path.module}/cloud-init/server.yaml.tpl", {
    k3s_token = random_password.k3s_token.result
    public_ip = aws_eip.server.public_ip
    node_name = "${var.cluster_name}-server"
  })
  user_data_replace_on_change = true

  tags = {
    Name = "${var.cluster_name}-server"
    Role = "k3s-server"
  }
}

resource "aws_eip_association" "server" {
  instance_id   = aws_instance.server.id
  allocation_id = aws_eip.server.id
}

# k3s agents (workers)
resource "aws_instance" "agent" {
  count = var.agent_count

  ami                    = data.aws_ami.amazon_linux.id
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.cluster.id]
  key_name               = aws_key_pair.this.key_name

  root_block_device {
    volume_size = var.root_volume_size
    volume_type = "gp3"
  }

  user_data = templatefile("${path.module}/cloud-init/agent.yaml.tpl", {
    k3s_token         = random_password.k3s_token.result
    server_private_ip = aws_instance.server.private_ip
    node_name         = "${var.cluster_name}-agent-${count.index + 1}"
  })
  user_data_replace_on_change = true

  tags = {
    Name = "${var.cluster_name}-agent-${count.index + 1}"
    Role = "k3s-agent"
  }

  depends_on = [aws_instance.server]
}
