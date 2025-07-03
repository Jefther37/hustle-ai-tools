import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Template {
  id: string;
  name: string;
  category: string;
  description?: string;
  layout_config?: any;
  color_scheme?: any;
  font_config?: any;
  background_config?: any;
  preview_url?: string;
  is_premium?: boolean;
  created_by?: string;
  created_at: string;
}

export const useTemplates = () => {
  return useQuery({
    queryKey: ["templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Template[];
    },
  });
};

export const useUserDesigns = () => {
  return useQuery({
    queryKey: ["user_designs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_designs")
        .select(`
          *,
          templates (
            name,
            category
          )
        `)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};