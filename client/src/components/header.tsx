import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Search, ShoppingCart, Wallet, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { mockWallet, type WalletConnection } from "@/lib/web3";
import { getOrCreateSessionId } from "@/lib/web3";

interface HeaderProps {
  onToggleCart: () => void;
  cartItemCount: number;
}

export default function Header({ onToggleCart, cartItemCount }: HeaderProps) {
  const [location] = useLocation();
  const [walletConnection, setWalletConnection] = useState<WalletConnection>({ isConnected: false });
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setWalletConnection(mockWallet.getConnection());
  }, []);

  const handleConnectWallet = async () => {
    if (!walletConnection.isConnected) {
      setShowWalletModal(true);
    }
  };

  const handleWalletConnect = async (walletType: string) => {
    try {
      const connection = await mockWallet.connect();
      setWalletConnection(connection);
      setShowWalletModal(false);
    } catch (error) {
      console.error(`Failed to connect to ${walletType}:`, error);
    }
  };

  const handleDisconnectWallet = async () => {
    await mockWallet.disconnect();
    setWalletConnection({ isConnected: false });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <>
      <header className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link href="/">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    CryptoMerch
                  </h1>
                </Link>
              </div>
              <div className="hidden md:block ml-8">
                <nav className="flex space-x-8">
                  <Link href="/">
                    <a className={`transition-colors ${location === '/' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400'}`}>
                      All Products
                    </a>
                  </Link>
                  <Link href="/?category=apparel">
                    <a className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      Apparel
                    </a>
                  </Link>
                  <Link href="/?category=accessories">
                    <a className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      Accessories
                    </a>
                  </Link>
                  <Link href="/?category=jewelry">
                    <a className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      Jewelry
                    </a>
                  </Link>
                </nav>
              </div>
            </div>

            {/* Search Bar */}
            <div className="hidden md:block flex-1 max-w-lg mx-8">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
            </div>

            {/* Wallet & Cart */}
            <div className="flex items-center space-x-4">
              {/* Network Badge */}
              <div className="hidden sm:flex items-center">
                <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                  <Globe className="w-3 h-3 mr-1" />
                  Base Sepolia
                </Badge>
              </div>

              {/* Wallet Connection */}
              <Button
                onClick={walletConnection.isConnected ? handleDisconnectWallet : handleConnectWallet}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
              >
                <Wallet className="w-4 h-4 mr-2" />
                {walletConnection.isConnected && walletConnection.address
                  ? formatAddress(walletConnection.address)
                  : "Connect Wallet"
                }
              </Button>

              {/* Shopping Cart */}
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleCart}
                className="relative"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs h-5 w-5 flex items-center justify-center rounded-full">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Wallet Connection Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <Wallet className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Connect Your Wallet</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Connect your crypto wallet to start shopping with digital currency
              </p>

              <div className="space-y-4">
                <Button
                  onClick={() => handleWalletConnect('MetaMask')}
                  variant="outline"
                  className="w-full justify-center"
                >
                  <span className="text-orange-500 mr-3 text-xl">🦊</span>
                  MetaMask
                </Button>
                <Button
                  onClick={() => handleWalletConnect('WalletConnect')}
                  variant="outline"
                  className="w-full justify-center"
                >
                  <span className="text-blue-500 mr-3 text-xl">🔗</span>
                  WalletConnect
                </Button>
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <Globe className="w-4 h-4 inline mr-2" />
                  Make sure you're connected to Base Sepolia network
                </p>
              </div>

              <Button
                variant="ghost"
                onClick={() => setShowWalletModal(false)}
                className="mt-6"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
