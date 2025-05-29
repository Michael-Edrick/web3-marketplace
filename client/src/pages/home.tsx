import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import ProductCard from "@/components/product-card";
import WalletConnectionSection from "@/components/wallet-connection";
import { apiRequest } from "@/lib/queryClient";
import { getOrCreateSessionId } from "@/lib/web3";
import { useToast } from "@/hooks/use-toast";
import type { Product, CartItemWithProduct } from "@shared/schema";

export default function Home() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const sessionId = getOrCreateSessionId();
  
  // Get category from URL params
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const categoryFilter = urlParams.get('category') || '';
  
  const [sortBy, setSortBy] = useState("popularity");

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/products', categoryFilter],
    queryFn: async () => {
      const url = categoryFilter ? `/api/products?category=${categoryFilter}` : '/api/products';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    },
  });

  const { data: cartItems = [] } = useQuery<CartItemWithProduct[]>({
    queryKey: ['/api/cart', { sessionId }],
    queryFn: async () => {
      const response = await fetch(`/api/cart?sessionId=${sessionId}`);
      if (!response.ok) throw new Error('Failed to fetch cart');
      return response.json();
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: async (product: Product) => {
      return apiRequest('POST', '/api/cart', {
        productId: product.id,
        quantity: 1,
        sessionId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    },
  });

  const handleAddToCart = (product: Product) => {
    addToCartMutation.mutate(product);
  };

  const categories = [
    { value: "headwear", label: "Headwear", image: "https://images.unsplash.com/photo-1521369909029-2afed882baee?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800" },
    { value: "jewelry", label: "Jewelry", image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800" },
    { value: "apparel", label: "Apparel", image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800" }
  ];

  const handleCategoryClick = (category: string) => {
    navigate(`/?category=${category}`);
  };

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return parseFloat(a.usdPrice) - parseFloat(b.usdPrice);
      case "price-high":
        return parseFloat(b.usdPrice) - parseFloat(a.usdPrice);
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Premium Merch,<br />Crypto Payments
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Shop authentic merchandise and pay with cryptocurrency on Base network
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3"
                onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Explore Products
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Learn About Web3 Shopping
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-gray-100">
            Shop by Category
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((category) => (
              <Card
                key={category.value}
                className="group cursor-pointer hover:shadow-lg transition-shadow duration-300"
                onClick={() => handleCategoryClick(category.value)}
              >
                <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-t-2xl overflow-hidden">
                  <img
                    src={category.image}
                    alt={`${category.label} collection`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
                    {category.label}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Discover our {category.label.toLowerCase()} collection
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section id="products" className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {categoryFilter ? `${categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1)} Products` : 'Featured Products'}
            </h2>
            <div className="flex items-center space-x-4">
              {categoryFilter && (
                <Button
                  variant="outline"
                  onClick={() => navigate('/')}
                >
                  Show All Products
                </Button>
              )}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity">Sort by popularity</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest first</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-square bg-gray-200 dark:bg-gray-700"></div>
                  <CardContent className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                No products found in this category.
              </p>
              <Button
                onClick={() => navigate('/')}
                className="mt-4"
                variant="outline"
              >
                View All Products
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {sortedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}

          {!productsLoading && sortedProducts.length > 0 && (
            <div className="text-center mt-12">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
              >
                Load More Products
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Web3 Features */}
      <div id="features">
        <WalletConnectionSection />
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">CryptoMerch</h3>
              <p className="text-gray-400 mb-4">
                The premier destination for authentic merchandise purchased with cryptocurrency.
              </p>
              <div className="flex space-x-4">
                <span className="text-xl hover:text-amber-500 cursor-pointer">🐦</span>
                <span className="text-xl hover:text-amber-500 cursor-pointer">💬</span>
                <span className="text-xl hover:text-amber-500 cursor-pointer">📱</span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Shop</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/" className="hover:text-white transition-colors">All Products</a></li>
                <li><a href="/?category=headwear" className="hover:text-white transition-colors">Headwear</a></li>
                <li><a href="/?category=jewelry" className="hover:text-white transition-colors">Jewelry</a></li>
                <li><a href="/?category=apparel" className="hover:text-white transition-colors">Apparel</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">How to Pay with Crypto</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Shipping & Returns</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Network Info</h4>
              <div className="text-gray-400 space-y-2">
                <p>Network: Base Sepolia</p>
                <p>Gas Fees: ~$0.01</p>
                <p>Transaction Time: ~2 seconds</p>
                <div className="mt-4">
                  <span className="bg-blue-600 px-3 py-1 rounded-full text-sm">Testnet</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 mt-8 text-center text-gray-400">
            <p>&copy; 2024 CryptoMerch. All rights reserved. Built on Base network.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
