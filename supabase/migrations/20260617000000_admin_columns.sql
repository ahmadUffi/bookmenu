-- Add ban flag to users
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- Add toggle flag to restaurants
ALTER TABLE public.restaurants
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- Admin can update subscriptions (for adjusting ended_at)
CREATE POLICY "Admins can update subscriptions"
  ON public.subscriptions FOR UPDATE
  TO authenticated
  USING (private.current_user_role() = 'admin')
  WITH CHECK (private.current_user_role() = 'admin');

-- Admin can update users.is_active (ban/unban)
CREATE POLICY "Admins can update user is_active"
  ON public.users FOR UPDATE
  TO authenticated
  USING (private.current_user_role() = 'admin')
  WITH CHECK (private.current_user_role() = 'admin');

-- Admin can update restaurants.is_active (toggle workspace)
CREATE POLICY "Admins can update restaurant is_active"
  ON public.restaurants FOR UPDATE
  TO authenticated
  USING (private.current_user_role() = 'admin')
  WITH CHECK (private.current_user_role() = 'admin');

-- Admin can delete any menu
CREATE POLICY "Admins can delete any menu"
  ON public.menus FOR DELETE
  TO authenticated
  USING (private.current_user_role() = 'admin');

-- Admin can read all users
CREATE POLICY "Admins can read all users"
  ON public.users FOR SELECT
  TO authenticated
  USING (private.current_user_role() = 'admin' OR auth.uid() = id);

-- Admin can read all subscriptions
CREATE POLICY "Admins can read all subscriptions"
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (private.current_user_role() = 'admin' OR auth.uid() = user_id);

-- Admin can read all subscription_usages
CREATE POLICY "Admins can read all subscription_usages"
  ON public.subscription_usages FOR SELECT
  TO authenticated
  USING (private.current_user_role() = 'admin' OR auth.uid() = user_id);
