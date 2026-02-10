import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth Setup
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "dev_secret",
      resave: false,
      saveUninitialized: false,
      store: storage.sessionStore,
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user) return done(null, false, { message: "Incorrect email." });
          if (!(await comparePasswords(password, user.password))) {
            return done(null, false, { message: "Incorrect password." });
          }
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Auth Routes
  app.post(api.auth.login.path, passport.authenticate("local"), (req, res) => {
    res.json(req.user);
  });

  app.post(api.auth.register.path, async (req, res) => {
    try {
      const input = api.auth.register.input.parse(req.body);
      const existing = await storage.getUserByEmail(input.email);
      if (existing) {
        return res.status(400).json({ message: "Email already exists" });
      }
      const { confirmPassword, ...userData } = input;
      const hashedPassword = await hashPassword(input.password);
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
        role: "user" // Default role
      });
      req.login(user, (err) => {
        if (err) throw err;
        res.status(201).json(user);
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  app.post(api.auth.logout.path, (req, res) => {
    req.logout(() => {
      res.json({ message: "Logged out" });
    });
  });

  app.get(api.auth.me.path, (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // Products
  app.get(api.products.list.path, async (req, res) => {
    const category = req.query.category as string | undefined;
    const products = await storage.getProducts(category);
    res.json(products);
  });

  app.get(api.products.get.path, async (req, res) => {
    const product = await storage.getProduct(Number(req.params.id));
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  });

  app.post(api.products.create.path, async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== 'admin') return res.status(403).send("Unauthorized");
    try {
      const input = api.products.create.input.parse(req.body);
      const product = await storage.createProduct(input);
      res.status(201).json(product);
    } catch (err) {
      if (err instanceof z.ZodError) res.status(400).json({ message: err.message });
    }
  });

  app.put(api.products.update.path, async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== 'admin') return res.status(403).send("Unauthorized");
    try {
      const input = api.products.update.input.parse(req.body);
      const product = await storage.updateProduct(Number(req.params.id), input);
      if (!product) return res.status(404).json({ message: "Product not found" });
      res.json(product);
    } catch (err) {
       if (err instanceof z.ZodError) res.status(400).json({ message: err.message });
    }
  });

  app.delete(api.products.delete.path, async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== 'admin') return res.status(403).send("Unauthorized");
    await storage.deleteProduct(Number(req.params.id));
    res.status(204).send();
  });

  // Services
  app.get(api.services.list.path, async (req, res) => {
    const services = await storage.getServices();
    res.json(services);
  });

  app.post(api.services.book.path, async (req, res) => {
    try {
      const input = api.services.book.input.parse(req.body);
      // Link user if logged in
      const appointmentData = {
        ...input,
        userId: req.isAuthenticated() ? (req.user as any).id : null,
      };
      const appointment = await storage.createAppointment(appointmentData);
      res.status(201).json(appointment);
    } catch (err) {
      if (err instanceof z.ZodError) res.status(400).json({ message: err.message });
    }
  });

  // Orders
  app.post(api.orders.create.path, async (req, res) => {
    try {
      const input = api.orders.create.input.parse(req.body);
      
      // Calculate total from products
      let total = 0;
      for (const item of input.items) {
        const product = await storage.getProduct(item.productId);
        if (product) {
          total += Number(product.price) * item.quantity;
        }
      }

      const orderData = {
        userId: req.isAuthenticated() ? (req.user as any).id : null,
        customerName: input.customerName,
        total: total.toString(), // Store as string for decimal type
      };
      
      const order = await storage.createOrder(orderData);

      for (const item of input.items) {
        const product = await storage.getProduct(item.productId);
        if (product) {
          await storage.createOrderItem({
            orderId: order.id,
            productId: item.productId,
            productName: product.name,
            quantity: item.quantity,
            price: product.price,
          });
        }
      }

      res.status(201).json(order);
    } catch (err) {
      if (err instanceof z.ZodError) res.status(400).json({ message: err.message });
    }
  });
  
  app.get(api.orders.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(403).send("Unauthorized");
    const user = req.user as any;
    if (user.role === 'admin') {
      const orders = await storage.getOrders();
      res.json(orders);
    } else {
      const orders = await storage.getOrdersByUser(user.id);
      res.json(orders);
    }
  });
  
  // Users (Admin)
  app.get(api.users.list.path, async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== 'admin') return res.status(403).send("Unauthorized");
    const users = await storage.getUsers();
    res.json(users);
  });

  // Contact
  app.post(api.contact.submit.path, async (req, res) => {
    try {
      const input = api.contact.submit.input.parse(req.body);
      const contact = await storage.createContact(input);
      res.status(201).json(contact);
    } catch (err) {
      if (err instanceof z.ZodError) res.status(400).json({ message: err.message });
    }
  });

  // Seed Data
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const users = await storage.getUsers();
  if (users.length === 0) {
    // Admin User
    const hashedPassword = await hashPassword("admin123");
    await storage.createUser({
      email: "admin@petshop.com",
      password: hashedPassword,
      name: "Admin User",
      role: "admin"
    });

    // Products
    await storage.createProduct({
      name: "Ração Premium Cães",
      description: "Ração de alta qualidade para cães adultos",
      price: "129.90",
      category: "Ração",
      image: "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=500&q=80",
      stock: 50
    });
    await storage.createProduct({
      name: "Brinquedo Mordedor",
      description: "Brinquedo resistente para cães",
      price: "29.90",
      category: "Brinquedos",
      image: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=500&q=80",
      stock: 100
    });
    await storage.createProduct({
      name: "Shampoo Pet",
      description: "Shampoo neutro para cães e gatos",
      price: "35.50",
      category: "Higiene",
      image: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=500&q=80",
      stock: 30
    });
    await storage.createProduct({
      name: "Coleira Ajustável",
      description: "Coleira confortável e segura",
      price: "45.00",
      category: "Acessórios",
      image: "https://images.unsplash.com/photo-1605639147291-8079055d8ce7?w=500&q=80",
      stock: 200
    });

    // Services
    await storage.createService({
      name: "Banho Completo",
      description: "Banho com produtos premium e secagem",
      price: "50.00",
      duration: 60,
      image: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=500&q=80"
    });
    await storage.createService({
      name: "Tosa Higiênica",
      description: "Corte de pelos e limpeza",
      price: "70.00",
      duration: 90,
      image: "https://images.unsplash.com/photo-1623387641168-d9803ddd3f35?w=500&q=80"
    });
    await storage.createService({
      name: "Consulta Veterinária",
      description: "Avaliação completa da saúde do seu pet",
      price: "150.00",
      duration: 30,
      image: "https://images.unsplash.com/photo-1628009368231-760335546e9c?w=500&q=80"
    });
  }
}
