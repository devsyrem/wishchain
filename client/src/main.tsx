import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Ensure the window.phantom type is available
declare global {
  interface Window {
    phantom?: {
      solana: {
        publicKey: any;
        signMessage: (message: Uint8Array) => Promise<Uint8Array>;
        signTransaction: any;
        connect: () => Promise<{ publicKey: any }>;
        disconnect: () => Promise<void>;
        isConnected: boolean;
      };
    };
  }
}

createRoot(document.getElementById("root")!).render(<App />);
