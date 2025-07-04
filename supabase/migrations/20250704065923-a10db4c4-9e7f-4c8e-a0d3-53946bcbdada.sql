-- Set admin role for the specified email
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'afuyojefther@gmail.com';

-- If the user doesn't exist yet, we'll handle this with a trigger
CREATE OR REPLACE FUNCTION public.set_admin_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if this is the admin email and set role
  IF NEW.email = 'afuyojefther@gmail.com' THEN
    NEW.role = 'admin';
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger to automatically set admin role on user creation
DROP TRIGGER IF EXISTS set_admin_role_trigger ON public.users;
CREATE TRIGGER set_admin_role_trigger
  BEFORE INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.set_admin_role();