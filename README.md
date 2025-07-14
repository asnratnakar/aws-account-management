# aws-account-management

A comprehensive solution for managing a personal AWS account with IAM roles, policies, and billing controls. This repository provides both AWS CDK (TypeScript) and Terraform implementations for infrastructure as code.

## 🎯 Purpose

This project helps you:
- **Secure your AWS account** with proper IAM roles and least-privilege policies
- **Control costs** with proactive billing alerts and spending limits
- **Prevent expensive mistakes** with safety guardrails
- **Monitor usage** with comprehensive cost tracking

## 📁 Repository Structure

```
aws-account-management/
├── src/                          # AWS CDK (TypeScript) implementation
│   ├── app.ts                   # Main CDK application
│   ├── iam/
│   │   ├── personal-roles.ts    # IAM roles for personal use
│   │   └── basic-policies.ts    # Custom IAM policies
│   └── billing/
│       ├── cost-alerts.ts       # CloudWatch billing alarms
│       └── spend-limits.ts      # AWS Budgets and limits
├── terraform/                   # Terraform implementation
│   ├── personal-iam.tf         # IAM resources
│   ├── billing-controls.tf     # Billing alerts and budgets
│   └── variables.tf            # Configuration variables
├── package.json                # Node.js dependencies
├── tsconfig.json              # TypeScript configuration
└── README.md                  # This file
```

## 🛡️ IAM Roles & Policies

### Roles Created

1. **PersonalDeveloperRole**
   - PowerUser access with restrictions
   - Denies dangerous actions (account/org changes, IAM deletions)
   - Perfect for daily development work

2. **PersonalReadOnlyRole**
   - Read-only access across all services
   - Billing read access for cost monitoring
   - Safe for auditing and monitoring

3. **PersonalEmergencyRole**
   - Full administrator access
   - Limited to 1-hour sessions
   - Use only in emergencies

4. **PersonalLambdaExecutionRole**
   - For Lambda functions
   - Access to personal S3 buckets and DynamoDB tables

### Custom Policies

- **Personal S3 Access**: Limited to buckets prefixed with "personal-"
- **Personal DynamoDB Access**: Limited to tables prefixed with "personal-"
- **Cost Optimization**: Permissions for cost monitoring and optimization
- **Safety Guards**: Prevents launching expensive instance types

## 💰 Billing Controls

### Cost Alerts
- **$10 Threshold**: Early warning alert
- **$25 Threshold**: High usage alert
- **$50 Threshold**: Critical spending alert

### Budget Limits
- **Monthly Budget**: $50 with 80% and 100% alerts
- **Quarterly Budget**: $150 with 90% alert

### Safety Features
- Restricts EC2 instances to cost-effective types (t2/t3/t4g micro/small)
- Restricts RDS instances to cost-effective types
- Email notifications for all alerts

## 🚀 Getting Started

### Prerequisites
- AWS CLI configured with appropriate credentials
- Node.js 18+ (for CDK approach)
- Terraform 1.0+ (for Terraform approach)

### Option 1: AWS CDK Deployment

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure your email** (replace in all files):
   ```bash
   # Search and replace 'your-email@example.com' with your actual email
   ```

3. **Bootstrap CDK** (first time only):
   ```bash
   npx cdk bootstrap
   ```

4. **Deploy the stack**:
   ```bash
   npm run deploy
   ```

5. **Verify deployment**:
   ```bash
   npm run synth
   ```

### Option 2: Terraform Deployment

1. **Initialize Terraform**:
   ```bash
   cd terraform
   terraform init
   ```

2. **Create terraform.tfvars**:
   ```hcl
   alert_email = "your-email@example.com"
   aws_region = "us-east-1"
   monthly_budget_limit = 50
   quarterly_budget_limit = 150
   ```

3. **Plan and apply**:
   ```bash
   terraform plan
   terraform apply
   ```

## 📧 Configuration

### Required Changes Before Deployment

1. **Update email addresses** in these files:
   - `src/billing/cost-alerts.ts`
   - `src/billing/spend-limits.ts`
   - `terraform/variables.tf` (or create `terraform.tfvars`)

2. **Adjust spending limits** if needed:
   - Monthly budget: Currently set to $50
   - Quarterly budget: Currently set to $150
   - Alert thresholds: $10, $25, $50

### Environment Variables (CDK)
```bash
export CDK_DEFAULT_ACCOUNT=123456789012  # Your AWS account ID
export CDK_DEFAULT_REGION=us-east-1      # Your preferred region
```

## 🔧 Available Scripts (CDK)

```bash
npm run build    # Compile TypeScript
npm run watch    # Watch for changes
npm run deploy   # Deploy to AWS
npm run destroy  # Remove all resources
npm run synth    # Generate CloudFormation template
npm run diff     # Show differences
```

## 🏷️ Resource Naming Convention

All resources follow this pattern:
- **IAM Roles**: `Personal[Purpose]Role`
- **S3 Buckets**: `personal-*`
- **DynamoDB Tables**: `personal-*`
- **Budgets**: `Personal*Budget`
- **Alarms**: `billing-alarm-*-usd`

## 🔒 Security Best Practices

### Implemented Safeguards
- ✅ Least privilege access patterns
- ✅ Resource-based restrictions (personal-* prefix)
- ✅ Instance type limitations
- ✅ Session duration limits for admin access
- ✅ Billing alerts and hard limits
- ✅ Dangerous action denials

### Recommended Usage
1. Use **PersonalDeveloperRole** for daily work
2. Use **PersonalReadOnlyRole** for monitoring
3. Reserve **PersonalEmergencyRole** for true emergencies
4. Always prefix personal resources with "personal-"

## 💡 Cost Optimization Tips

1. **Monitor regularly**: Check the billing dashboard weekly
2. **Use free tier**: Leverage AWS Free Tier resources when possible
3. **Clean up**: Regularly delete unused resources
4. **Right-size**: Use appropriate instance sizes for your needs
5. **Set alerts**: The implemented alerts will help catch overspending early

## 🛠️ Customization

### Adjusting Budget Limits
**CDK**: Modify values in `src/billing/spend-limits.ts`
**Terraform**: Update variables in `terraform/variables.tf`

### Adding New Roles
1. Define the role in `personal-roles.ts` or `personal-iam.tf`
2. Add appropriate policies
3. Update the main app file to include the new role

### Modifying Alert Thresholds
Update the threshold values in:
- `src/billing/cost-alerts.ts` (CDK)
- `terraform/billing-controls.tf` (Terraform)

## 📊 Monitoring & Alerts

After deployment, you'll receive email notifications for:
- Billing threshold breaches ($10, $25, $50)
- Budget limit warnings (80%, 90%, 100%)
- Forecasted spending overruns

## 🗑️ Cleanup

### CDK
```bash
npm run destroy
```

### Terraform
```bash
cd terraform
terraform destroy
```

## 🤝 Contributing

This is a personal AWS management repository. Feel free to fork and adapt for your own use.

## 📄 License

MIT License - feel free to use and modify for your personal AWS account management.

## ⚠️ Important Notes

1. **Billing Region**: Billing metrics are only available in `us-east-1`
2. **Email Confirmation**: You'll need to confirm SNS email subscriptions
3. **First Deployment**: Budget resources may take time to appear in the console
4. **Permissions**: Ensure your AWS credentials have sufficient permissions for deployment

---

**🎉 Happy cloud computing! Stay within budget and secure! 🎉**