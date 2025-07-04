-- Fix RLS policies for users table to allow auth system to insert new users
-- The auth system needs to be able to insert users during signup

-- Create policy to allow the auth system to insert new users
CREATE POLICY "Allow auth system to insert users" 
ON public.users 
FOR INSERT 
WITH CHECK (true);

-- Create policy to allow users to update their own profile
CREATE POLICY "Users can update their own profile" 
ON public.users 
FOR UPDATE 
USING (auth.uid() = id);

-- Create policy to allow users to delete their own profile  
CREATE POLICY "Users can delete their own profile" 
ON public.users 
FOR DELETE 
USING (auth.uid() = id);