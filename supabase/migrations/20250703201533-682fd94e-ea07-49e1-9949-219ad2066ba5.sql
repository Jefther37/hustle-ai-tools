-- Update templates table to store custom template configurations
ALTER TABLE public.templates ADD COLUMN IF NOT EXISTS layout_config JSONB;
ALTER TABLE public.templates ADD COLUMN IF NOT EXISTS color_scheme JSONB;
ALTER TABLE public.templates ADD COLUMN IF NOT EXISTS font_config JSONB;
ALTER TABLE public.templates ADD COLUMN IF NOT EXISTS background_config JSONB;
ALTER TABLE public.templates ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE public.templates ADD COLUMN IF NOT EXISTS description TEXT;

-- Create user_designs table for saving user creations
CREATE TABLE IF NOT EXISTS public.user_designs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.templates(id),
  title TEXT,
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create template_ratings table for community features
CREATE TABLE IF NOT EXISTS public.template_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.templates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(template_id, user_id)
);

-- Enable RLS on new tables
ALTER TABLE public.user_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_ratings ENABLE ROW LEVEL SECURITY;

-- Create policies for user_designs
CREATE POLICY "Users can view their own designs" 
ON public.user_designs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own designs" 
ON public.user_designs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own designs" 
ON public.user_designs 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own designs" 
ON public.user_designs 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for template_ratings
CREATE POLICY "Users can view all ratings" 
ON public.template_ratings 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create ratings" 
ON public.template_ratings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings" 
ON public.template_ratings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_designs_updated_at
BEFORE UPDATE ON public.user_designs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default templates with proper configurations
INSERT INTO public.templates (name, category, layout_config, color_scheme, font_config, background_config, description) VALUES
('Modern Sale', 'Promotion', 
 '{"textPosition": "center", "imageArea": "background", "layout": "centered"}',
 '{"primary": "hsl(346, 77%, 49%)", "secondary": "hsl(0, 0%, 100%)", "accent": "hsl(24, 95%, 53%)"}',
 '{"title": {"family": "Inter", "size": "2xl", "weight": "bold"}, "body": {"family": "Inter", "size": "lg", "weight": "normal"}}',
 '{"type": "gradient", "colors": ["hsl(346, 77%, 49%)", "hsl(24, 95%, 53%)"]}',
 'Bold gradient design perfect for sales announcements'),
 
('Professional Event', 'Event', 
 '{"textPosition": "center", "imageArea": "top", "layout": "stacked"}',
 '{"primary": "hsl(217, 91%, 60%)", "secondary": "hsl(0, 0%, 100%)", "accent": "hsl(142, 76%, 36%)"}',
 '{"title": {"family": "Inter", "size": "xl", "weight": "semibold"}, "body": {"family": "Inter", "size": "base", "weight": "normal"}}',
 '{"type": "solid", "color": "hsl(217, 91%, 60%)"}',
 'Clean professional design for corporate events'),
 
('Creative Service', 'Business', 
 '{"textPosition": "left", "imageArea": "right", "layout": "split"}',
 '{"primary": "hsl(158, 64%, 52%)", "secondary": "hsl(0, 0%, 100%)", "accent": "hsl(43, 89%, 38%)"}',
 '{"title": {"family": "Inter", "size": "xl", "weight": "bold"}, "body": {"family": "Inter", "size": "sm", "weight": "normal"}}',
 '{"type": "solid", "color": "hsl(158, 64%, 52%)"}',
 'Creative split layout perfect for service advertisements'),
 
('Limited Promo', 'Promotion', 
 '{"textPosition": "center", "imageArea": "background", "layout": "overlay"}',
 '{"primary": "hsl(180, 100%, 50%)", "secondary": "hsl(0, 0%, 0%)", "accent": "hsl(60, 100%, 50%)"}',
 '{"title": {"family": "Inter", "size": "2xl", "weight": "black"}, "body": {"family": "Inter", "size": "lg", "weight": "medium"}}',
 '{"type": "gradient", "colors": ["hsl(180, 100%, 50%)", "hsl(200, 100%, 40%)"]}',
 'Eye-catching design for limited time offers') 
ON CONFLICT (name) DO NOTHING;