import { useState } from "react";
import Header from "@/components/Header";
import NetworkStatus from "@/components/NetworkStatus";
import WishSubmissionForm from "@/components/WishSubmissionForm";
import TransactionInfo from "@/components/TransactionInfo";
import HowItWorks from "@/components/HowItWorks";
import WishTable from "@/components/WishTable";
import Footer from "@/components/Footer";
import { usePhantomWallet, useWishesWebSocket } from "@/lib/solana";

const WallOfWish = () => {
  const wallet = usePhantomWallet();
  const { wishes, isLoading, error } = useWishesWebSocket();
  
  const [transactionStatus, setTransactionStatus] = useState<{
    txId: string | null;
    status: string;
  }>({
    txId: null,
    status: "N/A"
  });
  
  return (
    <div className="flex flex-col min-h-screen bg-[#131418] text-[#F8F9FA]">
      <Header wallet={wallet} />
      <NetworkStatus wallet={wallet} />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <WishSubmissionForm 
              wallet={wallet} 
              onTransactionSubmitted={(txId, status) => {
                setTransactionStatus({ txId, status });
              }}
            />
            <TransactionInfo 
              txId={transactionStatus.txId} 
              status={transactionStatus.status} 
            />
            <HowItWorks />
          </div>
          
          <div className="lg:col-span-8">
            <WishTable 
              wishes={wishes} 
              isLoading={isLoading} 
              error={error} 
              wallet={wallet}
            />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default WallOfWish;
