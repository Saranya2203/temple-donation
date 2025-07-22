import mongoose, { Schema, Document } from 'mongoose';

// Donation Interface
export interface IDonation extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

// Donation Schema
const DonationSchema: Schema = new Schema(
  {
    receiptNo: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function(v: string) {
          return /^\d{10}$/.test(v);
        },
        message: 'Phone number must be exactly 10 digits'
      }
    },
    community: {
      type: String,
      required: true,
      enum: ['any', 'payiran', 'chozhan', 'pandiyan', 'othaalan', 'vizhiyan', 'aadai', 'aavan', 'odhaalan', 'semban'],
      default: 'any'
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    paymentMode: {
      type: String,
      required: true,
      enum: ['cash', 'card', 'upi', 'bankTransfer', 'cheque']
    },
    inscription: {
      type: Boolean,
      default: false
    },
    donationDate: {
      type: Date
    }
  },
  {
    timestamps: true // Automatically adds createdAt and updatedAt
  }
);

// Create indexes for better query performance
DonationSchema.index({ phone: 1 });
DonationSchema.index({ receiptNo: 1 });
DonationSchema.index({ createdAt: -1 });
DonationSchema.index({ community: 1 });
DonationSchema.index({ paymentMode: 1 });

export const Donation = mongoose.model<IDonation>('Donation', DonationSchema);