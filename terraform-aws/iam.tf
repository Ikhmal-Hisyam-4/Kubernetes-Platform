resource "aws_iam_policy" "secret_read" {
  name = "kubex-secret-read"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = "secretsmanager:GetSecretValue"
      Resource = "arn:aws:secretsmanager:ap-southeast-5:164092712009:secret:kubex/app-secret*"
    }]
  })
}

resource "aws_iam_role" "ec2_secrets" {
  name        = "kubex-ec2-secrets-role"
  description = "Allows EC2 instances to call AWS services on your behalf."

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "secret_read" {
  role       = aws_iam_role.ec2_secrets.name
  policy_arn = aws_iam_policy.secret_read.arn
}

resource "aws_iam_instance_profile" "ec2_secrets" {
  name = "kubex-ec2-secrets-role"
  role = aws_iam_role.ec2_secrets.name
}
