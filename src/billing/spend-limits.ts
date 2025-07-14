

// Spending limits and budget controls
import * as cdk from 'aws-cdk-lib';
import * as budgets from 'aws-cdk-lib/aws-budgets';
import { Construct } from 'constructs';
import { getConfig, validateConfig, AwsAccountConfig } from '../config';

export class SpendingLimits extends Construct {
  private config: AwsAccountConfig;

  constructor(scope: Construct, id: string, configOverrides?: Partial<AwsAccountConfig>) {
    super(scope, id);

    // Get and validate configuration
    this.config = getConfig(configOverrides);
    validateConfig(this.config);

    this.createBudgets();
  }

  private createBudgets(): void {
    // Monthly budget with email notification
    new budgets.CfnBudget(this, 'MonthlyBudget', {
      budget: {
        budgetName: `${this.config.resourcePrefix}-monthly-budget`,
        budgetType: 'COST',
        timeUnit: 'MONTHLY',
        budgetLimit: {
          amount: this.config.budgets.monthlyLimit,
          unit: 'USD',
        },
        costFilters: {
          Service: ['Amazon Elastic Compute Cloud - Compute'],
        },
      },
      notificationsWithSubscribers: [
        {
          notification: {
            notificationType: 'ACTUAL',
            comparisonOperator: 'GREATER_THAN',
            threshold: 80, // Alert at 80% of budget
            thresholdType: 'PERCENTAGE',
          },
          subscribers: [
            {
              subscriptionType: 'EMAIL',
              address: this.config.alertEmail,
            },
          ],
        },
        {
          notification: {
            notificationType: 'FORECASTED',
            comparisonOperator: 'GREATER_THAN',
            threshold: 100, // Alert when forecasted to exceed budget
            thresholdType: 'PERCENTAGE',
          },
          subscribers: [
            {
              subscriptionType: 'EMAIL',
              address: this.config.alertEmail,
            },
          ],
        },
      ],
    });

    // Quarterly budget for overall spending
    new budgets.CfnBudget(this, 'QuarterlyBudget', {
      budget: {
        budgetName: `${this.config.resourcePrefix}-quarterly-budget`,
        budgetType: 'COST',
        timeUnit: 'QUARTERLY',
        budgetLimit: {
          amount: this.config.budgets.quarterlyLimit,
          unit: 'USD',
        },
      },
      notificationsWithSubscribers: [
        {
          notification: {
            notificationType: 'ACTUAL',
            comparisonOperator: 'GREATER_THAN',
            threshold: 90, // Alert at 90% of quarterly budget
            thresholdType: 'PERCENTAGE',
          },
          subscribers: [
            {
              subscriptionType: 'EMAIL',
              address: this.config.alertEmail,
            },
          ],
        },
      ],
    });
  }
}
