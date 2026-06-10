-- Alter subscriptions table: drop status column and add qrisly_response column
ALTER TABLE public.subscriptions DROP COLUMN status;
ALTER TABLE public.subscriptions ADD COLUMN qrisly_response jsonb;
