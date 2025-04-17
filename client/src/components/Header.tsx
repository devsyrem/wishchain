import { Wallet, formatWalletAddress } from "@/lib/solana";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  wallet: Wallet | null;
}

const Header = ({ wallet }: HeaderProps) => {
  const handleWalletClick = async () => {
    if (!wallet) return;
    
    if (wallet.isConnected) {
      await wallet.disconnect();
    } else {
      await wallet.connect();
    }
  };
  
  return (
    <header className="bg-[#1E1E24] border-b border-[#9945FF]/20 py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#9945FF]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21.879 21H2.121A1.122 1.122 0 0 1 1 19.879V4.121A1.122 1.122 0 0 1 2.121 3h19.758A1.122 1.122 0 0 1 23 4.121v15.758A1.122 1.122 0 0 1 21.879 21zM2.5 19.5h19v-15h-19v15zm9.5-12.846c0-.258.21-.468.468-.468h5.064a.468.468 0 0 1 0 .937h-5.064a.468.468 0 0 1-.468-.469zm-6.5.469a.937.937 0 1 1 1.874-.001.937.937 0 0 1-1.874.001zM12 14.091c0 .258-.21.468-.468.468H6.468a.468.468 0 0 1 0-.937h5.064c.258 0 .468.21.468.469zm6.5-.469a.937.937 0 1 1-1.874.001.937.937 0 0 1 1.874-.001z" />
          </svg>
          <h1 className="text-xl md:text-2xl font-semibold">Wall of Wish</h1>
        </div>
        
        <Button
          onClick={handleWalletClick}
          className="bg-[#9945FF] hover:bg-[#9945FF]/90 text-white"
        >
          <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.97 6.43H4.03C2.9 6.43 2 7.33 2 8.46V15.54C2 16.67 2.9 17.57 4.03 17.57H19.97C21.1 17.57 22 16.67 22 15.54V8.46C22 7.33 21.1 6.43 19.97 6.43Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 10H18.97C17.9 10 17.03 10.87 17.03 11.94V12.06C17.03 13.13 17.9 14 18.97 14H22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {wallet?.isConnected ? formatWalletAddress(wallet.publicKey?.toString() || null) : "Connect Wallet"}
        </Button>
      </div>
    </header>
  );
};

export default Header;
