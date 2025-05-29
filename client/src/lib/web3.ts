export const generateSessionId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const getOrCreateSessionId = (): string => {
  let sessionId = localStorage.getItem('cryptomerch_session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem('cryptomerch_session_id', sessionId);
  }
  return sessionId;
};

export const formatEthPrice = (price: string): string => {
  return `${parseFloat(price).toFixed(3)} ETH`;
};

export const formatUsdPrice = (price: string): string => {
  return `$${parseFloat(price).toFixed(2)}`;
};

// Mock wallet connection functionality
export interface WalletConnection {
  isConnected: boolean;
  address?: string;
  chainId?: number;
}

export class MockWalletProvider {
  private connected = false;
  private address = '';
  private chainId = 84532; // Base Sepolia

  async connect(): Promise<WalletConnection> {
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    this.connected = true;
    this.address = '0x' + Math.random().toString(16).substr(2, 40);
    
    return {
      isConnected: this.connected,
      address: this.address,
      chainId: this.chainId
    };
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.address = '';
  }

  getConnection(): WalletConnection {
    return {
      isConnected: this.connected,
      address: this.connected ? this.address : undefined,
      chainId: this.connected ? this.chainId : undefined
    };
  }

  async switchToBaseSepolia(): Promise<boolean> {
    // Mock network switching
    await new Promise(resolve => setTimeout(resolve, 500));
    this.chainId = 84532;
    return true;
  }
}

export const mockWallet = new MockWalletProvider();
