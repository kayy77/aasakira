ALTER TABLE public.verification_requests
  ADD COLUMN IF NOT EXISTS trader_type text,
  ADD COLUMN IF NOT EXISTS account_number text,
  ADD COLUMN IF NOT EXISTS platform text,
  ADD COLUMN IF NOT EXISTS ai_confidence numeric,
  ADD COLUMN IF NOT EXISTS ai_raw jsonb;

ALTER TABLE public.verification_screenshots
  ADD COLUMN IF NOT EXISTS ai_extraction jsonb;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Users can upload their own verification screenshots'
  ) THEN
    CREATE POLICY "Users can upload their own verification screenshots"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'verification-screenshots'
      AND (auth.uid())::text = (storage.foldername(name))[1]
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Users can view their own verification screenshots'
  ) THEN
    CREATE POLICY "Users can view their own verification screenshots"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
      bucket_id = 'verification-screenshots'
      AND (auth.uid())::text = (storage.foldername(name))[1]
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Users can update their own verification screenshots'
  ) THEN
    CREATE POLICY "Users can update their own verification screenshots"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
      bucket_id = 'verification-screenshots'
      AND (auth.uid())::text = (storage.foldername(name))[1]
    )
    WITH CHECK (
      bucket_id = 'verification-screenshots'
      AND (auth.uid())::text = (storage.foldername(name))[1]
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Users can delete their own verification screenshots'
  ) THEN
    CREATE POLICY "Users can delete their own verification screenshots"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'verification-screenshots'
      AND (auth.uid())::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;