import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Schema for wishes stored on the blockchain
export interface Wish {
  title: string;
  timestamp: string;
  pubkey: string;
}

export const wishSchema = z.object({
  title: z.string().min(1, "Wish title is required").max(100, "Wish title must be less than 100 characters"),
  timestamp: z.string(),
  pubkey: z.string()
});

export type InsertWish = z.infer<typeof wishSchema>;
