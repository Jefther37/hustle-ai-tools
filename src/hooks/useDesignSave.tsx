import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "./useAuth";

interface SaveDesignData {
  template_id?: string;
  title: string;
  content: {
    text: string;
    customizations?: any;
  };
}

export const useDesignSave = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: SaveDesignData) => {
      if (!user) throw new Error("User not authenticated");

      const { data: result, error } = await supabase
        .from("user_designs")
        .insert({
          user_id: user.id,
          template_id: data.template_id,
          title: data.title,
          content: data.content,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_designs"] });
      toast({
        title: "Design saved!",
        description: "Your design has been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error saving design",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};