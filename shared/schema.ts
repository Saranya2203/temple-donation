import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const receiptSequence = pgTable("receipt_sequence", {
  id: serial("id").primaryKey(),
  currentNumber: integer("current_number").notNull().default(0),
  currentLetter: text("current_letter"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const donations = pgTable("donations", {
  id: serial("id").primaryKey(),
  receiptNo: text("receipt_no").notNull().unique(),
  name: text("name").notNull(),
  community: text("community"),
  location: text("location"),
  address: text("address"),
  phone: text("phone").notNull(),
  amount: integer("amount").notNull(),
  paymentMode: text("payment_mode").notNull(),
  inscription: boolean("inscription").notNull().default(false),
  donationDate: timestamp("donation_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDonationSchema = createInsertSchema(donations).omit({
  id: true,
  createdAt: true,
}).extend({
  receiptNo: z.string().min(1, "Receipt number is required"),
  phone: z.string().length(10, "Phone number must be exactly 10 digits").regex(/^\d{10}$/, "Phone number must contain only digits"),
  amount: z.number().min(1, "Amount must be greater than 0"),
  name: z.string().min(1, "Name is required"),
  location: z.string().min(1, "Location is required"),
  address: z.string().optional(),
  community: z.enum(["any", "payiran", "semban", "othaalan", "aavan", "aadai", "vizhiyan", "odhaalan", "chozhan", "pandiyan"], {
    required_error: "Kulam selection is required",
    invalid_type_error: "Please select a valid Kulam"
  }),
  donationDate: z.string().optional(),
  paymentMode: z.enum(["cash", "card", "upi", "bankTransfer", "cheque"]),
});

export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type Donation = typeof donations.$inferSelect;

// Additional types for API responses
export type DonorSummary = {
  name: string;
  phone: string;
  location: string;
  community: string;
  totalAmount: number;
  donationCount: number;
  lastDonation: string;
  donations: Donation[];
};

export type DashboardStats = {
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
};
