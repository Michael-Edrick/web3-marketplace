import { Switch, Route } from "wouter";
import { useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/header";
import ShoppingCart from "@/components/shopping-cart";
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";
import { useQuery } from "@tanstack/react-query";
import { getOrCreateSessionId } from "@/lib/web3";
import type { CartItemWithProduct } from "@shared/schema";

function AppContent() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const sessionId = getOrCreateSessionId();

  const { data: cartItems = [] } = useQuery<CartItemWithProduct[]>({
    queryKey: ['/api/cart', { sessionId }],
    queryFn: async () => {
      const response = await fetch(`/api/cart?sessionId=${sessionId}`);
      if (!response.ok) throw new Error('Failed to fetch cart');
      return response.json();
    },
  });

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onToggleCart={() => setIsCartOpen(!isCartOpen)} 
        cartItemCount={cartItemCount}
      />
      <main>
        <Switch>
          <Route path="/" component={Home} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <ShoppingCart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
