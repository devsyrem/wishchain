import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Wallet, formatWalletAddress, submitDonation } from "@/lib/solana";
import { WishDisplayData } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface DonationDialogProps {
  wallet: Wallet | null;
  wish: WishDisplayData | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DonationDialog = ({ wallet, wish, isOpen, onClose, onSuccess }: DonationDialogProps) => {
  const [amount, setAmount] = useState<string>('0.1');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { toast } = useToast();

  const handleDonate = async () => {
    if (!wallet?.publicKey || !wish?.id || !wish.walletAddress) {
      toast({
        variant: "destructive",
        title: "Donation Error",
        description: "Missing wallet connection or recipient information.",
      });
      return;
    }

    // Parse amount as float and check if valid
    const donationAmount = parseFloat(amount);
    if (isNaN(donationAmount) || donationAmount <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: "Please enter a valid donation amount greater than 0 SOL.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Submit donation
      const result = await submitDonation(
        wish.id,
        wallet.publicKey.toString(),
        wish.walletAddress,
        donationAmount
      );

      // Show success toast
      toast({
        title: "Donation Successful!",
        description: `You donated ${donationAmount} SOL to this wish.`,
      });

      // Reset form and close dialog
      setAmount('0.1');
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Donation Failed",
        description: error instanceof Error ? error.message : "Failed to process donation. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1E1E24] border border-[#9945FF]/20 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#9945FF]" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            Donate SOL
          </DialogTitle>
          <DialogDescription className="text-[#F8F9FA]/70">
            Support this wish by sending SOL directly to the creator.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="wish-title">Wish</Label>
            <div id="wish-title" className="p-2 rounded-md bg-[#282830] border border-[#9945FF]/10 text-sm">
              {wish?.title || "Loading..."}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient</Label>
            <div id="recipient" className="p-2 rounded-md bg-[#282830] border border-[#9945FF]/10 text-sm font-mono">
              {wish?.walletAddress ? formatWalletAddress(wish.walletAddress) : "Unknown"}
              <span className="ml-2 text-xs text-[#F8F9FA]/50">
                (Full address: {wish?.walletAddress || "Not available"})
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="donation-amount">Amount (SOL)</Label>
            <div className="relative">
              <Input
                id="donation-amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-[#282830] border border-[#9945FF]/20 focus:border-[#9945FF] pl-2 pr-10"
                placeholder="0.1"
                step="0.01"
                min="0.01"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-sm text-[#9945FF]">SOL</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-[#9945FF]/20 hover:bg-[#9945FF]/10 text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDonate}
            disabled={isSubmitting || !wallet?.publicKey}
            className="bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90 text-white font-medium"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              "Donate SOL"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DonationDialog;