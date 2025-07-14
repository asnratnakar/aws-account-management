# Billing controls and alerts

# SNS Topic for billing alerts
resource "aws_sns_topic" "billing_alerts" {
  name         = "personal-billing-alerts"
  display_name = "AWS Billing Alerts"

  tags = {
    Purpose = "BillingAlerts"
    Owner   = "Personal"
  }
}

# SNS Topic Subscription (replace email with your actual email)
resource "aws_sns_topic_subscription" "billing_email" {
  topic_arn = aws_sns_topic.billing_alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email # Define this in variables.tf
}

# CloudWatch Billing Alarm - $10 threshold
resource "aws_cloudwatch_metric_alarm" "billing_alarm_10" {
  alarm_name          = "billing-alarm-10-usd"
  alarm_description   = "Alert when billing exceeds $10"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "EstimatedCharges"
  namespace           = "AWS/Billing"
  period              = "21600" # 6 hours
  statistic           = "Maximum"
  threshold           = "10"
  treat_missing_data  = "notBreaching"

  dimensions = {
    Currency = "USD"
  }

  alarm_actions = [aws_sns_topic.billing_alerts.arn]

  tags = {
    Purpose = "BillingAlert"
    Level   = "Warning"
  }
}

# CloudWatch Billing Alarm - $25 threshold
resource "aws_cloudwatch_metric_alarm" "billing_alarm_25" {
  alarm_name          = "billing-alarm-25-usd"
  alarm_description   = "Alert when billing exceeds $25"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "EstimatedCharges"
  namespace           = "AWS/Billing"
  period              = "21600" # 6 hours
  statistic           = "Maximum"
  threshold           = "25"
  treat_missing_data  = "notBreaching"

  dimensions = {
    Currency = "USD"
  }

  alarm_actions = [aws_sns_topic.billing_alerts.arn]

  tags = {
    Purpose = "BillingAlert"
    Level   = "High"
  }
}

# CloudWatch Billing Alarm - $50 threshold (critical)
resource "aws_cloudwatch_metric_alarm" "billing_alarm_50" {
  alarm_name          = "billing-alarm-50-usd-critical"
  alarm_description   = "CRITICAL: Alert when billing exceeds $50"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "EstimatedCharges"
  namespace           = "AWS/Billing"
  period              = "21600" # 6 hours
  statistic           = "Maximum"
  threshold           = "50"
  treat_missing_data  = "notBreaching"

  dimensions = {
    Currency = "USD"
  }

  alarm_actions = [aws_sns_topic.billing_alerts.arn]

  tags = {
    Purpose = "BillingAlert"
    Level   = "Critical"
  }
}

# Budget for monthly spending
resource "aws_budgets_budget" "monthly_budget" {
  name         = "PersonalAWSBudget"
  budget_type  = "COST"
  limit_amount = "50"
  limit_unit   = "USD"
  time_unit    = "MONTHLY"
  time_period_start = "2025-01-01_00:00"

  cost_filters {
    service = ["Amazon Elastic Compute Cloud - Compute"]
  }

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                 = 80
    threshold_type            = "PERCENTAGE"
    notification_type         = "ACTUAL"
    subscriber_email_addresses = [var.alert_email]
  }

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                 = 100
    threshold_type            = "PERCENTAGE"
    notification_type          = "FORECASTED"
    subscriber_email_addresses = [var.alert_email]
  }

  tags = {
    Purpose = "BudgetControl"
    Owner   = "Personal"
  }
}

# Quarterly budget for overall spending
resource "aws_budgets_budget" "quarterly_budget" {
  name         = "QuarterlySpendLimit"
  budget_type  = "COST"
  limit_amount = "150"
  limit_unit   = "USD"
  time_unit    = "QUARTERLY"
  time_period_start = "2025-01-01_00:00"

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                 = 90
    threshold_type            = "PERCENTAGE"
    notification_type          = "ACTUAL"
    subscriber_email_addresses = [var.alert_email]
  }

  tags = {
    Purpose = "BudgetControl"
    Owner   = "Personal"
    Period  = "Quarterly"
  }
}
