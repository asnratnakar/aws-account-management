// Personal IAM roles for AWS account management
import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class PersonalRoles extends Construct {
  public readonly devRole: iam.Role;
  public readonly readOnlyRole: iam.Role;
  public readonly emergencyRole: iam.Role;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Development role for personal projects
    this.devRole = new iam.Role(this, 'PersonalDevRole', {
      roleName: 'PersonalDeveloperRole',
      description: 'Role for personal development and experimentation',
      assumedBy: new iam.AccountRootPrincipal(),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('PowerUserAccess'),
      ],
      inlinePolicies: {
        DenyDangerousActions: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.DENY,
              actions: [
                'organizations:*',
                'account:*',
                'iam:DeleteRole',
                'iam:DeleteUser',
                'iam:DeletePolicy',
                'billing:*',
              ],
              resources: ['*'],
            }),
          ],
        }),
      },
    });

    // Read-only role for monitoring and auditing
    this.readOnlyRole = new iam.Role(this, 'PersonalReadOnlyRole', {
      roleName: 'PersonalReadOnlyRole',
      description: 'Read-only access for monitoring and cost analysis',
      assumedBy: new iam.AccountRootPrincipal(),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('ReadOnlyAccess'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AWSBillingReadOnlyAccess'),
      ],
    });

    // Emergency access role (use with caution)
    this.emergencyRole = new iam.Role(this, 'PersonalEmergencyRole', {
      roleName: 'PersonalEmergencyRole',
      description: 'Emergency administrative access - use with extreme caution',
      assumedBy: new iam.AccountRootPrincipal(),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess'),
      ],
      maxSessionDuration: cdk.Duration.hours(1), // Limit session to 1 hour
    });

    // Lambda execution role for personal functions
    const lambdaRole = new iam.Role(this, 'PersonalLambdaRole', {
      roleName: 'PersonalLambdaExecutionRole',
      description: 'Execution role for personal Lambda functions',
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
      inlinePolicies: {
        PersonalLambdaPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                's3:GetObject',
                's3:PutObject',
                'dynamodb:GetItem',
                'dynamodb:PutItem',
                'dynamodb:UpdateItem',
                'dynamodb:DeleteItem',
                'dynamodb:Query',
                'dynamodb:Scan',
              ],
              resources: [
                'arn:aws:s3:::personal-*/*',
                'arn:aws:dynamodb:*:*:table/personal-*',
              ],
            }),
          ],
        }),
      },
    });
  }
}
