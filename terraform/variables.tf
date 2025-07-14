# Terraform variables
variable "alert_email" {
  description = "Email address for billing alerts and notifications"
  type        = string
  default     = "your-email@example.com"
}

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "monthly_budget_limit" {
  description = "Monthly budget limit in USD"
  type        = number
  default     = 50
}

variable "quarterly_budget_limit" {
  description = "Quarterly budget limit in USD"
  type        = number
  default     = 150
}

variable "billing_alarm_thresholds" {
  description = "Billing alarm thresholds in USD"
  type        = list(number)
  default     = [10, 25, 50]
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "personal"
}

variable "owner" {
  description = "Resource owner"
  type        = string
  default     = "Personal"
}

# Local values for common tags
locals {
  common_tags = {
    Environment = var.environment
    Owner       = var.owner
    ManagedBy   = "Terraform"
    Project     = "PersonalAWSManagement"
  }
}
