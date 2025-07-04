import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMpesaPayment } from "@/hooks/useMpesaPayment";
import { CreditCard } from "lucide-react";

interface PaymentDialogProps {
  children: React.ReactNode;
  amount: number;
  description: string;
  onSuccess?: () => void;
}

export const PaymentDialog = ({ children, amount, description, onSuccess }: PaymentDialogProps) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [open, setOpen] = useState(false);
  const mpesaPayment = useMpesaPayment();

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber) {
      return;
    }

    try {
      await mpesaPayment.mutateAsync({
        amount,
        phoneNumber,
        accountReference: `FLIER-${Date.now()}`,
        transactionDesc: description,
      });
      
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            M-Pesa Payment
          </DialogTitle>
          <DialogDescription>
            {description} - KES {amount}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handlePayment} className="space-y-4">
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="254712345678"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
            <p className="text-sm text-muted-foreground mt-1">
              Enter your M-Pesa registered phone number
            </p>
          </div>
          
          <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
            <span className="font-medium">Total Amount:</span>
            <span className="text-lg font-bold">KES {amount}</span>
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mpesaPayment.isPending}>
              {mpesaPayment.isPending ? "Processing..." : "Pay with M-Pesa"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};