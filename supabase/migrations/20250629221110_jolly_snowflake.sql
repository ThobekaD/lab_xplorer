/*
  # RevenueCat Integration Schema

  1. New Tables
    - `subscriptions` - Stores user subscription information
    - `subscription_transactions` - Records payment transactions
    - `subscription_usage` - Tracks usage of limited features

  2. Changes
    - Add subscription-related columns to profiles table
    - Create functions for usage tracking and limits

  3. Security
    - Enable RLS on all new tables
    - Create appropriate policies for access control
*/

-- Create subscriptions table if it doesn't exist
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES profiles(id),
  revenuecat_customer_id text UNIQUE,
  subscription_tier text DEFAULT 'free' CHECK (subscription_tier IN ('free', 'student', 'school')),
  is_active boolean DEFAULT true,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create subscription_transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS subscription_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid REFERENCES subscriptions(id),
  transaction_id text UNIQUE,
  product_id text NOT NULL,
  amount numeric(10,2) NOT NULL,
  currency text DEFAULT 'USD',
  status text NOT NULL,
  provider text NOT NULL,
  transaction_date timestamptz DEFAULT now(),
  metadata jsonb
);

-- Create subscription_usage table if it doesn't exist
CREATE TABLE IF NOT EXISTS subscription_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  feature_type text NOT NULL,
  usage_count integer DEFAULT 0,
  limit_count integer,
  reset_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, feature_type)
);

-- Enable Row Level Security
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_usage ENABLE ROW LEVEL SECURITY;

-- Create policies for subscriptions
CREATE POLICY "Users can view their own subscription"
  ON subscriptions
  FOR SELECT
  TO public
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all subscriptions"
  ON subscriptions
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "System can create and update subscriptions"
  ON subscriptions
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create policies for subscription_transactions
CREATE POLICY "Users can view their own transactions"
  ON subscription_transactions
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM subscriptions
      WHERE subscriptions.id = subscription_transactions.subscription_id
      AND subscriptions.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all transactions"
  ON subscription_transactions
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "System can create transactions"
  ON subscription_transactions
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create policies for subscription_usage
CREATE POLICY "Users can view their own usage"
  ON subscription_usage
  FOR SELECT
  TO public
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all usage"
  ON subscription_usage
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "System can update usage"
  ON subscription_usage
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create functions for usage tracking
CREATE OR REPLACE FUNCTION increment_experiment_usage()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
  current_tier text;
  current_usage integer;
  usage_limit integer;
  reset_date timestamptz;
BEGIN
  -- Get current user ID
  user_id := auth.uid();
  
  -- Get user's subscription tier
  SELECT subscription_tier INTO current_tier
  FROM subscriptions
  WHERE subscriptions.user_id = user_id;
  
  -- Skip for paid tiers (unlimited usage)
  IF current_tier IN ('student', 'school') THEN
    RETURN;
  END IF;
  
  -- Get current usage
  SELECT 
    usage_count, 
    limit_count, 
    reset_date 
  INTO 
    current_usage, 
    usage_limit, 
    reset_date
  FROM subscription_usage
  WHERE user_id = user_id
  AND feature_type = 'experiments';
  
  -- If no record exists or reset date has passed, create/reset it
  IF NOT FOUND OR reset_date < now() THEN
    -- Default limit for free tier
    usage_limit := 3;
    reset_date := date_trunc('month', now()) + interval '1 month';
    
    -- Insert or update usage record
    INSERT INTO subscription_usage (
      user_id, 
      feature_type, 
      usage_count, 
      limit_count, 
      reset_date
    ) VALUES (
      user_id, 
      'experiments', 
      1, 
      usage_limit, 
      reset_date
    )
    ON CONFLICT (user_id, feature_type) DO UPDATE
    SET 
      usage_count = 1,
      limit_count = usage_limit,
      reset_date = reset_date,
      updated_at = now();
  ELSE
    -- Increment usage count
    UPDATE subscription_usage
    SET 
      usage_count = current_usage + 1,
      updated_at = now()
    WHERE user_id = user_id
    AND feature_type = 'experiments';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION increment_offline_experiment_usage(experiment_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
  current_tier text;
  current_usage integer;
  usage_limit integer;
BEGIN
  -- Get current user ID
  user_id := auth.uid();
  
  -- Get user's subscription tier
  SELECT subscription_tier INTO current_tier
  FROM subscriptions
  WHERE subscriptions.user_id = user_id;
  
  -- Set limit based on tier
  CASE current_tier
    WHEN 'free' THEN usage_limit := 0;
    WHEN 'student' THEN usage_limit := 10;
    WHEN 'school' THEN usage_limit := 1000; -- Effectively unlimited
    ELSE usage_limit := 0;
  END CASE;
  
  -- Skip if no offline access
  IF usage_limit <= 0 THEN
    RETURN;
  END IF;
  
  -- Get current usage
  SELECT usage_count INTO current_usage
  FROM subscription_usage
  WHERE user_id = user_id
  AND feature_type = 'offline_experiments';
  
  -- If no record exists, create it
  IF NOT FOUND THEN
    INSERT INTO subscription_usage (
      user_id, 
      feature_type, 
      usage_count, 
      limit_count
    ) VALUES (
      user_id, 
      'offline_experiments', 
      1, 
      usage_limit
    );
  ELSE
    -- Increment usage count if under limit
    IF current_usage < usage_limit THEN
      UPDATE subscription_usage
      SET 
        usage_count = current_usage + 1,
        updated_at = now()
      WHERE user_id = user_id
      AND feature_type = 'offline_experiments';
    END IF;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION reset_experiment_usage()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
BEGIN
  -- Get current user ID
  user_id := auth.uid();
  
  -- Reset usage count and set new reset date
  UPDATE subscription_usage
  SET 
    usage_count = 0,
    reset_date = date_trunc('month', now()) + interval '1 month',
    updated_at = now()
  WHERE user_id = user_id
  AND feature_type = 'experiments';
  
  -- If no record exists, create it
  IF NOT FOUND THEN
    INSERT INTO subscription_usage (
      user_id, 
      feature_type, 
      usage_count, 
      limit_count, 
      reset_date
    ) VALUES (
      user_id, 
      'experiments', 
      0, 
      3, -- Default limit for free tier
      date_trunc('month', now()) + interval '1 month'
    );
  END IF;
END;
$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_tier ON subscriptions(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_subscription_transactions_subscription_id ON subscription_transactions(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_user_id ON subscription_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_feature ON subscription_usage(feature_type);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_reset_date ON subscription_usage(reset_date);

-- Create trigger to update timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscriptions_timestamp
BEFORE UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_subscription_usage_timestamp
BEFORE UPDATE ON subscription_usage
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Insert default subscription records for existing users
INSERT INTO subscriptions (user_id, subscription_tier)
SELECT id, 'free' FROM profiles
WHERE id NOT IN (SELECT user_id FROM subscriptions)
ON CONFLICT (user_id) DO NOTHING;

-- Insert default usage records for existing users
INSERT INTO subscription_usage (
  user_id, 
  feature_type, 
  usage_count, 
  limit_count, 
  reset_date
)
SELECT 
  id, 
  'experiments', 
  0, 
  3, 
  date_trunc('month', now()) + interval '1 month'
FROM profiles
WHERE id NOT IN (
  SELECT user_id FROM subscription_usage 
  WHERE feature_type = 'experiments'
)
ON CONFLICT (user_id, feature_type) DO NOTHING;