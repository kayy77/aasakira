-- Manually upgrade the user konejunior09@outlook.com to premium
INSERT INTO subscribers (email, subscribed, subscription_tier, updated_at, created_at)
VALUES ('konejunior09@outlook.com', true, 'premium', now(), now())
ON CONFLICT (email) 
DO UPDATE SET 
  subscribed = true,
  subscription_tier = 'premium',
  updated_at = now();