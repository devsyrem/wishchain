import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { 
  Connection, 
  PublicKey, 
  Keypair, 
  clusterApiUrl, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL 
} from '@solana/web3.js';
import { BlockchainWish } from '@shared/schema';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory (ES module equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the IDL from the Anchor program output
// In a real setup, this would be from the compiled program
// For now we'll define the IDL structure manually
const IDL = {
  version: "0.1.0",
  name: "wall_of_wish",
  instructions: [
    {
      name: "createWish",
      accounts: [
        {
          name: "wish",
          isMut: true,
          isSigner: false
        },
        {
          name: "author",
          isMut: true,
          isSigner: true
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false
        }
      ],
      args: [
        {
          name: "title",
          type: "string"
        }
      ]
    }
  ],
  accounts: [
    {
      name: "AWish",
      type: {
        kind: "struct",
        fields: [
          {
            name: "title",
            type: "string"
          },
          {
            name: "timestamp",
            type: "i64"
          },
          {
            name: "author",
            type: "publicKey"
          }
        ]
      }
    }
  ]
};

// Constants
const PROGRAM_ID = new PublicKey('9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin'); // Using a known test program ID
const NETWORK = process.env.SOLANA_NETWORK || 'devnet';
const PAYER_SECRET_KEY_PATH = path.join(__dirname, 'program', 'keypair.json');

// Helper function to get a connection to Solana
export function getConnection(): Connection {
  return new Connection(clusterApiUrl(NETWORK as anchor.web3.Cluster), 'confirmed');
}

// Create an Anchor provider
export function getProvider(): anchor.Provider {
  const connection = getConnection();
  
  // In a real application, we'd have a proper wallet/keypair setup
  // For testing, we'll create a keypair for the payer
  let payer: Keypair;
  
  try {
    const secretKeyString = fs.readFileSync(PAYER_SECRET_KEY_PATH, 'utf-8');
    const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
    payer = Keypair.fromSecretKey(secretKey);
  } catch (error) {
    console.log('Keypair file not found, generating a new one for testing');
    payer = Keypair.generate();
    
    // Save the keypair for future use
    fs.writeFileSync(
      PAYER_SECRET_KEY_PATH,
      JSON.stringify(Array.from(payer.secretKey))
    );
  }
  
  const wallet = new anchor.Wallet(payer);
  const provider = new anchor.AnchorProvider(
    connection,
    wallet,
    { preflightCommitment: 'confirmed' }
  );
  
  return provider;
}

// Get the Anchor program
export function getProgram(): Program {
  const provider = getProvider();
  return new anchor.Program(IDL as anchor.Idl, PROGRAM_ID, provider);
}

// Add a new wish to the blockchain
export async function addWish(title: string, walletPublicKey: string): Promise<{ signature: string, pubkey: string }> {
  const program = getProgram();
  const walletPubkey = new PublicKey(walletPublicKey);
  
  // Derive PDA for this wish
  const [wishPda] = await PublicKey.findProgramAddress(
    [Buffer.from('wish'), walletPubkey.toBuffer(), Buffer.from(title)],
    program.programId
  );
  
  // Send transaction to create wish
  const tx = await program.methods
    .createWish(title)
    .accounts({
      wish: wishPda,
      author: walletPubkey,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .rpc();
  
  return { 
    signature: tx,
    pubkey: wishPda.toString()
  };
}

// Get all wishes from the blockchain
export async function getAllWishes(): Promise<BlockchainWish[]> {
  const program = getProgram();
  const connection = getConnection();
  
  // Get all program accounts of type AWish
  const accounts = await connection.getProgramAccounts(program.programId);
  
  // Parse account data
  const wishes: BlockchainWish[] = [];
  
  for (const account of accounts) {
    try {
      const accountData = await program.account.aWish.fetch(account.pubkey);
      wishes.push({
        title: accountData.title,
        timestamp: new Date(accountData.timestamp.toNumber() * 1000).toISOString(),
        pubkey: account.pubkey.toString()
      });
    } catch (error) {
      console.error(`Error parsing account ${account.pubkey.toString()}:`, error);
    }
  }
  
  // Sort by timestamp (newest first)
  wishes.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  return wishes;
}

// Transfer SOL from one wallet to another (donation)
export async function transferSol(
  senderWalletAddress: string,
  recipientWalletAddress: string,
  amountInLamports: number
): Promise<{ signature: string }> {
  // In a real application, the client would sign this transaction
  // For development/simulation, we'll use our payer account
  const connection = getConnection();
  const provider = getProvider();
  
  try {
    // Create a simulation mode with fake transaction for development
    if (process.env.NODE_ENV === 'development') {
      // Generate a simulated transaction signature
      const simulatedSignature = 'sim_donation_' + Math.random().toString(36).substring(2, 15);
      
      // Log the simulated donation
      console.log(`[SIMULATED DONATION] From: ${senderWalletAddress} To: ${recipientWalletAddress} Amount: ${amountInLamports / LAMPORTS_PER_SOL} SOL`);
      
      // Return the simulated signature
      return { signature: simulatedSignature };
    }
    
    // For production: Create a new transaction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: new PublicKey(senderWalletAddress),
        toPubkey: new PublicKey(recipientWalletAddress),
        lamports: amountInLamports,
      })
    );
    
    // Note: In a real app, the frontend would sign this transaction
    // This is just for demonstration purposes
    // Using AnchorProvider's method, which we know exists since we created it
    const anchorProvider = provider as anchor.AnchorProvider;
    const signature = await anchorProvider.connection.sendTransaction(
      transaction, 
      [anchorProvider.wallet.payer]
    );
    
    return { signature: signature.toString() };
  } catch (error) {
    console.error('Error transferring SOL:', error);
    throw error;
  }
}
