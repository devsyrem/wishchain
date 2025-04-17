import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import * as anchor from "./anchor";
import WebSocket, { WebSocketServer } from "ws";

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
  
  // WebSocket connection handling
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    // Add client to the set
    clients.add(ws);
    
    // Send initial wishes list
    try {
      anchor.getAllWishes().then(wishes => {
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
  
  // API routes for interacting with Solana program
  app.post('/api/wishes', async (req, res) => {
    try {
      const { title, walletPublicKey } = req.body;
      
      if (!title || !walletPublicKey) {
        return res.status(400).json({ message: 'Title and wallet public key are required' });
      }
      
      // Add wish to blockchain
      const result = await anchor.addWish(title, walletPublicKey);
      
      // Get updated wishes
      const wishes = await anchor.getAllWishes();
      
      // Notify all connected clients about the new wish
      clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'WISHES_LIST', data: wishes }));
        }
      });
      
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error adding wish:', error);
      return res.status(500).json({ message: 'Failed to add wish', error: error instanceof Error ? error.message : String(error) });
    }
  });
  
  app.get('/api/wishes', async (req, res) => {
    try {
      const wishes = await anchor.getAllWishes();
      return res.status(200).json(wishes);
    } catch (error) {
      console.error('Error fetching wishes:', error);
      return res.status(500).json({ message: 'Failed to fetch wishes', error: error instanceof Error ? error.message : String(error) });
    }
  });

  return httpServer;
}
