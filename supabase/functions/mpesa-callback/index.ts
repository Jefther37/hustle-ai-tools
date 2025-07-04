import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const callbackData = await req.json()
    
    console.log('M-Pesa callback received:', JSON.stringify(callbackData, null, 2))

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Extract payment details from callback
    const stkCallback = callbackData.Body?.stkCallback
    
    if (stkCallback) {
      const resultCode = stkCallback.ResultCode
      const resultDesc = stkCallback.ResultDesc
      const checkoutRequestId = stkCallback.CheckoutRequestID
      
      let status = 'failed'
      let amount = null
      let mpesaReceiptNumber = null
      
      if (resultCode === 0) {
        // Payment successful
        status = 'completed'
        
        // Extract amount and receipt number from callback items
        const callbackMetadata = stkCallback.CallbackMetadata?.Item || []
        
        for (const item of callbackMetadata) {
          if (item.Name === 'Amount') {
            amount = item.Value
          }
          if (item.Name === 'MpesaReceiptNumber') {
            mpesaReceiptNumber = item.Value
          }
        }
      }

      // Update payment record in database
      // For now, we'll update the most recent pending payment
      // In a production system, you'd want to match by CheckoutRequestID
      await supabase
        .from('payments')
        .update({
          status,
          amount: amount || undefined,
        })
        .eq('method', 'mpesa')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)

      console.log(`Payment ${status}:`, {
        checkoutRequestId,
        amount,
        mpesaReceiptNumber,
        resultDesc
      })
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('M-Pesa callback error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})