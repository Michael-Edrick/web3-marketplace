import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertCartItemSchema, insertOrderSchema, insertOrderItemSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize with sample products
  await initializeSampleProducts();

  // Products routes
  app.get("/api/products", async (req, res) => {
    try {
      const { category } = req.query;
      let products;
      
      if (category && typeof category === 'string') {
        products = await storage.getProductsByCategory(category);
      } else {
        products = await storage.getAllProducts();
      }
      
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Cart routes
  app.get("/api/cart", async (req, res) => {
    try {
      const { userId, sessionId } = req.query;
      const cartItems = await storage.getCartItems(
        userId ? parseInt(userId as string) : undefined,
        sessionId as string
      );
      res.json(cartItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const cartItemData = insertCartItemSchema.parse(req.body);
      const cartItem = await storage.addToCart(cartItemData);
      res.json(cartItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid cart item data", errors: error.errors });
      }
      console.error("Error adding to cart:", error);
      res.status(500).json({ message: "Failed to add item to cart" });
    }
  });

  app.put("/api/cart/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { quantity } = req.body;
      
      if (!quantity || quantity < 1) {
        return res.status(400).json({ message: "Invalid quantity" });
      }
      
      const cartItem = await storage.updateCartItemQuantity(id, quantity);
      res.json(cartItem);
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.removeFromCart(id);
      res.json({ message: "Item removed from cart" });
    } catch (error) {
      console.error("Error removing from cart:", error);
      res.status(500).json({ message: "Failed to remove item from cart" });
    }
  });

  app.delete("/api/cart", async (req, res) => {
    try {
      const { userId, sessionId } = req.query;
      await storage.clearCart(
        userId ? parseInt(userId as string) : undefined,
        sessionId as string
      );
      res.json({ message: "Cart cleared" });
    } catch (error) {
      console.error("Error clearing cart:", error);
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });

  // Orders routes
  app.post("/api/orders", async (req, res) => {
    try {
      const { order, orderItems } = req.body;
      
      const orderData = insertOrderSchema.parse(order);
      const createdOrder = await storage.createOrder(orderData);
      
      // Create order items
      for (const item of orderItems) {
        const orderItemData = insertOrderItemSchema.parse({
          ...item,
          orderId: createdOrder.id
        });
        await storage.createOrderItem(orderItemData);
      }
      
      res.json(createdOrder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid order data", errors: error.errors });
      }
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.put("/api/orders/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, transactionHash } = req.body;
      
      const order = await storage.updateOrderStatus(id, status, transactionHash);
      res.json(order);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function initializeSampleProducts() {
  try {
    const existingProducts = await storage.getAllProducts();
    if (existingProducts.length > 0) {
      return; // Products already exist
    }

    const sampleProducts = [
      {
        name: "Crypto Pioneer Cap",
        description: "Premium quality baseball cap with embroidered crypto logo",
        cryptoPrice: "0.025",
        usdPrice: "89.99",
        category: "headwear",
        imageUrl: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600",
        stock: 50
      },
      {
        name: "Golden Chain Necklace",
        description: "18k gold-plated chain with crypto pendant",
        cryptoPrice: "0.15",
        usdPrice: "539.99",
        category: "jewelry",
        imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600",
        stock: 25
      },
      {
        name: "Web3 Developer Hoodie",
        description: "Comfortable cotton hoodie with blockchain graphics",
        cryptoPrice: "0.08",
        usdPrice: "287.99",
        category: "apparel",
        imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600",
        stock: 75
      },
      {
        name: "NFT Artist Tee",
        description: "Limited edition t-shirt featuring digital art",
        cryptoPrice: "0.045",
        usdPrice: "161.99",
        category: "apparel",
        imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600",
        stock: 100
      },
      {
        name: "Hardware Wallet Case",
        description: "Protective leather case for crypto hardware wallets",
        cryptoPrice: "0.035",
        usdPrice: "125.99",
        category: "accessories",
        imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600",
        stock: 40
      },
      {
        name: "Crypto Sticker Pack",
        description: "Set of 20 premium crypto-themed stickers",
        cryptoPrice: "0.012",
        usdPrice: "43.20",
        category: "accessories",
        imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600",
        stock: 200
      },
      {
        name: "Crypto Tracker Watch",
        description: "Smartwatch with built-in crypto price tracker",
        cryptoPrice: "0.42",
        usdPrice: "1511.99",
        category: "accessories",
        imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600",
        stock: 15
      },
      {
        name: "Digital Nomad Backpack",
        description: "Anti-theft backpack designed for crypto travelers",
        cryptoPrice: "0.18",
        usdPrice: "647.99",
        category: "accessories",
        imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600",
        stock: 30
      }
    ];

    for (const product of sampleProducts) {
      await storage.createProduct(product);
    }

    console.log("Sample products initialized successfully");
  } catch (error) {
    console.error("Error initializing sample products:", error);
  }
}
