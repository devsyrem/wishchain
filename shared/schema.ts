import { pgTable, text, serial, integer, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Define user table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  walletAddress: varchar("wallet_address", { length: 44 }).unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Define wish table for database storage
export const wishes = pgTable("wishes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  pubkey: varchar("pubkey", { length: 44 }),
  userId: integer("user_id").references(() => users.id),
  signature: varchar("signature", { length: 100 }),
  status: varchar("status", { length: 20 }).default("pending"),
});

// Define relationships between tables
export const usersRelations = relations(users, ({ many }) => ({
  wishes: many(wishes),
}));

export const wishesRelations = relations(wishes, ({ one }) => ({
  user: one(users, {
    fields: [wishes.userId],
    references: [users.id],
  }),
}));

// Schemas for insertions
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  walletAddress: true,
});

export const insertWishSchema = createInsertSchema(wishes).pick({
  title: true,
  pubkey: true,
  userId: true,
  signature: true,
  status: true,
});

// Types for the application
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertWish = z.infer<typeof insertWishSchema>;
export type Wish = typeof wishes.$inferSelect;

// Common interface for wishes (for UI compatibility with blockchain version)
export interface WishDisplayData {
  title: string;
  timestamp: string; // ISO format string
  pubkey: string;
}

// Interface for blockchain-stored wishes
export interface BlockchainWish {
  title: string;
  timestamp: string; // ISO format string
  pubkey: string;
}

// Schema for creating wishes through the API
export const wishCreationSchema = z.object({
  title: z.string().min(1, "Wish title is required").max(100, "Wish title must be less than 100 characters"),
  walletPublicKey: z.string().min(32, "Valid wallet address required"),
});
