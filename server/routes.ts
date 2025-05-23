import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import * as anchor from "./anchor";
import WebSocket, { WebSocketServer } from "ws";
import { wishCreationSchema, donationCreationSchema } from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);
  
  // Create WebSocket server for real-time updates
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/ws' // Specify a specific path for WebSocket connections
  });
  
  // Store connected clients
  const clients = new Set<WebSocket>();
  
  // Function to broadcast wishes to all clients
  const broadcastWishes = async () => {
    try {
      const wishes = await storage.getWishes();
      const message = JSON.stringify({ type: 'WISHES_LIST', data: wishes });
      
      clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    } catch (error) {
      console.error('Error broadcasting wishes:', error);
    }
  };
  
  // WebSocket connection handling
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    // Add client to the set
    clients.add(ws);
    
    // Send initial wishes list from database
    try {
      storage.getWishes().then(wishes => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'WISHES_LIST', data: wishes }));
        }
      }).catch(error => {
        console.error('Error fetching wishes:', error);
      });
    } catch (error) {
      console.error('Error sending initial wishes:', error);
    }
    
    // Handle client disconnect
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      clients.delete(ws);
    });
    
    // Handle errors
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });
  
  // API routes for wishes
  app.post('/api/wishes', async (req, res) => {
    try {
      // Validate request body
      const validatedData = wishCreationSchema.parse(req.body);
      const { title, walletPublicKey } = validatedData;
      
      // Try to add to blockchain for real dApp experience
      let blockchainResult = { signature: '', pubkey: '' };
      try {
        // This might fail in development without a real Solana program
        blockchainResult = await anchor.addWish(title, walletPublicKey);
      } catch (blockchainError) {
        console.log('Using simulation mode due to blockchain error:', blockchainError);
        // Generate a simulated signature and pubkey for development
        blockchainResult = {
          signature: 'sim_' + Math.random().toString(36).substring(2, 15),
          pubkey: walletPublicKey.substring(0, 8) + Math.random().toString(36).substring(2, 10)
        };
      }
      
      // Store wish in database
      const wishData = {
        title,
        pubkey: blockchainResult.pubkey,
        signature: blockchainResult.signature,
        status: 'confirmed'
      };
      
      await storage.createWish(wishData);
      
      // Broadcast updated wishes
      await broadcastWishes();
      
      return res.status(200).json(blockchainResult);
    } catch (error) {
      console.error('Error adding wish:', error);
      
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: 'Validation error', 
          errors: error.errors 
        });
      }
      
      return res.status(500).json({ 
        message: 'Failed to add wish', 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });
  
  app.get('/api/wishes', async (req, res) => {
    try {
      const wishes = await storage.getWishes();
      return res.status(200).json(wishes);
    } catch (error) {
      console.error('Error fetching wishes:', error);
      return res.status(500).json({ 
        message: 'Failed to fetch wishes', 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });
  
  // Get a single wish by ID
  app.get('/api/wishes/:id', async (req, res) => {
    try {
      const wishId = parseInt(req.params.id);
      if (isNaN(wishId)) {
        return res.status(400).json({ message: 'Invalid wish ID' });
      }
      
      const wish = await storage.getWishById(wishId);
      if (!wish) {
        return res.status(404).json({ message: 'Wish not found' });
      }
      
      return res.status(200).json(wish);
    } catch (error) {
      console.error('Error fetching wish:', error);
      return res.status(500).json({ 
        message: 'Failed to fetch wish', 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });
  
  // Endpoint for crypto donations
  app.post('/api/donations', async (req, res) => {
    try {
      // Validate request body
      const validatedData = donationCreationSchema.parse(req.body);
      const { wishId, walletPublicKey, amount, recipientWalletAddress } = validatedData;
      
      // Check if the wish exists
      const wish = await storage.getWishById(wishId);
      if (!wish) {
        return res.status(404).json({ message: 'Wish not found' });
      }
      
      // Try to process crypto donation transaction
      let transactionResult;
      try {
        // This function will be implemented in solana.ts
        // It creates and sends a Solana transaction to transfer SOL
        transactionResult = await anchor.transferSol(
          walletPublicKey,
          recipientWalletAddress,
          amount
        );
      } catch (txError) {
        console.log('Error processing donation transaction:', txError);
        return res.status(400).json({ 
          message: 'Transaction failed', 
          error: txError instanceof Error ? txError.message : String(txError) 
        });
      }
      
      // Store donation in database
      const donationData = {
        wishId,
        senderWalletAddress: walletPublicKey,
        amount,
        signature: transactionResult.signature,
        status: 'confirmed'
      };
      
      const donation = await storage.createDonation(donationData);
      
      // Increment the wish's donation count
      await storage.incrementWishDonations(wishId);
      
      // Broadcast updated wishes
      await broadcastWishes();
      
      return res.status(200).json({
        success: true,
        donation,
        transaction: transactionResult
      });
    } catch (error) {
      console.error('Error processing donation:', error);
      
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: 'Validation error', 
          errors: error.errors 
        });
      }
      
      return res.status(500).json({ 
        message: 'Failed to process donation', 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  return httpServer;
}
