-- First, let's insert the user into subscribers table as premium
INSERT INTO public.subscribers (
  email, 
  subscribed, 
  subscription_tier, 
  subscription_end,
  updated_at, 
  created_at
) VALUES (
  'Konejunior09@outlook.com',
  true,
  'premium',
  '2025-12-31 23:59:59+00',
  now(),
  now()
) 
ON CONFLICT (email) 
DO UPDATE SET 
  subscribed = true,
  subscription_tier = 'premium',
  subscription_end = '2025-12-31 23:59:59+00',
  updated_at = now();