# GitHub Actions Setup Guide

This repository includes comprehensive GitHub Actions workflows for automated AWS infrastructure management.

## 🚀 **Workflows Included**

### 1. **`deploy.yml`** - Main Deployment Pipeline
**Triggers:** Push to main branch, manual dispatch
**Purpose:** Validates, security checks, and deploys infrastructure
**Features:**
- TypeScript compilation validation
- CDK synthesis verification
- Security scanning for credentials
- Cost estimation checks
- Automatic deployment with approval gate
- Deployment notifications

### 2. **`pr-validation.yml`** - Pull Request Validation
**Triggers:** Pull requests to main branch
**Purpose:** Validates changes before merge
**Features:**
- Configuration validation
- Security scanning
- Infrastructure diff preview
- Automatic PR comments with validation results

### 3. **`cost-monitoring.yml`** - Daily Cost Monitoring
**Triggers:** Daily at 9 AM UTC, manual dispatch
**Purpose:** Monitors spending and resource usage
**Features:**
- Daily spending analysis
- Budget utilization tracking
- Resource inventory
- Cost alerting

### 4. **`emergency-destroy.yml`** - Emergency Resource Cleanup
**Triggers:** Manual dispatch only
**Purpose:** Emergency destruction of all resources
**Features:**
- Confirmation required ("DESTROY")
- Reason logging
- Approval gate
- Complete infrastructure teardown

## 🔧 **Setup Instructions**

### Step 1: Configure GitHub Secrets
Go to your repository Settings → Secrets and Variables → Actions

Add these secrets:
```
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_ACCOUNT_ID=677803207672  # Optional, can be auto-detected
```

### Step 2: Create AWS IAM User (Recommended Permissions)
Create an IAM user with these managed policies:
- `PowerUserAccess` (for most operations)
- `IAMFullAccess` (for role management)
- `AWSBudgetsFullAccess` (for budget management)

Or create a custom policy with specific permissions needed by your CDK.

### Step 3: Configure Environment Protection (Optional)
1. Go to Settings → Environments
2. Create environments: `production` and `emergency`
3. Add protection rules:
   - Required reviewers
   - Wait timer
   - Deployment branches (main only)

### Step 4: Test the Workflows
1. Make a small change to `src/config.ts`
2. Create a Pull Request
3. Observe the PR validation workflow
4. Merge the PR to trigger deployment

## 🛡️ **Security Features**

### Automated Security Checks
- **Credential scanning**: Detects hardcoded AWS keys
- **Policy validation**: Checks for overly permissive IAM policies
- **Cost analysis**: Alerts on expensive resource types

### Approval Gates
- **Production environment**: Requires manual approval for deployments
- **Emergency destroy**: Requires confirmation and reason

### Audit Trail
- All deployments are logged
- Changes are tracked in Git history
- Emergency actions require justification

## 🎯 **Usage Examples**

### Update Budget Limits
1. Edit `src/config.ts`:
   ```typescript
   budgets: {
     monthlyLimit: 75,    // Increased from $50
     quarterlyLimit: 225, // Increased from $150
   }
   ```
2. Commit and push
3. GitHub Actions automatically deploys the changes

### Add New IAM Role
1. Edit `src/iam/personal-roles.ts`
2. Add new role definition
3. Create Pull Request
4. Review the validation results
5. Merge to deploy

### Emergency Resource Cleanup
1. Go to Actions tab
2. Select "Emergency Destroy" workflow
3. Click "Run workflow"
4. Type "DESTROY" in confirmation
5. Provide reason for destruction
6. Approve if environment protection is enabled

## 📊 **Monitoring & Alerts**

### Automatic Cost Monitoring
- Daily spending checks
- Budget utilization alerts
- Resource inventory tracking

### Deployment Notifications
- Success/failure notifications in workflow logs
- Can be extended to send emails or Slack messages

### Cost Thresholds
Current configuration alerts at:
- $10 (Early warning)
- $25 (High usage)
- $50 (Critical - at budget limit)

## 🔄 **Workflow Customization**

### Change Deployment Frequency
Edit the `on:` section in workflows:
```yaml
on:
  push:
    branches: [ main ]
  schedule:
    - cron: '0 2 * * 1'  # Weekly deployment on Mondays
```

### Add Slack Notifications
Add to the end of deployment job:
```yaml
- name: Slack Notification
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Customize Cost Thresholds
Edit `cost-monitoring.yml` to change alert thresholds or add new checks.

## 🚨 **Troubleshooting**

### Common Issues
1. **"Access Denied"**: Check AWS credentials and permissions
2. **"Stack already exists"**: CDK bootstrap may be needed
3. **"Budget creation failed"**: Billing permissions required

### Debug Steps
1. Check workflow logs in Actions tab
2. Verify AWS credentials are valid
3. Ensure CDK is properly bootstrapped
4. Check CloudFormation console for stack status

## 🎉 **Benefits**

✅ **Automated deployments** - No manual CDK commands needed
✅ **Cost control** - Automatic monitoring and alerts  
✅ **Security validation** - Prevents dangerous deployments
✅ **Audit trail** - Complete history of all changes
✅ **Emergency controls** - Quick resource cleanup if needed
✅ **PR validation** - Catch issues before they reach production

Your AWS infrastructure is now fully automated and monitored! 🚀
