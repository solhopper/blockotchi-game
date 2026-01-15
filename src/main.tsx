import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import WalletContextProvider from "./wallet/WalletContextProvider";

import { Buffer } from "buffer";
import process from "process";

// Polyfills for Metaplex/Umi dependencies
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).Buffer = Buffer;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).process = process;

createRoot(document.getElementById("root")!).render(
  <WalletContextProvider>
    <App />
  </WalletContextProvider>
);
