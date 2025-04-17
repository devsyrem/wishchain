import { Wallet, formatWalletAddress } from "@/lib/solana";

interface NetworkStatusProps {
  wallet: Wallet | null;
}

const NetworkStatus = ({ wallet }: NetworkStatusProps) => {
  return (
    <div className="bg-gradient-to-r from-[#9945FF]/10 to-[#14F195]/10 py-2">
      <div className="container mx-auto px-4 flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <span className="h-2 w-2 rounded-full bg-[#14F195] animate-pulse"></span>
            <span>Connected to Solana Devnet</span>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          {wallet?.isConnected ? (
            <>
              <span className="h-2 w-2 rounded-full bg-[#14F195] inline-block mr-1"></span>
              <span>Wallet: {formatWalletAddress(wallet.publicKey?.toString() || null)}</span>
            </>
          ) : (
            <span>Wallet: Not Connected</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default NetworkStatus;
