import { SOLSCAN_URL } from "@/lib/solana";

interface TransactionInfoProps {
  txId: string | null;
  status: string;
}

const TransactionInfo = ({ txId, status }: TransactionInfoProps) => {
  // Determine if transaction can be viewed on Solscan (not simulation mode)
  const isSolscanViewable = txId && !txId.startsWith('SimSig') && !txId.startsWith('sim_');
  
  // Generate Solscan URL if this is a real transaction
  const solscanLink = isSolscanViewable ? `${SOLSCAN_URL}/${txId}?cluster=devnet` : null;
  
  return (
    <div className="bg-[#1E1E24] rounded-xl p-6 border border-[#9945FF]/20 shadow-lg">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#9945FF]" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        Transaction Info
      </h2>
      <div className="space-y-3 text-sm">
        <div className="rounded-lg bg-[#131418]/50 p-3 flex items-start">
          <div className="flex-grow">
            <p className="text-[#F8F9FA]/70">Latest Transaction:</p>
            <p className="font-mono text-xs truncate text-[#F8F9FA]/90">
              {txId ? txId : "No transactions yet"}
            </p>
            
            {/* Solscan.io link */}
            {isSolscanViewable && (
              <a 
                href={solscanLink || ""}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center text-xs text-[#14F195] hover:text-[#14F195]/80 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View on Solscan.io
              </a>
            )}
          </div>
        </div>
        <div className="rounded-lg bg-[#131418]/50 p-3">
          <p className="text-[#F8F9FA]/70">Status:</p>
          <p className={`${status === "Confirmed" ? "text-[#14F195]" : "text-[#F8F9FA]/90"}`}>
            {status}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TransactionInfo;
