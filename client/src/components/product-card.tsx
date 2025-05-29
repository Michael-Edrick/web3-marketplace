import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";
import { formatEthPrice, formatUsdPrice } from "@/lib/web3";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">
          {product.name}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>
        <div className="flex justify-between items-center">
          <div>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatEthPrice(product.cryptoPrice)}
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-sm block">
              ~{formatUsdPrice(product.usdPrice)}
            </span>
          </div>
          <Button
            onClick={() => onAddToCart(product)}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
            disabled={product.stock === 0}
          >
            <ShoppingCart className="w-4 h-4" />
          </Button>
        </div>
        {product.stock <= 5 && product.stock > 0 && (
          <p className="text-amber-600 dark:text-amber-400 text-xs mt-2">
            Only {product.stock} left in stock!
          </p>
        )}
        {product.stock === 0 && (
          <p className="text-red-600 dark:text-red-400 text-xs mt-2">
            Out of stock
          </p>
        )}
      </CardContent>
    </Card>
  );
}
