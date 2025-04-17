import { useState } from "react";
import { Wallet, submitWish } from "@/lib/solana";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Form validation schema
const formSchema = z.object({
  title: z.string().min(1, "Wish title is required").max(100, "Wish title must be less than 100 characters"),
});

type FormValues = z.infer<typeof formSchema>;

interface WishSubmissionFormProps {
  wallet: Wallet | null;
  onTransactionSubmitted: (txId: string, status: string) => void;
}

const WishSubmissionForm = ({ wallet, onTransactionSubmitted }: WishSubmissionFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  });
  
  const onSubmit = async (data: FormValues) => {
    if (!wallet?.isConnected || !wallet.publicKey) {
      toast({
        variant: "destructive",
        title: "Wallet not connected",
        description: "Please connect your wallet first",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await submitWish(data.title, wallet.publicKey.toString());
      
      // Reset form
      form.reset();
      
      // Update transaction info
      onTransactionSubmitted(result.signature, "Confirmed");
      
      // Show success toast
      toast({
        title: "Wish submitted successfully!",
        description: "Your wish has been recorded on the blockchain",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error submitting wish",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
      
      // Update transaction info with error
      onTransactionSubmitted("Failed", "Error");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-[#1E1E24] rounded-xl p-6 border border-[#9945FF]/20 shadow-lg">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#9945FF]" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
        </svg>
        Submit a Wish
      </h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Wish Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your wish here"
                    className="w-full bg-[#131418]/50 border border-[#9945FF]/30 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#9945FF]/50"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <Button
            type="submit"
            disabled={!wallet?.isConnected || isSubmitting}
            className={`w-full py-3 px-4 flex justify-center items-center ${
              wallet?.isConnected
                ? "bg-gradient-to-r from-[#9945FF] to-[#03E1FF] hover:from-[#9945FF]/90 hover:to-[#03E1FF]/90"
                : "bg-[#9945FF]/50"
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Submitting...
              </>
            ) : wallet?.isConnected ? (
              "Submit Wish"
            ) : (
              "Connect Wallet to Submit"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default WishSubmissionForm;
