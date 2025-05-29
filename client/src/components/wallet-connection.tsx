import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, Globe, Shield, Zap } from "lucide-react";
import { mockWallet, type WalletConnection } from "@/lib/web3";

export default function WalletConnectionSection() {
  const [walletConnection, setWalletConnection] = useState<WalletConnection>({ isConnected: false });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setWalletConnection(mockWallet.getConnection());
  }, []);

  const handleConnect = async (walletType: string) => {
    try {
      const connection = await mockWallet.connect();
      setWalletConnection(connection);
      setShowModal(false);
    } catch (error) {
      console.error(`Failed to connect to ${walletType}:`, error);
    }
  };

  const features = [
    {
      icon: Shield,
      title: "Secure Transactions",
      description: "All payments are secured by blockchain technology and smart contracts"
    },
    {
      icon: Globe,
      title: "Global Access",
      description: "Shop from anywhere in the world without traditional banking limitations"
    },
    {
      icon: Zap,
      title: "Fast Payments",
      description: "Instant transactions on Base network with low gas fees"
    }
  ];

  return (
    <>
      {/* Web3 Features Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-gray-100">
            Why Choose Crypto Payments?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Wallet Connection Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <Wallet className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                Connect Your Wallet
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Connect your crypto wallet to start shopping with digital currency
              </p>

              <div className="space-y-4">
                <Button
                  onClick={() => handleConnect('MetaMask')}
                  variant="outline"
                  className="w-full justify-center"
                >
                  <span className="text-orange-500 mr-3 text-xl">🦊</span>
                  MetaMask
                </Button>
                <Button
                  onClick={() => handleConnect('WalletConnect')}
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
                onClick={() => setShowModal(false)}
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
