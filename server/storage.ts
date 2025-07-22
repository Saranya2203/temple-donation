import { donations, receiptSequence, type Donation, type InsertDonation, type DonorSummary, type DashboardStats } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, like, sql, ilike } from "drizzle-orm";

export interface IStorage {
  // Donation CRUD operations
  createDonation(donation: InsertDonation): Promise<Donation>;
  getDonationById(id: number): Promise<Donation | undefined>;
  getAllDonations(): Promise<Donation[]>;
  getDonationsByFilters(filters: {
    dateRange?: string;
    community?: string;
    paymentMode?: string;
    amountRange?: string;
  }): Promise<Donation[]>;
  updateDonation(id: number, donation: InsertDonation): Promise<Donation | undefined>;
  deleteDonation(id: number): Promise<boolean>;
  
  // Donor operations
  getDonorByPhone(phone: string): Promise<DonorSummary | undefined>;
  searchDonors(query: string, community?: string): Promise<DonorSummary[]>;
  
  // Dashboard operations
  getDashboardStats(): Promise<DashboardStats>;
}

export class DatabaseStorage implements IStorage {
  private async withRetry<T>(operation: () => Promise<T>, retries = 3): Promise<T> {
    for (let i = 0; i < retries; i++) {
      try {
        return await operation();
      } catch (error) {
        console.error(`Database operation failed (attempt ${i + 1}/${retries}):`, error);
        if (i === retries - 1) throw error;
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    throw new Error('All retry attempts failed');
  }



  async createDonation(insertDonation: InsertDonation): Promise<Donation> {
    return this.withRetry(async () => {
      // Convert date string to Date object if provided
      const donationDate = insertDonation.donationDate 
        ? new Date(insertDonation.donationDate) 
        : null;
      
      const [donation] = await db
        .insert(donations)
        .values({
          ...insertDonation,
          donationDate,
        })
        .returning();
      
      return donation;
    });
  }

  async getDonationById(id: number): Promise<Donation | undefined> {
    return this.withRetry(async () => {
      const [donation] = await db
        .select()
        .from(donations)
        .where(eq(donations.id, id))
        .limit(1);
      
      return donation;
    });
  }

  async getAllDonations(): Promise<Donation[]> {
    return this.withRetry(async () => {
      const allDonations = await db
        .select()
        .from(donations)
        .orderBy(desc(donations.createdAt));
      
      return allDonations;
    });
  }

  async getDonationsByFilters(filters: {
    dateRange?: string;
    community?: string;
    paymentMode?: string;
    amountRange?: string;
  }): Promise<Donation[]> {
    return this.withRetry(async () => {
      const conditions = [];

      if (filters.community && filters.community !== 'all' && filters.community !== 'any') {
        conditions.push(eq(donations.community, filters.community));
      }

      if (filters.paymentMode && filters.paymentMode !== 'all') {
        conditions.push(eq(donations.paymentMode, filters.paymentMode));
      }

      if (filters.amountRange && filters.amountRange !== 'all') {
        const [min, max] = this.parseAmountRange(filters.amountRange);
        if (max === Infinity) {
          conditions.push(gte(donations.amount, min));
        } else {
          conditions.push(and(gte(donations.amount, min), lte(donations.amount, max)));
        }
      }

      if (filters.dateRange && filters.dateRange !== 'all') {
        const cutoffDate = this.getDateRangeCutoff(filters.dateRange);
        if (cutoffDate) {
          conditions.push(gte(donations.createdAt, cutoffDate));
        }
      }

      if (conditions.length > 0) {
        const result = await db
          .select()
          .from(donations)
          .where(and(...conditions))
          .orderBy(desc(donations.createdAt));
        return result;
      } else {
        const result = await db
          .select()
          .from(donations)
          .orderBy(desc(donations.createdAt));
        return result;
      }
    });
  }

  private parseAmountRange(range: string): [number, number] {
    switch (range) {
      case '0-1000': return [0, 1000];
      case '1001-5000': return [1001, 5000];
      case '5001-10000': return [5001, 10000];
      case '10000+': return [10000, Infinity];
      default: return [0, Infinity];
    }
  }

  private getDateRangeCutoff(range: string): Date | null {
    const now = new Date();
    switch (range) {
      case 'today':
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);
        return today;
      case 'week':
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return weekAgo;
      case 'month':
        const monthAgo = new Date(now);
        monthAgo.setMonth(now.getMonth() - 1);
        return monthAgo;
      default:
        return null;
    }
  }

  async getDonorByPhone(phone: string): Promise<DonorSummary | undefined> {
    return this.withRetry(async () => {
      const donorDonations = await db
        .select()
        .from(donations)
        .where(eq(donations.phone, phone))
        .orderBy(desc(donations.createdAt));

      if (donorDonations.length === 0) {
        return undefined;
      }

      const latestDonation = donorDonations[0];
      const totalAmount = donorDonations.reduce((sum: number, d: Donation) => sum + d.amount, 0);

      return {
        name: latestDonation.name,
        phone: latestDonation.phone,
        location: latestDonation.location || '',
        community: latestDonation.community || '',
        totalAmount,
        donationCount: donorDonations.length,
        lastDonation: latestDonation.createdAt.toISOString(),
        donations: donorDonations,
      };
    });
  }

  async searchDonors(query: string, community?: string): Promise<DonorSummary[]> {
    return this.withRetry(async () => {
      const conditions = [];
      
      if (query) {
        const isNumericQuery = /^\d+$/.test(query);
        if (isNumericQuery) {
          conditions.push(like(donations.phone, `%${query}%`));
        } else {
          // Case-insensitive name search using ilike
          conditions.push(ilike(donations.name, `%${query}%`));
        }
      }
      
      if (community && community !== 'all') {
        conditions.push(eq(donations.community, community));
      }
      
      let allDonations;
      if (conditions.length > 0) {
        allDonations = await db
          .select()
          .from(donations)
          .where(and(...conditions))
          .orderBy(desc(donations.createdAt));
      } else {
        allDonations = await db
          .select()
          .from(donations)
          .orderBy(desc(donations.createdAt));
      }
      
      const donorMap = new Map<string, Donation[]>();
      
      allDonations.forEach(donation => {
        const phone = donation.phone;
        if (!donorMap.has(phone)) {
          donorMap.set(phone, []);
        }
        donorMap.get(phone)!.push(donation);
      });

      const donors: DonorSummary[] = [];
      
      for (const [phone, donorDonations] of Array.from(donorMap.entries())) {
        const latestDonation = donorDonations[0];
        const totalAmount = donorDonations.reduce((sum: number, d: Donation) => sum + d.amount, 0);
        
        donors.push({
          name: latestDonation.name,
          phone: latestDonation.phone,
          location: latestDonation.location || '',
          community: latestDonation.community || '',
          totalAmount,
          donationCount: donorDonations.length,
          lastDonation: latestDonation.createdAt.toISOString(),
          donations: donorDonations,
        });
      }

      return donors.sort((a, b) => {
        if (query && /^\d+$/.test(query)) {
          const aExactMatch = a.phone.includes(query);
          const bExactMatch = b.phone.includes(query);
          if (aExactMatch && !bExactMatch) return -1;
          if (!aExactMatch && bExactMatch) return 1;
        }
        return b.totalAmount - a.totalAmount;
      });
    });
  }

  async getDashboardStats(): Promise<DashboardStats> {
    return this.withRetry(async () => {
      const allDonations = await db.select().from(donations);
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const totalCollection = allDonations.reduce((sum: number, d: Donation) => sum + d.amount, 0);
      const thisMonthDonations = allDonations.filter(d => new Date(d.createdAt) >= thisMonth);
      const thisMonthAmount = thisMonthDonations.reduce((sum: number, d: Donation) => sum + d.amount, 0);
      
      const uniquePhones = new Set(allDonations.map(d => d.phone));
      const totalDonors = uniquePhones.size;
      
      const avgDonation = allDonations.length > 0 ? Math.round(totalCollection / allDonations.length) : 0;
      
      const paymentModes = new Map<string, number>();
      allDonations.forEach(d => {
        paymentModes.set(d.paymentMode, (paymentModes.get(d.paymentMode) || 0) + d.amount);
      });
      
      const paymentModeDistribution = Array.from(paymentModes.entries()).map(([mode, amount]) => ({
        mode,
        amount,
        percentage: totalCollection > 0 ? Math.round((amount / totalCollection) * 100) : 0,
      }));
      
      const recentDonations = allDonations
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map(d => ({
          name: d.name,
          amount: d.amount,
          paymentMode: d.paymentMode,
          createdAt: d.createdAt.toISOString(),
        }));

      return {
        totalCollection,
        totalDonors,
        thisMonth: thisMonthAmount,
        avgDonation,
        paymentModeDistribution,
        recentDonations,
      };
    });
  }

  async updateDonation(id: number, updateData: InsertDonation): Promise<Donation | undefined> {
    return this.withRetry(async () => {
      // Extract donationDate and convert to Date object if provided
      const { donationDate: donationDateStr, ...restData } = updateData;
      const donationDate = donationDateStr 
        ? new Date(donationDateStr) 
        : null;
      
      const [updatedDonation] = await db
        .update(donations)
        .set({
          ...restData,
          donationDate,
        })
        .where(eq(donations.id, id))
        .returning();
      
      return updatedDonation;
    });
  }

  async deleteDonation(id: number): Promise<boolean> {
    return this.withRetry(async () => {
      const result = await db
        .delete(donations)
        .where(eq(donations.id, id))
        .returning();
      
      return result.length > 0;
    });
  }
}

export const storage = new DatabaseStorage();