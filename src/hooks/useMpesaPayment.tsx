import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface MpesaPaymentData {
  amount: number;
  phoneNumber: string;
  accountReference: string;
  transactionDesc: string;
}

export const useMpesaPayment = () => {
  return useMutation({
    mutationFn: async (data: MpesaPaymentData) => {
      const { data: result, error } = await supabase.functions.invoke('mpesa-payment', {
        body: data,
      });

      if (error) throw error;
      return result;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Payment Initiated",
          description: "Please check your phone for the M-Pesa prompt.",
        });
      } else {
        throw new Error(data.error || "Payment failed");
      }
    },
    onError: (error: any) => {
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initiate payment",
        variant: "destructive",
      });
    },
  });
};