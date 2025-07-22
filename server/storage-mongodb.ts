import { Donation, IDonation } from './models/Donation';
import { ReceiptSequence } from './models/ReceiptSequence';
import { connectMongoDB } from './mongodb';

// Types matching the shared schema
export interface InsertDonation {
  receiptNo: string;
  name: string;
  phone: string;
  community: string;
  location: string;
  address?: string;
  amount: number;
  paymentMode: 'cash' | 'card' | 'upi' | 'bankTransfer' | 'cheque';
  inscription: boolean;
  donationDate?: Date;
}

export interface DonorSummary {
  name: string;
  phone: string;
  location: string;
  community: string;
  totalAmount: number;
  donationCount: number;
  lastDonation: string;
  donations: IDonation[];
}

export interface DashboardStats {
  totalCollection: number;
  totalDonors: number;
  thisMonth: number;
  avgDonation: number;
  paymentModeDistribution: {
    mode: string;
    percentage: number;
    amount: number;
  }[];
  recentDonations: {
    name: string;
    amount: number;
    paymentMode: string;
    createdAt: string;
  }[];
}

export interface IStorage {
  // Donation CRUD operations
  createDonation(donation: InsertDonation): Promise<IDonation>;
  getDonationById(id: string): Promise<IDonation | null>;
  getAllDonations(): Promise<IDonation[]>;
  getDonationsByFilters(filters: {
    dateRange?: string;
    community?: string;
    paymentMode?: string;
    amountRange?: string;
  }): Promise<IDonation[]>;
  updateDonation(id: string, donation: InsertDonation): Promise<IDonation | null>;
  deleteDonation(id: string): Promise<boolean>;
  
  // Donor operations
  getDonorByPhone(phone: string): Promise<DonorSummary | null>;
  searchDonors(query: string, community?: string): Promise<DonorSummary[]>;
  
  // Dashboard operations
  getDashboardStats(): Promise<DashboardStats>;
}

export class MongoDBStorage implements IStorage {
  constructor() {
    // Ensure MongoDB connection is established
    connectMongoDB().catch(console.error);
  }

  async createDonation(insertDonation: InsertDonation): Promise<IDonation> {
    try {
      const donation = new Donation(insertDonation);
      return await donation.save();
    } catch (error) {
      console.error('Error creating donation:', error);
      throw error;
    }
  }

  async getDonationById(id: string): Promise<IDonation | null> {
    try {
      return await Donation.findById(id);
    } catch (error) {
      console.error('Error fetching donation by ID:', error);
      throw error;
    }
  }

  async getAllDonations(): Promise<IDonation[]> {
    try {
      return await Donation.find({}).sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error fetching all donations:', error);
      throw error;
    }
  }

  async getDonationsByFilters(filters: {
    dateRange?: string;
    community?: string;
    paymentMode?: string;
    amountRange?: string;
  }): Promise<IDonation[]> {
    try {
      const query: any = {};

      // Date range filter
      if (filters.dateRange) {
        const cutoffDate = this.getDateRangeCutoff(filters.dateRange);
        if (cutoffDate) {
          query.createdAt = { $gte: cutoffDate };
        }
      }

      // Community filter
      if (filters.community && filters.community !== 'all') {
        query.community = filters.community;
      }

      // Payment mode filter
      if (filters.paymentMode && filters.paymentMode !== 'all') {
        query.paymentMode = filters.paymentMode;
      }

      // Amount range filter
      if (filters.amountRange && filters.amountRange !== 'all') {
        const [min, max] = this.parseAmountRange(filters.amountRange);
        if (min !== undefined && max !== undefined) {
          query.amount = { $gte: min, $lte: max };
        } else if (min !== undefined) {
          query.amount = { $gte: min };
        }
      }

      return await Donation.find(query).sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error fetching donations with filters:', error);
      throw error;
    }
  }

  private parseAmountRange(range: string): [number | undefined, number | undefined] {
    switch (range) {
      case '0-100': return [0, 100];
      case '101-500': return [101, 500];
      case '501-1000': return [501, 1000];
      case '1001-5000': return [1001, 5000];
      case '5000+': return [5000, undefined];
      default: return [undefined, undefined];
    }
  }

