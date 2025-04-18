const HowItWorks = () => {
  return (
    <div className="bg-[#1E1E24] rounded-xl p-6 border border-[#9945FF]/20 shadow-lg">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#9945FF]" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
        How It Works
      </h2>
      <ol className="list-decimal list-inside space-y-2 text-[#F8F9FA]/90">
        <li>Connect your Solana wallet</li>
        <li>Enter your wish title</li>
        <li>Submit your wish to the blockchain</li>
        <li>Your wish will be stored on-chain using a Program Derived Address (PDA)</li>
        <li>View all wishes in the table in real-time</li>
      </ol>
    </div>
  );
};

export default HowItWorks;
