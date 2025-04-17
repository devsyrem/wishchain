import { users, wishes, donations, type User, type InsertUser, type InsertWish, type Wish, type WishDisplayData, type InsertDonation, type Donation } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { db } from "./db";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByWalletAddress(address: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Wish operations
  getWishes(): Promise<WishDisplayData[]>;
  getWishById(id: number): Promise<Wish | undefined>;
  createWish(wish: InsertWish): Promise<Wish>;
  updateWishStatus(id: number, status: string): Promise<Wish | undefined>;
  
  // Donation operations
  createDonation(donation: InsertDonation): Promise<Donation>;
  getDonationsByWishId(wishId: number): Promise<Donation[]>;
  updateDonationStatus(id: number, status: string): Promise<Donation | undefined>;
  incrementWishDonations(wishId: number): Promise<Wish | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByWalletAddress(address: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.walletAddress, address));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Wish operations
  async getWishes(): Promise<WishDisplayData[]> {
    const dbWishes = await db.select().from(wishes).orderBy(desc(wishes.timestamp));
    
    return dbWishes.map(wish => ({
      id: wish.id,
      title: wish.title,
      timestamp: wish.timestamp.toISOString(),
      pubkey: wish.pubkey || "",
      walletAddress: wish.walletAddress || undefined,
      signature: wish.signature || undefined,
      totalDonations: wish.totalDonations || 0
    }));
  }
  
  async getWishById(id: number): Promise<Wish | undefined> {
    const [wish] = await db.select().from(wishes).where(eq(wishes.id, id));
    return wish;
  }
  
  async createWish(wish: InsertWish): Promise<Wish> {
    const [createdWish] = await db.insert(wishes).values(wish).returning();
    return createdWish;
  }
  
  async updateWishStatus(id: number, status: string): Promise<Wish | undefined> {
    const [updatedWish] = await db
      .update(wishes)
      .set({ status })
      .where(eq(wishes.id, id))
      .returning();
    return updatedWish;
  }
  
  // Donation operations
  async createDonation(donation: InsertDonation): Promise<Donation> {
    const [createdDonation] = await db.insert(donations).values(donation).returning();
    return createdDonation;
  }
  
  async getDonationsByWishId(wishId: number): Promise<Donation[]> {
    return await db.select()
      .from(donations)
      .where(eq(donations.wishId, wishId))
      .orderBy(desc(donations.timestamp));
  }
  
  async updateDonationStatus(id: number, status: string): Promise<Donation | undefined> {
    const [updatedDonation] = await db
      .update(donations)
      .set({ status })
      .where(eq(donations.id, id))
      .returning();
    return updatedDonation;
  }
  
  async incrementWishDonations(wishId: number): Promise<Wish | undefined> {
    const wish = await this.getWishById(wishId);
    if (!wish) return undefined;
    
    const currentDonations = wish.totalDonations || 0;
    
    const [updatedWish] = await db
      .update(wishes)
      .set({ totalDonations: currentDonations + 1 })
      .where(eq(wishes.id, wishId))
      .returning();
    
    return updatedWish;
  }
}

export const storage = new DatabaseStorage();