  private getDateRangeCutoff(range: string): Date | null {
    const now = new Date();
    switch (range) {
      case 'today':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
      case 'week':
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return weekAgo;
      case 'month':
        const monthAgo = new Date(now);
        monthAgo.setMonth(now.getMonth() - 1);
        return monthAgo;
      case 'year':
        const yearAgo = new Date(now);
        yearAgo.setFullYear(now.getFullYear() - 1);
        return yearAgo;
      default:
        return null;
    }
  }

  async getDonorByPhone(phone: string): Promise<DonorSummary | null> {
    try {
      const donations = await Donation.find({ phone }).sort({ createdAt: -1 });
      
      if (donations.length === 0) {
        return null;
      }

      const firstDonation = donations[0];
      const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);

      return {
        name: firstDonation.name,
        phone: firstDonation.phone,
        location: firstDonation.location,
        community: firstDonation.community,
        totalAmount,
        donationCount: donations.length,
        lastDonation: firstDonation.createdAt.toISOString(),
        donations
      };
    } catch (error) {
      console.error('Error fetching donor by phone:', error);
      throw error;
    }
  }

  async searchDonors(query: string, community?: string): Promise<DonorSummary[]> {
    try {
      const searchQuery: any = {
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { phone: { $regex: query, $options: 'i' } }
        ]
      };

      if (community && community !== 'all') {
        searchQuery.community = community;
      }

      const donations = await Donation.find(searchQuery).sort({ createdAt: -1 });
      
      // Group by phone number to get unique donors
      const donorMap = new Map<string, DonorSummary>();
      
      for (const donation of donations) {
        if (!donorMap.has(donation.phone)) {
          const donorDonations = donations.filter(d => d.phone === donation.phone);
          const totalAmount = donorDonations.reduce((sum, d) => sum + d.amount, 0);
          
          donorMap.set(donation.phone, {
            name: donation.name,
            phone: donation.phone,
            location: donation.location,
            community: donation.community,
            totalAmount,
            donationCount: donorDonations.length,
            lastDonation: donation.createdAt.toISOString(),
            donations: donorDonations
          });
        }
      }

      return Array.from(donorMap.values());
    } catch (error) {
      console.error('Error searching donors:', error);
      throw error;
    }
  }

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const allDonations = await Donation.find({});
      const now = new Date();
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const thisMonthDonations = await Donation.find({
        createdAt: { $gte: firstOfMonth }
      });

      const totalCollection = allDonations.reduce((sum, d) => sum + d.amount, 0);
      const thisMonthAmount = thisMonthDonations.reduce((sum, d) => sum + d.amount, 0);
      
      // Get unique donors by phone
      const uniquePhones = new Set(allDonations.map(d => d.phone));
      const totalDonors = uniquePhones.size;
      
      const avgDonation = allDonations.length > 0 ? totalCollection / allDonations.length : 0;

      // Payment mode distribution
      const paymentModes = ['cash', 'card', 'upi', 'bankTransfer', 'cheque'];
      const paymentModeDistribution = paymentModes.map(mode => {
        const modeAmount = allDonations
          .filter(d => d.paymentMode === mode)
          .reduce((sum, d) => sum + d.amount, 0);
        
        return {
          mode,
          percentage: totalCollection > 0 ? (modeAmount / totalCollection) * 100 : 0,
          amount: modeAmount
        };
      });

      // Recent donations (last 10)
      const recentDonations = allDonations
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 10)
        .map(d => ({
          name: d.name,
          amount: d.amount,
          paymentMode: d.paymentMode,
          createdAt: d.createdAt.toISOString()
        }));

      return {
        totalCollection,
        totalDonors,
        thisMonth: thisMonthAmount,
        avgDonation,
        paymentModeDistribution,
        recentDonations
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  async updateDonation(id: string, updateData: InsertDonation): Promise<IDonation | null> {
    try {
      return await Donation.findByIdAndUpdate(id, updateData, { new: true });
    } catch (error) {
      console.error('Error updating donation:', error);
      throw error;
    }
  }

  async deleteDonation(id: string): Promise<boolean> {
    try {
      const result = await Donation.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting donation:', error);
      throw error;
    }
  }
}

export const storage = new MongoDBStorage();