-- Upgrade the user Konejunior09@outlook.com to premium
UPDATE subscribers 
SET subscribed = true, subscription_tier = 'premium', updated_at = now()
WHERE LOWER(email) = 'konejunior09@outlook.com';