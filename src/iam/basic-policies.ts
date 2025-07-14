// Basic IAM policies for personal AWS account
import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class BasicPolicies extends Construct {
  public readonly personalS3Policy: iam.ManagedPolicy;
  public readonly personalDynamoPolicy: iam.ManagedPolicy;
  public readonly costOptimizationPolicy: iam.ManagedPolicy;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Policy for personal S3 bucket access
    this.personalS3Policy = new iam.ManagedPolicy(this, 'PersonalS3Policy', {
      managedPolicyName: 'PersonalS3Access',
      description: 'Access to personal S3 buckets only',
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            's3:ListBucket',
            's3:GetBucketLocation',
            's3:GetBucketVersioning',
          ],
          resources: ['arn:aws:s3:::personal-*'],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            's3:GetObject',
            's3:PutObject',
            's3:DeleteObject',
            's3:GetObjectVersion',
            's3:DeleteObjectVersion',
          ],
          resources: ['arn:aws:s3:::personal-*/*'],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ['s3:ListAllMyBuckets'],
          resources: ['*'],
        }),
      ],
    });

    // Policy for personal DynamoDB table access
    this.personalDynamoPolicy = new iam.ManagedPolicy(this, 'PersonalDynamoPolicy', {
      managedPolicyName: 'PersonalDynamoDBAccess',
      description: 'Access to personal DynamoDB tables only',
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            'dynamodb:GetItem',
            'dynamodb:PutItem',
            'dynamodb:UpdateItem',
            'dynamodb:DeleteItem',
            'dynamodb:Query',
            'dynamodb:Scan',
            'dynamodb:BatchGetItem',
            'dynamodb:BatchWriteItem',
          ],
          resources: [
            'arn:aws:dynamodb:*:*:table/personal-*',
            'arn:aws:dynamodb:*:*:table/personal-*/index/*',
          ],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ['dynamodb:ListTables'],
          resources: ['*'],
        }),
      ],
    });

    // Policy for cost optimization and monitoring
    this.costOptimizationPolicy = new iam.ManagedPolicy(this, 'CostOptimizationPolicy', {
      managedPolicyName: 'PersonalCostOptimization',
      description: 'Permissions for cost monitoring and optimization',
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            'ce:GetCostAndUsage',
            'ce:GetUsageReport',
            'ce:GetReservationCoverage',
            'ce:GetReservationPurchaseRecommendation',
            'ce:GetReservationUtilization',
            'ce:ListCostCategoryDefinitions',
            'ce:GetRightsizingRecommendation',
            'budgets:ViewBudget',
            'budgets:DescribeBudgets',
            'cloudwatch:GetMetricStatistics',
            'cloudwatch:ListMetrics',
            'support:DescribeTrustedAdvisorChecks',
            'support:DescribeTrustedAdvisorCheckResult',
          ],
          resources: ['*'],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            'ec2:DescribeInstances',
            'ec2:DescribeReservedInstances',
            'ec2:DescribeSnapshots',
            'ec2:DescribeVolumes',
            'rds:DescribeDBInstances',
            'rds:DescribeReservedDBInstances',
          ],
          resources: ['*'],
        }),
      ],
    });

    // Deny policy for dangerous actions
    new iam.ManagedPolicy(this, 'DenyDangerousActions', {
      managedPolicyName: 'DenyDangerousActions',
      description: 'Deny potentially costly or dangerous actions',
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.DENY,
          actions: [
            'ec2:RunInstances',
            'ec2:StartInstances',
          ],
          resources: ['*'],
          conditions: {
            StringNotEquals: {
              'ec2:InstanceType': [
                't2.micro',
                't2.small',
                't3.micro',
                't3.small',
                't4g.micro',
                't4g.small',
              ],
            },
          },
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.DENY,
          actions: [
            'rds:CreateDBInstance',
            'rds:CreateDBCluster',
          ],
          resources: ['*'],
          conditions: {
            StringNotEquals: {
              'rds:db-instance-class': [
                'db.t3.micro',
                'db.t3.small',
                'db.t4g.micro',
                'db.t4g.small',
              ],
            },
          },
        }),
      ],
    });
  }
}
