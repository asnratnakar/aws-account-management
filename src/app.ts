// Main CDK application entry point
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { PersonalRoles } from './iam/personal-roles';
import { BasicPolicies } from './iam/basic-policies';
import { CostAlerts } from './billing/cost-alerts';
import { SpendingLimits } from './billing/spend-limits';
import { getConfig, AwsAccountConfig } from './config';

export class PersonalAwsManagementStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps & { config?: Partial<AwsAccountConfig> }) {
    super(scope, id, props);

    // Get configuration
    const config = getConfig(props?.config);

    // Create IAM roles and policies
    const roles = new PersonalRoles(this, 'PersonalRoles');
    const policies = new BasicPolicies(this, 'BasicPolicies');

    // Create billing controls with configuration
    const costAlerts = new CostAlerts(this, 'CostAlerts', props?.config);
    const spendingLimits = new SpendingLimits(this, 'SpendingLimits', props?.config);

    // Output important role ARNs
    new cdk.CfnOutput(this, 'DevRoleArn', {
      value: roles.devRole.roleArn,
      description: 'ARN of the development role',
    });

    new cdk.CfnOutput(this, 'ReadOnlyRoleArn', {
      value: roles.readOnlyRole.roleArn,
      description: 'ARN of the read-only role',
    });

    new cdk.CfnOutput(this, 'EmergencyRoleArn', {
      value: roles.emergencyRole.roleArn,
      description: 'ARN of the emergency access role',
    });
  }
}

// CDK App
const app = new cdk.App();
new PersonalAwsManagementStack(app, 'PersonalAwsManagementStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  description: 'Personal AWS account management with IAM roles and billing controls',
});

app.synth();
