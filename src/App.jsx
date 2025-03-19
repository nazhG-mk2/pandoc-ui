import './App.css'

import hypercycle from "hypercyclejs"
import { WagmiProvider } from "wagmi"
import { ConnectKitProvider } from "connectkit"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Header } from './Header';
import { Pandoc } from './Pandoc';

const sepoliaBaseRPC = import.meta.env.VITE_RPC_BASE_SEPOLIA;
const baseRPC = import.meta.env.VITE_RPC_BASE;
const mainnetRPC = import.meta.env.VITE_RPC_MAINNET;
const sepoliaRPC = import.meta.env.VITE_RPC_SEPOLIA;

const startConfig = () =>
  hypercycle.setAvailableRPCs({
    sepolia: sepoliaRPC,
    mainnet: mainnetRPC,
    base: baseRPC,
    baseSepolia: sepoliaBaseRPC,
  });

function App() {

  startConfig();
  const queryClient = new QueryClient();
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={hypercycle.wagmiConfig}>
          <ConnectKitProvider>
            <Header />

            <Pandoc />
            <footer className='flex'>
              <a href="https://www.hypercycle.ai/">
                <img src="./hy_logo.avif"
                  alt="Hypercycle logo" className="w-40 invert opacity-90" />
              </a>
            </footer>
          </ConnectKitProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </>
  )
}

export default App
