# GitHub Actions OIDC Setup for AWS

This repository uses OpenID Connect (OIDC) for secure authentication with AWS, eliminating the need to store AWS access keys in GitHub secrets.

## Prerequisites

- AWS Account (677803207672)
- GitHub repository with Actions enabled
- AWS CLI configured (for setup only)

## Step 1: Create OIDC Identity Provider in AWS

1. **Open AWS IAM Console** → Identity providers → Add provider

2. **Configure the provider:**
   - Provider type: `OpenID Connect`
   - Provider URL: `https://token.actions.githubusercontent.com`
   - Audience: `sts.amazonaws.com`

3. **Add thumbprint** (AWS will auto-populate this)

4. **Click "Add provider"**

## Step 2: Create IAM Role for GitHub Actions

Create a new IAM role with the following trust policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::677803207672:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:asnra/aws-account-management:*"
        }
      }
    }
  ]
}
```

## Step 3: Attach Policies to the Role

Attach the following AWS managed policies:

1. **PowerUserAccess** - For CDK deployments
2. **IAMFullAccess** - For IAM role/policy management
3. **CloudWatchFullAccess** - For billing alarms
4. **AWSBudgetsActionsWithAWSResourceControlAccess** - For budget management

**Custom Policy for Cost Monitoring:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ce:GetDimensionValues",
        "ce:GetRightsizingRecommendation",
        "ce:GetCostAndUsage",
        "ce:GetReservationCoverage",
        "ce:GetReservationPurchaseRecommendation",
        "ce:GetReservationUtilization",
        "ce:GetUsageReport",
        "budgets:ViewBudget",
        "budgets:DescribeBudgets",
        "budgets:DescribeBudgetActionsForBudget"
      ],
      "Resource": "*"
    }
  ]
}
```

## Step 4: Configure GitHub Repository Secrets

1. Go to your GitHub repository → Settings → Secrets and variables → Actions

2. Add the following repository secret:
   - **Name:** `AWS_ROLE_TO_ASSUME`
   - **Value:** `arn:aws:iam::677803207672:role/GitHubActionsRole` (replace with your actual role ARN)

## Step 5: Set Up GitHub Environments

Create the following environments in GitHub Settings → Environments:

### 1. Production Environment
- **Name:** `production`
- **Protection rules:**
  - Required reviewers: Add yourself
  - Wait timer: 0 minutes
- **Environment secrets:** None needed (inherits from repository)

### 2. Emergency Environment
- **Name:** `emergency`
- **Protection rules:**
  - Required reviewers: Add yourself
  - Wait timer: 5 minutes (cooling-off period)
- **Environment secrets:** None needed

## Step 6: Verify Setup

1. **Trigger a deployment:**
   ```bash
   git add .
   git commit -m "test: verify OIDC setup"
   git push origin main
   ```

2. **Check the Actions tab** - The workflow should authenticate successfully using OIDC

3. **Monitor AWS CloudTrail** - Verify that the role is being assumed correctly

## Troubleshooting

### Common Issues:

1. **"No permission to assume role"**
   - Verify the trust policy includes your repository path
   - Check that the OIDC provider is created correctly

2. **"Audience validation failed"**
   - Ensure audience is set to `sts.amazonaws.com`

3. **"Subject claim validation failed"**
   - Verify the repository path in the trust policy condition

### Verification Commands:

```bash
# Check OIDC provider
aws iam list-open-id-connect-providers

# Check role trust policy
aws iam get-role --role-name GitHubActionsRole

# Test assume role (from GitHub Actions context)
aws sts get-caller-identity
```

## Security Benefits

- ✅ No long-lived AWS credentials stored in GitHub
- ✅ Temporary credentials with short expiration
- ✅ Fine-grained access control per repository
- ✅ Audit trail in AWS CloudTrail
- ✅ Automatic credential rotation

## Role ARN Examples

Replace these with your actual ARNs:

- **OIDC Provider:** `arn:aws:iam::677803207672:oidc-provider/token.actions.githubusercontent.com`
- **GitHub Actions Role:** `arn:aws:iam::677803207672:role/GitHubActionsRole`

## Next Steps

After setup is complete:

1. Update `src/config.ts` if needed for your AWS account
2. Test deployment with a small change
3. Monitor cost alerts and budgets
4. Review CloudWatch logs for any issues

---

**Note:** This setup provides enterprise-grade security for your AWS deployments while maintaining the convenience of automated CI/CD workflows.
