import { useState, useEffect } from "react";
import { Wish } from "@shared/schema";
import { formatWalletAddress } from "@/lib/solana";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface WishTableProps {
  wishes: Wish[];
  isLoading: boolean;
  error: string | null;
}

const WishTable = ({ wishes, isLoading, error }: WishTableProps) => {
  const [displayWishes, setDisplayWishes] = useState<Wish[]>([]);
  
  // Update displayed wishes when they change
  useEffect(() => {
    if (wishes && wishes.length > 0) {
      setDisplayWishes(wishes);
    }
  }, [wishes]);
  
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };
  
  return (
    <div className="bg-[#1E1E24] rounded-xl p-6 border border-[#9945FF]/20 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#9945FF]" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
          </svg>
          Wall of Wishes
        </h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg bg-[#9945FF]/20 hover:bg-[#9945FF]/30"
            onClick={() => {
              // Refresh animation effect
              setDisplayWishes([]);
              setTimeout(() => {
                setDisplayWishes(wishes);
              }, 300);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#9945FF]" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
          </Button>
          <span className="flex items-center text-sm text-[#14F195]">
            <span className="h-2 w-2 rounded-full bg-[#14F195] animate-pulse mr-1"></span>
            Live Updates
          </span>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-[#9945FF]/20">
              <TableHead className="text-left text-xs font-medium text-[#F8F9FA]/70 uppercase tracking-wider">Wish</TableHead>
              <TableHead className="text-left text-xs font-medium text-[#F8F9FA]/70 uppercase tracking-wider">Timestamp</TableHead>
              <TableHead className="text-left text-xs font-medium text-[#F8F9FA]/70 uppercase tracking-wider">Address (PDA)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`loading-${index}`} className="hover:bg-[#9945FF]/5 transition">
                  <TableCell className="py-4">
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell className="py-4">
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell className="py-4">
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell colSpan={3} className="py-8 text-center text-red-400">
                  Error loading wishes: {error}
                </TableCell>
              </TableRow>
            ) : displayWishes.length > 0 ? (
              displayWishes.map((wish, index) => (
                <TableRow key={`${wish.pubkey}-${index}`} className="hover:bg-[#9945FF]/5 transition">
                  <TableCell className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium">{wish.title}</div>
                  </TableCell>
                  <TableCell className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-[#F8F9FA]/70">{formatTimestamp(wish.timestamp)}</div>
                  </TableCell>
                  <TableCell className="px-4 py-4 whitespace-nowrap">
                    <div className="text-xs font-mono text-[#F8F9FA]/70 truncate md:max-w-[180px] lg:max-w-[250px]">
                      {wish.pubkey}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3}>
                  <div className="text-center py-12">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-[#9945FF]/50 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <h3 className="text-xl font-medium text-[#F8F9FA]/90 mb-2">No wishes yet</h3>
                    <p className="text-[#F8F9FA]/70 max-w-md mx-auto">
                      Be the first to make a wish on the Solana blockchain. Connect your wallet and share your wish with the world.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default WishTable;
