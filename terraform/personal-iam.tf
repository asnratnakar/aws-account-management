# Personal IAM resources
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Personal Developer Role
resource "aws_iam_role" "personal_dev_role" {
  name        = "PersonalDeveloperRole"
  description = "Role for personal development and experimentation"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
        }
      }
    ]
  })

  managed_policy_arns = [
    "arn:aws:iam::aws:policy/PowerUserAccess"
  ]

  inline_policy {
    name = "DenyDangerousActions"
    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [
        {
          Effect = "Deny"
          Action = [
            "organizations:*",
            "account:*",
            "iam:DeleteRole",
            "iam:DeleteUser",
            "iam:DeletePolicy",
            "billing:*"
          ]
          Resource = "*"
        }
      ]
    })
  }

  tags = {
    Purpose = "PersonalDevelopment"
    Owner   = "Personal"
  }
}

# Read-Only Role for monitoring
resource "aws_iam_role" "personal_readonly_role" {
  name        = "PersonalReadOnlyRole"
  description = "Read-only access for monitoring and cost analysis"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
        }
      }
    ]
  })

  managed_policy_arns = [
    "arn:aws:iam::aws:policy/ReadOnlyAccess",
    "arn:aws:iam::aws:policy/AWSBillingReadOnlyAccess"
  ]

  tags = {
    Purpose = "Monitoring"
    Owner   = "Personal"
  }
}

# Emergency Access Role (use with caution)
resource "aws_iam_role" "personal_emergency_role" {
  name                 = "PersonalEmergencyRole"
  description          = "Emergency administrative access - use with extreme caution"
  max_session_duration = 3600 # 1 hour

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
        }
      }
    ]
  })

  managed_policy_arns = [
    "arn:aws:iam::aws:policy/AdministratorAccess"
  ]

  tags = {
    Purpose = "Emergency"
    Owner   = "Personal"
    Warning = "UseWithCaution"
  }
}

# Lambda Execution Role
resource "aws_iam_role" "personal_lambda_role" {
  name        = "PersonalLambdaExecutionRole"
  description = "Execution role for personal Lambda functions"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  managed_policy_arns = [
    "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  ]

  inline_policy {
    name = "PersonalLambdaPolicy"
    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [
        {
          Effect = "Allow"
          Action = [
            "s3:GetObject",
            "s3:PutObject",
            "dynamodb:GetItem",
            "dynamodb:PutItem",
            "dynamodb:UpdateItem",
            "dynamodb:DeleteItem",
            "dynamodb:Query",
            "dynamodb:Scan"
          ]
          Resource = [
            "arn:aws:s3:::personal-*/*",
            "arn:aws:dynamodb:*:*:table/personal-*"
          ]
        }
      ]
    })
  }

  tags = {
    Purpose = "Lambda"
    Owner   = "Personal"
  }
}

# Data source for current AWS account
data "aws_caller_identity" "current" {}

# Outputs
output "dev_role_arn" {
  value       = aws_iam_role.personal_dev_role.arn
  description = "ARN of the development role"
}

output "readonly_role_arn" {
  value       = aws_iam_role.personal_readonly_role.arn
  description = "ARN of the read-only role"
}

output "emergency_role_arn" {
  value       = aws_iam_role.personal_emergency_role.arn
  description = "ARN of the emergency access role"
}
