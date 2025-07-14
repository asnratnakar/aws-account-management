// Cost alerts for personal AWS spending
import * as cdk from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as cloudwatchActions from 'aws-cdk-lib/aws-cloudwatch-actions';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import { Construct } from 'constructs';
import { getConfig, validateConfig, AwsAccountConfig } from '../config';

export class CostAlerts extends Construct {
  private config: AwsAccountConfig;

  constructor(scope: Construct, id: string, configOverrides?: Partial<AwsAccountConfig>) {
    super(scope, id);

    // Get and validate configuration
    this.config = getConfig(configOverrides);
    validateConfig(this.config);

    this.createBillingAlerts();
  }

  private createBillingAlerts(): void {
    // SNS Topic for billing alerts
    const billingTopic = new sns.Topic(this, 'BillingAlerts', {
      displayName: 'AWS Billing Alerts',
      topicName: `${this.config.resourcePrefix}-billing-alerts`,
    });

    // Email subscription using configured email
    billingTopic.addSubscription(
      new subscriptions.EmailSubscription(this.config.alertEmail)
    );

    // Create billing alarms dynamically
    this.createBillingAlarm(
      'BillingAlarmLow',
      `billing-alarm-${this.config.billingAlerts.lowThreshold}-usd`,
      `Alert when billing exceeds $${this.config.billingAlerts.lowThreshold}`,
      this.config.billingAlerts.lowThreshold,
      billingTopic
    );

    this.createBillingAlarm(
      'BillingAlarmMedium',
      `billing-alarm-${this.config.billingAlerts.mediumThreshold}-usd`,
      `Alert when billing exceeds $${this.config.billingAlerts.mediumThreshold}`,
      this.config.billingAlerts.mediumThreshold,
      billingTopic
    );

    this.createBillingAlarm(
      'BillingAlarmHigh',
      `billing-alarm-${this.config.billingAlerts.highThreshold}-usd-critical`,
      `CRITICAL: Alert when billing exceeds $${this.config.billingAlerts.highThreshold}`,
      this.config.billingAlerts.highThreshold,
      billingTopic
    );
  }

  private createBillingAlarm(
    constructId: string,
    alarmName: string,
    description: string,
    threshold: number,
    topic: sns.Topic
  ): cloudwatch.Alarm {
    const alarm = new cloudwatch.Alarm(this, constructId, {
      alarmName,
      alarmDescription: description,
      metric: new cloudwatch.Metric({
        namespace: 'AWS/Billing',
        metricName: 'EstimatedCharges',
        dimensionsMap: {
          Currency: 'USD',
        },
        statistic: 'Maximum',
        period: cdk.Duration.hours(6),
      }),
      threshold,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      evaluationPeriods: 1,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });
    
    alarm.addAlarmAction(new cloudwatchActions.SnsAction(topic));
    return alarm;
  }
}
