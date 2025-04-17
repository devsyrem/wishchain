import { useCallback, useEffect, useState } from 'react';
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Wish } from '@shared/schema';

// Constants
const NETWORK = 'devnet';
export const solanaConnection = new Connection(clusterApiUrl(NETWORK), 'confirmed');

// Wallet interface
export interface Wallet {
  publicKey: PublicKey | null;
  signMessage?: (message: Uint8Array) => Promise<Uint8Array>;
  signTransaction?: any;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  isConnected: boolean;
}

// Hook for Phantom wallet connection
export function usePhantomWallet() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const { toast } = useToast();
  
  // Check if Phantom wallet is available
  const checkForPhantom = useCallback(async () => {
    const phantom = window?.phantom?.solana;
    
    if (phantom) {
      try {
        // Get the provider and connect
        const provider = phantom;
        
        setWallet({
          publicKey: provider.publicKey,
          signMessage: provider.signMessage,
          signTransaction: provider.signTransaction,
          connect: async () => {
            try {
              await provider.connect();
              setWallet(prevState => ({
                ...prevState!,
                publicKey: provider.publicKey,
                isConnected: true
              }));
            } catch (error) {
              toast({
                variant: "destructive",
                title: "Connection Failed",
                description: error instanceof Error ? error.message : "Failed to connect to wallet",
              });
            }
          },
          disconnect: async () => {
            await provider.disconnect();
            setWallet(prevState => ({
              ...prevState!,
              publicKey: null,
              isConnected: false
            }));
          },
          isConnected: provider.isConnected
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Wallet Error",
          description: error instanceof Error ? error.message : "Failed to initialize wallet",
        });
      }
    } else {
      toast({
        variant: "destructive",
        title: "Wallet Not Found",
        description: "Phantom wallet extension is not installed. Please install it from https://phantom.app/",
      });
    }
  }, [toast]);
  
  useEffect(() => {
    checkForPhantom();
  }, [checkForPhantom]);
  
  return wallet;
}

// Submit a wish to the blockchain
export async function submitWish(title: string, walletPublicKey: string): Promise<{ signature: string, pubkey: string }> {
  if (!title || !walletPublicKey) {
    throw new Error('Title and wallet public key are required');
  }
  
  // In a real implementation, this would call the blockchain
  // For demo purposes, we'll simulate a successful response
  const isSimulationMode = true; // Toggle this for demo/development

  if (isSimulationMode) {
    // Generate a simulated transaction signature and PDA
    const simulatedSignature = 'SimSig' + Math.random().toString(36).substring(2, 15);
    const simulatedPubkey = walletPublicKey.substring(0, 8) + Math.random().toString(36).substring(2, 10);
    
    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      signature: simulatedSignature,
      pubkey: simulatedPubkey
    };
  } else {
    // Real blockchain interaction
    const response = await apiRequest('POST', '/api/wishes', { title, walletPublicKey });
    return await response.json();
  }
}

// WebSocket hook for real-time updates
export function useWishesWebSocket() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    setIsLoading(true);
    
    // Create WebSocket connection for real data
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('WebSocket connection established');
    };
    
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        if (message.type === 'WISHES_LIST') {
          setWishes(message.data);
          setIsLoading(false);
        }
      } catch (err) {
        setError('Failed to parse WebSocket message');
        setIsLoading(false);
      }
    };
    
    ws.onerror = () => {
      setError('WebSocket error occurred');
      setIsLoading(false);
    };
    
    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };
    
    // Clean up WebSocket connection
    return () => {
      ws.close();
    };
  }, []);
  
  return { wishes, isLoading, error };
}

// Helper function to get SOL balance
export async function getSolBalance(publicKey: PublicKey): Promise<number> {
  const balance = await solanaConnection.getBalance(publicKey);
  return balance / LAMPORTS_PER_SOL;
}

// Format wallet address for display
export function formatWalletAddress(address: string | null): string {
  if (!address) return 'Not Connected';
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}
