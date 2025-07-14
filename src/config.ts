// Configuration settings for AWS account management
export interface AwsAccountConfig {
  // Email settings
  alertEmail: string;
  
  // AWS Account settings
  awsAccountId?: string; // Optional - CDK can auto-detect
  region?: string;       // Optional - defaults to AWS CLI default
  
  // Billing thresholds
  billingAlerts: {
    lowThreshold: number;
    mediumThreshold: number;
    highThreshold: number;
  };
  
  // Budget limits
  budgets: {
    monthlyLimit: number;
    quarterlyLimit: number;
  };
  
  // Resource naming
  resourcePrefix: string;
  
  // Environment
  environment: string;
}

// Default configuration - modify these values as needed
export const defaultConfig: AwsAccountConfig = {
  alertEmail: 'asnratnakar@gmail.com', // Your actual email
  
  awsAccountId: '677803207672',  // Your AWS Account ID as string
  region: 'us-east-1',          // Your preferred region

  billingAlerts: {
    lowThreshold: 10,    // $10 early warning
    mediumThreshold: 25, // $25 high usage alert
    highThreshold: 50,   // $50 critical alert
  },
  
  budgets: {
    monthlyLimit: 50,    // $50 monthly budget
    quarterlyLimit: 150, // $150 quarterly budget
  },
  
  resourcePrefix: 'personal',
  environment: 'personal',
};

// Helper function to get configuration with overrides
export function getConfig(overrides?: Partial<AwsAccountConfig>): AwsAccountConfig {
  return {
    ...defaultConfig,
    ...overrides,
  };
}

// Validation function
export function validateConfig(config: AwsAccountConfig): void {
  if (!config.alertEmail || config.alertEmail === 'your-email@example.com') {
    throw new Error('Please configure a valid email address in config.ts');
  }
  
  if (!config.alertEmail.includes('@')) {
    throw new Error('Invalid email address format');
  }
  
  // Validate AWS Account ID format if provided
  if (config.awsAccountId && !/^\d{12}$/.test(config.awsAccountId)) {
    throw new Error('AWS Account ID must be exactly 12 digits');
  }
  
  if (config.billingAlerts.lowThreshold >= config.billingAlerts.mediumThreshold) {
    throw new Error('Low threshold must be less than medium threshold');
  }
  
  if (config.billingAlerts.mediumThreshold >= config.billingAlerts.highThreshold) {
    throw new Error('Medium threshold must be less than high threshold');
  }
  
  if (config.budgets.monthlyLimit <= 0 || config.budgets.quarterlyLimit <= 0) {
    throw new Error('Budget limits must be positive numbers');
  }
}
